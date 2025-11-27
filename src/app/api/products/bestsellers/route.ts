import { NextResponse } from "next/server";
import { ProductService } from "@/services/products.service";
import { prisma } from "@/lib/prisma";
import { ok, fail, normalizeError } from "@/server/utils/api";

export async function GET() {
  try {
    const service = new ProductService(prisma);
    const items = await service.getBestSellingProducts(8);

    if (!items?.length)
      return NextResponse.json(fail("No best-selling products found", "NOT_FOUND"), {
        status: 404,
      });

    return NextResponse.json(ok(items, { count: items.length }));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
