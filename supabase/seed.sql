-- ============================================================================
-- Seed dữ liệu demo vào Supabase (chạy trong Supabase SQL editor).
-- Dùng đúng UUID khớp với src/data/products.ts để frontend demo hoạt động.
-- ============================================================================

-- Xóa sạch (chỉ demo).
DELETE FROM public.booking_items;
DELETE FROM public.bookings;
DELETE FROM public.inventory;
DELETE FROM public.products;

-- Sản phẩm (UUID cố định để khớp với mock frontend).
INSERT INTO public.products (id, type, title, price_adult, price_child, price_infant) VALUES
  ('11111111-1111-1111-1111-111111111111', 'tour',    'Tour Vịnh Hạ Long 2N1Đ - Du thuyền 5 sao', 2490000, 1490000, 490000),
  ('22222222-2222-2222-2222-222222222222', 'hotel',   'Khách sạn Ana Mandara Đà Lạt - Deluxe Garden', 1200000, 0, 0),
  ('33333333-3333-3333-3333-333333333333', 'ticket',  'Vé VinWonders Nha Trang - Cả ngày', 650000, 480000, 0),
  ('44444444-4444-4444-4444-444444444444', 'tour',    'Tour Phú Quốc - Cáp treo Hòn Thơm & Lặn biển', 1890000, 990000, 390000),
  ('55555555-5555-5555-5555-555555555555', 'ticket',  'Vé Cầu Vàng Ba Na Hills - Combo cáp treo', 850000, 650000, 0),
  ('66666666-6666-6666-6666-666666666666', 'hotel',   'Resort Anantara Hội An - Pool Villa', 3200000, 0, 0);

-- Tạo tồn kho 30 ngày tới, mỗi ngày 20 slot cho mỗi sản phẩm.
-- Chạy DO block để sinh date động.
DO $$
DECLARE
  v_prod UUID;
  v_date DATE;
  i INT;
  j INT;
BEGIN
  FOR v_prod IN
    SELECT id FROM public.products
  LOOP
    FOR i IN 0..29 LOOP
      v_date := CURRENT_DATE + i;
      INSERT INTO public.inventory (product_id, date, total_slots, booked_slots)
      VALUES (v_prod, v_date, 20, 0);
    END LOOP;
  END LOOP;
END $$;