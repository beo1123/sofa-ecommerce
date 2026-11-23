import type { PrismaClient, ReturnStatus } from "@prisma/client";
import { toNumber } from "@/lib/format";
import { recordAuditLog } from "@/lib/audit";
import type { UpsertRefundInput } from "@/lib/validators/return";
import {
  extractEvidenceUrls,
  type SerializedRefund,
  type SerializedReturnRequest,
} from "@/components/admin/returns/types";

export class AdminReturnService {
  constructor(private readonly db: PrismaClient) {}

  async listReturnsAndRefunds(): Promise<{
    returns: SerializedReturnRequest[];
    refunds: SerializedRefund[];
  }> {
    const [returnRequests, refunds] = await Promise.all([
      this.db.returnRequest.findMany({
        orderBy: { requestedAt: "desc" },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              recipientName: true,
              phone: true,
            },
          },
          orderItem: {
            select: { id: true, name: true, quantity: true, total: true },
          },
          refund: true,
        },
      }),
      this.db.refund.findMany({
        orderBy: { createdAt: "desc" },
        include: { order: { select: { orderNumber: true } } },
      }),
    ]);

    return {
      returns: returnRequests.map((req) => ({
        id: req.id,
        orderId: req.orderId,
        orderNumber: req.order.orderNumber,
        recipientName: req.order.recipientName,
        phone: req.order.phone,
        orderItemId: req.orderItemId,
        itemName: req.orderItem.name,
        itemQuantity: req.orderItem.quantity,
        itemTotal: toNumber(req.orderItem.total),
        reason: req.reason,
        status: req.status,
        evidenceUrls: extractEvidenceUrls(req.evidence),
        requestedAt: req.requestedAt.toISOString(),
        processedAt: req.processedAt ? req.processedAt.toISOString() : null,
        refund: req.refund
          ? {
              id: req.refund.id,
              orderId: req.refund.orderId,
              orderNumber: req.order.orderNumber,
              returnRequestId: req.refund.returnRequestId,
              amount: toNumber(req.refund.amount),
              method: req.refund.method,
              status: req.refund.status,
              providerRef: req.refund.providerRef,
              createdAt: req.refund.createdAt.toISOString(),
              processedAt: req.refund.processedAt ? req.refund.processedAt.toISOString() : null,
            }
          : null,
      })),
      refunds: refunds.map((rf) => ({
        id: rf.id,
        orderId: rf.orderId,
        orderNumber: rf.order.orderNumber,
        returnRequestId: rf.returnRequestId,
        amount: toNumber(rf.amount),
        method: rf.method,
        status: rf.status,
        providerRef: rf.providerRef,
        createdAt: rf.createdAt.toISOString(),
        processedAt: rf.processedAt ? rf.processedAt.toISOString() : null,
      })),
    };
  }

  async updateReturnStatus(returnRequestId: number, status: ReturnStatus, actorId?: string | number | null) {
    const processedAt = status === "PENDING" ? null : new Date();

    const updated = await this.db.$transaction(async (tx) => {
      const req = await tx.returnRequest.update({
        where: { id: returnRequestId },
        data: { status, processedAt },
        select: {
          id: true,
          orderId: true,
          orderItemId: true,
          status: true,
          processedAt: true,
        },
      });

      if (status === "RECEIVED") {
        await tx.orderItem.update({
          where: { id: req.orderItemId },
          data: { returned: true },
        });
      }

      return req;
    });

    await recordAuditLog({
      actorId,
      action: "RETURN_REQUEST_STATUS_UPDATED",
      entity: "ReturnRequest",
      entityId: updated.id,
      changes: { status: updated.status, orderId: updated.orderId },
    });

    return {
      returnRequestId: updated.id,
      status: updated.status,
      processedAt: updated.processedAt ? updated.processedAt.toISOString() : null,
    };
  }

  async upsertRefund(input: UpsertRefundInput, actorId?: string | number | null): Promise<SerializedRefund> {
    const processedAt = input.status === "COMPLETED" ? new Date() : null;

    const saved = await this.db.refund.upsert({
      where: { returnRequestId: input.returnRequestId },
      create: {
        orderId: input.orderId,
        returnRequestId: input.returnRequestId,
        amount: input.amount,
        method: input.method,
        status: input.status,
        providerRef: input.providerRef || null,
        processedAt,
      },
      update: {
        amount: input.amount,
        method: input.method,
        status: input.status,
        providerRef: input.providerRef || null,
        processedAt,
      },
      include: { order: { select: { orderNumber: true } } },
    });

    await recordAuditLog({
      actorId,
      action: "REFUND_UPSERTED",
      entity: "Refund",
      entityId: saved.id,
      changes: {
        orderId: saved.orderId,
        returnRequestId: saved.returnRequestId,
        amount: toNumber(saved.amount),
        method: saved.method,
        status: saved.status,
        providerRef: saved.providerRef,
      },
    });

    return {
      id: saved.id,
      orderId: saved.orderId,
      orderNumber: saved.order.orderNumber,
      returnRequestId: saved.returnRequestId,
      amount: toNumber(saved.amount),
      method: saved.method,
      status: saved.status,
      providerRef: saved.providerRef,
      createdAt: saved.createdAt.toISOString(),
      processedAt: saved.processedAt ? saved.processedAt.toISOString() : null,
    };
  }
}
