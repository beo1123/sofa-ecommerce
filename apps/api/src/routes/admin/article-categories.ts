// =========================================================
// apps/api/src/routes/admin/article-categories.ts
// Admin article category routes
// =========================================================

import { Hono } from "hono";
import { articleCategoryService } from "../../services/article-category.service.js";
import { ok, parsePagination, normalizeError } from "../../lib/response.js";

export const adminArticleCategoriesRouter = new Hono();

// ── GET /api/admin/article-categories ─────────────────────
adminArticleCategoriesRouter.get("/", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const { page, perPage } = parsePagination(query);
    const q = query.q?.trim() || undefined;

    const result = await articleCategoryService.adminListArticleCategories(page, perPage, { q });
    return c.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── POST /api/admin/article-categories ────────────────────
adminArticleCategoriesRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.name || !body.slug) {
      return c.json(
        { success: false, error: { message: "Name and slug are required", code: "INVALID_BODY" } },
        400
      );
    }

    const category = await articleCategoryService.adminCreateArticleCategory(body);
    return c.json(ok(category), 201);
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── PUT /api/admin/article-categories/:id ─────────────────
adminArticleCategoriesRouter.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        { success: false, error: { message: "Invalid article category ID", code: "BAD_REQUEST" } },
        400
      );
    }

    const body = await c.req.json();
    const category = await articleCategoryService.adminUpdateArticleCategory(id, body);
    return c.json(ok(category));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── DELETE /api/admin/article-categories/:id ──────────────
adminArticleCategoriesRouter.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json(
        { success: false, error: { message: "Invalid article category ID", code: "BAD_REQUEST" } },
        400
      );
    }

    const result = await articleCategoryService.adminDeleteArticleCategory(id);
    return c.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
