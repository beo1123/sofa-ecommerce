// =========================================================
// apps/api/src/routes/orders.ts
// Order routes: GET /orders, GET /orders/:id, PATCH /orders/:id/status
// =========================================================

import { Hono } from "hono";
import {
  listOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/orders.controller.js";

export const ordersRouter = new Hono();

ordersRouter.get("/", listOrders);
ordersRouter.get("/:id", getOrder);
ordersRouter.patch("/:id/status", updateOrderStatus);
