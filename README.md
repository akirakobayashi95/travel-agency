# VietTravel - Travel Product & Service Booking E-marketplace

Nền tảng đặt tour, khách sạn và vé du lịch trực tuyến, tối ưu cho **Netlify** ecosystem.

- **Frontend & Backend:** Next.js (App Router), deploy trên Netlify
- **Database:** Netlify Database (PostgreSQL) + Prisma ORM
- **Payment:** VNPAY (Việt Nam)
- **Chống overbooking:** Row-level locking (`SELECT ... FOR UPDATE`) trong transaction

---

## 1. Tính năng chính

- Sản phẩm đa dạng: `TOUR`, `HOTEL`, `TICKET` với giá riêng cho `Người lớn / Trẻ em / Em bé`.
- Giỏ hàng thống nhất (Unified Cart) tính giá real-time theo số lượng khách.
- Tạo booking an toàn: khóa dòng tồn kho (`FOR UPDATE`) để tránh book trùng khi có nhiều request đồng thời.
- Thanh toán VNPAY: tạo URL redirect (HMAC-SHA512) và xử lý IPN webhook (có rollback tồn kho khi thất bại).
- UI responsive, hỗ trợ light/dark mode, tuân thủ `prefers-reduced-motion`.

---

## 2. Cấu trúc dự án

```
prisma/
  schema.prisma        # Schema PostgreSQL (Product / Inventory / Booking / BookingItem)
  seed.ts              # Seed dữ liệu demo (3 sản phẩm, 30 ngày tồn kho)
src/
  lib/
    prisma.ts          # PrismaClient singleton (tránh cạn connection pool)
    vnpay.ts           # HMAC-SHA512, sort field, build URL, verify hash
  components/
    cart-store.tsx     # Context giỏ hàng + tính giá real-time
    site-nav.tsx       # Thanh điều hướng
    product-card.tsx   # Thẻ sản phẩm + stepper chọn khách
  data/products.ts     # Dữ liệu mẫu
  app/
    layout.tsx, globals.css, page.tsx
    cart/page.tsx      # Giỏ hàng + nút thanh toán VNPAY
    checkout/result/   # Trang kết quả
    payment/return/    # Trang return từ VNPAY
    api/
      bookings/create/route.ts       # Tạo booking + FOR UPDATE lock
      payment/vnpay-url/route.ts     # Tạo URL thanh toán
      payment/vnpay-ipn/route.ts     # Webhook IPN
netlify.toml           # Cấu hình deploy Netlify
.env.example           # Mẫu biến môi trường
```

---

## 3. Cài đặt local

### 3.1. Yêu cầu
- Node.js >= 18
- PostgreSQL (hoặc dùng Netlify Database)
- Tài khoản VNPAY (sandbox để test)

### 3.2. Các bước

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file env từ mẫu và điền thông tin
cp .env.example .env
# Mở .env và điền DATABASE_URL, VNP_TMN_CODE, VNP_HASH_SECRET, NEXT_PUBLIC_BASE_URL

# 3. Sinh Prisma Client
npx prisma generate

# 4. Tạo bảng (migrate) và seed dữ liệu demo
npx prisma migrate dev --name init
npx prisma db seed

# 5. Chạy dev server
npm run dev
# Mở http://localhost:3000
```

---

## 4. Biến môi trường (`.env`)

| Biến | Mô tả |
|------|-------|
| `DATABASE_URL` | Connection string PostgreSQL (Netlify Database) |
| `VNP_TMN_CODE` | Terminal code cấp bởi VNPAY |
| `VNP_HASH_SECRET` | Hash secret VNPAY (**tuyệt đối bí mật**) |
| `VNP_ENV` | `sandbox` (test) hoặc `production` |
| `NEXT_PUBLIC_BASE_URL` | URL gốc của site (dùng build returnUrl / ipnUrl) |

> Không commit file `.env` (đã nằm trong `.gitignore`).

---

## 5. Luồng booking & chống overbooking

```
User thêm sản phẩm -> Cart
  -> "Thanh toán" gọi POST /api/bookings/create
       ├─ Bắt đầu $transaction
       ├─ SELECT ... FOR UPDATE trên Inventory (theo productId + date)
       ├─ Kiểm tra totalSlots - bookedSlots >= qty
       │    ├─ Thiếu slot  -> ROLLBACK + trả 400 (SOLD OUT)
       │    └─ Đủ slot     -> UPDATE bookedSlots += qty
       └─ Tạo Booking (UNPAID) + BookingItem
  -> POST /api/payment/vnpay-url  -> trả URL redirect
  -> Redirect sang VNPAY
       ├─ Thành công -> VNPAY gọi IPN (vnp_ResponseCode='00') -> Booking = PAID
       └─ Thất bại -> IPN rollback bookedSlots (trong transaction)
```

`FOR UPDATE` đảm bảo hai request cùng lúc vào một ngày phải xếp hàng tuần tự,
không thể cùng đọc `bookedSlots` cũ dẫn đến bán vượt slot.

---

## 6. Deploy lên Netlify

### 6.1. Kết nối repository
1. Vào [Netlify](https://app.netlify.com) > **Add new site** > **Import from Git**.
2. Chọn repo `akirakobayashi95/travel-agency`.
3. Netlify tự động phát hiện Next.js nhờ `@netlify/plugin-nextjs` (đã khai báo trong `netlify.toml`).

Cấu hình build mặc định:
- **Build command:** `npm run build`
- **Publish directory:** `.next`

### 6.2. Biến môi trường trên Netlify
Vào **Site settings > Environment variables**, thêm:
- `DATABASE_URL` (lấy từ Netlify Database)
- `VNP_TMN_CODE`, `VNP_HASH_SECRET`, `VNP_ENV`
- `NEXT_PUBLIC_BASE_URL` = `https://<ten-site>.netlify.app`

### 6.3. Khởi tạo database trên Netlify
Trong Netlify UI, bật **Netlify Data (Postgres)** để lấy `DATABASE_URL`.
Sau đó chạy migration + seed từ môi trường có `DATABASE_URL`:

```bash
npx prisma migrate deploy
npx prisma db seed
```

> Lưu ý: `prisma migrate deploy` (không có dev) dùng cho production.

### 6.4. Deploy
Mỗi `git push` lên `master` sẽ tự động trigger deploy trên Netlify.

---

## 7. Test luồng thanh toán (Sandbox)

1. Đặt `VNP_ENV=sandbox`.
2. Dùng thẻ test VNPAY (tài khoản sandbox cung cấp).
3. Sau thanh toán, VNPAY gọi `IPN` rồi redirect về `/payment/return`, sau đó chuyển tới `/checkout/result`.

---

## 8. Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |
| `npx prisma generate` | Sinh Prisma Client |
| `npx prisma migrate dev` | Tạo migration (dev) |
| `npx prisma db seed` | Seed dữ liệu demo |

---

## 9. Lưu ý bảo mật

- Không hardcode secret (`VNP_HASH_SECRET`, `DATABASE_URL`) vào source.
- IPN luôn validate `vnp_SecureHash` trước khi xử lý.
- API validate input (số lượng khách >= 1, tồn tại sản phẩm) trước khi ghi DB.