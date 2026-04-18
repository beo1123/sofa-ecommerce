// =========================================================
// apps/api/src/routes/admin/products.ts
// Admin product routes
// =========================================================

import { Hono } from "hono";
import { productService } from "../../services/product.service.js";
import { ok, parsePagination, normalizeError } from "../../lib/response.js";
import type { ProductStatus } from "@repo/db";

export const adminProductsRouter = new Hono();

// ── GET /api/admin/products ───────────────────────────────
adminProductsRouter.get("/", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const { page, perPage } = parsePagination(query);
    const q = query.q?.trim() || undefined;
    const statusRaw = query.status?.trim().toUpperCase();
    const categoryIdRaw = query.categoryId;

    const allowedStatus = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
    const status =
      statusRaw && allowedStatus.includes(statusRaw as (typeof allowedStatus)[number])
        ? (statusRaw as ProductStatus)
        : undefined;

    const categoryId = categoryIdRaw ? Number(categoryIdRaw) : undefined;

    const result = await productService.adminListProducts(page, perPage, {
      q,
      status,
      categoryId: categoryId && Number.isFinite(categoryId) ? categoryId : undefined,
    });

    return c.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/admin/products/:id ───────────────────────────
adminProductsRouter.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid product ID", code: "BAD_REQUEST" } }, 400);
    }

    const product = await productService.adminGetProduct(id);
    return c.json(ok(product));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── POST /api/admin/products ──────────────────────────────
adminProductsRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.title || !body.slug) {
      return c.json(
        { success: false, error: { message: "Title and slug are required", code: "INVALID_BODY" } },
        400
      );
    }

    const product = await productService.adminCreateProduct(body);
    return c.json(ok(product), 201);
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── PUT /api/admin/products/:id ───────────────────────────
adminProductsRouter.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid product ID", code: "BAD_REQUEST" } }, 400);
    }

    const body = await c.req.json();
    const product = await productService.adminUpdateProduct(id, body);
    return c.json(ok(product));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── DELETE /api/admin/products/:id ────────────────────────
adminProductsRouter.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid product ID", code: "BAD_REQUEST" } }, 400);
    }

    const result = await productService.adminDeleteProduct(id);
    return c.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
