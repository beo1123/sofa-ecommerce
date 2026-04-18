import type { ArticleFormData } from "@/components/admin/articles/ArticleForm";

export interface AdminArticleCategory {
  id: number;
  name: string;
  slug: string;
}

export interface AdminMeta {
  page: number;
  perPage: number;
  total: number;
}

export interface AdminArticleListItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  thumbnail?: string | null;
  category?: { id: number; name: string; slug: string } | null;
  author?: { id: number; displayName?: string | null } | null;
  publishedAt?: string | null;
  updatedAt: string;
}

export interface AdminArticleDetail {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  thumbnail?: string | null;
  status: string;
  category?: { id: number; name: string; slug: string } | null;
  author?: { id: number; displayName?: string | null; email?: string | null } | null;
}

type ArticleSubmitData = ArticleFormData & {
  thumbnail?: string;
};

export function getApiErrorMessage(err: any, fallback: string) {
  return err?.response?.data?.error?.message ?? fallback;
}

export function buildAdminArticlePayload(data: ArticleSubmitData) {
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt?.trim() || undefined,
    content: data.content,
    thumbnail: data.thumbnail?.trim() || undefined,
    status: data.status || "DRAFT",
    categoryId: typeof data.categoryId === "number" && data.categoryId > 0 ? data.categoryId : undefined,
  };
}

export function mapAdminArticleToFormDefaults(article: AdminArticleDetail) {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    status: article.status,
    categoryId: article.category?.id,
    thumbnail: article.thumbnail ?? "",
  };
}

export function makeAssetFolderSegment(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function extractImageUrlsFromHtml(html?: string | null) {
  if (!html) return [];

  const matches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  return [...matches].map((match) => match[1]).filter(Boolean);
}
