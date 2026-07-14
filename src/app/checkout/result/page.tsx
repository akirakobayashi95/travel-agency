import Link from "next/link";

// Trang kết quả thanh toán (sau khi VNPAY return).
// status: "success" | "failed"

export default function CheckoutResultPage({
  searchParams,
}: {
  searchParams: { ref?: string; status?: string };
}) {
  const ok = searchParams.status === "success";
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 py-24 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
          ok ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]" : "bg-red-100 text-red-600"
        }`}
      >
        {ok ? "✓" : "!"}
      </div>
      <h1 className="text-2xl font-semibold text-[var(--text)]">
        {ok ? "Thanh toán thành công" : "Thanh toán chưa hoàn tất"}
      </h1>
      <p className="text-[var(--text-muted)]">
        {ok
          ? "Chúng tôi đã ghi nhận đơn của bạn. Mã giao dịch:"
          : "Giao dịch chưa được xác nhận. Tồn kho đã được tự động hoàn trả."}{" "}
        <span className="font-mono text-sm">{searchParams.ref ?? "N/A"}</span>
      </p>
      <Link
        href="/"
        className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition active:scale-95"
      >
        Tiếp tục khám phá
      </Link>
    </div>
  );
}