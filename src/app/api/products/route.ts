import { NextResponse } from "next/server";
import { ProductService } from "@/services/products.service";
import { normalizeError, ok, parseOptionalNumber, parsePagination, parseStringParam } from "@/server/utils/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { page, perPage } = parsePagination(url.searchParams, 12);

    const category = parseStringParam(url.searchParams.get("category"));
    const priceMin = parseOptionalNumber(url.searchParams.get("priceMin"));
    const priceMax = parseOptionalNumber(url.searchParams.get("priceMax"));
    const color = parseStringParam(url.searchParams.get("color"));
    const material = parseStringParam(url.searchParams.get("material"));

    const service = new ProductService(prisma);

    const { items, meta } = await service.listProducts({
      page,
      perPage,
      category,
      priceMin,
      priceMax,
      color,
      material,
    });

    return NextResponse.json(ok(items, meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
