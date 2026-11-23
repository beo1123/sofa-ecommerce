import type { ArticleStatus } from "@/lib/prisma";

export interface SerializedArticleCategory {
  id: number;
  name: string;
  slug: string;
}

export interface SerializedLinkedProductOption {
  id: number;
  title: string;
  slug: string;
  workshopCode: string | null;
}

export interface SerializedArticleListItem {
  id: number;
  title: string;
  slug: string;
  status: ArticleStatus;
  coverImageUrl: string | null;
  categoryId: number | null;
  categoryName: string | null;
  linkedProductTitle: string | null;
  linkedProductCode: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface SerializedArticleDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  bodyJson: Record<string, unknown> | null;
  thumbnail: string | null;
  coverImageUrl: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  categoryId: number | null;
  linkedProductId: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
}
