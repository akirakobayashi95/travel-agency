import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// ============================================================================
// POST /api/admin/products — Tạo sản phẩm mới
// PUT  /api/admin/products — Cập nhật sản phẩm
// DELETE /api/admin/products — Xoá sản phẩm
// Dùng service_role (server), gọi từ client component.
// ============================================================================

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ error: "Thiếu title" }, { status: 400 });
  }
  const { data, error } = await supabaseServer
    .from("products")
    .insert({
      type: body.type ?? "tour",
      title: body.title,
      price_adult: body.price_adult ?? 0,
      price_child: body.price_child ?? 0,
      price_infant: body.price_infant ?? 0,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }
  const { data, error } = await supabaseServer
    .from("products")
    .update({
      type: body.type,
      title: body.title,
      price_adult: body.price_adult,
      price_child: body.price_child,
      price_infant: body.price_infant,
    })
    .eq("id", body.id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Thiếu id query param" }, { status: 400 });
  }
  const { error } = await supabaseServer.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}