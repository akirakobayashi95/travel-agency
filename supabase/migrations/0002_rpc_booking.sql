-- ============================================================================
-- Stored Procedures (RPC) cho luồng booking chống overbooking.
-- Gọi từ Next.js qua supabase.rpc() với service_role key (bên server).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TYPE đầu vào: từng dòng booking item (product_id, quantity, booking_date)
-- ----------------------------------------------------------------------------
DROP TYPE IF EXISTS public.booking_item_input;
CREATE TYPE public.booking_item_input AS (
  product_id   UUID,
  quantity     INTEGER,
  booking_date DATE
);

-- ----------------------------------------------------------------------------
-- create_booking_transaction
--   p_user_id      : UUID user đặt
--   p_total_amount : NUMERIC tổng tiền
--   p_vnpay_txn_ref : VARCHAR mã giao dịch VNPAY (unique)
--   p_items        : mảng booking_item_input[]
-- Trả về booking_id (UUID) vừa tạo.
--
-- Bên trong function:
--   a. LOCK các dòng inventory (SELECT ... FOR UPDATE) theo product+date.
--   b. Kiểm tra (total_slots - booked_slots) >= quantity.
--   c. Nếu thiếu -> RAISE EXCEPTION -> toàn bộ rollback.
--   d. Nếu đủ -> UPDATE booked_slots += qty, INSERT bookings + booking_items.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_transaction(
  p_user_id       UUID,
  p_total_amount  NUMERIC,
  p_vnpay_txn_ref VARCHAR,
  p_items          public.booking_item_input[]
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking_id UUID;
  v_item        public.booking_item_input;
  v_inv         RECORD;
  v_available   INTEGER;
BEGIN
  -- Tạo booking trước (status mặc định 'unpaid' do DDL).
  INSERT INTO public.bookings (user_id, total_amount, vnpay_txn_ref)
  VALUES (p_user_id, p_total_amount, p_vnpay_txn_ref)
  RETURNING id INTO v_booking_id;

  -- Duyệt từng item, LOCK + CHECK + UPDATE booked_slots.
  FOREACH v_item IN ARRAY p_items
  LOOP
    -- (a) ROW-LEVEL LOCK: chặn 2 request đồng thời cùng ngày.
    SELECT id, total_slots, booked_slots
      INTO v_inv
      FROM public.inventory
     WHERE product_id = v_item.product_id
       AND date = v_item.booking_date
       FOR UPDATE;

    -- Không có dòng tồn kho cho ngày này.
    IF v_inv IS NULL THEN
      RAISE EXCEPTION 'INVENTORY_NOT_FOUND product=% booking_date=%',
        v_item.product_id, v_item.booking_date
        USING ERRCODE = 'P0001';
    END IF;

    -- (b) Kiểm tra slot trống.
    v_available := v_inv.total_slots - v_inv.booked_slots;
    IF v_available < v_item.quantity THEN
      -- (c) Hết slot -> ném lỗi -> rollback toàn bộ (bao gồm booking vừa tạo).
      RAISE EXCEPTION 'SOLD_OUT product=% available=% requested=%',
        v_item.product_id, v_available, v_item.quantity
        USING ERRCODE = 'P0002';
    END IF;

    -- (d) Tăng booked_slots (đã được lock an toàn).
    UPDATE public.inventory
       SET booked_slots = booked_slots + v_item.quantity,
           updated_at   = now()
     WHERE id = v_inv.id;

    -- Thêm booking_items.
    INSERT INTO public.booking_items
      (booking_id, product_id, quantity, booking_date)
    VALUES
      (v_booking_id, v_item.product_id, v_item.quantity, v_item.booking_date);
  END LOOP;

  RETURN v_booking_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- rollback_booking_inventory
-- Khi thanh toán VNPAY thất bại: hoàn trả booked_slots và
-- đánh dấu booking thành 'cancelled'. Chạy trong 1 transaction (function).
--   p_booking_id : UUID booking cần rollback
-- Trả về TRUE nếu xử lý xong.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rollback_booking_inventory(
  p_booking_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Duyệt từng booking_item để trừ booked_slots.
  FOR v_item IN
    SELECT product_id, booking_date, quantity
      FROM public.booking_items
     WHERE booking_id = p_booking_id
  LOOP
    UPDATE public.inventory
       SET booked_slots = GREATEST(0, booked_slots - v_item.quantity),
           updated_at   = now()
     WHERE product_id = v_item.product_id
       AND date = v_item.booking_date;
  END LOOP;

  -- Cập nhật trạng thái booking.
  UPDATE public.bookings
     SET payment_status = 'cancelled',
         updated_at     = now()
   WHERE id = p_booking_id;

  RETURN TRUE;
END;
$$;

-- Cấp quyền thực thi cho service_role (dùng ở backend).
-- supabase.rpc() với service_role key sẽ chạy được 2 function này.
GRANT EXECUTE ON FUNCTION public.create_booking_transaction(
  UUID, NUMERIC, VARCHAR, public.booking_item_input[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.rollback_booking_inventory(UUID) TO service_role;