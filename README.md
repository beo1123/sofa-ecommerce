[![CI](https://github.com/beo1123/sofa-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/beo1123/sofa-ecommerce/actions/workflows/ci.yml)

# Sofa Ecommerce Monorepo

Monorepo nay dung pnpm workspace gom 3 app va cac package dung chung:

- apps/web: Next.js storefront (mac dinh 3000)
- apps/admin: Next.js admin (3001)
- apps/api: Hono API (4000)
- packages/db: Prisma schema + client wrapper
- packages/types: shared TypeScript types
- packages/utils: shared utilities
- packages/ui: shared UI components (source package, khong co build script)
- packages/config: shared eslint/tsconfig package

Tai lieu chi tiet kien truc: xem MONOREPO.md.

## 1) Yeu cau moi truong

- Node.js 20+
- pnpm 9+
- Docker Desktop (neu dung local Postgres)

Kiem tra nhanh:

    node -v
    pnpm -v
    docker -v

## 2) Cai dat va khoi tao

1. Cai dependency:

   pnpm install

2. Tao file env tu mau:

   Copy-Item .env.example .env.local

3. Neu dung Postgres local bang Docker, dat DATABASE_URL trong .env.local:

   DATABASE_URL="postgresql://postgres:1234@localhost:5433/sofa?schema=public"

4. Khoi dong DB local:

   pnpm db:up

5. Tao Prisma client + migrate + seed:

   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed

## 3) Chay development

- Chay rieng web:

      pnpm dev:web

- Chay rieng admin:

      pnpm dev:admin

- Chay rieng api:

      pnpm dev:api

- Chay ca 3 service cung luc:

      pnpm dev:all

## 4) Build toan bo du an

Lenh hien tai trong repo:

    pnpm build:all

Lenh nay se chay:

1. build:packages (types, utils, db)
2. build:web
3. build:api
4. build:admin

Build mac dinh (shortcut):

    pnpm build

Lenh nay chi build web app.

## 5) Build tung package/workspace

### Apps

- @repo/web

      pnpm --filter @repo/web build

- @repo/admin

      pnpm --filter @repo/admin build

- @repo/api

      pnpm --filter @repo/api build

### Shared packages

- @repo/types

      pnpm --filter @repo/types build

- @repo/utils

      pnpm --filter @repo/utils build

- @repo/db

      pnpm --filter @repo/db build

- @repo/ui

  Khong co script build; package nay xuat truc tiep source TypeScript/TSX qua exports.

- @repo/config

  Khong co script build; package nay chi chua file cau hinh (eslint/tsconfig).

## 6) Typecheck, lint, start

- Typecheck tat ca workspace:

      pnpm typecheck:all

- Typecheck tung app:

      pnpm typecheck:web
      pnpm typecheck:api
      pnpm typecheck:admin

- Lint toan repo:

      pnpm lint

- Start production mode tung service sau khi da build:

      pnpm start:web
      pnpm start:api
      pnpm start:admin

## 7) Database commands (root scripts)

- Bat/tat/reset DB local:

      pnpm db:up
      pnpm db:down
      pnpm db:reset

- Xem logs postgres:

      pnpm db:logs

- Prisma workflow:

      pnpm db:generate
      pnpm db:migrate
      pnpm db:migrate:deploy
      pnpm db:studio
      pnpm db:seed

## 8) Co nhanh hon singleton setup khong?

Tra loi ngan gon: nhanh hon trong vong doi phat trien va CI khi du an lon, nhung khong luon nhanh hon cho cold start ban dau.

### Diem nhanh hon

1. Incremental work theo scope:
   - Co the chi build/chay package can thiet bang filter, khong can chay lai ca he thong.
   - Vi du sua API thi chay @repo/api thay vi boot ca web/admin.

2. Tai su dung package dung chung:
   - types/utils/db/ui dung lai cho nhieu app, giam duplicate code.
   - Sua 1 cho, tat ca app dung chung duoc cap nhat.

3. CI/CD de toi uu theo workspace:
   - Co the tach job build/test theo app-package.
   - Tranh build toan bo neu thay doi chi nam o mot scope nho.

### Diem co the cham hon

1. Cai dependency lan dau thuong nang hon singleton:
   - Nhieu workspace, nhieu dependency khac nhau.

2. Quan ly script va thu tu build phuc tap hon:
   - Can ro rang dependency graph giua package va app.

3. Neu script tong chua toi uu, build all co the chay thua:
   - Nen giu build:packages dong bo dependency dung chung (types, utils, db) truoc apps.
   - Co the tiep tuc toi uu bang cach chi build scope bi thay doi trong CI.

### Ket luan practical

- Neu team nho, 1 app, release don gian: singleton de van hanh, toc do bat dau nhanh hon.
- Neu co nhieu app (web + admin + api) va package dung chung: monorepo la lua chon hop ly, nhanh hon o quy mo trung-lon nho kha nang chia nho va tai su dung.

## 9) Lenh de xac minh nhanh sau setup

    pnpm lint
    pnpm typecheck:all
    pnpm build:all

Neu 3 lenh tren xanh, workflow build co ban da san sang.

## 10) Benchmark nhanh (Apr 29, 2026)

Do tren workspace hien tai, bang cach do thoi gian thuc thi lenh bang PowerShell Stopwatch.

Ket qua sau khi fix cac blocker code/config:

| Command             | Time (s) | Status | Ghi chu ngan                              |
| ------------------- | -------: | ------ | ----------------------------------------- |
| pnpm build:packages |     3.80 | Pass   | build types + utils + db                  |
| pnpm build:web      |    22.23 | Pass   | can env Cloudinary                        |
| pnpm build:api      |     2.58 | Pass   | da pass sau khi dieu chinh tsconfig.build |
| pnpm build:admin    |    10.72 | Pass   | pass on dinh                              |
| pnpm build:all      |    37.74 | Pass   | pass khi co env Cloudinary                |
| pnpm typecheck:all  |     3.86 | Pass   | all workspace xanh                        |

Luu y:

- Build web/all can co mot trong 2 cau hinh env: CLOUDINARY_URL hoac CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET.
- Trong lan do benchmark nay da set env demo de xac minh pipeline build.
- Co canh bao Next.js ve key cu trong next.config.ts (experimental.serverComponentsExternalPackages, eslint), nhung chi la warning, khong chan build.

## 11) Cach benchmark chuan: singleton vs monorepo

De so sanh cong bang, dung cung may, cung Node/pnpm version, cung du lieu va cung bo testcase.

Kich ban nen do:

1. Cold install + cold build:
   - Xoa cache, cai dep tu dau, build production.
2. Warm build:
   - Build lan 2 ngay sau lan 1 (khong doi code).
3. Incremental build:
   - Sua nho trong 1 scope (vi du 1 file api) va do lai.
4. Typecheck all.
5. Dev startup:
   - Thoi gian tu luc chay lenh dev den luc app san sang.

Chi so goi y:

- T_install: thoi gian cai dependency
- T_build_cold: thoi gian build lan dau
- T_build_warm: thoi gian build lan 2
- T_build_incremental: thoi gian build sau thay doi nho
- T_typecheck: thoi gian typecheck
- T_dev_ready: thoi gian startup dev

Cong thuc danh gia nhanh:

- Lien tuc phat trien: T_build_incremental + T_typecheck
- CI thong thuong: T_build_cold + T_typecheck

Ky vong thuong gap:

- Singleton thuong nhanh hon o T_install va setup ban dau.
- Monorepo thuong nhanh hon o T_build_incremental neu tan dung filter/scope tot.
