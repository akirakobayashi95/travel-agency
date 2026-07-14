// ============================================================================
// /admin/inventory — Quản lý tồn kho: chọn sản phẩm, xem 30 ngày,
// chỉnh sửa total_slots inline.
// ============================================================================

import { supabaseServer } from "@/lib/supabase";
import { InventoryClient } from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const { data: products } = await supabaseServer
    .from("products")
    .select("id, title")
    .order("title");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
        Quản lý tồn kho
      </h1>
      <InventoryClient products={products ?? []} />
    </div>
  );
}