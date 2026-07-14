// ============================================================================
// Admin layout: sidebar navigation dọc + nội dung.
// ============================================================================

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-64px)] gap-0">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-5 sm:flex sm:flex-col sm:gap-1">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">
          Admin
        </h2>
        <NavItem href="/admin/products" label="Sản phẩm" />
        <NavItem href="/admin/inventory" label="Tồn kho" />
        <NavItem href="/admin/bookings" label="Đơn đặt" />
      </aside>
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-brick-soft)] hover:text-[var(--color-brick)]"
    >
      {label}
    </Link>
  );
}