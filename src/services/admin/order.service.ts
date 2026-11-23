import type { PaymentMethod, Prisma, PrismaClient } from "@prisma/client";
import { toNumber } from "@/lib/format";
import { resolveWorkshopCode } from "@/lib/slug";
import { recordAuditLog } from "@/lib/audit";
import { isShipmentStatus, isWorkshopStatus, type ShipmentStatus, type WorkshopStatus } from "@/lib/workshop-types";
import type {
  AddDepositLogInput,
  UpdateOrderInternalNoteInput,
  UpdateOrderWorkshopSpecsInput,
  UpdateWorkshopStatusInput,
  UpsertShipmentInput,
} from "@/lib/validators/order";
import type { SerializedAdminOrder, SerializedDepositLog, SerializedShipment } from "@/components/admin/orders/types";

export const ORDER_DETAIL_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, workshopCode: true } },
      variant: { select: { id: true, name: true } },
    },
  },
  shipment: true,
  depositLogs: { orderBy: { createdAt: "desc" as const } },
  statusHistory: {
    orderBy: { createdAt: "desc" as const },
    include: {
      actor: { select: { displayName: true, email: true } },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithDetailsPayload = Prisma.OrderGetPayload<{
  include: typeof ORDER_DETAIL_INCLUDE;
}>;

function parseOptionalDate(value: string | null | undefined): Date | null {
  if (!value || value.trim() === "") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function serializeAdminOrder(order: OrderWithDetailsPayload): SerializedAdminOrder {
  const workshopStatus: WorkshopStatus = isWorkshopStatus(order.workshopStatus) ? order.workshopStatus : "new";

  const shipmentStatus: ShipmentStatus =
    order.shipment && isShipmentStatus(order.shipment.status) ? order.shipment.status : "scheduled";

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    recipientName: order.recipientName,
    phone: order.phone,
    email: order.email,
    line1: order.line1,
    city: order.city,
    province: order.province,
    country: order.country,
    status: order.status,
    workshopStatus,
    subtotal: toNumber(order.subtotal),
    shipping: toNumber(order.shipping),
    tax: toNumber(order.tax),
    total: toNumber(order.total),
    depositPaid: toNumber(order.depositPaid),
    paymentMethod: order.paymentMethod,
    isCustomSize: order.isCustomSize,
    customWidthCm: order.customWidthCm,
    customDepthCm: order.customDepthCm,
    customHeightCm: order.customHeightCm,
    materialChoice: order.materialChoice,
    colorChoice: order.colorChoice,
    internalNote: order.internalNote,
    deliverDate: order.deliverDate ? order.deliverDate.toISOString() : null,
    invoiceUrl: order.invoiceUrl,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      price: toNumber(item.price),
      quantity: item.quantity,
      total: toNumber(item.total),
      productId: item.productId,
      workshopCode: resolveWorkshopCode(item.product?.workshopCode, item.name),
      variantName: item.variant?.name ?? null,
    })),
    shipment: order.shipment
      ? {
          id: order.shipment.id,
          orderId: order.shipment.orderId,
          scheduledDate: order.shipment.scheduledDate ? order.shipment.scheduledDate.toISOString() : null,
          driverName: order.shipment.driverName,
          needsCrane: order.shipment.needsCrane,
          buildingFloor: order.shipment.buildingFloor,
          hasElevator: order.shipment.hasElevator,
          specialNote: order.shipment.specialNote,
          status: shipmentStatus,
          updatedAt: order.shipment.updatedAt.toISOString(),
        }
      : null,
    depositLogs: order.depositLogs.map((log) => ({
      id: log.id,
      orderId: log.orderId,
      amount: toNumber(log.amount),
      method: log.method,
      note: log.note,
      recordedBy: log.recordedBy,
      createdAt: log.createdAt.toISOString(),
    })),
    statusHistory: order.statusHistory.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      note: h.note,
      actorName: h.actor?.displayName ?? h.actor?.email ?? null,
      createdAt: h.createdAt.toISOString(),
    })),
  };
}

export class AdminOrderService {
  constructor(private readonly db: PrismaClient) {}

