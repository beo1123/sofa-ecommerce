// =========================================================
// apps/api/src/middleware/error.ts
// Centralized error handler for Hono
// =========================================================

import type { Context, Next } from "hono";
import type { ApiFail } from "@repo/types";

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string; stack?: string };

    const status = error.status ?? 500;
    const payload: ApiFail = {
      success: false,
      error: {
        message: error.message ?? "Internal server error",
        code: status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
        details:
          process.env.NODE_ENV !== "production" ? error.stack : undefined,
      },
    };

    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
}
