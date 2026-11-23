import React from "react";
import { prisma } from "@/lib/prisma";
import { resolveWorkshopCode } from "@/lib/slug";
import ArticleForm from "@/components/admin/articles/ArticleForm";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categories, products] = await Promise.all([
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true, workshopCode: true },
    }),
  ]);

  const resolvedProducts = products.map((p) => ({
    ...p,
    workshopCode: resolveWorkshopCode(p.workshopCode, p.title),
  }));

  return <ArticleForm categories={categories} products={resolvedProducts} />;
}
