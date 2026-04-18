import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok } from "@/server/utils/api";
import { AdminArticleCategoryService } from "@/services/admin/articleCategory.service";

const service = new AdminArticleCategoryService(prisma);

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await requireAdmin();

    const { id } = await params;
    const categoryId = Number(id);
    if (!Number.isFinite(categoryId)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid article category id", code: "INVALID_ID" } },
        { status: 400 }
      );
    }

    const body = await req.json();
    const category = await service.updateArticleCategory(categoryId, {
      name: body?.name,
      slug: body?.slug,
    });

    return NextResponse.json(ok(category));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAdmin();

    const { id } = await params;
    const categoryId = Number(id);
    if (!Number.isFinite(categoryId)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid article category id", code: "INVALID_ID" } },
        { status: 400 }
      );
    }

    const result = await service.deleteArticleCategory(categoryId);
    return NextResponse.json(ok(result));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
