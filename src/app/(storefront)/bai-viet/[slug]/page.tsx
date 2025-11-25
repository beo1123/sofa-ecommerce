import { notFound } from "next/navigation";
import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import { ArticleService } from "@/services/article.service";
import prisma from "@/lib/prisma";

import ArticleHeader from "@/components/blog/BlogDetail/ArticleHeader";
import ArticleContent from "@/components/blog/BlogDetail/ArticleContent";
import RelatedArticles from "@/components/blog/BlogDetail/RelatedArticles";

export const revalidate = 3600;

const service = new ArticleService(prisma);

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await service.getArticleBySlug(slug);
    if (!res?.success || !res.data) return {};

    const a = res.data;

    return {
      title: a.title,
      description: a.excerpt ?? undefined,
      openGraph: {
        title: a.title,
        description: a.excerpt ?? undefined,
        images: a.thumbnail ? [a.thumbnail] : undefined,
        type: "article",
        publishedTime: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;

  const res = await service.getArticleBySlug(slug).catch(() => null);
  if (!res || !res.success || !res.data) return notFound();
  const article = res.data;

  const relatedRes = await service.getRelatedArticleBySlug(slug).catch(() => null);
  const related = relatedRes?.success ? relatedRes.data.related : [];

  return (
    <main className="p-12 bg-[var(--color-bg-muted)] text-[var(--color-text-default)]">
      <Container className="max-w-4xl mx-auto space-y-12">
        <ArticleHeader article={article} />
        <ArticleContent content={article.content} />
        <RelatedArticles related={related} />
      </Container>
    </main>
  );
}
