// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CheckoutService } from "@/services/checkout.service";
import { normalizeError, validateRequest } from "@/server/utils/api";
import { serializeData } from "@/lib/helpers";

const prisma = new PrismaClient();
const checkoutService = new CheckoutService(prisma);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    validateRequest(body, { cart: "array" });

    const result = await checkoutService.validateCart(body.cart);

    return NextResponse.json(serializeData(result), { status: 200 });
  } catch (err: any) {
    const normalized = normalizeError(err);
    return NextResponse.json(normalized.payload, { status: normalized.status });
  }
}
