import React from "react";
import Link from "next/link";
import { IconFolder, IconPlus } from "@tabler/icons-react";
import { prisma } from "@/lib/prisma";
import { resolveWorkshopCode } from "@/lib/slug";
import ArticleTable from "@/components/admin/articles/ArticleTable";
import type { SerializedArticleCategory, SerializedArticleListItem } from "@/components/admin/articles/types";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        linkedProduct: { select: { title: true, workshopCode: true } },
      },
    }),
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const serializedArticles: SerializedArticleListItem[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status,
    coverImageUrl: a.coverImageUrl ?? a.thumbnail,
    categoryId: a.categoryId,
    categoryName: a.category?.name ?? null,
    linkedProductTitle: a.linkedProduct?.title ?? null,
    linkedProductCode: a.linkedProduct
      ? resolveWorkshopCode(a.linkedProduct.workshopCode, a.linkedProduct.title)
      : null,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    updatedAt: a.updatedAt.toISOString(),
  }));

  const serializedCategories: SerializedArticleCategory[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-400">Quản lý bài đăng</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Quản lý bài viết tư vấn, bàn giao thực tế, SEO và sản phẩm liên kết.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/article-categories"
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-brand-300 bg-bg-page px-3.5 text-sm font-medium text-brand-400 transition-colors hover:bg-brand-50">
            <IconFolder size={16} stroke={1.75} aria-hidden="true" />
            <span>Danh mục bài</span>
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-brand-400 px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-300">
            <IconPlus size={16} stroke={1.75} aria-hidden="true" />
            <span>Viết bài mới</span>
          </Link>
        </div>
      </div>

      <ArticleTable initialArticles={serializedArticles} categories={serializedCategories} />
    </div>
  );
}
