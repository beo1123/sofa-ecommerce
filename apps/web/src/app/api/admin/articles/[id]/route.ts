import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok } from "@/server/utils/api";
import { AdminArticleService } from "@/services/admin/article.service";

const service = new AdminArticleService(prisma);

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/articles/[id] – Chi tiết bài viết
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const article = await service.getArticle(Number(id));
    return NextResponse.json(ok(article));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

/**
 * PUT /api/admin/articles/[id] – Cập nhật bài viết
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const article = await service.updateArticle(Number(id), body);
    return NextResponse.json(ok(article));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

/**
 * DELETE /api/admin/articles/[id] – Xóa bài viết (archive)
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const result = await service.deleteArticle(Number(id));
    return NextResponse.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
