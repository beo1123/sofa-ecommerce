import { z } from "zod";

export const articleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const saveArticleSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(2, "Tiêu đề tối thiểu 2 ký tự").max(240),
  slug: z
    .string()
    .trim()
    .min(2, "Slug không được trống")
    .max(240)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  categoryId: z.number().int().positive().nullable().optional(),
  coverImageUrl: z.string().trim().max(1000).nullable().optional(),
  excerpt: z.string().trim().max(160, "Mô tả ngắn tối đa 160 ký tự").nullable().optional(),
  content: z.string().min(1, "Nội dung bài viết không được trống"),
  bodyJson: z.record(z.string(), z.unknown()).nullable().optional(),
  linkedProductId: z.number().int().positive().nullable().optional(),
  status: articleStatusSchema.default("DRAFT"),
  publishedAt: z.string().nullable().optional(),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
});

export type SaveArticleInput = z.infer<typeof saveArticleSchema>;

export const createArticleCategorySchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục tối thiểu 2 ký tự").max(120),
});

export const updateArticleStatusSchema = z.object({
  articleId: z.number().int().positive(),
  status: articleStatusSchema,
});
