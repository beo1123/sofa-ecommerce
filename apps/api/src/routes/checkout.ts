// =========================================================
// apps/api/src/routes/checkout.ts
// Checkout routes
// =========================================================

import { Hono } from "hono";
import { orderService } from "../services/order.service.js";
import { ok, normalizeError } from "../lib/response.js";
import type { CheckoutPayload } from "@repo/types";

export const checkoutRouter = new Hono();

// ── POST /api/v1/checkout ─────────────────────────────────
checkoutRouter.post("/", async (c) => {
  try {
    const body = await c.req.json<CheckoutPayload>();

    if (!body.cart?.items?.length) {
      return c.json(
        { success: false, error: { message: "Cart is empty", code: "EMPTY_CART" } },
        400
      );
    }

    if (!body.recipient?.name || !body.recipient?.phone) {
      return c.json(
        { success: false, error: { message: "Recipient name and phone are required", code: "INVALID_BODY" } },
        400
      );
    }

    if (!body.shipping?.line1 || !body.shipping?.city || !body.shipping?.province) {
      return c.json(
        { success: false, error: { message: "Shipping address is required", code: "INVALID_BODY" } },
        400
      );
    }

    if (!body.paymentMethod) {
      return c.json(
        { success: false, error: { message: "Payment method is required", code: "INVALID_BODY" } },
        400
      );
    }

    const result = await orderService.createOrder(body);
    return c.json(ok(result.order), 201);
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});

// ── GET /api/v1/checkout/user-orders ──────────────────────
checkoutRouter.get("/user-orders/:userId", async (c) => {
  try {
    const userId = Number(c.req.param("userId"));
    if (isNaN(userId)) {
      return c.json(
        { success: false, error: { message: "Invalid user ID", code: "BAD_REQUEST" } },
        400
      );
    }

    const orders = await orderService.getUserOrders(userId);
    return c.json(ok(orders));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return c.json(payload, status as 400 | 401 | 403 | 404 | 500);
  }
});
