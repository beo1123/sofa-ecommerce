import { ProductService } from "@/services/products.service";
import { NextRequest, NextResponse } from "next/server";
import { normalizeError, ok } from "@/server/utils/api";
import { prisma } from "@/lib/prisma";
const productService = new ProductService(prisma);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = parseInt(url.searchParams.get("perPage ") || "12", 10);
    const result = await productService.SearchProducts(q, page, perPage);
    return NextResponse.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
