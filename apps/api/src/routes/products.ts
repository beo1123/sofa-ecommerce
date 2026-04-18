// =========================================================
// apps/api/src/routes/products.ts
// Public product routes
// =========================================================

import { Hono } from "hono";
import { productService } from "../services/product.service.js";
import { ok, parsePagination, normalizeError } from "../lib/response.js";
import type { ProductQueryParams } from "@repo/types";

export const productsRouter = new Hono();

// ── GET /api/v1/products ──────────────────────────────────
productsRouter.get("/", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const { page, perPage } = parsePagination(query);

    const params: ProductQueryParams = {
      page,
      perPage,
      category: query.category,
      priceMin: query.priceMin ? Number(query.priceMin) : undefined,
      priceMax: query.priceMax ? Number(query.priceMax) : undefined,
      color: query.color,
      material: query.material,
    };

    const result = await productService.listProducts(params);
    return c.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/products/bestsellers ──────────────────────
productsRouter.get("/bestsellers", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const limit = query.limit ? Number(query.limit) : 8;

    const products = await productService.getBestSellingProducts(limit);
    return c.json(ok(products));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/products/featured ─────────────────────────
productsRouter.get("/featured", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const limit = query.limit ? Number(query.limit) : 8;

    const products = await productService.getFeaturedProducts(limit);
    return c.json(ok(products));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/products/filters ──────────────────────────
productsRouter.get("/filters", async (c) => {
  try {
    const filters = await productService.getFilters();
    return c.json(ok(filters));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/products/:slug ────────────────────────────
productsRouter.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const product = await productService.getProductBySlug(slug);

    if (!product) {
      return c.json(
        { success: false, error: { message: "Product not found", code: "NOT_FOUND" } },
        404
      );
    }

    return c.json(ok(product));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/products/:slug/related ────────────────────
productsRouter.get("/:slug/related", async (c) => {
  try {
    const slug = c.req.param("slug");
    const related = await productService.getRelatedProducts(slug);
    return c.json(ok(related));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
