// ============================================================================
// /admin/bookings — Danh sách đơn đặt + filter + modal chi tiết + cập nhật
// payment_status. Server component fetch danh sách, client component xử lý.
// ============================================================================

import { supabaseServer } from "@/lib/supabase";
import { BookingsClient } from "./bookings-client";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const { data: bookings } = await supabaseServer
    .from("bookings")
    .select("id, user_id, total_amount, payment_status, vnpay_txn_ref, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
        Quản lý đơn đặt
      </h1>
      <BookingsClient bookings={bookings ?? []} />
    </div>
  );
}