import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok } from "@/server/utils/api";
import { AdminProductService } from "@/services/admin/product.service";

const service = new AdminProductService(prisma);

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/products/[id] – Chi tiết sản phẩm
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await service.getProduct(Number(id));
    return NextResponse.json(ok(product));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

/**
 * PUT /api/admin/products/[id] – Cập nhật sản phẩm
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const product = await service.updateProduct(Number(id), body);
    return NextResponse.json(ok(product));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

/**
 * DELETE /api/admin/products/[id] – Xóa sản phẩm (archive)
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const result = await service.deleteProduct(Number(id));
    return NextResponse.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
