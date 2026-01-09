import { MetadataRoute } from "next";
import { PrismaClient } from "@prisma/client";
import { ProductService } from "@/services/products.service";
import { ArticleService } from "@/services/article.service";

const prisma = new PrismaClient();
const productService = new ProductService(prisma);
const articleService = new ArticleService(prisma);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sofaphamgia.com";

  // ===== PRODUCTS =====
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ===== ARTICLES =====
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      publishedAt: true,
    },
  });

  const articleUrls = articles.map((a) => ({
    url: `${baseUrl}/blog/${a.slug}`,
    lastModified: a.publishedAt ?? new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...productUrls,
    ...articleUrls,
  ];
}
