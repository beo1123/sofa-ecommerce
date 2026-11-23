import { z } from "zod";

export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const productColorOptionSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên màu").max(80),
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Mã màu HEX không hợp lệ"),
});

export const productMaterialOptionSchema = z.object({
  label: z.string().trim().min(1, "Nhập tên chất liệu").max(120),
  priceDelta: z.number().finite().min(-100_000_000).max(500_000_000),
  colors: z.array(productColorOptionSchema).default([]),
});

export const productVariantInputSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1, "Tên biến thể không được trống").max(160),
  skuPrefix: z.string().trim().max(80).nullable().optional(),
  price: z.number().min(0, "Giá không được âm").max(10_000_000_000),
  compareAtPrice: z.number().min(0, "Giá gốc không được âm").max(10_000_000_000).nullable().optional(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  image: z.string().trim().max(1000).nullable().optional(),
});

export const productImageInputSchema = z.object({
  id: z.number().int().positive().optional(),
  url: z.string().trim().min(1, "Thiếu URL ảnh"),
  alt: z.string().trim().max(255).nullable().optional(),
  isPrimary: z.boolean().default(false),
});

export const saveProductSchema = z.object({
  id: z.number().int().positive().optional(),
  workshopCode: z.string().trim().max(40).nullable().optional(),
  title: z.string().trim().min(2, "Tên sản phẩm tối thiểu 2 ký tự").max(220),
  slug: z
    .string()
    .trim()
    .min(2, "Slug không được trống")
    .max(220)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  categoryId: z.number().int().positive().nullable().optional(),
  status: productStatusSchema.default("PUBLISHED"),
  shortDescription: z.string().trim().max(600).nullable().optional(),
  description: z.string().max(100_000).nullable().optional(),
  priceNote: z.string().trim().max(300).nullable().optional(),
  defaultWidthCm: z.number().int().min(20).max(1000).nullable().optional(),
  defaultDepthCm: z.number().int().min(20).max(1000).nullable().optional(),
  defaultHeightCm: z.number().int().min(20).max(400).nullable().optional(),
  allowCustomSize: z.boolean().default(false),
  materialOptions: z.array(productMaterialOptionSchema).default([]),
  colorOptions: z.array(productColorOptionSchema).default([]),
  metadata: z.record(z.string(), z.string()).nullable().optional(),
  variants: z.array(productVariantInputSchema).default([]),
  images: z.array(productImageInputSchema).default([]),
});

export type SaveProductInput = z.infer<typeof saveProductSchema>;

export const updateProductStatusSchema = z.object({
  productId: z.number().int().positive(),
  status: productStatusSchema,
});

export const moderateReviewSchema = z.object({
  reviewId: z.number().int().positive(),
  approved: z.boolean(),
});
