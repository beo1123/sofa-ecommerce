// =========================================================
// apps/api/src/routes/admin/articles.ts
// Admin article routes
// =========================================================

import { Hono } from "hono";
import { articleService } from "../../services/article.service.js";
import { ok, parsePagination, normalizeError } from "../../lib/response.js";
import type { ArticleStatus } from "@repo/db";

export const adminArticlesRouter = new Hono();

// ── GET /api/admin/articles ───────────────────────────────
adminArticlesRouter.get("/", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const { page, perPage } = parsePagination(query);
    const q = query.q?.trim() || undefined;
    const statusRaw = query.status?.trim().toUpperCase();
    const categoryIdRaw = query.categoryId;

    const allowedStatus = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
    const status =
      statusRaw && allowedStatus.includes(statusRaw as (typeof allowedStatus)[number])
        ? (statusRaw as ArticleStatus)
        : undefined;

    const categoryId = categoryIdRaw ? Number(categoryIdRaw) : undefined;

    const result = await articleService.adminListArticles(page, perPage, {
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

// ── GET /api/admin/articles/:id ───────────────────────────
adminArticlesRouter.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid article ID", code: "BAD_REQUEST" } }, 400);
    }

    const article = await articleService.adminGetArticle(id);
    return c.json(ok(article));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── POST /api/admin/articles ──────────────────────────────
adminArticlesRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.title || !body.slug || !body.content) {
      return c.json(
        { success: false, error: { message: "Title, slug and content are required", code: "INVALID_BODY" } },
        400
      );
    }

    const article = await articleService.adminCreateArticle(body);
    return c.json(ok(article), 201);
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── PUT /api/admin/articles/:id ───────────────────────────
adminArticlesRouter.put("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid article ID", code: "BAD_REQUEST" } }, 400);
    }

    const body = await c.req.json();
    const article = await articleService.adminUpdateArticle(id, body);
    return c.json(ok(article));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── DELETE /api/admin/articles/:id ────────────────────────
adminArticlesRouter.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid article ID", code: "BAD_REQUEST" } }, 400);
    }

    const result = await articleService.adminDeleteArticle(id);
    return c.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
