// src/services/checkout.service.ts
import { CartItemInput } from "@/types/cart/cart";
import { PrismaClient } from "@prisma/client";

export class CheckoutService {
  constructor(private prisma: PrismaClient) {}

  async validateCart(cart: CartItemInput[]) {
    if (!Array.isArray(cart) || cart.length === 0) {
      throw {
        status: 400,
        body: {
          success: false,
          error: { message: "Cart is empty", code: "EMPTY_CART" },
        },
      };
    }

    const skus = cart.map((i) => i.sku).filter(Boolean) as string[];

    const inventories = await this.prisma.inventory.findMany({
      where: { sku: { in: skus } },
      include: {
        variant: {
          include: {
            product: { select: { id: true, title: true, status: true } },
          },
        },
      },
    });

    const errors: any[] = [];
    const validated: any[] = [];

    for (const item of cart) {
      const inv = inventories.find((inv) => inv.sku === item.sku);

      if (!inv) {
        errors.push({
          sku: item.sku,
          reason: "SKU not found",
          code: "NOT_FOUND",
        });
        continue;
      }

      if (inv.variant.product.status !== "PUBLISHED") {
        errors.push({
          sku: item.sku,
          reason: "Product not available",
          code: "UNAVAILABLE",
        });
        continue;
      }

      const available = inv.quantity - inv.reserved;

      if (available < item.quantity) {
        errors.push({
          sku: item.sku,
          reason: `Insufficient stock (${available} left)`,
          code: "OUT_OF_STOCK",
          available,
          requested: item.quantity,
        });
        continue;
      }

      // ✅ Prisma Decimal, BigInt => ép về string/number an toàn
      const toPlain = (val: any) => {
        if (val === null || val === undefined) return null;
        if (typeof val === "bigint") return Number(val);
        if (typeof val === "object" && "toNumber" in val) return val.toNumber();
        return val;
      };

      validated.push({
        sku: inv.sku,
        productId: inv.variant.product.id,
        variantId: inv.variantId,
        quantity: item.quantity,
        available,
        price: toPlain(inv.variant.price),
      });
    }

    if (errors.length > 0) {
      throw {
        status: 400,
        body: {
          success: false,
          error: {
            message: "Stock validation failed",
            code: "OUT_OF_STOCK",
            details: errors,
          },
        },
      };
    }

    // ✅ ép toàn bộ kết quả thành JSON-safe trước khi return
    const safeData = JSON.parse(
      JSON.stringify({
        token: `checkout_validate_${Date.now()}`,
        validatedAt: new Date().toISOString(),
        items: validated,
      })
    );

    return safeData;
  }
}
