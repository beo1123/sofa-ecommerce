import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok } from "@/server/utils/api";
import { AdminArticleService } from "@/services/admin/article.service";

const service = new AdminArticleService(prisma);

interface Params {
  params: Promise<{ id: string; imageId: string }>;
}

/**
 * DELETE /api/admin/articles/[id]/images/[imageId]
 * Xóa ảnh khỏi bài viết (DB + Cloudinary) – dùng cho nút X trong edit
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { id, imageId } = await params;
    const result = await service.deleteArticleImage(Number(id), Number(imageId));
    return NextResponse.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
