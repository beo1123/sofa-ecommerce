import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma_client";
import { OrderService } from "@/services/order.service";
import { normalizeError, validateRequest } from "@/server/utils/api";
import { serializeData } from "@/lib/helpers";

const prisma = new PrismaClient();
const orderService = new OrderService(prisma);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    validateRequest(body, { cart: "object", paymentMethod: "string" });

    // ⬇️ detect guest case
    const isGuest = !body.userId;
    const result = await orderService.createOrder({
      ...body,
      userId: body.userId ?? null,
      guestEmail: isGuest ? (body.recipient?.email ?? body.guestEmail) : undefined,
    });

    const response = serializeData(result);
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const normalized = normalizeError(err);
    return NextResponse.json(normalized.payload, { status: normalized.status });
  }
}
