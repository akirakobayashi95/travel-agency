import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { buildPaymentUrl, getVnpayConfig } from "@/lib/vnpay";

// ============================================================================
// POST /api/payment/vnpay-url
// ----------------------------------------------------------------------------
// Nhận bookingId, truy vấn Supabase, tính secure hash HMAC-SHA512,
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

  // Lấy booking từ Supabase.
  const { data: booking, error } = await supabaseServer
    .from("bookings")
    .select("id, total_amount, vnpay_txn_ref, payment_status")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking không tồn tại" }, { status: 404 });
  }

  if (booking.payment_status === "paid") {
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

  // IP khách (ưu tiên x-forwarded-for từ Netlify).
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddr =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const orderInfo = `Thanh toan booking ${booking.vnpay_txn_ref}`;
  // total_amount lưu dạng integer VND (không có số thập phân).
  const amount = Number(booking.total_amount);
  const paymentUrl = buildPaymentUrl({
    txnRef: booking.vnpay_txn_ref,
    amount,
    orderInfo,
    ipAddr,
    config,
  });

  return NextResponse.json({
    paymentUrl,
    vnpayTxnRef: booking.vnpay_txn_ref,
    amount,
  });
}