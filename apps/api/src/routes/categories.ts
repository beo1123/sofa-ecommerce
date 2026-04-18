// =========================================================
// apps/api/src/routes/categories.ts
// Public category routes
// =========================================================

import { Hono } from "hono";
import { categoryService } from "../services/category.service.js";
import { ok, normalizeError } from "../lib/response.js";

export const categoriesRouter = new Hono();

// ── GET /api/v1/categories ────────────────────────────────
categoriesRouter.get("/", async (c) => {
  try {
    const categories = await categoryService.getAllCategories();
    return c.json(ok(categories));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/categories/:slug ──────────────────────────
categoriesRouter.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const category = await categoryService.getCategoryBySlug(slug);
    return c.json(ok(category));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
