// FILE: src/app/api/articles/category/[slug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeError, ok } from "@/server/utils/api";
import { serializeData } from "@/lib/helpers";
import { ArticleService } from "@/services/article.service";

const articleService = new ArticleService(prisma);

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const data = await articleService.getArticleByCategory(slug);
    return NextResponse.json(serializeData(ok(data)));
  } catch (err: any) {
    const normalized = normalizeError(err);
    return NextResponse.json(normalized.payload, { status: normalized.status });
  }
}
