import { ProductService } from "@/services/products.service";
import { NextRequest, NextResponse } from "next/server";
import { normalizeError, ok, parsePagination } from "@/server/utils/api";
import { prisma } from "@/lib/prisma";
const productService = new ProductService(prisma);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const { page, perPage } = parsePagination(url.searchParams, 12);
    const result = await productService.SearchProducts(q, page, perPage);
    return NextResponse.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
