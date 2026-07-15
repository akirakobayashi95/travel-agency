// ============================================================================
// /admin/products — Quản lý sản phẩm (CRUD). Server component fetch dữ liệu,
// client component cho modal add/edit.
// ============================================================================

import { supabaseServer } from "@/lib/supabase";
import { AdminError } from "../admin-error";
import { ProductsClient, type ProductRow } from "./products-client";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: ProductRow[] = [];

  try {
    const { data, error } = await supabaseServer
      .from("products")
      .select("*")
      .order("title");
    if (error) throw new Error(error.message);
    products = (data ?? []) as ProductRow[];
  } catch (err) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
          Quản lý sản phẩm
        </h1>
        <AdminError message={err instanceof Error ? err.message : "Lỗi không xác định"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
        Quản lý sản phẩm
      </h1>
      <ProductsClient products={products} />
    </div>
  );
}