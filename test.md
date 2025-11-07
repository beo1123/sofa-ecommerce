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
   DATABASE_URL="postgresql://postgres:1234@localhost:5433/sofa?schema=public"
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

#### **Bước A: Dump từ Local**

```bash
pg_dump -U postgres -h localhost -Fc --no-owner --no-acl sofa > sofa.dump
```

- `-Fc` → định dạng custom.
- `--no-owner` / `--no-acl` → tránh lỗi quyền.

#### **Bước B: Restore vào Neon**

```bash
pg_restore --verbose --clean --no-owner --no-acl \
  -h ep-bold-fire-a1kme9hr-pooler.ap-southeast-1.aws.neon.tech \
  -U neondb_owner \
  -d neondb sofa.dump
```

> Nhập password khi được yêu cầu.

#### **Bước C: Dùng SQL Plain (tùy chọn)**

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
