# Monorepo Architecture — Sofa E-Commerce

This project uses a **pnpm workspace monorepo** to keep the frontend, admin dashboard,
backend API, and shared packages cleanly separated while sharing one Prisma schema
and one NeonDB database.

---

## Directory Structure

```
sofa-ecommerce/
├── apps/
│   ├── web/                     ← @repo/web — Next.js user site     (port 3000)
│   ├── admin/                   ← @repo/admin — Next.js admin       (port 3001)
│   └── api/                     ← @repo/api — Hono REST API         (port 4000)
├── packages/
│   ├── db/                      ← @repo/db — shared Prisma client
│   ├── ui/                      ← @repo/ui — shared UI components
│   ├── types/                   ← @repo/types — shared TypeScript types
│   ├── utils/                   ← @repo/utils — shared utility functions
│   └── config/                  ← @repo/config — shared ESLint/TSConfig
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

### `packages/ui` — `@repo/ui`

Shared UI components used by web and admin apps.

```ts
import { Button, Card, Modal, Input, Badge, Spinner, Heading, Dropdown } from "@repo/ui";
```

**Components:**
- `Button` - Primary, secondary, outline, ghost, danger variants
- `Card` - With CardHeader, CardTitle, CardContent, CardFooter
- `Modal` - Animated modal with framer-motion
- `Input` - Form input with validation support
- `Badge` - Status badges
- `Spinner` - Loading indicator
- `Heading` - Typography headings (h1-h6)
- `Dropdown` - Select dropdown

### `packages/types` — `@repo/types`

Shared response envelopes, pagination types, and domain DTOs used by all apps.

```ts
import { type ApiSuccess, type PaginationMeta, type ProductListItem } from "@repo/types";
```

### `packages/utils` — `@repo/utils`

Shared utility functions for API responses, pagination, validation, formatting.

```ts
import { ok, fail, parsePagination, formatPrice, formatDate } from "@repo/utils";
```

### `packages/config` — `@repo/config`

Shared ESLint and TypeScript configurations.

```js
// eslint.config.mjs
import eslintNext from "@repo/config/eslint-next";
export default eslintNext;
```

```json
// tsconfig.json
{
  "extends": "@repo/config/tsconfig-next"
}
```

---

## Apps

### `apps/web` — Web Storefront

The main Next.js user-facing app. Runs on **port 3000**.

```bash
pnpm dev          # pnpm --filter @repo/web dev
pnpm build        # pnpm --filter @repo/web build
```

### `apps/admin` — Admin Dashboard

Separate Next.js app with full admin functionality. Runs on **port 3001**.

```bash
pnpm dev:admin    # pnpm --filter @repo/admin dev
pnpm build:admin  # pnpm --filter @repo/admin build
```

**Features:**
- Dashboard with stats
- Product management (CRUD)
- Category management (CRUD)
- Order management
- Article management (CRUD)
- Article category management (CRUD)

### `apps/api` — REST API (Hono)

Standalone Hono server providing API endpoints. Runs on **port 4000**.

```bash
pnpm dev:api      # pnpm --filter @repo/api dev
pnpm build:api    # pnpm --filter @repo/api build
```

**Public Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/products` | List products (paginated, filterable) |
| `GET` | `/api/v1/products/:slug` | Product detail |
| `GET` | `/api/v1/products/bestsellers` | Best-selling products |
| `GET` | `/api/v1/products/featured` | Featured products |
| `GET` | `/api/v1/products/filters` | Product filters |
| `GET` | `/api/v1/products/:slug/related` | Related products |
| `GET` | `/api/v1/categories` | List categories |
| `GET` | `/api/v1/categories/:slug` | Category + products |
| `GET` | `/api/v1/articles` | List articles |
| `GET` | `/api/v1/articles/:slug` | Article detail |
| `GET` | `/api/v1/articles/latest` | Latest articles |
| `GET` | `/api/v1/search` | Search products |
| `POST` | `/api/v1/checkout` | Create order |
| `GET` | `/api/v1/orders` | List orders |
| `GET` | `/api/v1/orders/:id` | Order detail |
| `PATCH` | `/api/v1/orders/:id/status` | Update order status |

