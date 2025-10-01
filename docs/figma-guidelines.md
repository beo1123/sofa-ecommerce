# Figma Wireframes & Guidelines — Sofa Ecommerce

Visual reference: [Blocksy Furniture demo](https://startersites.io/blocksy/furniture/).

---

## Wireframes to Create

### 1. Homepage

- Hero banner (sofa lifestyle image + headline + CTA).
- Featured categories (“Browse by room”: Living Room, Office, Outdoor).
- Product grid (new arrivals / best sellers).
- Promo blocks (discounts, seasonal).
- Newsletter signup block.
- Footer (links, contact, socials).

### 2. Product Listing

- Category header (title, breadcrumbs).
- Filter sidebar (price range, material, color, size).
- Sort dropdown (Newest, Price, Popularity).
- Product grid with card (image, name, price, rating, quick-view).
- Pagination / infinite scroll loader.

### 3. Product Detail

- Image gallery (zoom + thumbnails).
- Title, description, rating, stock status.
- Variants (color, size options).
- Price & Add-to-cart block (sticky on scroll mobile).
- Related products (carousel/grid).
- Reviews & Q&A section.

### 4. Cart

- Cart list (image, name, variant, qty selector, remove).
- Subtotal, discounts, total summary.
- Coupon code field.
- Checkout CTA button (primary).

### 5. Checkout

- Multi-step form (Shipping → Payment → Review).
- Shipping details form.
- Payment method (VNPAY, COD).
- Order summary (sticky on desktop).
- Place order button.

### 6. Admin Product List

- Sidebar nav (Dashboard, Products, Orders, Users).
- Product table (image, name, SKU, price, stock, actions).
- Search & filters (by name, SKU, category).
- Action buttons (edit, delete, add product).

---

## Component List (per page)

### Shared

- Header (logo, nav, cart, account dropdown).
- Footer (links, copyright).
- Button (primary, secondary, ghost).
- Card (product card, promo card).
- Modal (quick-view, confirm).
- Form elements (input, select, radio, checkbox).
- Toast/notification.

### Homepage

- Hero banner
- Category card
- Promo block
- Newsletter form

### Listing

- Filter sidebar
- Sort dropdown
- Product grid

### Product Detail

- Image gallery
- Variant selector
- Review card

### Cart

- Cart item row
- Coupon input
- Summary card

### Checkout

- Step indicator
- Form groups
- Payment method card

### Admin

- Sidebar nav
- Data table
- Table row actions
- Search bar
- CRUD modal

---

## Responsive Breakpoints

- **Mobile (≤640px)**: Single column layout, filters collapse into drawer, sticky add-to-cart.
- **Tablet (641–1024px)**: 2-column grid, sidebar collapsible, product grid 2–3 cols.
- **Desktop (≥1025px)**: Full layout, sidebar visible, product grid 3–5 cols, sticky order summary on checkout.

---

## Export Asset Checklist

- **Logos:** logo-light.png, logo-dark.png, logo-icon.svg.
- **Icons:** cart.svg, user.svg, search.svg, filter.svg.
- **UI Elements:** button-bg.png, promo-bg.jpg (optimized WebP/AVIF).
- **Images:** hero-desktop.jpg (1920x1080), hero-mobile.jpg (768x1024), category-livingroom.jpg (800x600).
- **Product placeholders:** product-thumb-400x400.jpg, product-large-800x800.jpg.

> Naming convention: `feature-context-size.format` (e.g. `hero-home-1920x1080.jpg`).

---

## Micro-interactions & Frames

- **Hover states:** buttons, product cards (show quick-view).
- **Cart badge:** animate increment on add-to-cart.
- **Checkout stepper:** smooth transition between steps.
- **Modal:** fade/scale in for quick-view, confirmation.
- **Admin table actions:** inline edit hover, row highlight on selection.

---

## Notes for Figma File

- Use **auto-layout** for product cards, nav bars, form groups.
- Group frames by flow: `Homepage`, `Listing`, `Product Detail`, `Cart`, `Checkout`, `Admin`.
- Include example mobile & desktop variants.
- Ensure grid system matches Tailwind default (container widths).
