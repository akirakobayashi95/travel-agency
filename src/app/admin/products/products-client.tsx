"use client";

// ============================================================================
// ProductsClient — Table sản phẩm + Modal Add/Edit.
// Gọi /api/admin/products (server) để dùng service_role, không import
// supabaseServer trực tiếp từ client.
// ============================================================================

import { useState } from "react";

export interface ProductRow {
  id: string;
  type: string;
  title: string;
  price_adult: number;
  price_child: number;
  price_infant: number;
}

export function ProductsClient({ products }: { products: ProductRow[] }) {
  const [list, setList] = useState<ProductRow[]>(products);
  const [modal, setModal] = useState<{ open: boolean; edit?: ProductRow }>({ open: false });

  const [form, setForm] = useState({
    type: "tour",
    title: "",
    price_adult: 0,
    price_child: 0,
    price_infant: 0,
  });

  function openAdd() {
    setForm({ type: "tour", title: "", price_adult: 0, price_child: 0, price_infant: 0 });
    setModal({ open: true });
  }

  function openEdit(p: ProductRow) {
    setForm({
      type: p.type,
      title: p.title,
      price_adult: Number(p.price_adult),
      price_child: Number(p.price_child),
      price_infant: Number(p.price_infant),
    });
    setModal({ open: true, edit: p });
  }

  async function handleSave() {
    if (modal.edit) {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: modal.edit.id, ...form }),
      });
      if (!res.ok) throw new Error("Update failed");
      setList((prev) =>
        prev.map((p) => (p.id === modal.edit!.id ? { ...p, ...form } : p)),
      );
    } else {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Insert failed");
      const data = await res.json();
      setList((prev) => [...prev, data as ProductRow]);
    }
    setModal({ open: false });
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá sản phẩm này?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    setList((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="rounded-full bg-[var(--color-brick)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#86301f] active:scale-95"
        >
          + Add Product
        </button>
      </div>

      <div className="overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--color-cream)]">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Adult</th>
              <th className="px-4 py-3 font-medium">Child</th>
              <th className="px-4 py-3 font-medium">Infant</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs text-[var(--color-ink-muted)]">
                  {p.id}
                </td>
                <td className="px-4 py-3 capitalize">{p.type}</td>
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3">{Number(p.price_adult).toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3">{Number(p.price_child).toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3">{Number(p.price_infant).toLocaleString("vi-VN")}</td>
                <td className="flex gap-2 px-4 py-3">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs text-[var(--color-ink-muted)] hover:border-[var(--color-brick)] hover:text-[var(--color-brick)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-ink-muted)]">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              {modal.edit ? "Edit Product" : "Add Product"}
            </h2>

            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--color-ink-muted)]">Type</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2 text-sm"
                >
                  <option value="tour">Tour</option>
                  <option value="hotel">Hotel</option>
                  <option value="ticket">Ticket</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--color-ink-muted)]">Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2 text-sm"
                />
              </label>

              <div className="grid grid-cols-3 gap-3">
                <PriceInput label="Adult" value={form.price_adult} onChange={(v) => setForm((f) => ({ ...f, price_adult: v }))} />
                <PriceInput label="Child" value={form.price_child} onChange={(v) => setForm((f) => ({ ...f, price_child: v }))} />
                <PriceInput label="Infant" value={form.price_infant} onChange={(v) => setForm((f) => ({ ...f, price_infant: v }))} />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ open: false })}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--color-ink-muted)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-full bg-[var(--color-brick)] px-4 py-2 text-sm text-white transition hover:bg-[#86301f]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[var(--color-ink-muted)]">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2 text-sm"
      />
    </label>
  );
}