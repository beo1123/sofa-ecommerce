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

export interface AdminArticleImage {
  id?: number;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface AdminArticleListItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  thumbnail?: string | null;
  images?: AdminArticleImage[];
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
  author?: { id: number; displayName?: string | null } | null;
  images?: AdminArticleImage[];
  publishedAt?: string | null;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: { message?: string } } } };
  return e?.response?.data?.error?.message ?? fallback;
}

export function mapAdminArticleToFormDefaults(article: AdminArticleDetail) {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    status: article.status,
    categoryId: article.category?.id,
    images:
      article.images?.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
      })) ?? [],
  };
}

export function buildAdminArticlePayload(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: string;
  categoryId?: number;
  images: AdminArticleImage[];
}) {
  const primaryImage = data.images.find((img) => img.isPrimary) ?? data.images[0];
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || undefined,
    content: data.content,
    status: data.status || "DRAFT",
    categoryId: typeof data.categoryId === "number" && data.categoryId > 0 ? data.categoryId : undefined,
    thumbnail: primaryImage?.url || undefined,
    images: data.images.map((img) => ({
      ...(img.id ? { id: img.id } : {}),
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary ?? false,
    })),
  };
}
