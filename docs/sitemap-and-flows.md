# Sofa Ecommerce — Sitemap & User Flows

## 📍 High-Level Sitemap

/
├── Home (SSR + ISR banners, featured sofas)
├── Category Listing (ISR)
│ ├── /category/[slug]
│ └── Filters (price, material, size)
├── Product Detail (SSR + client hydration)
│ └── /product/[id or slug]
├── Cart (client state + persisted w/ redux-persist + localForage)
│ └── /cart
├── Checkout (SSR + TanStack Query fetch payment methods)
│ └── /checkout
├── Account
│ ├── /account/login
│ ├── /account/register
│ ├── /account/orders
│ └── /account/profile
├── Admin (protected routes)
│ ├── /admin/dashboard
│ ├── /admin/products
│ ├── /admin/products/[id]/edit
│ ├── /admin/inventory
│ └── /admin/orders
├── Marketing / CMS Pages
│ ├── /about
│ ├── /contact
│ └── /blog/[slug]
└── 404 / error pages

## 👤 User Flows

### 1. Customer Checkout Flow

[Browse Products]
↓
[Category Listing]
↓
[Select Product → Product Detail]
↓
[Add to Cart]
↓
[View Cart]
↓
[Proceed to Checkout]
↓
[Enter Shipping + Payment Info]
↓
[Confirm Order]
↓
[Order Success Page]

- State persistence: Cart items stored in Redux Toolkit + persisted with localForage.
- Data fetching: TanStack Query for product details, shipping methods, and payment gateway.
- Edge cases:
  - Cart empty → disable checkout.
  - Payment failed → redirect back with error.

### 2. Admin Product CRUD & Inventory Flow

[Login as Admin]
↓
[Go to /admin/dashboard]
↓
[Manage Products]
├── Create Product
├── Update Product
└── Delete Product
↓
[Update Inventory Levels]
↓
[Save Changes → DB via Prisma + Postgres]
↓
[Success Notification]

- Admin routes require auth middleware.
- Inventory updates validated server-side (no negative stock).
- Optimistic updates via RTK Query or TanStack Query mutations.

## ✅ Checklist Deliverables

### API Endpoints Needed

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/[id]`
- `POST /api/cart`
- `POST /api/checkout`
- `POST /api/payment`
- `GET /api/account/orders`
- `POST /api/account/login`
- `POST /api/account/register`
- `CRUD /api/admin/products`
- `PATCH /api/admin/inventory`

### Pages Needed

- `/`, `/category/[slug]`, `/product/[id]`
- `/cart`, `/checkout`
- `/account/*`
- `/admin/*`
- `/about`, `/contact`, `/blog/[slug]`
- Error pages: `/404`, `/500`

### Metadata & SEO

- Each category/product page has unique `<title>` + `<meta description>`.
- Open Graph tags for product detail (image, price, availability).
- Sitemap.xml auto-generated via Next.js route tree.
- Canonical URLs to avoid duplicate content.

## 🖼 ASCII Flow Diagram

+-----------------+ +--------------+ +--------------+
| Customer Flow | | Admin Flow | | Shared DB |
+-----------------+ +--------------+ +--------------+
| Browse → Cart → | | CRUD Product | --> | Products |
| Checkout → Pay | --> | Update Stock | --> | Inventory |
+-----------------+ +--------------+ +--------------+
