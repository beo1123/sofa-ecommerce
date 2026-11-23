import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveWorkshopCode } from "@/lib/slug";
import ArticleForm from "@/components/admin/articles/ArticleForm";
import type { SerializedArticleDetail } from "@/components/admin/articles/types";

export const dynamic = "force-dynamic";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId) || articleId <= 0) {
    notFound();
  }

  const [article, categories, products] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
    }),
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true, workshopCode: true },
    }),
  ]);

  if (!article) {
    notFound();
  }

  const serializedArticle: SerializedArticleDetail = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    bodyJson:
      article.bodyJson && typeof article.bodyJson === "object" && !Array.isArray(article.bodyJson)
        ? (article.bodyJson as Record<string, unknown>)
        : null,
    thumbnail: article.thumbnail,
    coverImageUrl: article.coverImageUrl,
    status: article.status,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    categoryId: article.categoryId,
    linkedProductId: article.linkedProductId,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
  };

  const resolvedProducts = products.map((p) => ({
    ...p,
    workshopCode: resolveWorkshopCode(p.workshopCode, p.title),
  }));

  return <ArticleForm initialArticle={serializedArticle} categories={categories} products={resolvedProducts} />;
}
