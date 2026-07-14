"use client";

// ============================================================================
// BookingsClient — Table đơn đặt + filter (payment_status, search) +
// modal chi tiết (items + products) + dropdown đổi payment_status.
// ============================================================================

import { useState } from "react";

interface BookingRow {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  vnpay_txn_ref: string;
  created_at: string;
}

interface ItemDetail {
  id: string;
  product_id: string;
  quantity: number;
  booking_date: string;
  products: { title: string; type: string } | null;
}

interface BookingDetail {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  vnpay_txn_ref: string;
  created_at: string;
  booking_items: ItemDetail[];
}

export function BookingsClient({ bookings }: { bookings: BookingRow[] }) {
  const [list] = useState<BookingRow[]>(bookings);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [updating, setUpdating] = useState(false);

  const filtered = list.filter((b) => {
    if (filterStatus && b.payment_status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!b.id.toLowerCase().includes(q) && !b.user_id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  async function openDetail(id: string) {
    const res = await fetch(`/api/admin/bookings?id=${id}`);
    if (res.ok) {
      setDetail(await res.json());
    }
  }

  async function handleStatusChange(bookingId: string, newStatus: string) {
    setUpdating(true);
    await fetch("/api/admin/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, payment_status: newStatus }),
    });
    setDetail((prev) => (prev ? { ...prev, payment_status: newStatus } : null));
    setUpdating(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="text"
          placeholder="Search by ID or User ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--color-cream)]">
            <tr>
              <th className="px-4 py-3 font-medium">Booking ID</th>
              <th className="px-4 py-3 font-medium">User ID</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Txn Ref</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-[var(--border)] last:border-0">
                <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs">{b.id}</td>
                <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs">{b.user_id}</td>
                <td className="px-4 py-3">
                  {Number(b.total_amount).toLocaleString("vi-VN")}đ
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.payment_status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{b.vnpay_txn_ref}</td>
                <td className="px-4 py-3 text-xs">
                  {new Date(b.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openDetail(b.id)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs hover:border-[var(--color-brick)] hover:text-[var(--color-brick)]"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-ink-muted)]">
                  Không tìm thấy đơn đặt nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết booking */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              Booking Details
            </h2>

            <div className="flex flex-col gap-2 text-sm">
              <p><span className="font-medium">ID:</span> {detail.id}</p>
              <p><span className="font-medium">User ID:</span> {detail.user_id}</p>
              <p><span className="font-medium">Amount:</span> {Number(detail.total_amount).toLocaleString("vi-VN")}đ</p>
              <p><span className="font-medium">Txn Ref:</span> {detail.vnpay_txn_ref}</p>
              <p><span className="font-medium">Created:</span> {new Date(detail.created_at).toLocaleString("vi-VN")}</p>
            </div>

            {/* Chi tiết items */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-[var(--color-ink)]">Booking Items</h3>
              <div className="flex flex-col gap-2">
                {detail.booking_items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--color-cream)] p-3 text-sm"
                  >
                    <p className="font-medium">{item.products?.title ?? "N/A"}</p>
                    <p className="text-[var(--color-ink-muted)]">
                      {item.products?.type} · {item.booking_date} · Qty: {item.quantity}
                    </p>
                  </div>
                ))}
                {detail.booking_items.length === 0 && (
                  <p className="text-sm text-[var(--color-ink-muted)]">No items.</p>
                )}
              </div>
            </div>

            {/* Dropdown đổi payment_status */}
            <div className="flex items-center gap-3 border-t border-[var(--border)] pt-4">
              <label className="text-sm font-medium">Payment Status:</label>
              <select
                value={detail.payment_status}
                onChange={(e) => handleStatusChange(detail.id, e.target.value)}
                disabled={updating}
                className="rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2 text-sm"
              >
                <option value="unpaid">unpaid</option>
                <option value="paid">paid</option>
                <option value="cancelled">cancelled</option>
              </select>
              {updating && <span className="text-xs text-[var(--color-ink-muted)]">...</span>}
            </div>

            <button
              onClick={() => setDetail(null)}
              className="self-end rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--color-ink-muted)]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    unpaid: "bg-amber-50 text-amber-700",
    paid: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-600",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}