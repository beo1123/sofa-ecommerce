"use server";

import { revalidatePath } from "next/cache";
import { prisma, type ReturnStatus } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminReturnService } from "@/services/admin/return.service";
import { updateReturnStatusSchema, upsertRefundSchema, type UpsertRefundInput } from "@/lib/validators/return";
import type { SerializedRefund } from "@/components/admin/returns/types";

export interface ReturnActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

const returnService = new AdminReturnService(prisma);

export async function updateReturnStatusAction(
  returnRequestId: number,
  status: ReturnStatus
): Promise<
  ReturnActionResult<{
    returnRequestId: number;
    status: ReturnStatus;
    processedAt: string | null;
  }>
> {
  try {
    const session = await requireAdmin();
    const parsed = updateReturnStatusSchema.safeParse({
      returnRequestId,
      status,
    });
    if (!parsed.success) {
      return { ok: false, error: "Trạng thái yêu cầu không hợp lệ" };
    }

    const data = await returnService.updateReturnStatus(returnRequestId, parsed.data.status, session.user.id);
    revalidatePath("/admin/returns");
    revalidatePath("/admin/orders");

    return { ok: true, data };
  } catch (err) {
    console.error("[updateReturnStatusAction]", err);
    return { ok: false, error: "Không thể cập nhật trạng thái bảo hành / đổi trả" };
  }
}

export async function upsertRefundAction(input: UpsertRefundInput): Promise<ReturnActionResult<SerializedRefund>> {
  try {
    const session = await requireAdmin();
    const parsed = upsertRefundSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Dữ liệu hoàn tiền không hợp lệ",
      };
    }

    const data = await returnService.upsertRefund(parsed.data, session.user.id);
    revalidatePath("/admin/returns");
    revalidatePath("/admin/orders");

    return { ok: true, data };
  } catch (err) {
    console.error("[upsertRefundAction]", err);
    return { ok: false, error: "Không thể lưu thông tin hoàn tiền" };
  }
}
