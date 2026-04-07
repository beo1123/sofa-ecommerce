import { NextResponse } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok, parsePagination, validateRequest } from "@/server/utils/api";
import { AdminArticleService } from "@/services/admin/article.service";

const service = new AdminArticleService(prisma);

/**
 * GET /api/admin/articles – Danh sách bài viết (admin, tất cả status)
 */
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const { page, perPage } = parsePagination(url.searchParams);
    const q = url.searchParams.get("q")?.trim() || undefined;
    const status = url.searchParams.get("status")?.trim();
    const categoryIdParam = url.searchParams.get("categoryId")?.trim();
    const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

    const result = await service.listArticles(page, perPage, {
      ...(q ? { q } : {}),
      ...(status && Object.values(ArticleStatus).includes(status as ArticleStatus)
        ? { status: status as ArticleStatus }
        : {}),
      ...(categoryId && Number.isFinite(categoryId) ? { categoryId } : {}),
    });
    return NextResponse.json(ok(result.items, result.meta));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

/**
 * POST /api/admin/articles – Tạo bài viết mới
 */
export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    validateRequest(body, { title: "string", slug: "string", content: "string" });

    // Auto-assign authorId nếu không truyền
    if (!body.authorId && session.user?.id) {
      body.authorId = Number(session.user.id);
    }

    const article = await service.createArticle(body);
    return NextResponse.json(ok(article), { status: 201 });
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
