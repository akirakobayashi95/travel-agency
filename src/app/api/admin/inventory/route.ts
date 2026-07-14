import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// ============================================================================
// GET  /api/admin/inventory?product_id=X — Lấy 30 ngày tồn kho cho sản phẩm
// PUT  /api/admin/inventory — Cập nhật total_slots cho 1 ngày (id)
// ============================================================================

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");
  if (!productId) {
    return NextResponse.json({ error: "Thiếu product_id" }, { status: 400 });
  }
  const { data, error } = await supabaseServer
    .from("inventory")
    .select("id, date, total_slots, booked_slots")
    .eq("product_id", productId)
    .gte("date", new Date().toISOString().slice(0, 10))
    .order("date")
    .limit(30);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id || body.total_slots == null) {
    return NextResponse.json({ error: "Thiếu id hoặc total_slots" }, { status: 400 });
  }
  const { error } = await supabaseServer
    .from("inventory")
    .update({ total_slots: body.total_slots })
    .eq("id", body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}