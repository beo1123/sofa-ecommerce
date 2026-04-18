// =========================================================
// apps/api/src/routes/admin/orders.ts
// Admin order routes
// =========================================================

import { Hono } from "hono";
import { orderService } from "../../services/order.service.js";
import { ok, parsePagination, normalizeError } from "../../lib/response.js";
import type { OrderStatus } from "@repo/db";

export const adminOrdersRouter = new Hono();

// ── GET /api/admin/orders ─────────────────────────────────
adminOrdersRouter.get("/", async (c) => {
  try {
    const query = c.req.query() as Record<string, string>;
    const { page, perPage } = parsePagination(query);
    const status = query.status as OrderStatus | undefined;

    const result = await orderService.adminListOrders(page, perPage, { status });
    return c.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/admin/orders/:id ─────────────────────────────
adminOrdersRouter.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid order ID", code: "BAD_REQUEST" } }, 400);
    }

    const order = await orderService.adminGetOrder(id);
    return c.json(ok(order));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── PATCH /api/admin/orders/:id/status ────────────────────
adminOrdersRouter.patch("/:id/status", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ success: false, error: { message: "Invalid order ID", code: "BAD_REQUEST" } }, 400);
    }

    const body = await c.req.json<{ status: string; note?: string }>();

    if (!body.status) {
      return c.json({ success: false, error: { message: "Status is required", code: "INVALID_BODY" } }, 400);
    }

    const order = await orderService.adminUpdateOrderStatus(id, body.status as OrderStatus, body.note);
    return c.json(ok(order));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
