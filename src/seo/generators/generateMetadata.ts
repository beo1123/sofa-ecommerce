import type { Metadata } from "next";
import { BRAND_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/seo/config/site";
import { buildCanonicalUrl, buildCategoryTitle, buildProductTitle, normalizeSeoText } from "@/seo/utils/seo";

type ProductSeoInput = {
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  image?: string | null;
};

type CategorySeoInput = {
  name: string;
  slug: string;
  description?: string | null;
};

type ArticleSeoInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  publishedAt?: string | Date | null;
};

type PageSeoInput = {
  title: string;
  description: string;
  slug: string;
  type?: "website" | "article";
  keywords?: string[];
  image?: string | null;
};

export function generatePageMetadata(page: PageSeoInput): Metadata {
  const normalizedTitle = normalizeSeoText(page.title) || BRAND_NAME;
  const normalizedDescription = normalizeSeoText(page.description) || SITE_DESCRIPTION;
  const canonical = buildCanonicalUrl(`${SITE_URL}${page.slug.startsWith("/") ? page.slug : `/${page.slug}`}`);

  return {
    title: `${normalizedTitle} | ${BRAND_NAME}`,
    description: normalizedDescription,
    keywords: page.keywords,
    alternates: { canonical },
    openGraph: {
      title: `${normalizedTitle} | ${BRAND_NAME}`,
      description: normalizedDescription,
      url: canonical,
      type: page.type ?? "website",
      images: page.image ? [{ url: page.image, width: 1200, height: 630, alt: normalizedTitle }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${normalizedTitle} | ${BRAND_NAME}`,
      description: normalizedDescription,
      images: page.image ? [page.image] : undefined,
    },
  };
}

export function generateProductMetadata(product: ProductSeoInput): Metadata {
  const title = buildProductTitle(product.name);
  const description =
    normalizeSeoText(product.shortDescription) ||
    normalizeSeoText(product.description) ||
    `Khám phá ${product.name} với thiết kế hiện đại, chất liệu bền đẹp và dịch vụ tư vấn tận tâm từ Sofa Phạm Gia.`;
  const canonical = buildCanonicalUrl(`${SITE_URL}/san-pham/${product.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: product.image ? [{ url: product.image, width: 1200, height: 630, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export function generateCategoryMetadata(category: CategorySeoInput): Metadata {
  const title = buildCategoryTitle(category.name);
  const description =
    normalizeSeoText(category.description) ||
    `Khám phá bộ sưu tập ${category.name} với nhiều mẫu sofa hiện đại, chất liệu bền đẹp và phong cách phù hợp mọi không gian sống.`;
  const canonical = buildCanonicalUrl(`${SITE_URL}/san-pham?category=${category.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function generateArticleMetadata(article: ArticleSeoInput): Metadata {
  const title = normalizeSeoText(article.title) || BRAND_NAME;
  const description = normalizeSeoText(article.excerpt) || SITE_DESCRIPTION;
  const canonical = buildCanonicalUrl(`${SITE_URL}/bai-viet/${article.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      images: article.thumbnail ? [{ url: article.thumbnail, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.thumbnail ? [article.thumbnail] : undefined,
    },
  };
}

export function generateHomeMetadata(): Metadata {
  const canonical = buildCanonicalUrl(SITE_URL);

  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
  };
}
