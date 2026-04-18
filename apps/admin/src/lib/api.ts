// =========================================================
// apps/admin/src/lib/api.ts
// API client for admin app to communicate with the backend API
// =========================================================

import axios from "axios";

// Base URL for the API server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (can be enhanced with proper auth)
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const adminApi = {
  // Products
  products: {
    list: (params?: Record<string, unknown>) =>
      api.get("/api/admin/products", { params }),
    get: (id: number) => api.get(`/api/admin/products/${id}`),
    create: (data: unknown) => api.post("/api/admin/products", data),
    update: (id: number, data: unknown) => api.put(`/api/admin/products/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/products/${id}`),
  },

  // Categories
  categories: {
    list: (params?: Record<string, unknown>) =>
      api.get("/api/admin/categories", { params }),
    create: (data: unknown) => api.post("/api/admin/categories", data),
    update: (id: number, data: unknown) => api.put(`/api/admin/categories/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/categories/${id}`),
  },

  // Orders
  orders: {
    list: (params?: Record<string, unknown>) =>
      api.get("/api/admin/orders", { params }),
    get: (id: number) => api.get(`/api/admin/orders/${id}`),
    updateStatus: (id: number, data: { status: string; note?: string }) =>
      api.patch(`/api/admin/orders/${id}/status`, data),
  },

  // Articles
  articles: {
    list: (params?: Record<string, unknown>) =>
      api.get("/api/admin/articles", { params }),
    get: (id: number) => api.get(`/api/admin/articles/${id}`),
    create: (data: unknown) => api.post("/api/admin/articles", data),
    update: (id: number, data: unknown) => api.put(`/api/admin/articles/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/articles/${id}`),
  },

  // Article Categories
  articleCategories: {
    list: (params?: Record<string, unknown>) =>
      api.get("/api/admin/article-categories", { params }),
    create: (data: unknown) => api.post("/api/admin/article-categories", data),
    update: (id: number, data: unknown) =>
      api.put(`/api/admin/article-categories/${id}`, data),
    delete: (id: number) => api.delete(`/api/admin/article-categories/${id}`),
  },
};
