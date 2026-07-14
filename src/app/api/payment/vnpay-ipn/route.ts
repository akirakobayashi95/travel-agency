import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { getVnpayConfig, verifySecureHash } from "@/lib/vnpay";

// ============================================================================
// GET /api/payment/vnpay-ipn  (IPN - Instant Payment Notification)
// ----------------------------------------------------------------------------
// Webhook bất đồng bộ từ VNPAY. VNPAY gọi endpoint này để báo kết quả.
//
// Quy trình:
//   1. Validate vnp_SecureHash (HMAC-SHA512).
//   2. Tìm booking qua vnp_TxnRef.
//   3. So sánh số tiền (vnp_Amount / 100) với total_amount.
//   4. Nếu vnp_ResponseCode === '00' -> cập nhật payment_status = 'paid'.
//   5. Nếu thất bại -> gọi RPC rollback_booking_inventory (trừ booked_slots)
//      và đánh dấu 'cancelled'.
//   6. Trả JSON chuẩn VNPAY: { "RspCode": "00", "Message": "Confirm success" }
// ============================================================================

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
  const { data: booking, error } = await supabaseServer
    .from("bookings")
    .select("id, total_amount, payment_status")
    .eq("vnpay_txn_ref", txnRef)
    .single();

  if (error || !booking) {
    return NextResponse.json(
      { RspCode: "01", Message: "Order not found" },
      { status: 200 },
    );
  }

  // Idempotency: đã paid thì xác nhận luôn.
  if (booking.payment_status === "paid") {
    return NextResponse.json(
      { RspCode: "00", Message: "Confirm success" },
      { status: 200 },
    );
  }

  // ---- 3. So sánh số tiền ----
  if (amountFromVnpay !== Number(booking.total_amount)) {
    return NextResponse.json(
      { RspCode: "04", Message: "Amount invalid" },
      { status: 200 },
    );
  }

  // ---- 4 & 5. Xử lý kết quả ----
  if (responseCode === "00") {
    const { error: updErr } = await supabaseServer
      .from("bookings")
      .update({ payment_status: "paid", updated_at: new Date().toISOString() })
      .eq("id", booking.id);
    if (updErr) {
      console.error("[vnpay-ipn] update paid error:", updErr);
      return NextResponse.json(
        { RspCode: "99", Message: "Update failed" },
        { status: 200 },
      );
    }
    return NextResponse.json(
      { RspCode: "00", Message: "Confirm success" },
      { status: 200 },
    );
  }

  // Thất bại -> rollback tồn kho qua RPC (giảm booked_slots + cancelled).
  const { error: rpcErr } = await supabaseServer.rpc(
    "rollback_booking_inventory",
    { p_booking_id: booking.id },
  );
  if (rpcErr) {
    console.error("[vnpay-ipn] rollback error:", rpcErr);
  }

  return NextResponse.json(
    { RspCode: "00", Message: "Confirm success" },
    { status: 200 },
  );
}