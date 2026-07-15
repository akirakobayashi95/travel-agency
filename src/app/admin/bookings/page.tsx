// ============================================================================
// /admin/bookings — Danh sách đơn đặt + filter + modal chi tiết + cập nhật
// payment_status. Server component fetch danh sách, client component xử lý.
// ============================================================================

import { supabaseServer } from "@/lib/supabase";
import { AdminError } from "../admin-error";
import { BookingsClient } from "./bookings-client";

export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  vnpay_txn_ref: string;
  created_at: string;
};

export default async function AdminBookingsPage() {
  let bookings: BookingRow[] = [];

  try {
    const { data, error } = await supabaseServer
      .from("bookings")
      .select("id, user_id, total_amount, payment_status, vnpay_txn_ref, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    bookings = (data ?? []) as BookingRow[];
  } catch (err) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
          Quản lý đơn đặt
        </h1>
        <AdminError message={err instanceof Error ? err.message : "Lỗi không xác định"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
        Quản lý đơn đặt
      </h1>
      <BookingsClient bookings={bookings} />
    </div>
  );
}