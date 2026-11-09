// FILE: src/app/(storefront)/bai-viet/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArticleService } from "@/services/article.service";

import ArticleHeader from "@/components/blog/BlogDetail/ArticleHeader";
import ArticleContent from "@/components/blog/BlogDetail/ArticleContent";
import RelatedArticles from "@/components/blog/BlogDetail/RelatedArticles";

import type { blogDetail } from "@/types/blog/blogDetail";
import { prisma } from "@/lib/prisma";
import { generateArticleMetadata } from "@/seo/generators/generateMetadata";

export const revalidate = 3600;

const service = new ArticleService(prisma);

type Params = { slug: string };

interface PageProps {
  params: Promise<Params>;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await service.getArticleBySlug(slug);
    if (!res?.success || !res.data) return {};

    const a = res.data as blogDetail;

    return generateArticleMetadata({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      thumbnail: a.thumbnail,
      publishedAt: a.publishedAt,
    });
  } catch {
    return {};
  }
}

export default async function ArticlePage(props: PageProps) {
  const { slug } = await props.params;

  const res = await service.getArticleBySlug(slug).catch(() => null);
  if (!res || !res.success || !res.data) return notFound();

  const article = res.data as blogDetail;

  const relatedRes = await service.getRelatedArticleBySlug(slug).catch(() => null);
  const related = relatedRes?.success ? relatedRes.data.related : [];

  return (
    <div className="py-5 sm:py-10 lg:py-12 text-[var(--color-text-default)]">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
        <div className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-page)] p-4 sm:p-8 lg:p-10 ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)] space-y-6 sm:space-y-8">
          <ArticleHeader article={article} />
          <ArticleContent content={article.content} />
        </div>
        <RelatedArticles related={related} />
      </div>
    </div>
  );
}
