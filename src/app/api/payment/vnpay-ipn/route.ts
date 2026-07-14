import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVnpayConfig, verifySecureHash } from "@/lib/vnpay";

// ============================================================================
// GET /api/payment/vnpay-ipn  (IPN - Instant Payment Notification)
// ----------------------------------------------------------------------------
// Webhook bất đồng bộ từ VNPAY. VNPAY gọi endpoint này để báo kết quả thanh toán.
//
// Quy trình:
//   1. Validate vnp_SecureHash (HMAC-SHA512).
//   2. Tìm booking qua vnp_TxnRef.
//   3. So sánh số tiền (vnp_Amount / 100) với totalAmount.
//   4. Nếu vnp_ResponseCode === '00' -> cập nhật paymentStatus = PAID.
//   5. Nếu thất bại -> rollback bookedSlots trong transaction.
//   6. Trả JSON chuẩn VNPAY: { "RspCode": "00", "Message": "Confirm success" }
// ============================================================================

// Helper: parse query string thành Record<string,string> (giữ nguyên ký tự).
function parseQuery(searchParams: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

export async function GET(req: NextRequest) {
  const params = parseQuery(req.nextUrl.searchParams);
  const config = getVnpayConfig();

  // ---- 1. Xác thực chữ ký ----
  if (!verifySecureHash(params, config.hashSecret)) {
    // RspCode '97' = checksum không hợp lệ (theo chuẩn VNPAY).
    return NextResponse.json(
      { RspCode: "97", Message: "Invalid signature" },
      { status: 200 },
    );
  }

  const txnRef = params["vnp_TxnRef"];
  const responseCode = params["vnp_ResponseCode"];
  const amountFromVnpay = params["vnp_Amount"]
    ? Number(params["vnp_Amount"]) / 100
    : 0;

  if (!txnRef) {
    return NextResponse.json(
      { RspCode: "01", Message: "Order not found" },
      { status: 200 },
    );
  }

  // ---- 2. Tìm booking ----
  const booking = await prisma.booking.findUnique({
    where: { vnpayTxnRef: txnRef },
    include: { items: true },
  });

  if (!booking) {
    return NextResponse.json(
      { RspCode: "01", Message: "Order not found" },
      { status: 200 },
    );
  }

  // Idempotency: nếu đã PAID thì xác nhận luôn (VNPAY có thể gửi lại).
  if (booking.paymentStatus === "PAID") {
    return NextResponse.json(
      { RspCode: "00", Message: "Confirm success" },
      { status: 200 },
    );
  }

  // ---- 3. So sánh số tiền ----
  if (amountFromVnpay !== booking.totalAmount) {
    return NextResponse.json(
      { RspCode: "04", Message: "Amount invalid" },
      { status: 200 },
    );
  }

  // ---- 4 & 5. Xử lý kết quả trong transaction ----
  if (responseCode === "00") {
    // Thành công -> đánh dấu PAID.
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "PAID" },
    });
    return NextResponse.json(
      { RspCode: "00", Message: "Confirm success" },
      { status: 200 },
    );
  }

  // Thất bại -> hoàn trả bookedSlots (rollback tồn kho) trong transaction.
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of booking.items) {
        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: { bookedSlots: { decrement: item.quantity } },
        });
      }
      await tx.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "CANCELLED" },
      });
    });
  } catch (err) {
    console.error("[vnpay-ipn] rollback error:", err);
    // Vẫn trả 00 để VNPAY không gửi lại vô tận, nhưng log lỗi để xử lý thủ công.
  }

  return NextResponse.json(
    { RspCode: "00", Message: "Confirm success" },
    { status: 200 },
  );
}