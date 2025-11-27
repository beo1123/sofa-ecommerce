import { NextResponse } from "next/server";
import { ProductService } from "@/services/products.service";
import { normalizeError, ok, parsePagination } from "@/server/utils/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { page, perPage } = parsePagination(url.searchParams);

    const category = url.searchParams.get("category") ?? undefined;
    const priceMin = url.searchParams.get("priceMin") ? Number(url.searchParams.get("priceMin")) : undefined;
    const priceMax = url.searchParams.get("priceMax") ? Number(url.searchParams.get("priceMax")) : undefined;
    const color = url.searchParams.get("color") ?? undefined;

    const service = new ProductService(prisma);

    const { items, meta } = await service.listProducts({
      page,
      perPage,
      category,
      priceMin,
      priceMax,
      color,
    });

    return NextResponse.json(ok(items, meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
