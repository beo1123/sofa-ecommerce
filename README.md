[![CI](https://github.com/beo1123/sofa-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/beo1123/sofa-ecommerce/actions/workflows/ci.yml)

# **Sofa Ecommerce** — Production-ready Ecommerce App

Ứng dụng bán sofa **sẵn sàng triển khai**, xây dựng với **Next.js (App Router)** + **TypeScript**.  
Tích hợp công cụ hiện đại, CI/CD, và quy trình đóng góp rõ ràng.

## **Tech Stack**

- **Next.js** (App Router)
- **TypeScript**
- **pnpm** (package manager)
- **Redux Toolkit** (đang phát triển)
- **Tailwind CSS** (đang phát triển)
- **GitHub Actions** (CI/CD)
- **Prisma ORM** + **PostgreSQL** (Local / Neon Cloud)

---

## **Quick Start (Khởi động nhanh)**

```bash
# Cài đặt dependencies
npm install
# hoặc
pnpm install

# Chạy dev server
npm run dev
# hoặc
pnpm dev

# Kiểm tra code (lint)
pnpm lint

# Build production
pnpm build

# Chạy test (đang phát triển)
pnpm test
```

## **Docker & Database Commands**

```bash

# Dừng và xóa container cũ (nếu có)

docker compose -f docker-compose.postgres.yml down --remove-orphans

# Khởi động PostgreSQL container

docker compose -f docker-compose.postgres.yml up -d

# Tắt PostgreSQL hệ thống (nếu chạy trên Windows)

# → Dùng Services → tắt "PostgreSQL"

# Kiểm tra IP của container (nếu cần kết nối trực tiếp)

docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' sofa-ecommerce-db-1

```

---

## **Prisma Commands**

```bash

# Tạo client Prisma

npx prisma generate

# hoặc

npm run prisma:generate

# Tạo & áp dụng migration đầu tiên

npx prisma migrate dev --name init --schema=prisma/schema.prisma

# hoặc

npm run prisma:migrate:dev

# Mở Prisma Studio (giao diện quản lý DB)

npx prisma studio

```

---

# **Hướng Dẫn Cài Đặt Dự Án Sofa Ecommerce**

## **Giới thiệu**

Hướng dẫn này cung cấp các bước cài đặt và thiết lập dự án Sofa Ecommerce sau khi clone về. Bạn có thể chọn sử dụng database **PostgreSQL** trên máy local hoặc sử dụng **Neon** (dịch vụ PostgreSQL đám mây).

---

## **I. Cài Đặt Database PostgreSQL trên Máy Local**

<details><summary><strong>1. Cài Đặt Docker và Docker Compose</strong></summary>

1. **Cài Docker trên Ubuntu**

   ```bash
   sudo apt update
   sudo apt install docker docker-compose -y
   ```

2. **Cài Docker trên Windows/macOS**: Tải và cài đặt **[Docker Desktop](https://www.docker.com/products/docker-desktop)**.

</details>

<details><summary><strong>2. Khởi Động Container PostgreSQL</strong></summary>

1. Vào thư mục chứa file cấu hình Docker:

   ```bash
   cd /path/to/your/project
   ```

2. **Chạy Docker Compose**:

   ```bash
   docker compose -f docker-compose.postgres.yml up -d
   ```

   - `-f` → Chỉ định file `docker-compose` cụ thể.
   - `up` → Khởi động các dịch vụ.
   - `-d` → Chạy ở chế độ ngầm.

   ***

   ### **Kiểm Tra Cổng 5432 đã bị chiếm dụng hay chưa**

   Nếu gặp lỗi sau khi chạy:

   ```
   failed to bind host port for 0.0.0.0:5432 ... address already in use
   ```

   **Nguyên nhân**: Cổng **5432** đang bị chiếm dụng bởi một service khác (ví dụ PostgreSQL cài trực tiếp trên máy).

   #### **Cách khắc phục**:
   1. **Cách 1**: Tìm container hoặc service đang chiếm cổng và dừng nó:
   - Kiểm tra các container đang chạy:

     ```bash
     sudo docker ps
     ```

   - Dừng container chiếm cổng:

     ```bash
     sudo docker stop <container_name>
     ```

   - Nếu PostgreSQL đang chạy trực tiếp trên máy:

     ```bash
     sudo systemctl status postgresql
     sudo systemctl stop postgresql
     ```
   2. **Cách 2**: Thay đổi cổng trong file `docker-compose.postgres.yml`:
   - Mở file và thay đổi `ports`:

     ```yaml
     ports:
       - "5433:5432"
     ```

   - Sau đó, chạy lại container:

     ```bash
     sudo docker compose -f docker-compose.postgres.yml up -d
     ```

   PostgreSQL sẽ chạy trên cổng **5432** trong container, nhưng từ máy host, bạn sẽ kết nối qua cổng **5433**.

---

</details>

<details><summary><strong>3. Kiểm Tra Container</strong></summary>

1. **Kiểm tra container đang chạy**:

   ```bash
   docker ps
   ```

   Nếu thấy container PostgreSQL (postgres:15 hoặc tên bạn đã đặt) → thành công ✅.

2. **Xem log**:

   ```bash
   docker compose -f docker-compose.postgres.yml logs -f
   ```

</details>

<details><summary><strong>4. Dừng và Xóa Container</strong></summary>

1. **Dừng container**:

   ```bash
   docker compose -f docker-compose.postgres.yml down
   ```

2. **Xóa container + volume (cẩn thận)**:

   ```bash
   docker compose -f docker-compose.postgres.yml down -v
   ```

</details>

<details><summary><strong>5. Kết Nối và Sử Dụng PostgreSQL</strong></summary>

#### **Kết nối vào PostgreSQL**

1. **Kết nối vào container**:

   ```bash
   sudo docker exec -it sofa-ecommerce-postgres-1 psql -U postgres -d sofa
   ```

2. **Xem danh sách bảng**:

   ```sql
   \dt
   ```

#### **Tạo Bảng & Migrate với Prisma**

1. **Chạy migration**:

   ```bash
   npx prisma migrate dev
   ```

2. **Hoặc dùng `db push`**:

   ```bash
   npx prisma db push
   ```

3. **Cấu hình `.env`**:

   ```env
   DATABASE_URL="postgresql://postgres:1234@localhost:<your_port>/sofa?schema=public"
   ```

   Sau đó chạy lại migration.

4. **Seed dữ liệu** (đổi trong `package.json`):

   ```json
   "scripts": {
     "seed": "node --loader ts-node/esm prisma/seed.ts"
   }
   ```

   ```bash
   npx prisma db seed
   ```

</details>

---

## **II. Sử Dụng Neon (PostgreSQL Cloud Service)**

<details><summary><strong>1. Đăng Ký và Tạo Dự Án trên Neon</strong></summary>

1. Tạo tài khoản tại: [Neon](https://neon.tech/)
2. Tạo database mới → lưu **host, user, password**.

</details>

<details><summary><strong>2. Dump và Restore Database từ Local lên Neon</strong></summary>

#### **Bước 1: Dump từ Local**

```bash
pg_dump -U postgres -h localhost -Fc --no-owner --no-acl sofa > sofa.dump
```

- `-Fc` → định dạng custom.
- `--no-owner` / `--no-acl` → tránh lỗi quyền.

#### **Bước 2: Import vào Neon**

Dump:

```bash
pg_dump -U postgres -h localhost --no-owner --no-acl -f sofa_dump.sql sofa
```

Import:

```bash
psql "postgresql://neondb_owner:<password>@ep-bold-fire-a1kme9hr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" -f sofa_dump.sql
```

</details>

<details><summary><strong>3. Tạo Bảng & Migrate trên Neon</strong></summary>

1. **Cấu hình `.env`**:

   ```env
   DATABASE_URL="postgresql://neondb_owner:<password>@ep-bold-fire-a1kme9hr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```

2. **Chạy migration**:

   ```bash
   npx prisma migrate dev
   ```

3. **Seed dữ liệu** (nếu cần):

   ```bash
   npx prisma db seed
   ```

</details>

---

## **Tóm Tắt**

- **Docker + PostgreSQL trên Local**: Dễ dàng phát triển và thử nghiệm mà không cần cài đặt PostgreSQL thủ công.
- **Neon (PostgreSQL Cloud Service)**: Giúp bạn dễ dàng quản lý database mà không cần cài đặt hoặc duy trì server riêng.

//các bước làm nếu thêm bảng mới
bước 1: npx prisma migrate reset
bước 2 : npx prisma migrate dev --name "tên migrate của bạn"
bước 3: npx prisma generate
bước 3: npm run prisma:seed(chạy seed để gen data mẫu)
