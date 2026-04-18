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
  status?: ProductStatus;
  images: Array<{ id?: number; url: string; alt: string | null; isPrimary: boolean }>;
  variants: ProductVariantItem[];
  category?: { id: number; name: string; slug: string } | null;
  reviewsSummary: {
    average: number;
    count: number;
    breakdown?: Record<number, number>;
  };
};

export type ProductImage = {
  id?: number;
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
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
  user?: { id: number; email: string; displayName: string | null } | null;
};

export type OrderItem = {
  id: number;
  sku?: string | null;
  name: string;
  price: number;
  quantity: number;
  total: number;
  returned: boolean;
  product?: { id: number; slug: string; title: string } | null;
  variant?: { id: number; name: string } | null;
};

export type OrderDetail = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  recipientName: string;
  phone: string;
  email?: string | null;
  line1: string;
  city: string;
  province: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: { id: number; email: string; displayName: string | null } | null;
  paymentMeta?: Record<string, unknown> | null;
  statusHistory?: Array<{
    id: number;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    note?: string | null;
    createdAt: string;
  }>;
};

export type UserOrder = {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  recipientName: string;
  createdAt: string;
};

// -------------------------------------------------------
// Categories
// -------------------------------------------------------

export type Category = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { products: number };
};

// -------------------------------------------------------
// Articles / Blog
// -------------------------------------------------------

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ArticleListItem = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  status: ArticleStatus;
  publishedAt?: string | null;
  category?: { id: number; name: string; slug: string } | null;
  author?: { id: number; displayName: string | null } | null;
};

export type ArticleDetail = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  thumbnail?: string | null;
  status: ArticleStatus;
  publishedAt?: string | null;
  category?: { id: number; name: string; slug: string } | null;
  author?: { id: number; displayName: string | null; email?: string } | null;
};

export type ArticleCategory = {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: { articles: number };
};

// -------------------------------------------------------
// Cart
// -------------------------------------------------------

export type CartItem = {
  productId: number;
  variantId?: number | null;
  sku?: string | null;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  metadata?: Record<string, unknown>;
};

export type CartState = {
  items: CartItem[];
  updatedAt?: string | null;
};

export type CartItemInput = {
  productId: number;
  variantId?: number | null;
  sku?: string | null;
  quantity: number;
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

export type AdminProductFilters = {
  q?: string;
  status?: ProductStatus;
  categoryId?: number;
};

export type AdminArticleFilters = {
  q?: string;
  status?: ArticleStatus;
  categoryId?: number;
};

// -------------------------------------------------------
// Admin Input Types
// -------------------------------------------------------

export type CreateProductInput = {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  status?: ProductStatus;
  categoryId?: number;
  metadata?: Record<string, unknown>;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  variants?: Array<{
    id?: number;
    name: string;
    skuPrefix?: string;
    price: number;
    compareAtPrice?: number;
    attributes?: Record<string, unknown>;
    image?: string;
    inventory?: { sku: string; quantity?: number; location?: string };
  }>;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type CreateCategoryInput = {
  name: string;
  slug: string;
  image?: string | null;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreateArticleInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  status?: ArticleStatus;
  categoryId?: number;
  authorId?: number;
  publishedAt?: string;
};

export type UpdateArticleInput = Partial<CreateArticleInput>;

export type CreateArticleCategoryInput = {
  name: string;
  slug: string;
};

export type UpdateArticleCategoryInput = Partial<CreateArticleCategoryInput>;

// -------------------------------------------------------
// Checkout
// -------------------------------------------------------

export type CheckoutPayload = {
  userId?: number | null;
  paymentMethod: PaymentMethod;
  shipping: {
    addressId?: number | null;
    shippingCost?: number;
    tax?: number;
    line1: string;
    city: string;
    province: string;
    country: string;
  };
  cart: {
    items: Array<{
      sku: string;
      quantity: number;
      price: number;
      productId: number;
      variantId?: number | null;
      name: string;
    }>;
    subtotal: number;
  };
  recipient: {
    name: string;
    phone: string;
    email?: string | null;
  };
  couponId?: number | null;
};

// -------------------------------------------------------
// Filters
// -------------------------------------------------------

export type ProductFilters = {
  materials: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
};
