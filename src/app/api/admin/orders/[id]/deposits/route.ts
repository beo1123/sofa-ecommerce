import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminOrderService } from "@/services/admin/order.service";
import { fail, normalizeError, ok } from "@/server/utils/api";
import { addDepositLogSchema } from "@/lib/validators/order";

const orderService = new AdminOrderService(prisma);

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

    const logs = await prisma.depositLog.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ok(logs));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
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
    const parsed = addDepositLogSchema.safeParse({ ...body, orderId });
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid deposit data", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const staff = session.user.name || session.user.email || "Admin";
    const result = await orderService.addDeposit(parsed.data, staff, session.user.id);

    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return NextResponse.json(ok(result), { status: 201 });
  } catch (err: any) {
    if (err?.message === "ORDER_NOT_FOUND") {
      return NextResponse.json(fail("Order not found", "NOT_FOUND"), {
        status: 404,
      });
    }
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