**Admin Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/products` | List products (admin) |
| `GET` | `/api/admin/products/:id` | Get product by ID |
| `POST` | `/api/admin/products` | Create product |
| `PUT` | `/api/admin/products/:id` | Update product |
| `DELETE` | `/api/admin/products/:id` | Delete product |
| `GET` | `/api/admin/categories` | List categories |
| `POST` | `/api/admin/categories` | Create category |
| `PUT` | `/api/admin/categories/:id` | Update category |
| `DELETE` | `/api/admin/categories/:id` | Delete category |
| `GET` | `/api/admin/orders` | List orders |
| `GET` | `/api/admin/orders/:id` | Get order by ID |
| `PATCH` | `/api/admin/orders/:id/status` | Update order status |
| `GET` | `/api/admin/articles` | List articles |
| `GET` | `/api/admin/articles/:id` | Get article by ID |
| `POST` | `/api/admin/articles` | Create article |
| `PUT` | `/api/admin/articles/:id` | Update article |
| `DELETE` | `/api/admin/articles/:id` | Delete article |
| `GET` | `/api/admin/article-categories` | List article categories |
| `POST` | `/api/admin/article-categories` | Create article category |
| `PUT` | `/api/admin/article-categories/:id` | Update article category |
| `DELETE` | `/api/admin/article-categories/:id` | Delete article category |

---

## Database (NeonDB + Prisma)

The **canonical schema** lives in `packages/db/prisma/schema.prisma`.

### Generate Prisma client (monorepo-aware)

```bash
pnpm db:generate
# equivalent to: pnpm --filter @repo/db prisma:generate
```

### Migrate

```bash
pnpm db:migrate          # Development
pnpm db:migrate:deploy   # Production
```

### Studio

```bash
pnpm db:studio
```

---

## Environment Variables

Copy `.env.example` → `.env` in each app that needs it.

```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXT_PUBLIC_API_URL="http://localhost:4000"  # For admin app
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

# Or run all at once
pnpm dev:all
```

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run web storefront (port 3000) |
| `pnpm dev:web` | Run web storefront (port 3000) |
| `pnpm dev:admin` | Run admin dashboard (port 3001) |
| `pnpm dev:api` | Run API server (port 4000) |
| `pnpm dev:all` | Run all apps concurrently |
| `pnpm build` | Build web storefront |
| `pnpm build:web` | Build web storefront |
| `pnpm build:admin` | Build admin dashboard |
| `pnpm build:api` | Build API server |
| `pnpm build:all` | Build all packages and apps |
| `pnpm typecheck:all` | Type-check all apps |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations (dev) |
| `pnpm db:migrate:deploy` | Run database migrations (prod) |
| `pnpm db:studio` | Open Prisma Studio |

---

## Deployment

| App | Platform recommendation |
|-----|------------------------|
| Web storefront | Vercel (apps/web) |
| Admin dashboard | Vercel (apps/admin) |
| API server | Railway / Render / Fly.io / any Node host |
| Database | NeonDB (existing — no changes required) |

### Vercel Setup for Web

1. Create a new Vercel project
2. Set root directory to `apps/web`
3. Set environment variables:
   - `DATABASE_URL` (from NeonDB)

### Vercel Setup for Admin

1. Create a new Vercel project
2. Set root directory to `apps/admin`
3. Set environment variables:
   - `DATABASE_URL` (from NeonDB)
   - `NEXT_PUBLIC_API_URL` (your API server URL)

### API Server Setup

1. Deploy to Railway/Render/Fly.io
2. Set environment variables:
   - `DATABASE_URL` (from NeonDB)
   - `WEB_URL` (your web app URL)
   - `ADMIN_URL` (your admin app URL)
3. Set build command: `pnpm build:api`
4. Set start command: `pnpm start:api`
