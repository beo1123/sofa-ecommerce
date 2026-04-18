// =========================================================
// apps/api/src/index.ts
// Hono REST API entry point
// Run: pnpm --filter @repo/api dev
// =========================================================

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorMiddleware } from "./middleware/error.js";

// Routes
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { categoriesRouter } from "./routes/categories.js";
import { articlesRouter } from "./routes/articles.js";
import { articleCategoriesRouter } from "./routes/article-categories.js";
import { searchRouter } from "./routes/search.js";
import { checkoutRouter } from "./routes/checkout.js";

// Admin Routes
import { adminProductsRouter } from "./routes/admin/products.js";
import { adminCategoriesRouter } from "./routes/admin/categories.js";
import { adminOrdersRouter } from "./routes/admin/orders.js";
import { adminArticlesRouter } from "./routes/admin/articles.js";
import { adminArticleCategoriesRouter } from "./routes/admin/article-categories.js";

const app = new Hono();

// ── Global middleware ──────────────────────────────────────
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      process.env.WEB_URL ?? "http://localhost:3000",
      process.env.ADMIN_URL ?? "http://localhost:3001",
    ],
    credentials: true,
  })
);
app.use("*", errorMiddleware);

// ── Health check ──────────────────────────────────────────
app.get("/health", (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));

// ── API v1 routes (Public) ────────────────────────────────
const v1 = new Hono();
v1.route("/products", productsRouter);
v1.route("/orders", ordersRouter);
v1.route("/categories", categoriesRouter);
v1.route("/articles", articlesRouter);
v1.route("/article-categories", articleCategoriesRouter);
v1.route("/search", searchRouter);
v1.route("/checkout", checkoutRouter);

app.route("/api/v1", v1);

// ── Admin API routes ──────────────────────────────────────
const admin = new Hono();
admin.route("/products", adminProductsRouter);
admin.route("/categories", adminCategoriesRouter);
admin.route("/orders", adminOrdersRouter);
admin.route("/articles", adminArticlesRouter);
admin.route("/article-categories", adminArticleCategoriesRouter);

app.route("/api/admin", admin);

// ── Start server ──────────────────────────────────────────
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`🚀 API server running at http://localhost:${port}`);
});

export default app;
