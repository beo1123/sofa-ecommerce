import type { ArticleDetail, Category } from "@repo/types";
import { buildCanonical, SITE_URL } from "../utils/canonical";
import { toAbsoluteAssetUrl } from "../utils/openGraph";

export function buildArticleSchema(article: ArticleDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? "",
    image: article.thumbnail ? [toAbsoluteAssetUrl(article.thumbnail)] : undefined,
    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    author: article.author?.displayName
      ? {
          "@type": "Person",
          name: article.author.displayName,
        }
      : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": buildCanonical(`/bai-viet/${article.slug}`),
    },
    publisher: {
      "@type": "Organization",
      name: "Sofa Phạm Gia",
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteAssetUrl("/images/LOGO_SOFA.png"),
      },
    },
  };
}

export function buildArticleBreadcrumbSchema(article: Pick<ArticleDetail, "slug" | "title">) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Bài viết",
        item: buildCanonical("/bai-viet"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: buildCanonical(`/bai-viet/${article.slug}`),
      },
    ],
  };
}

type CategoryNavItem = Pick<Category, "name" | "slug">;

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Sofa Phạm Gia - Nội thất cao cấp",
    alternateName: ["Sofa Phạm Gia", "sofaphamgia.com"],
    url: SITE_URL,
    inLanguage: "vi-VN",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tim-kiem?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "@id": `${SITE_URL}/#organization`,
    name: "Sofa Phạm Gia",
    alternateName: "Sofa Phạm Gia - Nội thất cao cấp",
    url: SITE_URL,
    logo: toAbsoluteAssetUrl("/images/LOGO_SOFA.png"),
    image: toAbsoluteAssetUrl("/images/LOGO_SOFA.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: "C12/17, Ấp 3",
      addressLocality: "Bình Chánh",
      addressRegion: "TP.HCM",
      addressCountry: "VN",
    },
    areaServed: "VN",
    sameAs: ["https://www.facebook.com/sofaphamgia", "https://www.tiktok.com/@sofaphamgia"],
  };
}

export function buildSiteNavigationSchema(categories: CategoryNavItem[] = []) {
  const primaryItems = [
    { name: "Trang chủ", url: SITE_URL },
    { name: "Sản phẩm", url: buildCanonical("/san-pham") },
    { name: "Giới thiệu", url: buildCanonical("/gioi-thieu") },
    { name: "Bài viết", url: buildCanonical("/bai-viet") },
    { name: "Liên hệ", url: buildCanonical("/lien-he") },
  ];

  const categoryItems = categories.map((category) => ({
    name: `Sản phẩm ${category.name}`,
    url: buildCanonical("/san-pham", { category: category.slug }),
  }));

  const navigationItems = [...primaryItems, ...categoryItems];

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Điều hướng chính",
    itemListElement: navigationItems.map((item, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function buildHomePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: "Sofa Phạm Gia - Nội thất cao cấp",
    headline: "Sofa Phạm Gia - Nội thất cao cấp",
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/#organization`,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: toAbsoluteAssetUrl("/images/LOGO_SOFA.png"),
    },
    breadcrumb: {
      "@id": `${SITE_URL}/#breadcrumb`,
    },
    inLanguage: "vi-VN",
  };
}

export function buildHomeBreadcrumbSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}/#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: SITE_URL,
      },
    ],
  };
}
