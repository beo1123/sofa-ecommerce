import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminInquiryService } from "@/services/admin/inquiry.service";
import { fail, normalizeError, ok } from "@/server/utils/api";
import { INQUIRY_STATUSES } from "@/lib/workshop-types";

const inquiryService = new AdminInquiryService(prisma);

const patchInquirySchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  assignedTo: z.string().trim().max(120).nullable().optional(),
  note: z.string().trim().max(2000).nullable().optional(),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const inquiryId = Number(id);
    if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
      return NextResponse.json(fail("Invalid inquiry id", "INVALID_ID"), {
        status: 400,
      });
    }

    const body = await req.json();
    const parsed = patchInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid payload", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const updated = await inquiryService.updateInquiry(inquiryId, parsed.data, session.user.id);

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return NextResponse.json(ok(updated));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const inquiryId = Number(id);
    if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
      return NextResponse.json(fail("Invalid inquiry id", "INVALID_ID"), {
        status: 400,
      });
    }

    await inquiryService.deleteInquiry(inquiryId, session.user.id);
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return NextResponse.json(ok({ deleted: true, id: inquiryId }));
  } catch (err: any) {
    if (err?.message === "INQUIRY_NOT_FOUND") {
      return NextResponse.json(fail("Inquiry not found", "NOT_FOUND"), {
        status: 404,
      });
    }
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
