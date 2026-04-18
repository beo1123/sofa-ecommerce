// =========================================================
// apps/api/src/lib/response.ts
// API response helpers
// =========================================================

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

/**
 * Create a success API response
 */
export function ok<T>(data: T, meta?: Record<string, unknown>): ApiSuccess<T> {
  return { success: true, data, meta };
}

/**
 * Create a failure API response
 */
export function fail(message: string, code?: string, details?: unknown): ApiFail {
  return {
    success: false,
    error: { message, code, details },
  };
}

/**
 * Parse pagination from query string
 */
export function parsePagination(query: Record<string, string>) {
  const page = Math.max(1, Number(query.page ?? 1));
  const perPage = Math.min(100, Math.max(1, Number(query.perPage ?? 20)));
  return { page, perPage, skip: (page - 1) * perPage };
}

/**
 * Normalize any error to API response format
 */
export function normalizeError(err: unknown): { status: number; payload: ApiFail } {
  if (typeof err === "object" && err !== null) {
    const errObj = err as Record<string, unknown>;
    if (typeof errObj.status === "number" && errObj.body) {
      return { status: errObj.status, payload: errObj.body as ApiFail };
    }
    if (typeof errObj.message === "string") {
      return {
        status: 500,
        payload: fail(errObj.message, "INTERNAL_ERROR"),
      };
    }
  }

  return {
    status: 500,
    payload: fail("Internal server error", "INTERNAL_ERROR"),
  };
}
