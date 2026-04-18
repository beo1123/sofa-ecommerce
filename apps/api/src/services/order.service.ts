// =========================================================
// apps/api/src/services/order.service.ts
// Order service for public API and admin operations
// =========================================================

import { prisma, type Prisma, type OrderStatus, type PaymentMethod } from "@repo/db";
import { Decimal } from "@prisma/client/runtime/library";
import type { CheckoutPayload } from "@repo/types";
import { fail } from "../lib/response.js";

export class OrderService {
  // =====================================================
  // 🛒 PUBLIC: Create order (checkout)
  // =====================================================
  async createOrder(payload: CheckoutPayload) {
    const { userId, paymentMethod, shipping, cart, couponId, recipient } = payload;

    if (!cart?.items?.length) {
      throw {
        status: 400,
        body: fail("Cart is empty", "EMPTY_CART"),
      };
    }

    // Compute totals
    const subtotal = Number(cart.subtotal ?? 0);
    const shippingCost = Number(shipping.shippingCost ?? 0);
    const tax = Number(shipping.tax ?? 0);
    const total = +(subtotal + shippingCost + tax).toFixed(2);

    // Validate inventory
    const skus = cart.items.map((i) => i.sku);
    const inventories = await prisma.inventory.findMany({
      where: { sku: { in: skus } },
      select: { id: true, sku: true, quantity: true, reserved: true },
    });

    for (const item of cart.items) {
      const inv = inventories.find((x) => x.sku === item.sku);
      if (!inv) {
        throw {
          status: 400,
          body: fail(`SKU ${item.sku} not found`, "SKU_NOT_FOUND"),
        };
      }
      const available = inv.quantity - inv.reserved;
      if (available < item.quantity) {
        throw {
          status: 400,
          body: fail(`Insufficient stock for ${item.sku}`, "OUT_OF_STOCK"),
        };
      }
    }

    try {
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            userId: userId ?? undefined,
            status: paymentMethod === "VNPAY" ? "PENDING_PAYMENT" : "CREATED",
            subtotal: new Decimal(subtotal),
            shipping: new Decimal(shippingCost),
            tax: new Decimal(tax),
            total: new Decimal(total),
            paymentMethod: paymentMethod as PaymentMethod,
            recipientName: recipient.name,
            phone: recipient.phone,
            email: recipient.email ?? null,
            line1: shipping.line1,
            city: shipping.city,
            province: shipping.province,
            country: shipping.country,
            shippingAddressId: shipping.addressId ?? undefined,
            couponId: couponId ?? undefined,
          },
        });

        // Create items and reserve inventory
        for (const item of cart.items) {
          const inv = inventories.find((x) => x.sku === item.sku);
          if (!inv) continue;

          await tx.orderItem.create({
            data: {
              orderId: created.id,
              productId: item.productId,
              variantId: item.variantId ?? undefined,
              sku: item.sku,
              name: item.name,
              price: new Decimal(item.price),
              quantity: item.quantity,
              total: new Decimal(item.price * item.quantity),
            },
          });

          await tx.inventory.update({
            where: { id: inv.id },
            data: { reserved: { increment: item.quantity } },
          });
        }

        await tx.orderStatusHistory.create({
          data: {
            orderId: created.id,
            toStatus: created.status,
            note: userId ? "Order created by user" : "Order created by guest checkout",
            actorId: userId ?? undefined,
          },
        });

        return created;
      });

      return {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
        },
      };
    } catch (err: unknown) {
      console.error("OrderService.createOrder error:", err);
      throw {
        status: 500,
        body: fail(
          "Failed to create order",
          "ORDER_TRANSACTION_FAILED",
          err instanceof Error ? err.message : undefined
        ),
      };
    }
  }

  // =====================================================
  // 📋 PUBLIC: Get user orders
  // =====================================================
  async getUserOrders(userId: number) {
    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        paymentMethod: true,
        recipientName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((o) => ({
      ...o,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
    }));
  }

  // =====================================================
  // 🔒 ADMIN: List orders
  // =====================================================
  async adminListOrders(page: number, perPage: number, filters: { status?: OrderStatus } = {}) {
    const skip = (page - 1) * perPage;
    const where: Prisma.OrderWhereInput = filters.status ? { status: filters.status } : {};

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

    return { items, meta: { page, perPage, total } };
  }

  // =====================================================
  // 🔒 ADMIN: Get order by ID
  // =====================================================
  async adminGetOrder(id: number) {
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
      throw { status: 404, body: fail("Order not found", "NOT_FOUND") };
    }

    return {
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
    };
  }

  // =====================================================
  // 🔒 ADMIN: Update order status
  // =====================================================
  async adminUpdateOrderStatus(id: number, status: OrderStatus, note?: string, actorId?: number) {
    const validStatuses: OrderStatus[] = [
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

    if (!validStatuses.includes(status)) {
      throw {
        status: 400,
        body: fail(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, "INVALID_STATUS"),
      };
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Order not found", "NOT_FOUND") };
    }

    const [updated] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: existing.status,
          toStatus: status,
          note,
          actorId,
        },
      }),
    ]);

    return { ...updated, total: Number(updated.total) };
  }
}

export const orderService = new OrderService();
