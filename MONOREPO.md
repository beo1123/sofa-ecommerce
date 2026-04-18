# Monorepo Architecture — Sofa E-Commerce

This project uses a **pnpm workspace monorepo** to keep the frontend, admin dashboard,
backend API, and shared packages cleanly separated while sharing one Prisma schema
and one NeonDB database.

---

## Directory Structure

```
sofa-ecommerce/                  ← root (also the web Next.js app)
├── apps/
│   ├── admin/                   ← Next.js admin dashboard  (port 3001)
│   └── api/                     ← Hono REST API            (port 4000)
├── packages/
│   ├── db/                      ← @repo/db  — shared Prisma client
│   └── types/                   ← @repo/types — shared TypeScript types
├── prisma/                      ← original schema (still used by root web app)
├── src/                         ← root Next.js web app (storefront)
├── pnpm-workspace.yaml
└── package.json
```

---

## Packages

### `packages/db` — `@repo/db`

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Single source of truth for the DB schema |
| `src/index.ts` | Prisma singleton + re-exports all `@prisma/client` types |

**Import anywhere:**

```ts
import { prisma } from "@repo/db";
import { type Product, type Order } from "@repo/db";
```

### `packages/types` — `@repo/types`

Shared response envelopes, pagination types, and domain DTOs used by all apps.

```ts
import { type ApiSuccess, type PaginationMeta, type ProductListItem } from "@repo/types";
```

---

## Apps

### Root (`/`) — Web Storefront

The existing Next.js app. Runs on **port 3000**.

```bash
pnpm dev          # next dev
pnpm build        # next build
```

### `apps/admin` — Admin Dashboard

Separate Next.js app. Runs on **port 3001**.

```bash
pnpm dev:admin    # pnpm --filter @repo/admin dev
pnpm build:admin  # pnpm --filter @repo/admin build
```

### `apps/api` — REST API (Hono)

Standalone Hono server. Runs on **port 4000**.

```bash
pnpm dev:api      # pnpm --filter @repo/api dev
pnpm build:api    # pnpm --filter @repo/api build
```

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/products` | List products (paginated, filterable) |
| `GET` | `/api/v1/products/:slug` | Product detail |
| `GET` | `/api/v1/categories` | List categories |
| `GET` | `/api/v1/categories/:slug` | Category + products |
| `GET` | `/api/v1/orders` | List orders |
| `GET` | `/api/v1/orders/:id` | Order detail |
| `PATCH` | `/api/v1/orders/:id/status` | Update order status |

---

## Database (NeonDB + Prisma)

The **canonical schema** lives in `packages/db/prisma/schema.prisma`.
The root `prisma/schema.prisma` is kept for backwards compatibility with
the existing Next.js app until it is migrated to import from `@repo/db`.

### Generate Prisma client (monorepo-aware)

```bash
pnpm db:generate
# equivalent to: pnpm --filter @repo/db prisma:generate
```

### Migrate

```bash
pnpm --filter @repo/db prisma:migrate:dev
pnpm --filter @repo/db prisma:migrate:deploy
```

### Studio

```bash
pnpm --filter @repo/db prisma:studio
```

---

## Environment Variables

Copy `.env.example` → `.env` in each app that needs it.

```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

All apps read `DATABASE_URL` from `.env` at the root or from their own `.env`.
`@repo/db` picks it up automatically via `env("DATABASE_URL")` in the Prisma schema.

---

## Getting Started (pnpm)

```bash
# Install pnpm globally
npm install -g pnpm

# Install all workspace dependencies
pnpm install

# Generate Prisma clients
pnpm db:generate

# Run everything locally
pnpm dev          # web (port 3000)
pnpm dev:admin    # admin (port 3001)
pnpm dev:api      # api  (port 4000)
```

---

## Migration Guide — Updating Imports in the Web App

When you're ready to migrate `src/lib/prisma.ts` to use the shared package:

```ts
// Before (standalone singleton):
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

// After (shared singleton from @repo/db):
export { prisma } from "@repo/db";
```

---

## Deployment

| App | Platform recommendation |
|-----|------------------------|
| Web storefront | Vercel (existing config in `vercel.json`) |
| Admin dashboard | Vercel (separate project, `apps/admin`) |
| API server | Railway / Render / Fly.io / any Node host |
| Database | NeonDB (existing — no changes required) |
