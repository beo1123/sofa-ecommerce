import { NextResponse } from "next/server";
import { ProductService } from "@/services/products.service";
import { fail, normalizeError, ok } from "@/server/utils/api";
import prisma from "@/lib/prisma";
const service = new ProductService(prisma);

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
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
