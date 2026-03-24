import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok } from "@/server/utils/api";
import { AdminArticleCategoryService } from "@/services/admin/articleCategory.service";

const service = new AdminArticleCategoryService(prisma);

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get("perPage") ?? 20)));
    const q = url.searchParams.get("q")?.trim() || undefined;

    const result = await service.listArticleCategories(page, perPage, { q });
    return NextResponse.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    const category = await service.createArticleCategory({
      name: body?.name,
      slug: body?.slug,
    });

    return NextResponse.json(ok(category), { status: 201 });
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
