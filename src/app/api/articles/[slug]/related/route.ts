// FILE: src/app/api/articles/[slug]/related/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeError, ok } from "@/server/utils/api";
import { serializeData } from "@/lib/helpers";
import { ArticleService } from "@/services/article.service";

const articleService = new ArticleService(prisma);

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const related = await articleService.getRelatedArticleBySlug(slug);

    return NextResponse.json(serializeData(ok(related)));
  } catch (err: any) {
    const normalized = normalizeError(err);
    return NextResponse.json(normalized.payload, { status: normalized.status });
  }
}
