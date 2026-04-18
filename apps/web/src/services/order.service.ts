import { PrismaClient, PaymentMethod, OrderStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

type CreateOrderPayload = {
  userId?: number | null;
  paymentMethod: PaymentMethod;
  // giữ addressId để tương thích, nhưng Order vẫn snapshot fields
  shipping: {
    addressId?: number | null;
    shippingCost?: number;
    tax?: number;
    line1: string;
    city: string;
    province: string;
    country: string;
  };
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
  recipient: {
    name: string;
    phone: string;
    email?: string | null;
  };
  couponId?: number | null;
};

export class OrderService {
  constructor(private prisma: PrismaClient) {}

  async createOrder(payload: CreateOrderPayload) {
    const { userId, paymentMethod, shipping, cart, couponId, recipient } = payload;

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

    try {
      const order = await this.prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            userId: userId ?? undefined,

            // status & money
            status: paymentMethod === "VNPAY" ? OrderStatus.PENDING_PAYMENT : OrderStatus.CREATED,
            subtotal: new Decimal(subtotal),
            shipping: new Decimal(shippingCost),
            tax: new Decimal(tax),
            total: new Decimal(total),
            paymentMethod,

            // 🔥 snapshot recipient + address theo model mới
            recipientName: recipient.name,
            phone: recipient.phone,
            email: recipient.email ?? null,
            line1: shipping.line1,
            city: shipping.city,
            province: shipping.province,
            country: shipping.country,

            // để dành nếu cần tham chiếu ngoài (không bắt buộc dùng)
            shippingAddressId: shipping.addressId ?? undefined,

            couponId: couponId ?? undefined,
          },
        });

        // items + reserve inventory
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
    } catch (err: any) {
      console.error("OrderService.createOrder error:", err);
      throw {
        status: 500,
        body: {
          success: false,
          error: { message: "Failed to create order", code: "ORDER_TRANSACTION_FAILED", details: err?.message },
        },
      };
    }
  }

  async getUserOrders(userId: number) {
    try {
      const orders = await this.prisma.order.findMany({
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

      return { success: true, data: orders };
    } catch (err: any) {
      console.error("OrderService.getUserOrders error:", err);
      throw {
        status: 500,
        body: {
          success: false,
          error: {
            message: "Failed to fetch orders",
            code: "ORDERS_FETCH_FAILED",
            details: err?.message,
          },
        },
      };
    }
  }
}
