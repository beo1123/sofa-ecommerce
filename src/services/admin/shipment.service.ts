import type { PrismaClient } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit";
import { isShipmentStatus, type ShipmentStatus } from "@/lib/workshop-types";
import type { SerializedShipmentRow, UnscheduledOrderOption } from "@/components/admin/shipments/types";

export class AdminShipmentService {
  constructor(private readonly db: PrismaClient) {}

  async listShipmentsAndUnscheduled(): Promise<{
    shipments: SerializedShipmentRow[];
    unscheduledOrders: UnscheduledOrderOption[];
  }> {
    const [shipments, unscheduledOrders] = await Promise.all([
      this.db.shipment.findMany({
        orderBy: [{ scheduledDate: "asc" }, { createdAt: "desc" }],
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              recipientName: true,
              phone: true,
              line1: true,
              city: true,
              province: true,
            },
          },
        },
      }),
      this.db.order.findMany({
        where: {
          shipment: null,
          workshopStatus: { not: "cancelled" },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          orderNumber: true,
          recipientName: true,
          phone: true,
          line1: true,
          city: true,
          province: true,
          deliverDate: true,
        },
      }),
    ]);

    return {
      shipments: shipments.map((s) => ({
        id: s.id,
        orderId: s.orderId,
        orderNumber: s.order.orderNumber,
        recipientName: s.order.recipientName,
        phone: s.order.phone,
        address: `${s.order.line1}, ${s.order.city}, ${s.order.province}`,
        scheduledDate: s.scheduledDate ? s.scheduledDate.toISOString() : null,
        driverName: s.driverName,
        needsCrane: s.needsCrane,
        buildingFloor: s.buildingFloor,
        hasElevator: s.hasElevator,
        specialNote: s.specialNote,
        status: isShipmentStatus(s.status) ? s.status : "scheduled",
        updatedAt: s.updatedAt.toISOString(),
      })),
      unscheduledOrders: unscheduledOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        recipientName: o.recipientName,
        phone: o.phone,
        address: `${o.line1}, ${o.city}, ${o.province}`,
        deliverDate: o.deliverDate ? o.deliverDate.toISOString() : null,
      })),
    };
  }

  async updateShipment(
    shipmentId: number,
    patch: {
      scheduledDate?: Date | null;
      driverName?: string | null;
      needsCrane?: boolean;
      buildingFloor?: number | null;
      hasElevator?: boolean;
      specialNote?: string | null;
      status?: ShipmentStatus;
    },
    actorId?: string | number | null
  ) {
    const updated = await this.db.$transaction(async (tx) => {
      const shipment = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          ...(patch.scheduledDate !== undefined ? { scheduledDate: patch.scheduledDate } : {}),
          ...(patch.driverName !== undefined ? { driverName: patch.driverName } : {}),
          ...(patch.needsCrane !== undefined ? { needsCrane: patch.needsCrane } : {}),
          ...(patch.buildingFloor !== undefined ? { buildingFloor: patch.buildingFloor } : {}),
          ...(patch.hasElevator !== undefined ? { hasElevator: patch.hasElevator } : {}),
          ...(patch.specialNote !== undefined ? { specialNote: patch.specialNote } : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
        },
      });

      if (patch.status === "delivering") {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { workshopStatus: "shipping" },
        });
      } else if (patch.status === "done") {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { workshopStatus: "done" },
        });
      }

      return shipment;
    });

    await recordAuditLog({
      actorId,
      action: "SHIPMENT_UPDATED",
      entity: "Shipment",
      entityId: updated.id,
      changes: {
        orderId: updated.orderId,
        status: updated.status,
        driverName: updated.driverName,
      },
    });

    return {
      ...updated,
      status: isShipmentStatus(updated.status) ? updated.status : "scheduled",
    };
  }
}
