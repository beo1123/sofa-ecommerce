"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminShipmentService } from "@/services/admin/shipment.service";
import { SHIPMENT_STATUSES, type ShipmentStatus } from "@/lib/workshop-types";

const updateShipmentStatusSchema = z.object({
  shipmentId: z.number().int().positive(),
  status: z.enum(SHIPMENT_STATUSES),
});

const shipmentService = new AdminShipmentService(prisma);

export async function updateShipmentStatusAction(
  shipmentId: number,
  status: ShipmentStatus
): Promise<{
  ok: boolean;
  data?: { shipmentId: number; status: ShipmentStatus };
  error?: string;
}> {
  try {
    const session = await requireAdmin();
    const parsed = updateShipmentStatusSchema.safeParse({ shipmentId, status });
    if (!parsed.success) {
      return { ok: false, error: "Trạng thái vận chuyển không hợp lệ" };
    }

    const updated = await shipmentService.updateShipment(shipmentId, { status: parsed.data.status }, session.user.id);

    revalidatePath("/admin/shipments");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return {
      ok: true,
      data: { shipmentId: updated.id, status: updated.status },
    };
  } catch (err) {
    console.error("[updateShipmentStatusAction]", err);
    return { ok: false, error: "Không thể cập nhật trạng thái giao hàng" };
  }
}
