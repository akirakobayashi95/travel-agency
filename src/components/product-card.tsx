"use client";

// ============================================================================
// ProductCard: thẻ sản phẩm với bộ chọn số lượng khách (adult/child/infant)
// và nút "Thêm vào giỏ". Tính giá tạm thời theo real-time.
// ============================================================================

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useCart, formatVnd, type CartItem } from "./cart-store";
import type { ProductSeed } from "@/data/products";

export function ProductCard({ product }: { product: ProductSeed }) {
  const reduce = useReducedMotion();
  const { addItem } = useCart();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [added, setAdded] = useState(false);

  const lineTotal =
    adults * product.priceAdult +
    children * product.priceChild +
    infants * product.priceInfant;

  function handleAdd() {
    const item: CartItem = {
      productId: product.id,
      title: product.title,
      type: product.type,
      priceAdult: product.priceAdult,
      priceChild: product.priceChild,
      priceInfant: product.priceInfant,
      bookingDate: date,
      adults,
      children,
      infants,
    };
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card overflow-hidden"
    >
      {/* Hình ảnh sản phẩm */}
      <img
        src={product.image}
        alt={product.title}
        className="h-48 w-full object-cover"
        loading="lazy"
      />

      <div className="flex flex-col gap-3 p-5">
        <span className="w-fit rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent-strong)]">
          {product.type}
        </span>
        <h3 className="text-base font-semibold leading-snug text-[var(--text)]">
          {product.title}
        </h3>
        <p className="text-sm text-[var(--text-muted)]">{product.blurb}</p>

        {/* Chọn ngày */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--text-muted)]">Ngày đi</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]"
          />
        </label>

        {/* Bộ chọn khách */}
        <GuestStepper label="Người lớn" value={adults} min={1} onChange={setAdults} unit={product.priceAdult} />
        <GuestStepper label="Trẻ em" value={children} min={0} onChange={setChildren} unit={product.priceChild} />
        <GuestStepper label="Em bé" value={infants} min={0} onChange={setInfants} unit={product.priceInfant} />

        {/* Giá tạm tính + nút */}
        <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-3">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Tạm tính</p>
            <p className="text-lg font-semibold text-[var(--text)]">
              {formatVnd(lineTotal)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white transition active:scale-95 hover:bg-[var(--color-accent-strong)]"
          >
            {added ? "Đã thêm" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function GuestStepper({
  label,
  value,
  min,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
  unit: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--text-muted)]">
        {label}
        {unit > 0 && <span className="block text-xs">{formatVnd(unit)}</span>}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Giảm ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] transition active:scale-90"
        >
          −
        </button>
        <span className="w-6 text-center font-medium text-[var(--text)]">{value}</span>
        <button
          type="button"
          aria-label={`Tăng ${label}`}
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] transition active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
}