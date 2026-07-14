-- ============================================================================
-- Supabase (PostgreSQL) DDL cho Travel Booking Marketplace
-- ----------------------------------------------------------------------------
-- Thiết kế chống overbooking bằng:
--   + Check constraint (booked_slots <= total_slots)
--   + Row-Level Locking (SELECT ... FOR UPDATE) bên trong Stored Procedure
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. products: sản phẩm / dịch vụ du lịch
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          VARCHAR(20) NOT NULL
                  CHECK (type IN ('tour', 'hotel', 'ticket')),
  title         VARCHAR(255) NOT NULL,
  price_adult   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price_child   NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price_infant  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_type ON public.products (type);

-- ----------------------------------------------------------------------------
-- 2. inventory: tồn kho theo ngày (mỗi product + date chỉ 1 dòng)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  total_slots   INTEGER NOT NULL DEFAULT 0,
  booked_slots  INTEGER NOT NULL DEFAULT 0,
  -- Ràng buộc toàn vẹn: không bao giờ book vượt quá tổng slot
  CONSTRAINT chk_booked_le_total CHECK (booked_slots <= total_slots),
  -- Mỗi ngày mỗi sản phẩm đúng 1 dòng tồn kho
  CONSTRAINT unq_product_date UNIQUE (product_id, date)
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory (product_id);

-- ----------------------------------------------------------------------------
-- 3. bookings: đơn đặt chỗ của user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,
  total_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_status  VARCHAR(20) NOT NULL DEFAULT 'unpaid'
                    CHECK (payment_status IN ('unpaid', 'paid', 'cancelled')),
  vnpay_txn_ref  VARCHAR(100) NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_txn ON public.bookings (vnpay_txn_ref);

-- ----------------------------------------------------------------------------
-- 4. booking_items: chi tiết từng dòng trong booking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings (id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products (id),
  quantity        INTEGER NOT NULL DEFAULT 0,
  booking_date    DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON public.booking_items (booking_id);

-- ----------------------------------------------------------------------------
-- Bật Row Level Security (khuyến nghị Supabase)
-- API routes dùng service_role key (bên server) nên cần policy cho phép.
-- Ở ví dụ này, backend gọi qua service_role nên RLS được bỏ qua tại tầng DB.
-- Nếu dùng anon key từ browser, cần tạo policy riêng.
-- ----------------------------------------------------------------------------
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;