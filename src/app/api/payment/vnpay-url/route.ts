import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPaymentUrl, getVnpayConfig } from "@/lib/vnpay";

// ============================================================================
// POST /api/payment/vnpay-url
// ----------------------------------------------------------------------------
// Nhận bookingId, truy vấn Netlify Database, tính secure hash HMAC-SHA512,
// trả về URL redirect thanh toán VNPAY.
// ============================================================================

export async function POST(req: NextRequest) {
  let body: { bookingId?: string };
  try {
    body = (await req.json()) as { bookingId?: string };
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 });
  }

  const { bookingId } = body;
  if (!bookingId) {
    return NextResponse.json({ error: "Thiếu bookingId" }, { status: 400 });
  }

  // Lấy booking từ DB.
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking không tồn tại" }, { status: 404 });
  }

  if (booking.paymentStatus === "PAID") {
    return NextResponse.json(
      { error: "Booking đã được thanh toán" },
      { status: 409 },
    );
  }

  const config = getVnpayConfig();
  if (!config.tmnCode || !config.hashSecret) {
    return NextResponse.json(
      { error: "Chưa cấu hình VNPAY (VNP_TMN_CODE / VNP_HASH_SECRET)" },
      { status: 500 },
    );
  }

  // Lấy IP khách (ưu tiên x-forwarded-for từ Netlify).
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddr =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const orderInfo = `Thanh toan booking ${booking.vnpayTxnRef}`;
  const paymentUrl = buildPaymentUrl({
    txnRef: booking.vnpayTxnRef,
    amount: booking.totalAmount,
    orderInfo,
    ipAddr,
    config,
  });

  return NextResponse.json({
    paymentUrl,
    vnpayTxnRef: booking.vnpayTxnRef,
    amount: booking.totalAmount,
  });
}