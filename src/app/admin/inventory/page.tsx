// ============================================================================
// /admin/inventory — Quản lý tồn kho: chọn sản phẩm, xem 30 ngày,
// chỉnh sửa total_slots inline.
// ============================================================================

import { supabaseServer } from "@/lib/supabase";
import { AdminError } from "../admin-error";
import { InventoryClient } from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  let products: { id: string; title: string }[] = [];

  try {
    const { data, error } = await supabaseServer
      .from("products")
      .select("id, title")
      .order("title");
    if (error) throw new Error(error.message);
    products = (data ?? []) as { id: string; title: string }[];
  } catch (err) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
          Quản lý tồn kho
        </h1>
        <AdminError message={err instanceof Error ? err.message : "Lỗi không xác định"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
        Quản lý tồn kho
      </h1>
      <InventoryClient products={products} />
    </div>
  );
}