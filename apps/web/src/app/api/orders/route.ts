import { NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { fail, normalizeError, validateRequest } from "@/server/utils/api";
import { serializeData } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(fail("Unauthorized", "UNAUTHORIZED"), { status: 401 });
  }
  try {
    const result = await orderService.getUserOrders(Number(session?.user?.id));
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(err.body ?? { success: false }, {
      status: err.status ?? 500,
    });
  }
}
