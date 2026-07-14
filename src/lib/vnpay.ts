import crypto from "crypto";

// ============================================================================
// VNPAY helper - tạo secure hash (HMAC-SHA512) & build URL thanh toán.
// Tuân thủ chuẩn tài liệu VNPAY Integration: sắp xếp field alphabetically,
// nối query string, sign bằng HMAC-SHA512 với vnp_HashSecret.
// ============================================================================

export interface VnpayConfig {
  tmnCode: string;
  hashSecret: string;
  baseUrl: string; // https://sandbox.vnpayment.vn/paymentv2/vpcpay.html hoặc production
  returnUrl: string;
  ipnUrl: string;
}

export function getVnpayConfig(): VnpayConfig {
  const env = (process.env.VNP_ENV ?? "sandbox").toLowerCase();
  const baseUrl =
    env === "production"
      ? "https://pay.vnpay.vn/vpcpay.html"
      : "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  return {
    tmnCode: process.env.VNP_TMN_CODE ?? "",
    hashSecret: process.env.VNP_HASH_SECRET ?? "",
    baseUrl,
    returnUrl: `${base}/api/payment/vnpay-return`,
    ipnUrl: `${base}/api/payment/vnpay-ipn`,
  };
}

// Sắp xếp các key theo thứ tự alphabet (yêu cầu của VNPAY) và build query string.
export function buildSortedQueryString(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys
    .filter((k) => params[k] !== "" && params[k] !== undefined)
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");
}

// Tạo secure hash từ query string đã sắp xếp.
export function signQuery(queryString: string, hashSecret: string): string {
  return crypto
    .createHmac("sha512", hashSecret)
    .update(queryString)
    .digest("hex");
}

// Xác thực secure hash của callback từ VNPAY.
export function verifySecureHash(
  params: Record<string, string>,
  hashSecret: string,
): boolean {
  const secureHash = params["vnp_SecureHash"];
  if (!secureHash) return false;

  // Loại bỏ vnp_SecureHash khỏi danh sách ký.
  const { vnp_SecureHash, ...rest } = params;
  void secureHash;
  const queryString = buildSortedQueryString(rest as Record<string, string>);
  const computed = signQuery(queryString, hashSecret);
  return computed.toLowerCase() === (secureHash as string).toLowerCase();
}

// Tạo mã giao dịch duy nhất (vnp_TxnRef). Dùng timestamp + random đảm bảo unique.
export function generateTxnRef(): string {
  const now = new Date();
  const yyyymmddhhmmss = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${yyyymmddhhmmss}${rand}`;
}

// Build URL redirect thanh toán VNPAY.
export function buildPaymentUrl(input: {
  txnRef: string;
  amount: number; // số tiền VND nguyên
  orderInfo: string;
  ipAddr: string;
  config: VnpayConfig;
}): string {
  const { txnRef, amount, orderInfo, ipAddr, config } = input;
  const createDate = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: String(amount * 100), // VNPAY yêu cầu nhân 100 (đơn vị xu)
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "travel",
    vnp_Locale: "vn",
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  const queryString = buildSortedQueryString(params);
  const secureHash = signQuery(queryString, config.hashSecret);
  return `${config.baseUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
}