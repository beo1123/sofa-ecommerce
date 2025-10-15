import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../../../../generated/prisma_client";
import { ProductService } from "@/services/products.service";
import { fail, normalizeError, ok } from "@/server/utils/api";

const prisma = new PrismaClient();

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const numId = Number(id);

    if (isNaN(numId)) {
      return NextResponse.json(fail("Invalid ID", "BAD_REQUEST"), { status: 400 });
    }

    const service = new ProductService(prisma);
    const related = await service.getRelatedProducts(numId);

    if (!related.length) {
      return NextResponse.json(fail("No related products found", "NOT_FOUND"), { status: 404 });
    }

    return NextResponse.json(ok(related));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
