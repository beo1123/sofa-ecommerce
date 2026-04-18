// =========================================================
// packages/utils/src/index.ts
// Shared utility functions for all apps in the monorepo
// Import: import { parsePagination, formatPrice } from "@repo/utils"
// =========================================================

// -------------------------------------------------------
// API Response Types
// -------------------------------------------------------

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
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
// Response Helpers
// -------------------------------------------------------

/**
 * Create a success API response (HTTP 200)
 */
export function ok<T>(data: T, meta?: Record<string, unknown>): ApiSuccess<T> {
  return { success: true, data, meta };
}

/**
 * Create a failure API response (HTTP 4xx/5xx)
 */
export function fail(message: string, code?: string, details?: unknown): ApiFail {
  return {
    success: false,
    error: { message, code, details },
  };
}

// -------------------------------------------------------
// Pagination Helpers
// -------------------------------------------------------

export type PaginationParams = {
  page: number;
  perPage: number;
  skip: number;
  take: number;
};

/**
 * Parse pagination from query string or object
 * @example
 * parsePagination({ page: 2, perPage: 10 })
 * // => { page: 2, perPage: 10, skip: 10, take: 10 }
 */
export function parsePagination(query: Record<string, unknown> | URLSearchParams): PaginationParams {
  const get = (key: string): unknown =>
    query instanceof URLSearchParams ? query.get(key) : query[key];

  const page = Math.max(1, Number(get("page") ?? 1));
  const perPage = Math.min(100, Math.max(1, Number(get("perPage") ?? 20)));
  const skip = (page - 1) * perPage;

  return { page, perPage, skip, take: perPage };
}

// -------------------------------------------------------
// Validation Helpers
// -------------------------------------------------------

export type ValidationSchema = Record<string, "string" | "number" | "boolean" | "array" | "object">;

/**
 * Validate request body against a simple schema
 * @param body - Request data
 * @param schema - Schema definition: { name: "string", age: "number" }
 * @throws { status: 400, body: ApiFail }
 */
export function validateRequest(body: Record<string, unknown>, schema: ValidationSchema): void {
  const missing: string[] = [];
  const wrong: string[] = [];

  for (const key in schema) {
    const expected = schema[key];
    const value = body[key];

    if (value === undefined || value === null) {
      missing.push(key);
      continue;
    }

    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== expected) {
      wrong.push(`${key}: expected ${expected}, got ${actual}`);
    }
  }

  if (missing.length || wrong.length) {
    throw {
      status: 400,
      body: fail("Invalid request", "INVALID_BODY", { missing, wrong }),
    };
  }
}

// -------------------------------------------------------
// Error Handling
// -------------------------------------------------------

export type NormalizedError = {
  status: number;
  payload: ApiFail;
};

/**
 * Normalize any error to API response format
 */
export function normalizeError(err: unknown): NormalizedError {
  if (typeof err === "object" && err !== null) {
    const errObj = err as Record<string, unknown>;
    if (typeof errObj.status === "number" && errObj.body) {
      return { status: errObj.status, payload: errObj.body as ApiFail };
    }
    if (typeof errObj.message === "string") {
      return {
        status: 500,
        payload: fail(errObj.message, "INTERNAL_ERROR", (errObj as Error).stack),
      };
    }
  }

  return {
    status: 500,
    payload: fail("Internal server error", "INTERNAL_ERROR"),
  };
}

// -------------------------------------------------------
// String Utilities
// -------------------------------------------------------

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (!text || text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

// -------------------------------------------------------
// Number / Price Utilities
// -------------------------------------------------------

/**
 * Format a number as Vietnamese currency (VND)
 */
export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return "0 ₫";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

// -------------------------------------------------------
// Date Utilities
// -------------------------------------------------------

/**
 * Format a date to Vietnamese locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN", options ?? { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals = [
    { label: "năm", seconds: 31536000 },
    { label: "tháng", seconds: 2592000 },
    { label: "tuần", seconds: 604800 },
    { label: "ngày", seconds: 86400 },
    { label: "giờ", seconds: 3600 },
    { label: "phút", seconds: 60 },
    { label: "giây", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label} trước`;
    }
  }

  return "vừa xong";
}

// -------------------------------------------------------
// Object Utilities
// -------------------------------------------------------

/**
 * Remove undefined and null values from an object
 */
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

// -------------------------------------------------------
// Array Utilities
// -------------------------------------------------------

/**
 * Group array items by a key
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Remove duplicates from array
 */
export function unique<T>(arr: T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) return [...new Set(arr)];
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// -------------------------------------------------------
// ID Generation
// -------------------------------------------------------

/**
 * Generate a random alphanumeric ID
 */
export function generateId(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate an order number
 */
export function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
