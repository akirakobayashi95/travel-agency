"use client";

// ============================================================================
// Cart store (Zustand) - Global state cho giỏ hàng.
// Tính giá thời gian thực theo số lượng khách (adult / child / infant).
// Chỉ dùng trong Client Components (CartProvider bọc ở layout).
// ============================================================================

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartItem {
  productId: string;
  title: string;
  type: "TOUR" | "HOTEL" | "TICKET";
  priceAdult: number;
  priceChild: number;
  priceInfant: number;
  bookingDate: string;
  adults: number;
  children: number;
  infants: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, bookingDate: string) => void;
  updateGuests: (
    productId: string,
    bookingDate: string,
    field: "adults" | "children" | "infants",
    value: number,
  ) => void;
  clear: () => void;
  // Tổng tiền VND.
  total: number;
  // Tổng số khách.
  totalGuests: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function calcItemPrice(item: CartItem): number {
  return (
    item.adults * item.priceAdult +
    item.children * item.priceChild +
    item.infants * item.priceInfant
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      // Nếu cùng sản phẩm + cùng ngày -> merge số lượng.
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.bookingDate === item.bookingDate,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          adults: next[idx].adults + item.adults,
          children: next[idx].children + item.children,
          infants: next[idx].infants + item.infants,
        };
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((productId: string, bookingDate: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.bookingDate === bookingDate),
      ),
    );
  }, []);

  const updateGuests = useCallback(
    (
      productId: string,
      bookingDate: string,
      field: "adults" | "children" | "infants",
      value: number,
    ) => {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.bookingDate === bookingDate
            ? { ...i, [field]: Math.max(0, value) }
            : i,
        ),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + calcItemPrice(i), 0);
  const totalGuests = items.reduce(
    (sum, i) => sum + i.adults + i.children + i.infants,
    0,
  );

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateGuests,
    clear,
    total,
    totalGuests,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải dùng trong <CartProvider>");
  return ctx;
}

// Format tiền VND.
export function formatVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}