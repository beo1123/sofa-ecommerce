// =========================================================
// packages/types/src/index.ts
// Shared TypeScript types for all apps in the monorepo
// Import: import { ApiSuccess, ApiFail, PaginationMeta } from "@repo/types"
// =========================================================

// -------------------------------------------------------
// API Response Envelope
// -------------------------------------------------------

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
};

export type ApiFail = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFail;

// -------------------------------------------------------
// Pagination
// -------------------------------------------------------

export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

// -------------------------------------------------------
// Products
// -------------------------------------------------------

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ProductListItem = {
  id: number;
  slug: string;
  title: string;
  shortDescription: string | null;
  priceMin: number | null;
  priceMax: number | null;
  primaryImage: { url: string; alt: string | null } | null;
  variantsCount: number;
  category: { name: string; slug: string; image: string | null } | null;
};

export type ProductVariantItem = {
  id: number;
  name: string;
  price: number;
  compareAtPrice: number | null;
  attributes: Record<string, unknown> | null;
  inventory: InventoryItem[];
};

export type InventoryItem = {
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
};

export type ProductDetail = {
  id: number;
  slug: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  images: Array<{ url: string; alt: string | null; isPrimary: boolean }>;
  variants: ProductVariantItem[];
  reviewsSummary: {
    average: number;
    count: number;
    breakdown: Record<number, number>;
  };
};

// -------------------------------------------------------
// Orders
// -------------------------------------------------------

export type OrderStatus =
  | "CREATED"
  | "PENDING_PAYMENT"
  | "PAID"
  | "FAILED_PAYMENT"
  | "COD_PENDING"
  | "COD_COMPLETED"
  | "FULFILLED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod = "VNPAY" | "COD" | "WALLET" | "OTHER";

export type OrderListItem = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  recipientName: string;
  phone: string;
};

// -------------------------------------------------------
// Auth / Users
// -------------------------------------------------------

export type UserRole = "ADMIN" | "PRODUCT_MANAGER" | "ORDER_MANAGER" | "CUSTOMER";

export type AuthUser = {
  id: number;
  email: string;
  username: string | null;
  displayName: string | null;
  roles: UserRole[];
};

// -------------------------------------------------------
// Query Params
// -------------------------------------------------------

export type ProductQueryParams = {
  page: number;
  perPage: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  color?: string;
  material?: string;
};
