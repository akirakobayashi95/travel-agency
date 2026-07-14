"use client";

// SiteNav: thanh điều hướng 1 dòng, cao ≤ 72px, hiển thị số lượng trong giỏ.
import Link from "next/link";
import { useCart } from "./cart-store";

export function SiteNav() {
  const { totalGuests } = useCart();
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <nav className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--text)]">
          Viet<span className="text-[var(--color-accent)]">Travel</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--text)]">
            Tour
          </Link>
          <Link href="/" className="hover:text-[var(--text)]">
            Khách sạn
          </Link>
          <Link href="/" className="hover:text-[var(--text)]">
            Vé
          </Link>
          <Link
            href="/cart"
            aria-label="Giỏ hàng"
            className="relative rounded-full bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-transform active:scale-95"
          >
            Giỏ hàng
            {totalGuests > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--text)] px-1 text-xs text-white">
                {totalGuests}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}