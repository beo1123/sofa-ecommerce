import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../../generated/prisma_client";
import { ProductService } from "@/services/products.service";
import { fail, normalizeError, ok } from "@/server/utils/api";

const prisma = new PrismaClient();

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const service = new ProductService(prisma);
    const product = await service.getProductBySlug(slug);

    if (!product)
      return NextResponse.json(fail("Product not found", "NOT_FOUND"), {
        status: 404,
      });

    return NextResponse.json(ok(product));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
