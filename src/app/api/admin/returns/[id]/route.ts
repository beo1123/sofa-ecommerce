import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminReturnService } from "@/services/admin/return.service";
import { fail, normalizeError, ok } from "@/server/utils/api";
import { updateReturnStatusSchema, upsertRefundSchema } from "@/lib/validators/return";

const returnService = new AdminReturnService(prisma);

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const returnRequestId = Number(id);
    if (!Number.isInteger(returnRequestId) || returnRequestId <= 0) {
      return NextResponse.json(fail("Invalid return request id", "INVALID_ID"), {
        status: 400,
      });
    }

    const body = await req.json();
    const parsed = updateReturnStatusSchema.safeParse({
      ...body,
      returnRequestId,
    });
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid status", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const updated = await returnService.updateReturnStatus(returnRequestId, parsed.data.status, session.user.id);

    revalidatePath("/admin/returns");
    revalidatePath("/admin/orders");

    return NextResponse.json(ok(updated));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const returnRequestId = Number(id);
    if (!Number.isInteger(returnRequestId) || returnRequestId <= 0) {
      return NextResponse.json(fail("Invalid return request id", "INVALID_ID"), {
        status: 400,
      });
    }

    const existingReq = await prisma.returnRequest.findUnique({
      where: { id: returnRequestId },
      select: { id: true, orderId: true },
    });
    if (!existingReq) {
      return NextResponse.json(fail("Return request not found", "NOT_FOUND"), {
        status: 404,
      });
    }

    const body = await req.json();
    const parsed = upsertRefundSchema.safeParse({
      ...body,
      returnRequestId,
      orderId: existingReq.orderId,
    });
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid refund payload", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const refund = await returnService.upsertRefund(parsed.data, session.user.id);

    revalidatePath("/admin/returns");

    return NextResponse.json(ok(refund));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