  async listSerializedOrders(): Promise<SerializedAdminOrder[]> {
    const orders = await this.db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: ORDER_DETAIL_INCLUDE,
    });
    return orders.map(serializeAdminOrder);
  }

  async listPaginatedOrders(params: {
    skip: number;
    take: number;
    workshopStatus?: string;
    paymentMethod?: PaymentMethod;
    search?: string;
  }) {
    const where: Prisma.OrderWhereInput = {
      ...(params.workshopStatus && isWorkshopStatus(params.workshopStatus)
        ? { workshopStatus: params.workshopStatus }
        : {}),
      ...(params.paymentMethod ? { paymentMethod: params.paymentMethod } : {}),
      ...(params.search
        ? {
            OR: [
              { orderNumber: { contains: params.search, mode: "insensitive" } },
              { recipientName: { contains: params.search, mode: "insensitive" } },
              { phone: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.db.order.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          items: { select: { id: true, name: true, quantity: true, total: true } },
          shipment: true,
          depositLogs: { orderBy: { createdAt: "desc" } },
        },
      }),
      this.db.order.count({ where }),
    ]);

    return { items, total };
  }

  async getSerializedOrderById(orderId: number): Promise<SerializedAdminOrder | null> {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: ORDER_DETAIL_INCLUDE,
    });
    return order ? serializeAdminOrder(order) : null;
  }

  async updateWorkshopStatus(
    input: UpdateWorkshopStatusInput,
    actorId?: string | number | null
  ): Promise<{ orderId: number; workshopStatus: WorkshopStatus }> {
    const existing = await this.db.order.findUnique({
      where: { id: input.orderId },
      select: { id: true, orderNumber: true, workshopStatus: true },
    });

    if (!existing) {
      throw new Error("ORDER_NOT_FOUND");
    }

    await this.db.order.update({
      where: { id: input.orderId },
      data: { workshopStatus: input.workshopStatus },
    });

    await recordAuditLog({
      actorId,
      action: "ORDER_WORKSHOP_STATUS_UPDATED",
      entity: "Order",
      entityId: input.orderId,
      changes: {
        orderNumber: existing.orderNumber,
        from: existing.workshopStatus,
        to: input.workshopStatus,
        note: input.note ?? null,
      },
    });

    return { orderId: input.orderId, workshopStatus: input.workshopStatus };
  }

  async updateInternalNote(
    input: UpdateOrderInternalNoteInput,
    actorId?: string | number | null
  ): Promise<{ orderId: number; internalNote: string; updatedAt: string }> {
    const updated = await this.db.order.update({
      where: { id: input.orderId },
      data: {
        internalNote: input.internalNote.trim() === "" ? null : input.internalNote,
      },
      select: { id: true, internalNote: true, updatedAt: true },
    });

    await recordAuditLog({
      actorId,
      action: "ORDER_INTERNAL_NOTE_UPDATED",
      entity: "Order",
      entityId: updated.id,
      changes: { internalNote: updated.internalNote },
    });

    return {
      orderId: updated.id,
      internalNote: updated.internalNote ?? "",
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async updateWorkshopSpecs(input: UpdateOrderWorkshopSpecsInput, actorId?: string | number | null) {
    const deliverDate = parseOptionalDate(input.deliverDate);

    const updated = await this.db.order.update({
      where: { id: input.orderId },
      data: {
        isCustomSize: input.isCustomSize,
        customWidthCm: input.isCustomSize ? (input.customWidthCm ?? null) : null,
        customDepthCm: input.isCustomSize ? (input.customDepthCm ?? null) : null,
        customHeightCm: input.isCustomSize ? (input.customHeightCm ?? null) : null,
        materialChoice: input.materialChoice || null,
        colorChoice: input.colorChoice || null,
        deliverDate,
      },
      select: {
        id: true,
        isCustomSize: true,
        customWidthCm: true,
        customDepthCm: true,
        customHeightCm: true,
        materialChoice: true,
        colorChoice: true,
        deliverDate: true,
      },
    });

    await recordAuditLog({
      actorId,
      action: "ORDER_WORKSHOP_SPECS_UPDATED",
      entity: "Order",
      entityId: updated.id,
      changes: {
        isCustomSize: updated.isCustomSize,
        customWidthCm: updated.customWidthCm,
        customDepthCm: updated.customDepthCm,
        customHeightCm: updated.customHeightCm,
        materialChoice: updated.materialChoice,
        colorChoice: updated.colorChoice,
        deliverDate: updated.deliverDate?.toISOString() ?? null,
      },
    });

    return {
      orderId: updated.id,
      isCustomSize: updated.isCustomSize,
      customWidthCm: updated.customWidthCm,
      customDepthCm: updated.customDepthCm,
      customHeightCm: updated.customHeightCm,
      materialChoice: updated.materialChoice,
      colorChoice: updated.colorChoice,
      deliverDate: updated.deliverDate ? updated.deliverDate.toISOString() : null,
    };
  }

  async upsertShipment(
    input: UpsertShipmentInput,
    actorId?: string | number | null
  ): Promise<{ shipment: SerializedShipment; deliverDate: string | null }> {
    const parsedDate = parseOptionalDate(input.scheduledDate);

    const [shipment] = await this.db.$transaction([
      this.db.shipment.upsert({
        where: { orderId: input.orderId },
        create: {
          orderId: input.orderId,
          scheduledDate: parsedDate,
          driverName: input.driverName || null,
          needsCrane: input.needsCrane,
          buildingFloor: input.buildingFloor ?? null,
          hasElevator: input.hasElevator,
          specialNote: input.specialNote || null,
          status: input.status,
        },
        update: {
          scheduledDate: parsedDate,
          driverName: input.driverName || null,
          needsCrane: input.needsCrane,
          buildingFloor: input.buildingFloor ?? null,
          hasElevator: input.hasElevator,
          specialNote: input.specialNote || null,
          status: input.status,
        },
      }),
      this.db.order.update({
        where: { id: input.orderId },
        data: {
          ...(parsedDate ? { deliverDate: parsedDate } : {}),
        },
      }),
    ]);

    await recordAuditLog({
      actorId,
      action: "SHIPMENT_UPSERTED",
      entity: "Shipment",
      entityId: shipment.id,
      changes: {
        orderId: input.orderId,
        status: shipment.status,
        driverName: shipment.driverName,
        scheduledDate: shipment.scheduledDate?.toISOString() ?? null,
        needsCrane: shipment.needsCrane,
        hasElevator: shipment.hasElevator,
        buildingFloor: shipment.buildingFloor,
      },
    });

    const normalizedStatus: ShipmentStatus = isShipmentStatus(shipment.status) ? shipment.status : "scheduled";

    return {
      shipment: {
        id: shipment.id,
        orderId: shipment.orderId,
        scheduledDate: shipment.scheduledDate ? shipment.scheduledDate.toISOString() : null,
        driverName: shipment.driverName,
        needsCrane: shipment.needsCrane,
        buildingFloor: shipment.buildingFloor,
        hasElevator: shipment.hasElevator,
        specialNote: shipment.specialNote,
        status: normalizedStatus,
        updatedAt: shipment.updatedAt.toISOString(),
      },
      deliverDate: parsedDate ? parsedDate.toISOString() : null,
    };
  }

  async addDeposit(
    input: AddDepositLogInput,
    staffFallback: string,
    actorId?: string | number | null
  ): Promise<{
    depositLog: SerializedDepositLog;
    depositPaid: number;
    workshopStatus: WorkshopStatus;
  }> {
    const staffName = input.recordedBy || staffFallback;

    const result = await this.db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: input.orderId },
        select: { id: true, orderNumber: true, workshopStatus: true },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const log = await tx.depositLog.create({
        data: {
          orderId: input.orderId,
          amount: input.amount,
          method: input.method || null,
          note: input.note || null,
          recordedBy: staffName,
        },
      });

      const nextWorkshopStatus: WorkshopStatus =
        order.workshopStatus === "new"
          ? "deposited"
          : isWorkshopStatus(order.workshopStatus)
            ? order.workshopStatus
            : "deposited";

      const updatedOrder = await tx.order.update({
        where: { id: input.orderId },
        data: {
          depositPaid: { increment: input.amount },
          workshopStatus: nextWorkshopStatus,
        },
        select: { depositPaid: true, workshopStatus: true },
      });

      return { log, updatedOrder, orderNumber: order.orderNumber };
    });

    await recordAuditLog({
      actorId,
      action: "DEPOSIT_LOG_CREATED",
      entity: "DepositLog",
      entityId: result.log.id,
      changes: {
        orderId: input.orderId,
        orderNumber: result.orderNumber,
        amount: input.amount,
        method: input.method ?? null,
        depositPaidAfter: toNumber(result.updatedOrder.depositPaid),
      },
    });

    const finalWorkshopStatus: WorkshopStatus = isWorkshopStatus(result.updatedOrder.workshopStatus)
      ? result.updatedOrder.workshopStatus
      : "deposited";

    return {
      depositLog: {
        id: result.log.id,
        orderId: result.log.orderId,
        amount: toNumber(result.log.amount),
        method: result.log.method,
        note: result.log.note,
        recordedBy: result.log.recordedBy,
        createdAt: result.log.createdAt.toISOString(),
      },
      depositPaid: toNumber(result.updatedOrder.depositPaid),
      workshopStatus: finalWorkshopStatus,
    };
  }
}
