// =========================================================
// apps/api/src/routes/admin/categories.ts
// Admin category routes
// =========================================================

import { Hono } from "hono";
import { categoryService } from "../../services/category.service.js";
import { ok, parsePagination, normalizeError } from "../../lib/response.js";

export const adminCategoriesRouter = new Hono();

// ── GET /api/admin/categories ─────────────────────────────
adminCategoriesRouter.get("/", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const { page, perPage } = parsePagination(query);
    const q = query.q?.trim() || undefined;

    const result = await categoryService.adminListCategories(page, perPage, { q });
    return c.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── POST /api/admin/categories ────────────────────────────
adminCategoriesRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.name || !body.slug) {
      return c.json(
        { success: false, error: { message: "Name and slug are required", code: "INVALID_BODY" } },
        400
      );
    }

    const category = await categoryService.adminCreateCategory(body);
    return c.json(ok(category), 201);
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── PUT /api/admin/categories/:id ─────────────────────────
adminCategoriesRouter.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid category ID", code: "BAD_REQUEST" } }, 400);
    }

    const body = await c.req.json();
    const category = await categoryService.adminUpdateCategory(id, body);
    return c.json(ok(category));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── DELETE /api/admin/categories/:id ──────────────────────
adminCategoriesRouter.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid category ID", code: "BAD_REQUEST" } }, 400);
    }

    const result = await categoryService.adminDeleteCategory(id);
    return c.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
