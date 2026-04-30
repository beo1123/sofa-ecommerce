// FILE: src/app/(storefront)/bai-viet/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";

import Container from "@repo/ui/Container";
import { sdk } from "@repo/sdk";

import ArticleHeader from "@/components/blog/BlogDetail/ArticleHeader";
import ArticleContent from "@/components/blog/BlogDetail/ArticleContent";
import RelatedArticles from "@/components/blog/BlogDetail/RelatedArticles";

import { buildArticleBreadcrumbSchema, buildArticleSchema, generateArticleMetadata } from "@repo/seo";

export const revalidate = 3600;

type Params = { slug: string };

interface PageProps {
  params: Promise<Params>;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await sdk.articles.getBySlug(slug);
    return generateArticleMetadata(article);
  } catch {
    return {};
  }
}

export default async function ArticlePage(props: PageProps) {
  const { slug } = await props.params;

  const article = await sdk.articles.getBySlug(slug).catch(() => null);
  if (!article) return notFound();
  const related = await sdk.articles.getRelated(slug).catch(() => []);
  const articleForView = {
    ...article,
    excerpt: article.excerpt ?? null,
    thumbnail: article.thumbnail ?? null,
    publishedAt: article.publishedAt ?? null,
    category: article.category ?? null,
    author: article.author ?? null,
  };

  return (
    <main className="p-12 bg-bg-muted text-text-default">
      <Script id="article-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(buildArticleBreadcrumbSchema(article))}
      </Script>
      <Script id="article-jsonld" type="application/ld+json">
        {JSON.stringify(buildArticleSchema(article))}
      </Script>
      <Container className="max-w-4xl mx-auto space-y-12">
        <ArticleHeader article={articleForView} />
        <ArticleContent content={article.content} />
        <RelatedArticles related={related} />
      </Container>
    </main>
  );
}
