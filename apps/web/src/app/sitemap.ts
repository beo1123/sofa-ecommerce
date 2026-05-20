import { MetadataRoute } from "next";
import { sdk } from "@repo/sdk";

const BASE_URL = "https://sofaphamgia.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;

  // ===== PRODUCTS =====
  const productsResponse = await sdk.productApi.list({ page: 1, perPage: 200 }).catch(() => ({ items: [] as any[] }));
  const products = productsResponse.items;

  const productUrls = products.map((p: any) => ({
    url: `${baseUrl}/san-pham/${p.slug}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ===== ARTICLES =====
  const articleResponse = await sdk.articleApi.list(1, 200).catch(() => ({ items: [] as any[] }));
  const articles = articleResponse.items;

  const articleUrls = articles.map((a: any) => ({
    url: `${baseUrl}/bai-viet/${a.slug}`,
    lastModified: a.publishedAt ?? new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ===== CATEGORIES =====
  const categories = await sdk.categoryApi.list().catch(() => [] as any[]);

  const categoryUrls = categories.map((c: any) => ({
    url: `${baseUrl}/san-pham?category=${c.slug}`,
    lastModified: c.updatedAt ?? new Date(),
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
