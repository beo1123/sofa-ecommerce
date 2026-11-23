// src/lib/prisma.ts
import { PrismaClient, type Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.PRISMA_LOG_QUERIES === "true"
        ? ["query", "error", "warn"]
        : process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Re-export generated Prisma model & enum types (type-only; no client bundle impact)
export type {
  Prisma,
  User,
  Role,
  UserRole,
  Product,
  Category,
  ProductImage,
  ProductVariant,
  Inventory,
  Order,
  OrderItem,
  OrderStatusHistory,
  Coupon,
  Review,
  Wishlist,
  WishlistItem,
  Address,
  AuditLog,
  ReturnRequest,
  Refund,
  PaymentMeta,
  Article,
  ArticleCategory,
  Inquiry,
  Shipment,
  DepositLog,
  ProductStatus,
  OrderStatus,
  PaymentMethod,
  CouponType,
  RefundStatus,
  ReturnStatus,
  ArticleStatus,
} from "@prisma/client";

export type {
  WorkshopStatus,
  InquiryStatus,
  InquirySource,
  ShipmentStatus,
  ProductColorOption,
  ProductMaterialOption,
} from "./workshop-types";

// Composite relation payload types for Admin & Storefront Server Components
export type OrderWithWorkshopDetails = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: { select: { id: true; title: true; slug: true; workshopCode: true } };
        variant: { select: { id: true; name: true } };
      };
    };
    shipment: true;
    depositLogs: true;
    statusHistory: {
      include: {
        actor: { select: { id: true; email: true; displayName: true } };
      };
    };
    paymentMeta: true;
    coupon: { select: { id: true; code: true; type: true } };
    user: { select: { id: true; email: true; displayName: true } };
  };
}>;

export type ProductWithWorkshopDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: true;
    reviews: {
      include: {
        user: { select: { id: true; email: true; displayName: true } };
      };
    };
  };
}>;

export type ArticleWithDetails = Prisma.ArticleGetPayload<{
  include: {
    category: true;
    author: { select: { id: true; email: true; displayName: true } };
    linkedProduct: {
      select: { id: true; title: true; slug: true; workshopCode: true };
    };
  };
}>;

export type ShipmentWithOrder = Prisma.ShipmentGetPayload<{
  include: {
    order: {
      select: {
        id: true;
        orderNumber: true;
        recipientName: true;
        phone: true;
        line1: true;
        city: true;
        province: true;
        workshopStatus: true;
      };
    };
  };
}>;

export type ReturnRequestWithDetails = Prisma.ReturnRequestGetPayload<{
  include: {
    order: { select: { id: true; orderNumber: true; recipientName: true; phone: true } };
    orderItem: { select: { id: true; name: true; price: true; quantity: true } };
    refund: true;
  };
}>;

export type AuditLogWithActor = Prisma.AuditLogGetPayload<{
  include: {
    actor: { select: { id: true; email: true; displayName: true } };
  };
}>;
