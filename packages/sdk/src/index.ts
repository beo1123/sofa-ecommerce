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

type RequestOptions = {
  query?: Query;
  init?: RequestInit;
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

async function request<T>(path: string, options?: RequestOptions): Promise<SuccessResponse<T>> {
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

async function requestData<T>(path: string, options?: RequestOptions) {
  const response = await request<T>(path, options);
  return response.data;
}

async function requestEnvelope<T>(path: string, options?: RequestOptions) {
  return request<T>(path, options);
}

async function asAxiosLikeResponse(path: string, options?: RequestOptions): Promise<{ data: any }> {
  const payload = await requestEnvelope<any>(path, options);
  return { data: payload };
}

function withJsonBody(body: unknown, init?: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

export const sdk = {
  http: {
    get: async <T>(path: string, query?: Query) => requestData<T>(path, { query }),
    post: async <T>(path: string, body?: unknown, init?: RequestInit) =>
      requestData<T>(path, { init: withJsonBody(body, { ...(init ?? {}), method: "POST" }) }),
    put: async <T>(path: string, body?: unknown, init?: RequestInit) =>
      requestData<T>(path, { init: withJsonBody(body, { ...(init ?? {}), method: "PUT" }) }),
    patch: async <T>(path: string, body?: unknown, init?: RequestInit) =>
      requestData<T>(path, { init: withJsonBody(body, { ...(init ?? {}), method: "PATCH" }) }),
    delete: async <T>(path: string, body?: unknown, init?: RequestInit) =>
      requestData<T>(
        path,
        body === undefined
          ? { init: { ...(init ?? {}), method: "DELETE" } }
          : { init: withJsonBody(body, { ...(init ?? {}), method: "DELETE" }) }
      ),
  },

  categories: {
    async getAll() {
      return requestData<Category[]>("/api/v1/categories");
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
      return requestData<ProductDetail>(`/api/v1/products/${slug}`);
    },

    async getRelated(slug: string) {
      return requestData<ProductListItem[]>(`/api/v1/products/${slug}/related`);
    },

    async getFeatured(limit = 8) {
      return requestData<ProductListItem[]>("/api/v1/products/featured", { query: { limit } });
    },

    async getBestSellers(limit = 8) {
      return requestData<ProductListItem[]>("/api/v1/products/bestsellers", { query: { limit } });
    },

    async getFilters() {
      return requestData<ProductFilters>("/api/v1/products/filters");
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
      return requestData<{ category: { id: number; name: string }; articles: ArticleListItem[] }>(
        `/api/v1/articles/category/${slug}`
      );
    },

    async getBySlug(slug: string) {
      return requestData<ArticleDetail>(`/api/v1/articles/${slug}`);
    },

    async getRelated(slug: string) {
      return requestData<ArticleListItem[]>(`/api/v1/articles/${slug}/related`);
    },
  },

  articleCategories: {
    async getAll() {
      return requestData<ArticleCategory[]>("/api/v1/article-categories");
    },
  },

  auth: {
    signup: (payload: unknown) =>
      sdk.http.post<{ id: string; email: string; displayName: string | null }>("/api/v1/auth/signup", payload),
  },

  adminApi: {
    products: {
      list: (params?: Query) => asAxiosLikeResponse("/api/admin/products", { query: params }),
      get: (id: number) => asAxiosLikeResponse(`/api/admin/products/${id}`),
      create: (data: unknown) =>
        asAxiosLikeResponse("/api/admin/products", { init: withJsonBody(data, { method: "POST" }) }),
      update: (id: number, data: unknown) =>
        asAxiosLikeResponse(`/api/admin/products/${id}`, { init: withJsonBody(data, { method: "PUT" }) }),
      delete: (id: number) => asAxiosLikeResponse(`/api/admin/products/${id}`, { init: { method: "DELETE" } }),
    },
    categories: {
      list: (params?: Query) => asAxiosLikeResponse("/api/admin/categories", { query: params }),
      create: (data: unknown) =>
        asAxiosLikeResponse("/api/admin/categories", { init: withJsonBody(data, { method: "POST" }) }),
      update: (id: number, data: unknown) =>
        asAxiosLikeResponse(`/api/admin/categories/${id}`, { init: withJsonBody(data, { method: "PUT" }) }),
      delete: (id: number) => asAxiosLikeResponse(`/api/admin/categories/${id}`, { init: { method: "DELETE" } }),
    },
    orders: {
      list: (params?: Query) => asAxiosLikeResponse("/api/admin/orders", { query: params }),
      get: (id: number) => asAxiosLikeResponse(`/api/admin/orders/${id}`),
      updateStatus: (id: number, data: { status: string; note?: string }) =>
        asAxiosLikeResponse(`/api/admin/orders/${id}/status`, {
          init: withJsonBody(data, { method: "PATCH" }),
        }),
    },
    articles: {
      list: (params?: Query) => asAxiosLikeResponse("/api/admin/articles", { query: params }),
      get: (id: number) => asAxiosLikeResponse(`/api/admin/articles/${id}`),
      create: (data: unknown) =>
        asAxiosLikeResponse("/api/admin/articles", { init: withJsonBody(data, { method: "POST" }) }),
      update: (id: number, data: unknown) =>
        asAxiosLikeResponse(`/api/admin/articles/${id}`, { init: withJsonBody(data, { method: "PUT" }) }),
      delete: (id: number) => asAxiosLikeResponse(`/api/admin/articles/${id}`, { init: { method: "DELETE" } }),
    },
    articleCategories: {
      list: (params?: Query) => asAxiosLikeResponse("/api/admin/article-categories", { query: params }),
      create: (data: unknown) =>
        asAxiosLikeResponse("/api/admin/article-categories", { init: withJsonBody(data, { method: "POST" }) }),
      update: (id: number, data: unknown) =>
        asAxiosLikeResponse(`/api/admin/article-categories/${id}`, {
          init: withJsonBody(data, { method: "PUT" }),
        }),
      delete: (id: number) =>
        asAxiosLikeResponse(`/api/admin/article-categories/${id}`, { init: { method: "DELETE" } }),
    },
  },
};

export type StorefrontSdk = typeof sdk;
