import type { PrismaClient } from "@prisma/client";
import { toNumber } from "@/lib/format";
import { isWorkshopStatus, type WorkshopStatus } from "@/lib/workshop-types";
import type { SerializedCustomer } from "@/components/admin/customers/types";

export class AdminCustomerService {
  constructor(private readonly db: PrismaClient) {}

  async listSerializedCustomers(): Promise<SerializedCustomer[]> {
    const users = await this.db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        userRoles: { include: { role: { select: { name: true } } } },
        addresses: {
          orderBy: [{ isDefaultShipping: "desc" }, { createdAt: "desc" }],
        },
        orders: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            city: true,
            total: true,
            depositPaid: true,
            status: true,
            workshopStatus: true,
            createdAt: true,
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            product: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    return users.map((user) => {
      const defaultAddr = user.addresses.find((a) => a.isDefaultShipping) ?? user.addresses[0];
      const city = defaultAddr?.city ?? user.orders[0]?.city ?? null;
      const totalSpent = user.orders
        .filter((o) => o.status !== "CANCELLED" && o.workshopStatus !== "cancelled")
        .reduce((sum, o) => sum + toNumber(o.total), 0);

      return {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        city,
        orderCount: user.orders.length,
        totalSpent,
        lastOrderDate: user.orders[0] ? user.orders[0].createdAt.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
        roles: user.userRoles.map((ur) => ur.role.name),
        addresses: user.addresses.map((a) => ({
          id: a.id,
          fullName: a.fullName,
          phone: a.phone,
          line1: a.line1,
          line2: a.line2,
          city: a.city,
          province: a.province,
          country: a.country,
          isDefaultShipping: a.isDefaultShipping,
          isDefaultBilling: a.isDefaultBilling,
        })),
        orders: user.orders.map((o) => {
          const ws: WorkshopStatus = isWorkshopStatus(o.workshopStatus) ? o.workshopStatus : "new";
          return {
            id: o.id,
            orderNumber: o.orderNumber,
            total: toNumber(o.total),
            depositPaid: toNumber(o.depositPaid),
            status: o.status,
            workshopStatus: ws,
            createdAt: o.createdAt.toISOString(),
          };
        }),
        reviews: user.reviews.map((r) => ({
          id: r.id,
          productId: r.productId,
          productTitle: r.product.title,
          productSlug: r.product.slug,
          rating: r.rating,
          title: r.title,
          body: r.body,
          approved: r.approved,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    });
  }
}
