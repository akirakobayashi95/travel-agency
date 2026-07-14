import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/product-card";

// ============================================================================
// Trang chủ: Hero bất đối xứng (split) + lưới sản phẩm.
// Hero chiếm vừa viewport, headline ≤ 2 dòng, CTA hiển thị không cần scroll.
// ============================================================================

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      {/* ----- HERO (Asymmetric Split) ----- */}
      <section className="grid min-h-[78dvh] grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <span className="w-fit rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent-strong)]">
            Du lịch Việt Nam
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--text)] md:text-5xl lg:text-6xl">
            Đặt tour, khách sạn và vé chỉ trong vài chạm
          </h1>
          <p className="max-w-[52ch] text-base text-[var(--text-muted)]">
            Hàng nghìn trải nghiệm trên khắp Việt Nam. Thanh toán an toàn qua VNPAY, xác nhận tức thì.
          </p>
          <div className="flex gap-3">
            <a
              href="#products"
              className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition active:scale-95 hover:bg-[var(--color-accent-strong)]"
            >
              Khám phá ngay
            </a>
          </div>
        </div>
        <div className="relative h-[40dvh] overflow-hidden rounded-[var(--radius-card)] lg:h-[60dvh]">
          <img
            src="https://picsum.photos/seed/vietnam-travel-hero/1200/900"
            alt="Bãi biển Việt Nam"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* ----- GRID SẢN PHẨM ----- */}
      <section id="products" className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
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