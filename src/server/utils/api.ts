// ======================
// ✅ API Response Types
// ======================

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, any>;
};

export type ApiFail = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFail;

// ======================
// ✅ Helpers
// ======================

/**
 * Tạo response thành công (HTTP 200)
 */
export function ok<T>(data: T, meta?: Record<string, any>): ApiSuccess<T> {
  return { success: true, data, meta };
}

/**
 * Tạo response thất bại (HTTP 4xx/5xx)
 */
export function fail(message: string, code?: string, details?: any): ApiFail {
  return {
    success: false,
    error: { message, code, details },
  };
}

/**
 * Parse một chuỗi đơn từ query param (hỗ trợ cả string | string[] | null | undefined)
 */
export function parseStringParam(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Parse số nguyên dương an toàn với giá trị mặc định và giới hạn min/max
 */
export function parsePositiveInt(value: unknown, fallback: number, min = 1, max = 100): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  const intVal = Math.floor(parsed);
  if (intVal < min) return min;
  if (intVal > max) return max;
  return intVal;
}

/**
 * Parse số không âm tùy chọn (dùng cho priceMin, priceMax)
 */
export function parseOptionalNumber(value: unknown): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null || raw === "") return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
}

/**
 * Parse phân trang từ query string hoặc object
 * @example
 * parsePagination({ page: 2, perPage: 10 })
 * // => { page: 2, perPage: 10, skip: 10, take: 10 }
 */
export function parsePagination(query: Record<string, any> | URLSearchParams, defaultPerPage = 20) {
  const get = (key: string) => (query instanceof URLSearchParams ? query.get(key) : query?.[key]);

  const page = parsePositiveInt(get("page"), 1, 1, 10000);
  const perPage = parsePositiveInt(get("perPage"), defaultPerPage, 1, 100);
  const skip = (page - 1) * perPage;

  return { page, perPage, skip, take: perPage };
}

/**
 * Kiểm tra request body có đúng schema hay không
 * @param body - Dữ liệu request
 * @param schema - Định nghĩa kiểu: { name: "string", age: "number" }
 * @throws { status: 400, body: ApiFail }
 */
export function validateRequest(body: Record<string, any>, schema: Record<string, string>) {
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

/**
 * Chuẩn hóa lỗi để trả về API (ẩn stack trace và lỗi nội bộ trên môi trường production)
 */
export function normalizeError(err: any) {
  if (err?.status && err?.body) {
    return { status: err.status, payload: err.body };
  }

  const isDev = process.env.NODE_ENV === "development";

  return {
    status: 500,
    payload: fail(
      isDev ? (err?.message ?? "Internal server error") : "Internal server error",
      "INTERNAL_ERROR",
      isDev ? err?.stack : undefined
    ),
  };
}
