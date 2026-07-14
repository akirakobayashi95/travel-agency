import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// ============================================================================
// GET /api/payment/vnpay-return  (Trang return sau khi user thanh toán xong)
// VNPAY redirect user về đây kèm query params. Ta kiểm tra vnp_ResponseCode
// rồi điều hướng sang trang kết quả tương ứng.
// ============================================================================

export default async function VnpayReturnPage({
  searchParams,
}: {
  searchParams: { vnp_TxnRef?: string; vnp_ResponseCode?: string };
}) {
  const txnRef = searchParams.vnp_TxnRef;
  const responseCode = searchParams.vnp_ResponseCode;

  const status = responseCode === "00" ? "success" : "failed";
  if (txnRef) {
    // Cập nhật trạng thái hiển thị (đã được IPN xử lý trước đó). Log nhẹ.
    await prisma.booking
      .findUnique({ where: { vnpayTxnRef: txnRef } })
      .catch(() => null);
  }

  redirect(`/checkout/result?ref=${txnRef ?? ""}&status=${status}`);
}