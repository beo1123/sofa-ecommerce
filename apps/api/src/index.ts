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
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { categoriesRouter } from "./routes/categories.js";

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

// ── API v1 routes ─────────────────────────────────────────
const v1 = new Hono();
v1.route("/products", productsRouter);
v1.route("/orders", ordersRouter);
v1.route("/categories", categoriesRouter);

app.route("/api/v1", v1);

// ── Start server ──────────────────────────────────────────
const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`🚀 API server running at http://localhost:${port}`);
});

export default app;
