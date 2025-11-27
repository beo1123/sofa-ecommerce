import { serializeData } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { normalizeError, ok, parsePagination } from "@/server/utils/api";
import { ArticleService } from "@/services/article.service";
import { NextResponse } from "next/server";

const articleService = new ArticleService(prisma);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { page, perPage, skip } = parsePagination(url.searchParams);
    const data = await articleService.getAllArticle(page, perPage, skip);
    return NextResponse.json(serializeData(ok(data.data, data.meta)));
  } catch (err: any) {
    const normalized = normalizeError(err);
    return NextResponse.json(normalized.payload, { status: normalized.status });
  }
}
