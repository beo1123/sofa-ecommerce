[![CI](https://github.com/beo1123/sofa-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/beo1123/sofa-ecommerce/actions/workflows/ci.yml)

# Sofa Phạm Gia (`sofaphamgia.com`) — Web Cửa Hàng & Hệ Thống Quản Trị Xưởng Sofa

Ứng dụng thương mại điện tử và quản trị xưởng đóng sofa theo yêu cầu cho **Sofa Phạm Gia** (TP. Hồ Chí Minh — Hotline/Zalo: `0932 111 620`), xây dựng bằng **Next.js 16 (App Router)**, **TypeScript strict**, **Tailwind CSS v4** và **Prisma ORM + PostgreSQL**.

---

## 1. Công nghệ sử dụng (Tech Stack)

| Thành phần        | Công nghệ                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Framework         | Next.js 16 (App Router, Server Components, Server Actions, Turbopack), React 19, TypeScript  |
| Styling & Icons   | Tailwind CSS v4 (design tokens trong `src/app/globals.css`), `@tabler/icons-react` (outline) |
| Database & ORM    | PostgreSQL (Docker Local / Neon Cloud) + Prisma 6 (additive migrations)                      |
| Xác thực          | NextAuth v4 (`Credentials` + JWT session, phân quyền `Admin` / `Khách hàng`)                 |
| Form & Validation | `react-hook-form` + `zod` + `@hookform/resolvers`                                            |
| Rich Text Editor  | Tiptap v3 (`StarterKit`, `Link`, `Image`, `Placeholder`, `@tiptap/html` `generateHTML`)      |
| Biểu đồ & PDF     | Recharts (biểu đồ doanh thu & danh mục), `@react-pdf/renderer` (xuất hóa đơn PDF tiếng Việt) |
| State & Media     | Zustand (Admin UI state), Redux Toolkit (giỏ hàng storefront), Cloudinary CDN (upload ảnh)   |
| Kiểm thử          | Jest + Testing Library (`npm test`)                                                          |

---

## 2. Kiến trúc dự án (Clean Architecture)

Dự án được tổ chức tách lớp rõ ràng theo hướng **Clean Architecture** cho Next.js App Router — tách biệt **UI**, **Delivery (Page / Server Actions / API)**, **Application Services (Use Cases)**, **Domain Validators** và **Infrastructure**:

```text
Presentation (src/components/*)
   │  UI thuần Tailwind v4, không import PrismaClient
   ▼
Delivery / Adapters (src/app/(admin)/*, src/app/(storefront)/*, src/app/api/*)
   │  Xác thực (requireAdmin), validate Zod, gọi Service, revalidatePath
   ▼
Application Services (src/services/*)
   │  Nghiệp vụ & transaction Prisma (Dependency Injection: new Service(prisma))
   ▼
Domain & Infrastructure (src/lib/*)
   ├─ Domain: workshop-types.ts, validators/*.ts, format.ts, slug.ts, tiptap-extensions.ts
   └─ Infra : prisma.ts, audit.ts, admin.ts, upload.ts, cache/categories.ts
```

### Cấu trúc thư mục chính

```text
prisma/
├── schema.prisma                # Lược đồ DB (models gốc + mở rộng xưởng: Inquiry, Shipment, DepositLog)
├── migrations/                  # Prisma migrations (chỉ additive, an toàn cho dữ liệu live)
└── seed-admin.ts                # Script khởi tạo role & tài khoản Admin

src/
├── app/
│   ├── globals.css              # Design tokens nguồn (brand-50..400, MontserratLocal, .tiptap-editor-content)
│   ├── (storefront)/            # Giao diện khách hàng: /, /san-pham, /san-pham/[slug], /bai-viet/[slug], /lien-he
│   ├── (admin)/admin/           # Cổng quản trị (bảo vệ bằng requireAdmin):
│   │   ├── page.tsx             # 5a. Tổng quan (KPI + Recharts + Đơn gần nhất + Leads mới)
│   │   ├── orders/              # 5b. Đơn hàng (pipeline inline, Drawer 520px, cọc, vận chuyển, PDF)
│   │   ├── products/            # 5c. Sản phẩm (bảng + form 6 tab + duyệt đánh giá)
│   │   ├── articles/            # 5d. Bài đăng (Tiptap bodyJson + SEO + gắn sản phẩm)
│   │   ├── inquiries/           # 5e. Tư vấn & Leads (web/zalo/fb/tiktok/walk-in)
│   │   ├── returns/             # 5f. Bảo hành, Đổi trả & Hoàn tiền (lightbox bằng chứng)
│   │   ├── shipments/           # 5g. Vận chuyển (chế độ Bảng & Lịch tuần)
│   │   ├── customers/           # 5h. Khách hàng (sổ địa chỉ, lịch sử đơn, đánh giá)
│   │   ├── coupons/             # 5i. Khuyến mãi (PERCENT / FIXED / BOGO)
│   │   └── settings/            # 5j. Cài đặt & Nhật ký AuditLog
│   └── api/                     # REST Route Handlers (public /api/inquiries + /api/admin/*)
├── services/                    # Application Services (DI với PrismaClient, dễ unit test)
│   ├── storefront.service.ts
│   └── admin/                   # dashboard, order, product, article, inquiry, return, shipment, customer, coupon, auditLog
├── components/
│   ├── ui/                      # Primitives: Button, Badge, Input, Select, Drawer, StatusBadge
│   ├── admin/                   # AdminSidebar, AdminHeader + UI từng phân hệ quản trị
│   └── store/                   # StoreNavbar, StoreProductCard, StoreProductListing, StoreProductDetail, ConsultationForm
├── lib/
│   ├── validators/              # Zod schemas khớp Prisma models (order, product, article, inquiry, return, coupon)
│   ├── cache/categories.ts      # React cache() gộp truy vấn Category giữa RootLayout, StorefrontLayout & Footer
│   ├── prisma.ts                # Singleton PrismaClient + type exports
│   ├── audit.ts                 # Ghi nhận AuditLog tự động lấy IP & User-Agent
│   └── workshop-types.ts        # Enums, nhãn tiếng Việt & JSON parsers an toàn cho Client/Server
└── store/
    └── useAdminUIStore.ts       # Zustand store chỉ quản lý trạng thái UI Admin
```

---

## 3. Hướng dẫn cài đặt & khởi chạy

### Bước 1: Cài đặt thư viện

```bash
npm install
```

### Bước 2: Tạo file biến môi trường `.env`

Sao chép từ `.env.example`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Cấu hình các biến quan trọng trong `.env`:

```env
# App & Auth
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<chuoi-ngau-nhien-64-ky-tu>

# Database — Chọn 1 trong 2:
# Option 1: Docker PostgreSQL Local (cổng 5433)
DATABASE_URL="postgresql://postgres:1234@localhost:5433/sofa?schema=public"

# Option 2: Neon Cloud PostgreSQL (Server / Production)
# DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>/<DB>?sslmode=require&channel_binding=require"

# Cloudinary (Upload ảnh sản phẩm, bài viết, hóa đơn PDF)
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# Tạo tài khoản Admin lần đầu (dùng với npm run prisma:seed:admin)
ADMIN_EMAIL=admin@sofaphamgia.com
ADMIN_PASSWORD=<mat-khau-manh>

# Tùy chọn: Bật log SQL khi debug (mặc định tắt ở production)
# PRISMA_LOG_QUERIES=true

# Tùy chọn: Gửi email thông báo cho Admin khi có khách gửi form /lien-he (Resend)
# RESEND_API_KEY=<resend_api_key>
# ADMIN_NOTIFY_EMAIL=admin@sofaphamgia.com
```

### Bước 3: Khởi động Database & chạy Migration

**Nếu dùng Docker PostgreSQL Local:**

```bash
npm run db:up
npx prisma migrate deploy
npx prisma generate
```

**Nếu dùng Neon Cloud Server DB (hoặc DB đã có dữ liệu live):**

```bash
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
```

> **Lưu ý an toàn dữ liệu:** Luôn dùng `npx prisma migrate dev --name <ten_migration>` ở môi trường local khi thêm trường/bảng mới (chỉ bổ sung cột mới có `DEFAULT` hoặc nullable) và dùng `npx prisma migrate deploy` trên server/production. **Không bao giờ** chạy `prisma migrate reset` hoặc `prisma db push` trên cơ sở dữ liệu có dữ liệu thực tế.

### Bước 4: Tạo tài khoản Admin & chạy ứng dụng

```bash
# Tạo role Admin và tài khoản quản trị (chạy 1 lần)
npm run prisma:seed:admin

# Chạy môi trường phát triển
npm run dev
```

Truy cập:

- **Cửa hàng:** `http://localhost:3000`
- **Đăng nhập quản trị:** `http://localhost:3000/dang-nhap` → sau khi đăng nhập tài khoản `Admin`, vào `http://localhost:3000/admin`.

---

## 4. Hướng dẫn sử dụng Cửa hàng (Storefront)

1. **Thanh điều hướng (Navbar):**
   - Cố định khi cuộn trang, tự động hiển thị danh mục từ bảng `Category`.
   - Biểu tượng kính lúp mở ô tìm kiếm nhanh (`/tim-kiem?q=...`), nút hotline `0932 111 620` gọi trực tiếp, trên di động mở menu dạng ngăn kéo trượt.
2. **Danh sách sản phẩm (`/san-pham`):**
   - Lọc theo **Danh mục**, **Chất liệu bọc**, **Bảng màu (Color swatch)** và **Khoảng giá**; sắp xếp theo _Mới nhất_, _Giá thấp → cao_, _Giá cao → thấp_.
   - Mỗi thẻ hiển thị ảnh chính tỷ lệ `4/3`, mã xưởng (`workshopCode`), giá khởi điểm thấp nhất từ biến thể và các chip chất liệu.
3. **Chi tiết sản phẩm (`/san-pham/[slug]`):**
   - Xem bộ ảnh gallery + dải ảnh thu nhỏ.
   - Chọn **Kích thước tiêu chuẩn** hoặc bật **Đặt kích thước riêng** (nhập Dài × Sâu × Cao theo cm), chọn **Chất liệu** (tự động cộng chênh lệch `priceDelta` & cập nhật bảng **Bảo hành Khung / Bề mặt / Đệm** tương ứng) và chọn **Màu sắc**.
   - Bấm **Nhắn tư vấn Zalo**, **Gọi Mr. Giang**, hoặc bấm gửi báo giá để tự động điền sẵn cấu hình vừa chọn sang `/lien-he`.
   - Bên dưới hiển thị **Đánh giá đã duyệt** và **Sản phẩm tương tự**.
4. **Form tư vấn (`/lien-he`):**
   - Khách nhập Họ tên, SĐT, Quận/Huyện, Loại phòng, Ngân sách dự kiến và Ghi chú → gọi `POST /api/inquiries` tạo bản ghi `Inquiry` mới (xuất hiện ngay trên badge sidebar & trang `/admin/inquiries`).
5. **Bài viết kinh nghiệm (`/bai-viet/[slug]`):**
   - Nội dung Tiptap JSON được render qua `@tiptap/html` (`generateHTML`) kết hợp thẻ sản phẩm liên kết (`linkedProductId`) cuối bài.

---

## 5. Hướng dẫn sử dụng Cổng Quản Trị (`/admin`)

| Phân hệ                | Đường dẫn          | Hướng dẫn thao tác chính                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tổng quan**          | `/admin`           | Xem 4 chỉ số KPI (Đơn hôm nay, Chờ sản xuất, Đang giao, Doanh thu tháng), biểu đồ doanh thu 30 ngày, đơn theo danh mục, thẻ Leads mới chờ xử lý và 10 đơn hàng gần nhất.                                                                                                                                                                                                                                                                                                                 |
| **Đơn hàng**           | `/admin/orders`    | • Nhấn trực tiếp vào **badge trạng thái xưởng** để chuyển bước (`Đơn mới → Đã cọc → Đang sản xuất → Đang giao → Hoàn thành / Bảo hành / Đã hủy`) không cần tải lại trang.<br>• Nhấn vào **dòng đơn hàng** để mở Drawer 520px: sửa lịch vận chuyển, ghi nhận **Thêm cọc** (tự động cộng `depositPaid` và chuyển trạng thái `new → deposited`), xem lịch sử trạng thái, ghi chú nội bộ (tự động lưu sau 0.7 giây) và bấm **In hóa đơn PDF** (xuất file A4 tiếng Việt & lưu `invoiceUrl`).  |
| **Sản phẩm**           | `/admin/products`  | • Nhấn badge trạng thái để chuyển nhanh `PUBLISHED / DRAFT / ARCHIVED`.<br>• Trang Thêm/Sửa gồm **6 tab**: _Cơ bản_ (mã xưởng tự gợi ý `PGG-`/`PGB-` theo danh mục, tự tạo slug), _Giá & Biến thể_ (bảng `ProductVariant` + bộ cấu hình `materialOptions` & bảng màu), _Kích thước_ (`W×D×H` + bật/tắt đặt riêng), _Hình ảnh_ (kéo-thả lên Cloudinary, sắp xếp thứ tự, chọn radio ảnh chính), _SEO_ (`metadata` key-value + xem trước URL), _Đánh giá_ (duyệt/ẩn/xóa review khách hàng). |
| **Bài đăng**           | `/admin/articles`  | Soạn thảo bằng **Tiptap** (H2/H3, Bold/Italic, List, Blockquote, Link, upload ảnh trực tiếp trong bài, xóa định dạng — tự động đồng bộ `bodyJson` và `content`), tạo danh mục bài viết ngay tại chỗ, tải ảnh bìa (`coverImageUrl`), tìm & gắn **Sản phẩm liên kết**, tùy chỉnh SEO, chọn **Lưu nháp**, **Xuất bản** hoặc **Xem trước**.                                                                                                                                                  |
| **Tư vấn & Leads**     | `/admin/inquiries` | Lọc theo trạng thái (`Mới / Đang tư vấn / Chốt đơn / Không chốt`) và nguồn (`Website / Zalo / Facebook / TikTok / Showroom`). Chọn nhân viên phụ trách & đổi trạng thái trực tiếp trên bảng, hoặc bấm **Thêm Lead mới** để nhập khách từ Zalo/Showroom.                                                                                                                                                                                                                                  |
| **Bảo hành & Đổi trả** | `/admin/returns`   | Chuyển đổi giữa tab **Yêu cầu bảo hành/đổi trả** và **Lịch sử hoàn tiền**. Nhấn **Xem ảnh** để mở lightbox phóng to minh chứng, đổi trạng thái phiếu (`PENDING / APPROVED / RECEIVED / REJECTED`), và mở Drawer để tạo/cập nhật giao dịch hoàn tiền (`Refund`).                                                                                                                                                                                                                          |
| **Vận chuyển**         | `/admin/shipments` | Bấm chuyển đổi giữa chế độ **Bảng** và **Lịch tuần** (màu theo trạng thái, nút Tuần trước / Tuần này / Tuần sau). Lọc nhanh các đơn **cần xe cẩu**, kiểm tra tầng & thang máy, hoặc bấm **Lên lịch giao** cho đơn chưa có lịch.                                                                                                                                                                                                                                                          |
| **Khách hàng**         | `/admin/customers` | Tìm kiếm theo tên, email, SĐT, thành phố; nhấn vào khách để mở Drawer xem sổ địa chỉ, lịch sử đơn hàng và các đánh giá đã viết.                                                                                                                                                                                                                                                                                                                                                          |
| **Khuyến mãi**         | `/admin/coupons`   | Bật/tắt công tắc `active` trực tiếp trên bảng; bấm **Tạo mã khuyến mãi** để cấu hình mã giảm `%`, giảm tiền cố định hoặc `BOGO`, giới hạn lượt dùng và thời gian hiệu lực.                                                                                                                                                                                                                                                                                                               |
| **Cài đặt & Log**      | `/admin/settings`  | Xem thông tin tổng quan xưởng và tra cứu bảng `AuditLog` (lọc theo đối tượng, tài khoản, khoảng ngày); nhấn vào từng dòng để xem chi tiết JSON thay đổi, địa chỉ IP và User-Agent.                                                                                                                                                                                                                                                                                                       |

---

## 6. Danh sách Scripts & REST API

### Scripts phổ biến

```bash
npm run dev                  # Chạy Next.js dev server
npm run build                # Build production (Next.js Turbopack + TypeScript check)
npm run start                # Khởi chạy bản production build
npm run typecheck            # Kiểm tra TypeScript (tsc --noEmit)
npm test                     # Chạy toàn bộ bộ unit test Jest
npm run lint                 # Kiểm tra ESLint
npm run format               # Format toàn bộ mã nguồn với Prettier
npm run db:up                # Khởi động Docker PostgreSQL local (cổng 5433)
npm run db:down              # Dừng Docker PostgreSQL local
npm run prisma:generate      # Sinh Prisma Client
npm run prisma:migrate:deploy # Áp dụng migration an toàn (production / server)
npm run prisma:studio        # Mở Prisma Studio
npm run prisma:seed:admin    # Khởi tạo tài khoản Admin
```

### REST API Endpoints chính (bổ trợ Server Actions)

- **Public Storefront:**
  - `POST /api/inquiries` — Nhận yêu cầu tư vấn từ `/lien-he`
  - `GET /api/products`, `GET /api/products/[slug]`, `GET /api/categories`, `GET /api/articles`, `GET /api/search`, `POST /api/checkout`
- **Admin (yêu cầu session `Admin` qua `requireAdmin()`):**
  - `GET /api/admin/orders`, `GET|PATCH /api/admin/orders/[id]`
  - `GET|POST /api/admin/orders/[id]/deposits`
  - `PUT /api/admin/orders/[id]/shipment`
  - `GET|POST /api/admin/orders/[id]/invoice` (xuất PDF hóa đơn `@react-pdf/renderer`)
  - `GET|POST /api/admin/inquiries`, `PATCH|DELETE /api/admin/inquiries/[id]`
  - `GET /api/admin/returns`, `PATCH|PUT /api/admin/returns/[id]`
  - `GET /api/admin/shipments`, `PATCH /api/admin/shipments/[id]`
  - `GET /api/admin/customers`
  - `GET|POST /api/admin/coupons`, `PATCH|DELETE /api/admin/coupons/[id]`
  - `GET /api/admin/audit-logs`
  - `POST|DELETE /api/admin/upload` (Cloudinary upload)
  - `GET|POST /api/admin/products`, `GET|PATCH|DELETE /api/admin/products/[id]`, `POST /api/admin/products/import`
  - `GET|POST /api/admin/articles`, `GET|PATCH|DELETE /api/admin/articles/[id]`

---

## 7. Triển khai lên Production (Vercel + Neon)

1. Tạo PostgreSQL database trên [Neon](https://neon.tech/) và lấy chuỗi `DATABASE_URL` có `sslmode=require`.
2. Khai báo đủ biến môi trường trên Vercel (`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_BASE_URL`, các biến `CLOUDINARY_*`, và tùy chọn `RESEND_API_KEY` + `ADMIN_NOTIFY_EMAIL`).
3. Áp dụng migration an toàn lên server DB trước hoặc ngay khi deploy:

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

4. Kiểm tra build local trước khi đẩy code:

```bash
npm run typecheck && npm test && npm run build
```
