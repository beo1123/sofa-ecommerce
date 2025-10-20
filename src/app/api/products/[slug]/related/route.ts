import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../../../generated/prisma_client";
import { ProductService } from "@/services/products.service";
import { fail, normalizeError, ok } from "@/server/utils/api";

const prisma = new PrismaClient();

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const service = new ProductService(prisma);
    const related = await service.getRelatedProducts(slug);

    if (!related.length) {
      return NextResponse.json(fail("No related products found", "NOT_FOUND"), { status: 404 });
    }

    return NextResponse.json(ok(related));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
