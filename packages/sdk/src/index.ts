import type {
  ApiResponse,
  ArticleCategory,
  ArticleDetail,
  ArticleListItem,
  Category,
  PaginationMeta,
  ProductDetail,
  ProductFilters,
  ProductListItem,
  ProductQueryParams,
} from "@repo/types";

type QueryValue = string | number | boolean | undefined | null;

type Query = Record<string, QueryValue>;

type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
};

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:4000";

function getApiBaseUrl() {
  return DEFAULT_API_BASE_URL.replace(/\/$/, "");
}

function buildUrl(path: string, query?: Query) {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function request<T>(path: string, options?: { query?: Query; init?: RequestInit }): Promise<SuccessResponse<T>> {
  const response = await fetch(buildUrl(path, options?.query), {
    ...options?.init,
    headers: {
      Accept: "application/json",
      ...(options?.init?.headers ?? {}),
    },
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || !payload.success) {
    const message =
      payload && !payload.success ? payload.error.message : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as SuccessResponse<T>;
}

export const sdk = {
  categories: {
    async getAll() {
      const res = await request<Category[]>("/api/v1/categories");
      return res.data;
    },
  },

  products: {
    async list(params: ProductQueryParams) {
      const res = await request<ProductListItem[]>("/api/v1/products", {
        query: {
          page: params.page,
          perPage: params.perPage,
          category: params.category,
          priceMin: params.priceMin,
          priceMax: params.priceMax,
          color: params.color,
          material: params.material,
        },
      });

      return {
        items: res.data,
        meta: (res.meta ?? {
          page: params.page,
          perPage: params.perPage,
          total: res.data.length,
        }) as PaginationMeta,
      };
    },

    async getBySlug(slug: string) {
      const res = await request<ProductDetail>(`/api/v1/products/${slug}`);
      return res.data;
    },

    async getRelated(slug: string) {
      const res = await request<ProductListItem[]>(`/api/v1/products/${slug}/related`);
      return res.data;
    },

    async getFeatured(limit = 8) {
      const res = await request<ProductListItem[]>("/api/v1/products/featured", { query: { limit } });
      return res.data;
    },

    async getBestSellers(limit = 8) {
      const res = await request<ProductListItem[]>("/api/v1/products/bestsellers", { query: { limit } });
      return res.data;
    },

    async getFilters() {
      const res = await request<ProductFilters>("/api/v1/products/filters");
      return res.data;
    },
  },

  articles: {
    async list(page = 1, perPage = 9) {
      const res = await request<ArticleListItem[]>("/api/v1/articles", { query: { page, perPage } });
      return {
        items: res.data,
        meta: (res.meta ?? { page, perPage, total: res.data.length }) as PaginationMeta,
      };
    },

    async listByCategory(slug: string) {
      const res = await request<{ category: { id: number; name: string }; articles: ArticleListItem[] }>(
        `/api/v1/articles/category/${slug}`
      );
      return res.data;
    },

    async getBySlug(slug: string) {
      const res = await request<ArticleDetail>(`/api/v1/articles/${slug}`);
      return res.data;
    },

    async getRelated(slug: string) {
      const res = await request<ArticleListItem[]>(`/api/v1/articles/${slug}/related`);
      return res.data;
    },
  },

  articleCategories: {
    async getAll() {
      const res = await request<ArticleCategory[]>("/api/v1/article-categories");
      return res.data;
    },
  },
};

export type StorefrontSdk = typeof sdk;
