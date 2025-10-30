import { PrismaClient, PaymentMethod, OrderStatus } from "../../generated/prisma_client";
import { Decimal } from "@prisma/client/runtime/library";
import { randomUUID } from "crypto";

export class OrderService {
  constructor(private prisma: PrismaClient) {}

  async createOrder(payload: {
    userId?: number | null;
    guestEmail?: string | null;
    guestToken?: string | null;
    paymentMethod: PaymentMethod;
    shipping: { addressId?: number | null; shippingCost?: number; tax?: number };
    cart: {
      items: {
        sku: string;
        quantity: number;
        price: number;
        productId: number;
        variantId?: number | null;
        name: string;
      }[];
      subtotal: number;
    };
    couponId?: number | null;
  }) {
    const { userId, guestEmail, paymentMethod, shipping, cart, couponId } = payload;

    if (!cart?.items?.length) {
      throw { status: 400, body: { success: false, error: { message: "Cart is empty", code: "EMPTY_CART" } } };
    }

    // compute totals
    const subtotal = Number(cart.subtotal ?? 0);
    const shippingCost = Number(shipping.shippingCost ?? 0);
    const tax = Number(shipping.tax ?? 0);
    const total = +(subtotal + shippingCost + tax).toFixed(2);

    // validate inventory
    const skus = cart.items.map((i) => i.sku);
    const inventories = await this.prisma.inventory.findMany({
      where: { sku: { in: skus } },
      select: { id: true, sku: true, quantity: true, reserved: true },
    });

    for (const item of cart.items) {
      const inv = inventories.find((x) => x.sku === item.sku);
      if (!inv) {
        throw {
          status: 400,
          body: { success: false, error: { message: `SKU ${item.sku} not found`, code: "SKU_NOT_FOUND" } },
        };
      }
      const available = inv.quantity - inv.reserved;
      if (available < item.quantity) {
        throw {
          status: 400,
          body: { success: false, error: { message: `Insufficient stock for ${item.sku}`, code: "OUT_OF_STOCK" } },
        };
      }
    }

    // ✅ Guest token logic
    let guestToken: string | null = payload.guestToken ?? null;
    if (!userId && !guestToken && guestEmail) guestToken = randomUUID();

    try {
      const order = await this.prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            userId: userId ?? undefined,
            guestToken,
            status: paymentMethod === "VNPAY" ? OrderStatus.PENDING_PAYMENT : OrderStatus.CREATED,
            subtotal: new Decimal(subtotal),
            shipping: new Decimal(shippingCost),
            tax: new Decimal(tax),
            total: new Decimal(total),
            paymentMethod,
            shippingAddressId: shipping.addressId ?? undefined,
            couponId: couponId ?? undefined,
          },
        });

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
        guestToken,
      };
    } catch (err: any) {
      console.error("OrderService.createOrder error:", err);
      throw {
        status: 500,
        body: {
          success: false,
          error: { message: "Failed to create order", code: "ORDER_TRANSACTION_FAILED", details: err.message },
        },
      };
    }
  }
}
