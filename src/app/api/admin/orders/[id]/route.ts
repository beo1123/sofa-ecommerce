import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { recordAuditLog } from "@/lib/audit";
import { fail, normalizeError, ok } from "@/server/utils/api";
import { WORKSHOP_STATUSES } from "@/lib/workshop-types";

const patchOrderSchema = z.object({
  workshopStatus: z.enum(WORKSHOP_STATUSES).optional(),
  internalNote: z.string().max(4000).nullable().optional(),
  isCustomSize: z.boolean().optional(),
  customWidthCm: z.number().int().min(40).max(1000).nullable().optional(),
  customDepthCm: z.number().int().min(40).max(1000).nullable().optional(),
  customHeightCm: z.number().int().min(30).max(400).nullable().optional(),
  materialChoice: z.string().trim().max(150).nullable().optional(),
  colorChoice: z.string().trim().max(150).nullable().optional(),
  deliverDate: z.string().nullable().optional(),
});

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const orderId = Number(id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(fail("Invalid order id", "INVALID_ID"), {
        status: 400,
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shipment: true,
        depositLogs: { orderBy: { createdAt: "desc" } },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { id: true, email: true, displayName: true } } },
        },
        paymentMeta: true,
        coupon: true,
      },
    });

    if (!order) {
      return NextResponse.json(fail("Order not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    return NextResponse.json(ok(order));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const orderId = Number(id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(fail("Invalid order id", "INVALID_ID"), {
        status: 400,
      });
    }

    const body = await req.json();
    const parsed = patchOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid payload", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const d = parsed.data;
    const deliverDate = d.deliverDate === undefined ? undefined : d.deliverDate ? new Date(d.deliverDate) : null;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(d.workshopStatus !== undefined ? { workshopStatus: d.workshopStatus } : {}),
        ...(d.internalNote !== undefined ? { internalNote: d.internalNote } : {}),
        ...(d.isCustomSize !== undefined ? { isCustomSize: d.isCustomSize } : {}),
        ...(d.customWidthCm !== undefined ? { customWidthCm: d.customWidthCm } : {}),
        ...(d.customDepthCm !== undefined ? { customDepthCm: d.customDepthCm } : {}),
        ...(d.customHeightCm !== undefined ? { customHeightCm: d.customHeightCm } : {}),
        ...(d.materialChoice !== undefined ? { materialChoice: d.materialChoice } : {}),
        ...(d.colorChoice !== undefined ? { colorChoice: d.colorChoice } : {}),
        ...(deliverDate !== undefined ? { deliverDate } : {}),
      },
    });

    await recordAuditLog({
      actorId: session.user.id,
      action: "ORDER_UPDATED_API",
      entity: "Order",
      entityId: updated.id,
      changes: d,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return NextResponse.json(ok(updated));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
