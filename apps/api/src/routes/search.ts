// =========================================================
// apps/api/src/routes/search.ts
// Search routes
// =========================================================

import { Hono } from "hono";
import { productService } from "../services/product.service.js";
import { ok, parsePagination, normalizeError } from "../lib/response.js";

export const searchRouter = new Hono();

// ── GET /api/v1/search ────────────────────────────────────
searchRouter.get("/", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const { page, perPage } = parsePagination(query);
    const q = query.q?.trim() || "";

    const result = await productService.searchProducts(q, page, perPage);
    return c.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
