import { MetadataRoute } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = "https://sofaphamgia.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;

  // ===== PRODUCTS =====
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/san-pham/${p.slug}`,
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
    url: `${baseUrl}/bai-viet/${a.slug}`,
    lastModified: a.publishedAt ?? new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ===== CATEGORIES =====
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  });

  const categoryUrls = categories.map((c) => ({
    url: `${baseUrl}/san-pham?category=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/san-pham`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/bai-viet`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/gioi-thieu`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/lien-he`, changeFrequency: "monthly", priority: 0.5 },
    ...categoryUrls,
    ...productUrls,
    ...articleUrls,
  ];
}
