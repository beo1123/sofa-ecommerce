// =========================================================
// apps/api/src/routes/articles.ts
// Public article routes
// =========================================================

import { Hono } from "hono";
import { articleService } from "../services/article.service.js";
import { articleCategoryService } from "../services/article-category.service.js";
import { ok, parsePagination, normalizeError } from "../lib/response.js";

export const articlesRouter = new Hono();

// ── GET /api/v1/articles ──────────────────────────────────
articlesRouter.get("/", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const { page, perPage } = parsePagination(query);

    const result = await articleService.getAllArticles(page, perPage);
    return c.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/articles/latest ───────────────────────────
articlesRouter.get("/latest", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const limit = query.limit ? Number(query.limit) : 5;

    const articles = await articleService.getLatestArticles(limit);
    return c.json(ok(articles));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/articles/category/:slug ───────────────────
articlesRouter.get("/category/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const result = await articleService.getArticlesByCategory(slug);
    return c.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/articles/:slug ────────────────────────────
articlesRouter.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const article = await articleService.getArticleBySlug(slug);
    return c.json(ok(article));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/articles/:slug/related ────────────────────
articlesRouter.get("/:slug/related", async (c) => {
  try {
    const slug = c.req.param("slug");
    const related = await articleService.getRelatedArticles(slug);
    return c.json(ok(related));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
