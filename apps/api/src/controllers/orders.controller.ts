// =========================================================
// apps/api/src/controllers/orders.controller.ts
// Business logic for order endpoints
// =========================================================

import type { Context } from "hono";
import { prisma } from "@repo/db";
import type { ApiSuccess, PaginationMeta } from "@repo/types";

function parsePagination(query: Record<string, string>) {
  const page = Math.max(1, Number(query.page ?? 1));
  const perPage = Math.min(100, Math.max(1, Number(query.perPage ?? 20)));
  return { page, perPage, skip: (page - 1) * perPage };
}

// ── GET /orders ───────────────────────────────────────────
export async function listOrders(c: Context) {
  const query = c.req.query() as Record<string, string>;
  const { page, perPage, skip } = parsePagination(query);
  const status = query.status as
    | "CREATED"
    | "PENDING_PAYMENT"
    | "PAID"
    | "FULFILLED"
    | "CANCELLED"
    | undefined;

  const where = status ? { status } : {};

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        paymentMethod: true,
        createdAt: true,
        recipientName: true,
        phone: true,
        user: { select: { id: true, email: true, displayName: true } },
      },
    }),
  ]);

  const items = orders.map((o) => ({
    ...o,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
  }));

  const meta: PaginationMeta = { page, perPage, total };
  const response: ApiSuccess<typeof items> = { success: true, data: items, meta };
  return c.json(response);
}

// ── GET /orders/:id ───────────────────────────────────────
export async function getOrder(c: Context) {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json(
      { success: false, error: { message: "Invalid order ID", code: "BAD_REQUEST" } },
      400
    );
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, slug: true, title: true } },
          variant: { select: { id: true, name: true } },
        },
      },
      paymentMeta: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      user: { select: { id: true, email: true, displayName: true } },
    },
  });

  if (!order) {
    return c.json(
      { success: false, error: { message: "Order not found", code: "NOT_FOUND" } },
      404
    );
  }

  const response: ApiSuccess<unknown> = {
    success: true,
    data: {
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
        createdAt: item.createdAt.toISOString(),
      })),
    },
  };

  return c.json(response);
}

// ── PATCH /orders/:id/status ──────────────────────────────
export async function updateOrderStatus(c: Context) {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json(
      { success: false, error: { message: "Invalid order ID", code: "BAD_REQUEST" } },
      400
    );
  }

  const body = await c.req.json<{ status: string; note?: string }>();

  const validStatuses = [
    "CREATED",
    "PENDING_PAYMENT",
    "PAID",
    "FAILED_PAYMENT",
    "COD_PENDING",
    "COD_COMPLETED",
    "FULFILLED",
    "CANCELLED",
    "REFUNDED",
  ];

  if (!body.status || !validStatuses.includes(body.status)) {
    return c.json(
      {
        success: false,
        error: {
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          code: "INVALID_STATUS",
        },
      },
      400
    );
  }

  const existing = await prisma.order.findUnique({ where: { id } });

  if (!existing) {
    return c.json(
      { success: false, error: { message: "Order not found", code: "NOT_FOUND" } },
      404
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: body.status as Parameters<typeof prisma.order.update>[0]["data"]["status"] },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: existing.status,
        toStatus: body.status as Parameters<typeof prisma.orderStatusHistory.create>[0]["data"]["toStatus"],
        note: body.note,
      },
    }),
  ]);

  const response: ApiSuccess<unknown> = {
    success: true,
    data: { ...updated, total: Number(updated.total) },
  };

  return c.json(response);
}
