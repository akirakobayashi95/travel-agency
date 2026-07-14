# VietTravel - Travel Product & Service Booking E-marketplace

Nền tảng đặt tour, khách sạn và vé du lịch trực tuyến, tối ưu cho **Netlify** ecosystem, dùng **Supabase (PostgreSQL)**.

- **Frontend & Backend:** Next.js (App Router), deploy trên Netlify
- **Database:** Supabase (PostgreSQL) + RPC Stored Procedures
- **Payment:** VNPAY (Việt Nam)
- **Chống overbooking:** Row-Level Lock (`SELECT ... FOR UPDATE`) bên trong Supabase RPC `create_booking_transaction`

---

## 1. Tính năng chính

- Sản phẩm đa dạng: `tour`, `hotel`, `ticket` với giá riêng cho `adult / child / infant`.
- Giỏ hàng thống nhất (Unified Cart) tính giá real-time theo số lượng khách.
- **Tạo booking an toàn qua Supabase RPC**: khóa dòng tồn kho (`FOR UPDATE`) để tránh book trùng khi có nhiều request đồng thời. Có `CHECK (booked_slots <= total_slots)`.
- Thanh toán VNPAY: tạo URL redirect (HMAC-SHA512) và xử lý IPN webhook (rollback tồn kho khi thất bại).
- UI responsive, hỗ trợ light/dark mode, tuân thủ `prefers-reduced-motion`.

---

## 2. Cấu trúc dự án

```
supabase/
  migrations/0001_init.sql    # DDL: products / inventory / bookings / booking_items
  migrations/0002_rpc_booking.sql  # RPC: create_booking_transaction + rollback_booking_inventory
  seed.sql                     # Seed demo (UUID khớp với frontend)
src/
  lib/
    supabase.ts         # Supabase client (server service_role + browser anon)
    vnpay.ts           # HMAC-SHA512, sort field, build URL, verify hash
  components/
    cart-store.tsx     # Context giỏ hàng + tính giá real-time
    site-nav.tsx       # Thanh điều hướng
    product-card.tsx   # Thẻ sản phẩm + stepper chọn khách
  data/products.ts     # Dữ liệu mẫu (UUID khớp Supabase seed)
  app/
    layout.tsx, globals.css, page.tsx
    cart/page.tsx      # Giỏ hàng + nút thanh toán (gọi RPC rồi redirect VNPAY)
    checkout/result/   # Trang kết quả
    payment/return/    # Trang return từ VNPAY
    api/
      payment/vnpay-url/route.ts     # Tạo URL thanh toán
      payment/vnpay-ipn/route.ts     # Webhook IPN (rollback RPC)
netlify.toml           # Cấu hình deploy Netlify
.env.example           # Mẫu biến môi trường
```

---

## 3. Cài đặt local

### 3.1. Yêu cầu
- Node.js >= 18
- Tài khoản Supabase (project mới)
- Tài khoản VNPAY (sandbox để test)

### 3.2. Các bước

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file env từ mẫu và điền thông tin
cp .env.example .env
# Mở .env, điền:
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY  (TUYỆT ĐỐI BÍ MẬT - chỉ backend)
#   VNP_TMN_CODE, VNP_HASH_SECRET, VNP_ENV, NEXT_PUBLIC_BASE_URL

# 3. Trên Supabase SQL Editor, chạy tuần tự:
#   - supabase/migrations/0001_init.sql   (tạo bảng)
#   - supabase/migrations/0002_rpc_booking.sql (tạo RPC)
#   - supabase/seed.sql                        (dữ liệu demo)

# 4. Chạy dev server
npm run dev
# Mở http://localhost:3000
```

> Lưu ý: migration Supabase chạy qua SQL Editor hoặc Supabase CLI (`supabase db push`), không dùng Prisma.

---

## 4. Biến môi trường (`.env`)

| Biến | Mô tả |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (public, browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (**bí mật**, chỉ backend/API) |
| `VNP_TMN_CODE` | Terminal code cấp bởi VNPAY |
| `VNP_HASH_SECRET` | Hash secret VNPAY (**bí mật**) |
| `VNP_ENV` | `sandbox` (test) hoặc `production` |
| `NEXT_PUBLIC_BASE_URL` | URL gốc site (build returnUrl / ipnUrl) |

---

## 5. Luồng booking & chống overbooking (Supabase RPC)

```
User thêm sản phẩm -> Cart
  -> "Thanh toán" gọi supabase.rpc('create_booking_transaction')
       ├─ Bắt đầu transaction (bên trong Postgres function)
       ├─ INSERT bookings (status 'unpaid')
       ├─ FOREACH item:
       │    ├─ SELECT ... FOR UPDATE trên inventory (product+date)
       │    ├─ Check (total_slots - booked_slots) >= quantity
       │    │    ├─ Thiếu -> RAISE EXCEPTION -> ROLLBACK toàn bộ
       │    └─ Đủ     -> UPDATE booked_slots += quantity, INSERT booking_items
       └─ RETURN booking_id
  -> POST /api/payment/vnpay-url  -> trả URL redirect
  -> Redirect sang VNPAY
       ├─ Thành công -> VNPAY gọi IPN (vnp_ResponseCode='00') -> bookings = 'paid'
       └─ Thất bại -> IPN gọi RPC rollback_booking_inventory (giảm booked_slots) + 'cancelled'
```

`FOR UPDATE` đảm bảo hai request cùng lúc vào một ngày phải xếp hàng tuần tự, không thể cùng đọc `booked_slots` cũ dẫn đến bán vượt slot. Ngoài ra `CHECK (booked_slots <= total_slots)` là ràng buộc toàn vẹn ở tầng DB.

---

## 6. Deploy lên Netlify

### 6.1. Kết nối repository
1. Vào [Netlify](https://app.netlify.com) > **Add new site** > **Import from Git**.
2. Chọn repo `akirakobayashi95/travel-agency`.
3. Netlify tự động phát hiện Next.js nhờ `@netlify/plugin-nextjs`.

Cấu hình build mặc định:
- **Build command:** `npm run build`
- **Publish directory:** `.next`

### 6.2. Biến môi trường trên Netlify
Vào **Site settings > Environment variables**, thêm:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (paste service_role key)
- `VNP_TMN_CODE`, `VNP_HASH_SECRET`, `VNP_ENV`
- `NEXT_PUBLIC_BASE_URL` = `https://<ten-site>.netlify.app`

### 6.3. Khởi tạo DB trên Supabase
Trong Supabase dashboard, chạy 3 file SQL (mục 3.2) một lần. Các migration đã nằm trong `supabase/migrations/`.

### 6.4. Deploy
Mỗi `git push` lên `master` tự động trigger deploy.

---

## 7. Test luồng thanh toán (Sandbox)

1. Đặt `VNP_ENV=sandbox`.
2. Dùng thẻ test VNPAY.
3. Sau thanh toán, VNPAY gọi `IPN` rồi redirect về `/payment/return`, sau đó chuyển tới `/checkout/result`.

---

## 8. Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |

---

## 9. Lưu ý bảo mật

- Không hardcode secret (`SUPABASE_SERVICE_ROLE_KEY`, `VNP_HASH_SECRET`) vào source.
- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng ở server (API routes), không expose ra browser.
- IPN luôn validate `vnp_SecureHash` trước khi xử lý.
- RPC `create_booking_transaction` / `rollback_booking_inventory` được `GRANT EXECUTE` cho `service_role`.