import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminOrderService } from "@/services/admin/order.service";
import { fail, normalizeError, ok } from "@/server/utils/api";
import { upsertShipmentSchema } from "@/lib/validators/order";

const orderService = new AdminOrderService(prisma);

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
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
    const parsed = upsertShipmentSchema.safeParse({ ...body, orderId });
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid shipment data", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const result = await orderService.upsertShipment(parsed.data, session.user.id);

    revalidatePath("/admin/orders");
    revalidatePath("/admin/shipments");

    return NextResponse.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
