// FILE: src/app/api/articles/[slug]/route.ts
import { NextResponse } from "next/server";
import { normalizeError, ok } from "@/server/utils/api";
import { serializeData } from "@/lib/helpers";
import { ArticleService } from "@/services/article.service";
import { prisma } from "@/lib/prisma";

const articleService = new ArticleService(prisma);

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const article = await articleService.getArticleBySlug(slug);
    return NextResponse.json(serializeData(ok(article)));
  } catch (err: any) {
    const normalized = normalizeError(err);
    return NextResponse.json(normalized.payload, { status: normalized.status });
  }
}
