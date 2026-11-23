"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminInquiryService } from "@/services/admin/inquiry.service";
import type { InquiryStatus } from "@/lib/workshop-types";
import {
  createInquirySchema,
  updateInquiryAssignedSchema,
  updateInquiryNoteSchema,
  updateInquiryStatusSchema,
  type CreateInquiryInput,
} from "@/lib/validators/inquiry";
import type { SerializedInquiry } from "@/components/admin/inquiries/types";

export interface InquiryActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

const inquiryService = new AdminInquiryService(prisma);

export async function createInquiryAdminAction(
  input: CreateInquiryInput
): Promise<InquiryActionResult<SerializedInquiry>> {
  try {
    const session = await requireAdmin();
    const parsed = createInquirySchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu lead không hợp lệ" };
    }

    const data = await inquiryService.createInquiry(parsed.data, session.user.id);
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return { ok: true, data };
  } catch (err) {
    console.error("[createInquiryAdminAction]", err);
    return { ok: false, error: "Không thể tạo lead mới" };
  }
}

export async function updateInquiryStatusAction(
  inquiryId: number,
  status: InquiryStatus
): Promise<InquiryActionResult<{ inquiryId: number; status: InquiryStatus }>> {
  try {
    const session = await requireAdmin();
    const parsed = updateInquiryStatusSchema.safeParse({ inquiryId, status });
    if (!parsed.success) {
      return { ok: false, error: "Trạng thái không hợp lệ" };
    }

    const updated = await inquiryService.updateInquiry(inquiryId, { status: parsed.data.status }, session.user.id);
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return { ok: true, data: { inquiryId: updated.id, status: updated.status } };
  } catch (err) {
    console.error("[updateInquiryStatusAction]", err);
    return { ok: false, error: "Không thể cập nhật trạng thái tư vấn" };
  }
}

export async function updateInquiryAssignedAction(
  inquiryId: number,
  assignedTo: string | null
): Promise<InquiryActionResult<{ inquiryId: number; assignedTo: string | null }>> {
  try {
    const session = await requireAdmin();
    const parsed = updateInquiryAssignedSchema.safeParse({ inquiryId, assignedTo });
    if (!parsed.success) {
      return { ok: false, error: "Nhân viên phụ trách không hợp lệ" };
    }

    const updated = await inquiryService.updateInquiry(
      inquiryId,
      { assignedTo: parsed.data.assignedTo },
      session.user.id
    );
    revalidatePath("/admin/inquiries");

    return {
      ok: true,
      data: { inquiryId: updated.id, assignedTo: updated.assignedTo },
    };
  } catch (err) {
    console.error("[updateInquiryAssignedAction]", err);
    return { ok: false, error: "Không thể phân công nhân viên" };
  }
}

export async function updateInquiryNoteAction(
  inquiryId: number,
  note: string | null
): Promise<InquiryActionResult<{ inquiryId: number; note: string | null }>> {
  try {
    const session = await requireAdmin();
    const parsed = updateInquiryNoteSchema.safeParse({ inquiryId, note });
    if (!parsed.success) {
      return { ok: false, error: "Ghi chú không hợp lệ" };
    }

    const updated = await inquiryService.updateInquiry(inquiryId, { note: parsed.data.note }, session.user.id);
    revalidatePath("/admin/inquiries");

    return { ok: true, data: { inquiryId: updated.id, note: updated.note } };
  } catch (err) {
    console.error("[updateInquiryNoteAction]", err);
    return { ok: false, error: "Không thể lưu ghi chú" };
  }
}

export async function deleteInquiryAction(inquiryId: number): Promise<InquiryActionResult<{ deleted: boolean }>> {
  try {
    const session = await requireAdmin();
    const data = await inquiryService.deleteInquiry(inquiryId, session.user.id);
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return { ok: true, data };
  } catch (err) {
    console.error("[deleteInquiryAction]", err);
    return { ok: false, error: "Không thể xóa yêu cầu tư vấn" };
  }
}
