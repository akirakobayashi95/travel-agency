import { redirect } from "next/navigation";

// ============================================================================
// GET /payment/return  (Trang return sau khi user thanh toán xong)
// VNPAY redirect user về đây kèm query params. Trạng thái đã được
// IPN webhook cập nhật trước đó, nên ta chỉ đọc vnp_ResponseCode để
// điều hướng sang trang kết quả.
// ============================================================================

export default async function VnpayReturnPage({
  searchParams,
}: {
  searchParams: { vnp_TxnRef?: string; vnp_ResponseCode?: string };
}) {
  const txnRef = searchParams.vnp_TxnRef;
  const responseCode = searchParams.vnp_ResponseCode;

  const status = responseCode === "00" ? "success" : "failed";
  redirect(`/checkout/result?ref=${txnRef ?? ""}&status=${status}`);
}
