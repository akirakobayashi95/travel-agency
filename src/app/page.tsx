import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { BookingFilter } from "@/components/booking-filter";
import { FeatureGrid } from "@/components/feature-grid";

// ============================================================================
// Trang chủ (Redesign: retro-warm editorial).
// Hero: headline serif khổng lồ, căn giữa, từ khóa brick-red.
// Filter: form minimalist tích hợp mượt.
// Grid: 3 Room Categories với badge + icon + serif subhead.
// ============================================================================

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20">
      {/* ----- HERO ----- */}
      <section className="flex flex-col items-center gap-6 pt-10 text-center">
        <span className="badge-warm px-4 py-1 text-xs font-medium uppercase tracking-[0.18em]">
          MaiHome Homestay
        </span>
        <h1 className="font-serif-display max-w-3xl text-4xl leading-[1.05] tracking-tight text-[var(--color-ink)] md:text-6xl">
          A cozy shelter for the{" "}
          <span className="italic text-[var(--color-brick)]">wandering</span> souls.
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-[var(--color-ink-muted)]">
          Những căn phòng thủ công bên rừng thông và bờ biển, nơi bạn tìm lại
          nhịp thở chậm rãi. Cà phê sáng, ánh đèn ấm, và tiếng sóng mỗi tối.
        </p>
        <a
          href="#rooms"
          className="mt-2 rounded-full bg-[var(--color-brick)] px-7 py-3.5 text-sm font-medium text-white transition-transform duration-200 hover:bg-[#86301f] active:scale-95"
        >
          Explore rooms & book now
        </a>
      </section>

      {/* ----- FILTER (minimalist) ----- */}
      <BookingFilter />

      {/* ----- ROOM CATEGORIES GRID ----- */}
      <FeatureGrid />

      {/* ----- PRODUCTS (giữ nguyên booking engine) ----- */}
      <section id="rooms" className="flex flex-col gap-6">
        <h2 className="font-serif-display text-3xl tracking-tight text-[var(--color-ink)]">
          Lựa chọn phổ biến
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}