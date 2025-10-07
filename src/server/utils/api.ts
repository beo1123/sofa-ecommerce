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
 * Parse phân trang từ query string hoặc object
 * @example
 * parsePagination({ page: 2, perPage: 10 })
 * // => { page: 2, perPage: 10, skip: 10, take: 10 }
 */
export function parsePagination(query: Record<string, any> | URLSearchParams) {
  const get = (key: string) => (query instanceof URLSearchParams ? query.get(key) : query[key]);

  const page = Math.max(1, Number(get("page") ?? 1));
  const perPage = Math.min(100, Math.max(1, Number(get("perPage") ?? 20)));
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
 * Chuẩn hóa lỗi để trả về API
 */
export function normalizeError(err: any) {
  if (err?.status && err?.body) {
    return { status: err.status, payload: err.body };
  }

  return {
    status: 500,
    payload: fail(err?.message ?? "Internal server error", "INTERNAL_ERROR", err?.stack),
  };
}
