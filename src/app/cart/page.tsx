"use client";

// ============================================================================
// Cart page - Giỏ hàng thống nhất (Unified Shopping Cart).
// - Hiển thị từng item, cho phép chỉnh số lượng khách real-time.
// - Tính tổng tiền động (adult/child/infant riêng biệt).
// - "Proceed to Payment" -> gọi Supabase RPC create_booking_transaction
//   (chống overbooking bằng SELECT FOR UPDATE trong Postgres function) ->
//   /api/payment/vnpay-url -> redirect VNPAY.
// ============================================================================

import { useState } from "react";
import { useCart, formatVnd } from "@/components/cart-store";
import { motion, useReducedMotion } from "motion/react";
import { getBrowserSupabase } from "@/lib/supabase";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"; // UUID demo.

// Sinh mã giao dịch VNPAY unique (dùng ở client).
function generateTxnRef(): string {
  const now = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `${now}${rand}`;
}

export default function CartPage() {
  const reduce = useReducedMotion();
  const { items, updateGuests, removeItem, total, clear, totalGuests } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      // Bước 1: gọi Supabase RPC create_booking_transaction.
      // RPC thực hiện FOR UPDATE lock + check slot + insert trong 1 transaction.
      const supabase = getBrowserSupabase();
      const txnRef = generateTxnRef();

      const rpcItems = items.map((i) => ({
        product_id: i.productId, // UUID khớp với bảng products
        quantity: i.adults + i.children + i.infants,
        booking_date: i.bookingDate,
      }));

      const { data: bookingId, error: rpcError } = await supabase.rpc(
        "create_booking_transaction",
        {
          p_user_id: DEMO_USER_ID,
          p_total_amount: total, // integer VND
          p_vnpay_txn_ref: txnRef,
          p_items: rpcItems,
        },
      );

      if (rpcError || !bookingId) {
        throw new Error(
          (rpcError && rpcError.message) || "Tạo đơn thất bại (hết slot?)",
        );
      }

      // Bước 2: lấy URL thanh toán VNPAY từ API route (dùng server key).
      const payRes = await fetch("/api/payment/vnpay-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error ?? "Tạo link thanh toán thất bại");
      }

      // Bước 3: redirect sang VNPAY.
      clear();
      window.location.href = payData.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Giỏ hàng trống</h1>
        <p className="text-[var(--text-muted)]">
          Thêm tour, khách sạn hoặc vé để bắt đầu hành trình của bạn.
        </p>
        <a
          href="/"
          className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition active:scale-95"
        >
          Xem sản phẩm
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      {/* Danh sách item */}
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
          Giỏ hàng của bạn ({totalGuests} khách)
        </h1>
        {items.map((item, idx) => {
          const lineTotal =
            item.adults * item.priceAdult +
            item.children * item.priceChild +
            item.infants * item.priceInfant;
          return (
            <motion.div
              key={`${item.productId}-${item.bookingDate}`}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              className="card flex flex-col gap-3 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-[var(--text)]">{item.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    Ngày đi: {item.bookingDate}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.bookingDate)}
                  className="text-sm text-[var(--text-muted)] underline transition hover:text-[var(--color-accent-strong)]"
                >
                  Xóa
                </button>
              </div>

              {/* Chỉnh số lượng khách real-time */}
              <div className="grid grid-cols-3 gap-3">
                <GuestControl
                  label="Người lớn"
                  value={item.adults}
                  onChange={(v) =>
                    updateGuests(item.productId, item.bookingDate, "adults", v)
                  }
                />
                <GuestControl
                  label="Trẻ em"
                  value={item.children}
                  onChange={(v) =>
                    updateGuests(item.productId, item.bookingDate, "children", v)
                  }
                />
                <GuestControl
                  label="Em bé"
                  value={item.infants}
                  onChange={(v) =>
                    updateGuests(item.productId, item.bookingDate, "infants", v)
                  }
                />
              </div>

              <p className="text-right text-sm font-medium text-[var(--text)]">
                {formatVnd(lineTotal)}
              </p>
            </motion.div>
          );
        })}
      </section>

      {/* Tóm tắt + thanh toán */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Tổng cộng</h2>
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="text-[var(--text-muted)]">Tạm tính</span>
            <span className="text-xl font-semibold text-[var(--text)]">
              {formatVnd(total)}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Thanh toán an toàn qua VNPAY. Tự động khóa tồn kho để tránh book trùng.
          </p>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition active:scale-95 hover:bg-[var(--color-accent-strong)] disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Thanh toán VNPAY"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function GuestControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-2 py-1">
        <button
          type="button"
          aria-label={`Giảm ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text)] transition active:scale-90"
        >
          −
        </button>
        <span className="text-sm font-medium text-[var(--text)]">{value}</span>
        <button
          type="button"
          aria-label={`Tăng ${label}`}
          onClick={() => onChange(value + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text)] transition active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
}