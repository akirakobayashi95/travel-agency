import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// ============================================================================
// GET  /api/admin/bookings?id=X — Lấy booking + items + products
// PUT  /api/admin/bookings — Cập nhật payment_status
// ============================================================================

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }
  const { data, error } = await supabaseServer
    .from("bookings")
    .select("*, booking_items(*, products(*))")
    .eq("id", id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.payment_status) {
    return NextResponse.json({ error: "Thiếu id hoặc payment_status" }, { status: 400 });
  }
  const valid = ["unpaid", "paid", "cancelled"];
  if (!valid.includes(body.payment_status)) {
    return NextResponse.json({ error: "payment_status không hợp lệ" }, { status: 400 });
  }
  const { error } = await supabaseServer
    .from("bookings")
    .update({ payment_status: body.payment_status })
    .eq("id", body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}