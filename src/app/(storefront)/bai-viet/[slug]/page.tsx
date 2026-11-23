// FILE: src/app/(storefront)/bai-viet/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArticleService } from "@/services/article.service";

import ArticleHeader from "@/components/blog/BlogDetail/ArticleHeader";
import ArticleContent from "@/components/blog/BlogDetail/ArticleContent";
import RelatedArticles from "@/components/blog/BlogDetail/RelatedArticles";

import type { blogDetail } from "@/types/blog/blogDetail";
import { prisma } from "@/lib/prisma";
import { renderArticleBodyHtml } from "@/lib/tiptap-extensions";
import { resolveWorkshopCode } from "@/lib/slug";
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
    const [res, extra] = await Promise.all([
      service.getArticleBySlug(slug),
      prisma.article.findUnique({
        where: { slug },
        select: { seoTitle: true, seoDescription: true, coverImageUrl: true },
      }),
    ]);
    if (!res?.success || !res.data) return {};

    const a = res.data as blogDetail;

    return generateArticleMetadata({
      title: extra?.seoTitle || a.title,
      slug: a.slug,
      excerpt: extra?.seoDescription || a.excerpt,
      thumbnail: extra?.coverImageUrl || a.thumbnail,
      publishedAt: a.publishedAt,
    });
  } catch {
    return {};
  }
}

export default async function ArticlePage(props: PageProps) {
  const { slug } = await props.params;

  const [res, extra] = await Promise.all([
    service.getArticleBySlug(slug).catch(() => null),
    prisma.article
      .findUnique({
        where: { slug },
        select: {
          bodyJson: true,
          coverImageUrl: true,
          linkedProduct: {
            select: { title: true, slug: true, workshopCode: true },
          },
        },
      })
      .catch(() => null),
  ]);
  if (!res || !res.success || !res.data) return notFound();

  const article = {
    ...(res.data as blogDetail),
    thumbnail: extra?.coverImageUrl || (res.data as blogDetail).thumbnail,
  };
  const renderedHtml = renderArticleBodyHtml(extra?.bodyJson, article.content);

  const relatedRes = await service.getRelatedArticleBySlug(slug).catch(() => null);
  const related = relatedRes?.success ? relatedRes.data.related : [];

  return (
    <div className="py-5 sm:py-10 lg:py-12 text-text-default">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
        <div className="rounded-[12px] border border-brand-100 bg-bg-page p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
          <ArticleHeader article={article} />
          <div className="tiptap-editor-content">
            <ArticleContent content={renderedHtml} />
          </div>

          {extra?.linkedProduct &&
            (() => {
              const linkedCode = resolveWorkshopCode(extra.linkedProduct.workshopCode, extra.linkedProduct.title);
              return (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-4">
                  <div>
                    <p className="text-xs font-medium text-text-muted">Sản phẩm nhắc đến trong bài viết</p>
                    <p className="mt-0.5 text-sm font-semibold text-brand-400">
                      {linkedCode ? `[${linkedCode}] ` : ""}
                      {extra.linkedProduct.title}
                    </p>
                  </div>
                  <Link
                    href={`/san-pham/${extra.linkedProduct.slug}`}
                    className="inline-flex h-9 items-center rounded-[8px] bg-brand-400 px-4 text-xs font-medium text-white transition-colors hover:bg-brand-300">
                    Xem chi tiết sản phẩm
                  </Link>
                </div>
              );
            })()}
        </div>
        <RelatedArticles related={related} />
      </div>
    </div>
  );
}
