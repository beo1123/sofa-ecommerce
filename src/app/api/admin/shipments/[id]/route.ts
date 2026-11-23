import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminShipmentService } from "@/services/admin/shipment.service";
import { fail, normalizeError, ok } from "@/server/utils/api";
import { SHIPMENT_STATUSES } from "@/lib/workshop-types";

const shipmentService = new AdminShipmentService(prisma);

const patchShipmentSchema = z.object({
  scheduledDate: z.string().nullable().optional(),
  driverName: z.string().trim().max(120).nullable().optional(),
  needsCrane: z.boolean().optional(),
  buildingFloor: z.number().int().min(0).max(120).nullable().optional(),
  hasElevator: z.boolean().optional(),
  specialNote: z.string().trim().max(1000).nullable().optional(),
  status: z.enum(SHIPMENT_STATUSES).optional(),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const shipmentId = Number(id);
    if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
      return NextResponse.json(fail("Invalid shipment id", "INVALID_ID"), {
        status: 400,
      });
    }

    const body = await req.json();
    const parsed = patchShipmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid shipment payload", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const d = parsed.data;
    const scheduledDate =
      d.scheduledDate === undefined ? undefined : d.scheduledDate ? new Date(d.scheduledDate) : null;

    const updated = await shipmentService.updateShipment(
      shipmentId,
      {
        scheduledDate,
        driverName: d.driverName,
        needsCrane: d.needsCrane,
        buildingFloor: d.buildingFloor,
        hasElevator: d.hasElevator,
        specialNote: d.specialNote,
        status: d.status,
      },
      session.user.id
    );

    revalidatePath("/admin/shipments");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return NextResponse.json(ok(updated));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
