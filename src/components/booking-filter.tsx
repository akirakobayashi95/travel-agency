"use client";

// ============================================================================
// BookingFilter — Bộ lọc đặt phòng kiểu minimalist, editorial.
// Check-in / Check-out / Guests — trường nhập dạng text sạch,
// nền paper, không box-shadow, phù hợp với thẩm mỹ ấm.
// ============================================================================

import { useState } from "react";

export function BookingFilter() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Check-in */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brick)]/30"
          />
        </div>

        {/* Check-out */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brick)]/30"
          />
        </div>

        {/* Guests */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--color-cream)] px-3 py-2.5 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brick)]/30"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="self-start rounded-full bg-[var(--color-brick)] px-6 py-2.5 text-sm font-medium text-white transition-transform duration-200 hover:bg-[#86301f] active:scale-95">
        Check availability
      </button>
    </section>
  );
}