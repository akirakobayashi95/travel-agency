"use client";

// ============================================================================
// FeatureGrid — Grid 3 cột "Room Categories" / "Homestay Highlight Features".
// Mỗi thẻ có:
//   - Badge trạng thái (Available, Best Seller, etc.)
//   - Icon (Phosphor/HugeIcons — design-taste khuyến nghị Phosphor)
//   - Serif sub-heading
//   - Mô tả ngắn gọn, thanh lịch
//   - Nền paper ấm, viền mỏng, border-radius 20px
// ============================================================================

import { motion, useReducedMotion } from "motion/react";

const FEATURES = [
  {
    badge: "Available",
    title: "Phòng Gác Xép",
    desc: "Gác xép gỗ thông, cửa sổ nhìn ra vườn. Ba lô và sách là đủ.",
    // Icon: house (Phosphor)
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
        <path d="M218.84 130.84l-80-80a12 12 0 0 0-17 0l-80 80A12 12 0 0 0 52 148v60a12 12 0 0 0 12 12h40a12 12 0 0 0 12-12v-40h24v40a12 12 0 0 0 12 12h40a12 12 0 0 0 12-12v-60a12 12 0 0 0-3.16-17.16Z" opacity="0.2"/>
        <path d="M218.83 130.83l-80-80a12 12 0 0 0-17 0l-80 80A12 12 0 0 0 52 148v60a12 12 0 0 0 12 12h40a12 12 0 0 0 12-12v-40h24v40a12 12 0 0 0 12 12h40a12 12 0 0 0 12-12v-60a12 12 0 0 0-3.17-17.17ZM204 204h-28v-40a12 12 0 0 0-12-12h-72a12 12 0 0 0-12 12v40H52v-55L128 69l76 76v59Z"/>
      </svg>
    ),
  },
  {
    badge: "Best Seller",
    title: "Suite Hoa Sen",
    desc: "Phòng lớn với bồn tắm đá, ban công treo võng. Cho kỳ nghỉ chậm rãi.",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
        <path d="M24 112v-8a104 104 0 0 1 208 0v8Z" opacity="0.2"/>
        <path d="M240 112v-8a112 112 0 0 0-224 0v8a16 16 0 0 0 16 16h24v72a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16v-72h24a16 16 0 0 0 16-16ZM56 128H40v-8a88 88 0 0 1 176 0v8h-16v-8a72 72 0 0 0-144 0v8Zm24 0V56a56 56 0 0 1 112 0v72Zm88 0V56a40 40 0 0 0-80 0v72Z"/>
      </svg>
    ),
  },
  {
    badge: "New",
    title: "Villa Bãi Biển",
    desc: "Ngôi nhà riêng cách biển 3 phút đi bộ. BBQ tối, rượu vang và sóng.",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
        <path d="M216 232H40a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8Z" opacity="0.2"/>
        <path d="M248 208a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8v16Zm-24-24H56V72c0-13.1 11.4-24 24-24h72c13.1 0 24 10.9 24 24v24h-16V72c0-4.4-3.6-8-8-8H80c-4.4 0-8 3.6-8 8v112h152Z"/>
      </svg>
    ),
  },
];

export function FeatureGrid() {
  const reduce = useReducedMotion();

  return (
    <section className="flex flex-col gap-8">
      <h2 className="font-serif-display text-3xl tracking-tight text-[var(--color-ink)]">
        Room categories
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="card-warm flex flex-col gap-4 p-6"
          >
            {/* Badge */}
            <span className="badge-warm self-start px-3 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em]">
              {f.badge}
            </span>

            {/* Icon */}
            <span className="mt-1 block text-[var(--color-brick)]">{f.svg}</span>

            {/* Serif sub-heading */}
            <h3 className="font-serif-display text-xl leading-snug text-[var(--color-ink)]">
              {f.title}
            </h3>

            {/* Mô tả */}
            <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}