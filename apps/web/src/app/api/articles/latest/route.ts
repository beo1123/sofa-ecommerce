import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeError, ok } from "@/server/utils/api";
import { ArticleService } from "@/services/article.service";

import { serializeData } from "@/lib/helpers";

const articleService = new ArticleService(prisma);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 5);

    const articles = await articleService.getLatestArticle(limit);

    return NextResponse.json(serializeData(ok(articles)));
  } catch (err: any) {
    const normalized = normalizeError(err);
    return NextResponse.json(normalized.payload, { status: normalized.status });
  }
}
