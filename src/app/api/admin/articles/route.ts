import { NextResponse } from "next/server";
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
    const result = await service.listArticles(page, perPage);
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
