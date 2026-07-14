import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTxnRef } from "@/lib/vnpay";

// ============================================================================
// POST /api/bookings/create
// ----------------------------------------------------------------------------
// Tạo đơn đặt chỗ với cơ chế chống overbooking (race condition) bằng
// row-level locking: bên trong prisma.$transaction (interactive), thực hiện
// `SELECT ... FOR UPDATE` trên các dòng Inventory được yêu cầu.
//
// Quy trình:
//   1. Lock các dòng Inventory (FOR UPDATE) theo ngày.
//   2. Kiểm tra totalSlots - bookedSlots >= requested_quantity.
//   3. Nếu thiếu slot -> rollback + trả 400 (sold out).
//   4. Nếu đủ -> tăng bookedSlots và tạo Booking + BookingItem (UNPAID).
// ============================================================================

export interface BookingItemInput {
  productId: string;
  bookingDate: string; // ISO date string, vd: "2026-08-01"
  adults: number;
  children: number;
  infants: number;
}

export interface CreateBookingBody {
  userId: string;
  items: BookingItemInput[];
}

// Hàm helper: chuẩn hóa ngày về 00:00:00 UTC để so khớp với Inventory.date.
function toUtcDate(iso: string): Date {
  const d = new Date(iso);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  let body: CreateBookingBody;
  try {
    body = (await req.json()) as CreateBookingBody;
  } catch {
    return NextResponse.json(
      { error: "Body không hợp lệ (JSON expected)" },
      { status: 400 },
    );
  }

  const { userId, items } = body;

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Thiếu userId hoặc danh sách items rỗng" },
      { status: 400 },
    );
  }

  // Validate từng item: số lượng không âm, ít nhất 1 khách.
  for (const it of items) {
    if (!it.productId || !it.bookingDate) {
      return NextResponse.json(
        { error: "Mỗi item cần productId và bookingDate" },
        { status: 400 },
      );
    }
    const qty = (it.adults ?? 0) + (it.children ?? 0) + (it.infants ?? 0);
    if (qty <= 0) {
      return NextResponse.json(
        { error: "Mỗi item cần ít nhất 1 khách (adult/child/infant)" },
        { status: 400 },
      );
    }
  }

  try {
    // ---- INTERACTIVE TRANSACTION: chống overbooking ----
    const result = await prisma.$transaction(async (tx) => {
      // Tính tổng tiền & chuẩn bị danh sách item cần lock.
      let totalAmount = 0;
      const prepared: Array<{
        productId: string;
        date: Date;
        adults: number;
        children: number;
        infants: number;
        quantity: number;
        priceAdult: number;
        priceChild: number;
        priceInfant: number;
      }> = [];

      // Lấy giá sản phẩm trước (read-only) để tính tiền.
      const productIds = [...new Set(items.map((i) => i.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          priceAdult: true,
          priceChild: true,
          priceInfant: true,
        },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const it of items) {
        const prod = productMap.get(it.productId);
        if (!prod) {
          throw new Error(`Sản phẩm không tồn tại: ${it.productId}`);
        }
        const adults = it.adults ?? 0;
        const children = it.children ?? 0;
        const infants = it.infants ?? 0;
        const quantity = adults + children + infants;

        totalAmount +=
          adults * prod.priceAdult +
          children * prod.priceChild +
          infants * prod.priceInfant;

        prepared.push({
          productId: it.productId,
          date: toUtcDate(it.bookingDate),
          adults,
          children,
          infants,
          quantity,
          priceAdult: prod.priceAdult,
          priceChild: prod.priceChild,
          priceInfant: prod.priceInfant,
        });
      }

      // ---- ROW-LEVEL LOCK: SELECT ... FOR UPDATE ----
      // Lock từng dòng Inventory theo (productId, date) để các request song song
      // phải xếp hàng tuần tự, không thể cùng lúc đọc bookedSlots cũ.
      for (const p of prepared) {
        const locked = await tx.$queryRawUnsafe<
          Array<{
            id: string;
            totalSlots: number;
            bookedSlots: number;
          }>
        >(
          `SELECT id, "totalSlots", "bookedSlots"
           FROM "Inventory"
           WHERE "productId" = $1 AND "date" = $2
           FOR UPDATE`,
          p.productId,
          p.date,
        );

        if (locked.length === 0) {
          throw new Error(
            `Không có tồn kho cho sản phẩm ${p.productId} vào ngày ${p.date.toISOString()}`,
          );
        }

        const row = locked[0];
        const available = row.totalSlots - row.bookedSlots;
        if (available < p.quantity) {
          // Bán hết / không đủ slot -> ném lỗi -> transaction rollback.
          throw new Error(
            `SOLD_OUT: sản phẩm ${p.productId} ngày ${p.date.toISOString()} chỉ còn ${available} slot`,
          );
        }

        // Cập nhật bookedSlots (đã được lock, an toàn).
        await tx.inventory.update({
          where: { id: row.id },
          data: { bookedSlots: { increment: p.quantity } },
        });

        // Gắn inventoryId vào prepared để tạo BookingItem sau.
        p.productId = p.productId; // giữ nguyên
        (p as unknown as { inventoryId: string }).inventoryId = row.id;
      }

      // ---- Tạo Booking + BookingItem (UNPAID) ----
      const txnRef = generateTxnRef();
      const booking = await tx.booking.create({
        data: {
          userId,
          totalAmount,
          paymentStatus: "UNPAID",
          vnpayTxnRef: txnRef,
          items: {
            create: prepared.map((p) => ({
              productId: p.productId,
              inventoryId: (p as unknown as { inventoryId: string }).inventoryId,
              quantity: p.quantity,
              adults: p.adults,
              children: p.children,
              infants: p.infants,
              bookingDate: p.date,
            })),
          },
        },
        include: { items: true },
      });

      return { booking, totalAmount };
    });

    return NextResponse.json(
      {
        bookingId: result.booking.id,
        vnpayTxnRef: result.booking.vnpayTxnRef,
        totalAmount: result.totalAmount,
        paymentStatus: result.booking.paymentStatus,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    // Nếu là lỗi SOLD_OUT hoặc thiếu tồn kho -> 400.
    if (message.startsWith("SOLD_OUT") || message.startsWith("Không có tồn kho")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message.startsWith("Sản phẩm không tồn tại")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    console.error("[create-booking] error:", message);
    return NextResponse.json(
      { error: "Tạo đơn thất bại, vui lòng thử lại" },
      { status: 500 },
    );
  }
}