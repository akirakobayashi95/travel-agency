// ============================================================================
// /admin/products — Quản lý sản phẩm (CRUD). Server component fetch dữ liệu,
// client component cho modal add/edit.
// ============================================================================

import { supabaseServer } from "@/lib/supabase";
import { ProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { data: products } = await supabaseServer
    .from("products")
    .select("*")
    .order("title");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
        Quản lý sản phẩm
      </h1>
      <ProductsClient products={products ?? []} />
    </div>
  );
}