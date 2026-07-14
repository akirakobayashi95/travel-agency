"use client";

// ============================================================================
// InventoryClient — Chọn sản phẩm, hiển thị 30 ngày tồn kho.
// Inline chỉnh sửa total_slots, lưu qua PUT /api/admin/inventory.
// ============================================================================

import { useState, useEffect } from "react";

interface InvRow {
  id: string;
  date: string;
  total_slots: number;
  booked_slots: number;
}

export function InventoryClient({ products }: { products: { id: string; title: string }[] }) {
  const [selected, setSelected] = useState(products[0]?.id ?? "");
  const [rows, setRows] = useState<InvRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/admin/inventory?product_id=${selected}`)
      .then((r) => r.json())
      .then((data) => setRows(data ?? []))
      .finally(() => setLoading(false));
  }, [selected]);

  async function handleUpdate(row: InvRow, newSlots: number) {
    if (newSlots < 0) return;
    setSavingId(row.id);
    const res = await fetch("/api/admin/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, total_slots: newSlots }),
    });
    if (res.ok) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, total_slots: newSlots } : r)),
      );
    }
    setSavingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Product selector */}
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full max-w-xs rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2 text-sm"
      >
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.title}</option>
        ))}
      </select>

      {/* Grid 30 ngày */}
      {loading ? (
        <p className="text-sm text-[var(--color-ink-muted)]">Đang tải...</p>
      ) : (
        <div className="overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--color-cream)]">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total Slots</th>
                <th className="px-4 py-3 font-medium">Booked</th>
                <th className="px-4 py-3 font-medium">Available</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const available = r.total_slots - r.booked_slots;
                return (
                  <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-medium">{r.date}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        defaultValue={r.total_slots}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v !== r.total_slots) handleUpdate(r, v);
                        }}
                        className="w-20 rounded-lg border border-[var(--border)] bg-[var(--color-cream)] px-2 py-1 text-sm"
                      />
                      {savingId === r.id && (
                        <span className="ml-2 text-xs text-[var(--color-ink-muted)]">...</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{r.booked_slots}</td>
                    <td className="px-4 py-3">
                      <span className={available <= 2 ? "font-semibold text-red-600" : ""}>
                        {available}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-ink-muted)]">
                    Chưa có dữ liệu tồn kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}