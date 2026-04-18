// =========================================================
// apps/api/src/routes/article-categories.ts
// Public article category routes
// =========================================================

import { Hono } from "hono";
import { articleCategoryService } from "../services/article-category.service.js";
import { ok, normalizeError } from "../lib/response.js";

export const articleCategoriesRouter = new Hono();

// ── GET /api/v1/article-categories ────────────────────────
articleCategoriesRouter.get("/", async (c) => {
  try {
    const categories = await articleCategoryService.getAllArticleCategories();
    return c.json(ok(categories));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
