import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok, parsePagination, validateRequest } from "@/server/utils/api";
import { AdminProductService } from "@/services/admin/product.service";

const service = new AdminProductService(prisma);

/**
 * GET /api/admin/products – Danh sách sản phẩm (admin, tất cả status)
 */
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const { page, perPage } = parsePagination(url.searchParams);
    const result = await service.listProducts(page, perPage);
    return NextResponse.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

/**
 * POST /api/admin/products – Tạo sản phẩm mới
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    validateRequest(body, { title: "string", slug: "string" });
    const product = await service.createProduct(body);
    return NextResponse.json(ok(product), { status: 201 });
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
