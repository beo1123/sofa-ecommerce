"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminOrderService } from "@/services/admin/order.service";
import {
  addDepositLogSchema,
  updateOrderInternalNoteSchema,
  updateOrderWorkshopSpecsSchema,
  updateWorkshopStatusSchema,
  upsertShipmentSchema,
  type AddDepositLogInput,
  type UpdateOrderInternalNoteInput,
  type UpdateOrderWorkshopSpecsInput,
  type UpdateWorkshopStatusInput,
  type UpsertShipmentInput,
} from "@/lib/validators/order";
import type { WorkshopStatus } from "@/lib/workshop-types";
import type { SerializedDepositLog, SerializedShipment } from "@/components/admin/orders/types";

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const orderService = new AdminOrderService(prisma);

export async function updateOrderWorkshopStatusAction(
  input: UpdateWorkshopStatusInput
): Promise<ActionResult<{ orderId: number; workshopStatus: WorkshopStatus }>> {
  try {
    const session = await requireAdmin();
    const parsed = updateWorkshopStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
    }

    const data = await orderService.updateWorkshopStatus(parsed.data, session.user.id);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return { ok: true, data };
  } catch (err) {
    console.error("[updateOrderWorkshopStatusAction]", err);
    return { ok: false, error: "Không thể cập nhật trạng thái xưởng" };
  }
}

export async function updateOrderInternalNoteAction(
  input: UpdateOrderInternalNoteInput
): Promise<ActionResult<{ orderId: number; internalNote: string; updatedAt: string }>> {
  try {
    const session = await requireAdmin();
    const parsed = updateOrderInternalNoteSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Ghi chú không hợp lệ" };
    }

    const data = await orderService.updateInternalNote(parsed.data, session.user.id);
    revalidatePath("/admin/orders");

    return { ok: true, data };
  } catch (err) {
    console.error("[updateOrderInternalNoteAction]", err);
    return { ok: false, error: "Không thể lưu ghi chú nội bộ" };
  }
}

export async function updateOrderWorkshopSpecsAction(input: UpdateOrderWorkshopSpecsInput) {
  try {
    const session = await requireAdmin();
    const parsed = updateOrderWorkshopSpecsSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Thông số không hợp lệ" };
    }

    const data = await orderService.updateWorkshopSpecs(parsed.data, session.user.id);
    revalidatePath("/admin/orders");

    return { ok: true, data };
  } catch (err) {
    console.error("[updateOrderWorkshopSpecsAction]", err);
    return { ok: false, error: "Không thể lưu thông số sản xuất" };
  }
}

export async function upsertOrderShipmentAction(
  input: UpsertShipmentInput
): Promise<ActionResult<{ shipment: SerializedShipment; deliverDate: string | null }>> {
  try {
    const session = await requireAdmin();
    const parsed = upsertShipmentSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Thông tin vận chuyển không hợp lệ" };
    }

    const data = await orderService.upsertShipment(parsed.data, session.user.id);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/shipments");
    revalidatePath("/admin");

    return { ok: true, data };
  } catch (err) {
    console.error("[upsertOrderShipmentAction]", err);
    return { ok: false, error: "Không thể cập nhật thông tin vận chuyển" };
  }
}

export async function addOrderDepositAction(input: AddDepositLogInput): Promise<
  ActionResult<{
    depositLog: SerializedDepositLog;
    depositPaid: number;
    workshopStatus: WorkshopStatus;
  }>
> {
  try {
    const session = await requireAdmin();
    const parsed = addDepositLogSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Số tiền cọc không hợp lệ" };
    }

    const staffFallback = session.user.name || session.user.email || "Admin";
    const data = await orderService.addDeposit(parsed.data, staffFallback, session.user.id);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return { ok: true, data };
  } catch (err) {
    console.error("[addOrderDepositAction]", err);
    return { ok: false, error: "Không thể ghi nhận khoản cọc" };
  }
}
