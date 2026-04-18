export const BASE_URL = "https://sofaphamgia.com";
export const BRAND_NAME = "Sofa Phạm Gia";
export const SITE_NAME = "Sofa Phạm Gia - Nội thất cao cấp";

import { buildAbsoluteAssetUrl, headerLogoSrc } from "@/lib/branding";

type CategoryNavItem = {
  name: string;
  slug: string;
};

const PRIMARY_NAV_ITEMS = [
  { name: "Trang chủ", url: BASE_URL },
  { name: "Sản phẩm", url: `${BASE_URL}/san-pham` },
  { name: "Giới thiệu", url: `${BASE_URL}/gioi-thieu` },
  { name: "Bài viết", url: `${BASE_URL}/bai-viet` },
  { name: "Liên hệ", url: `${BASE_URL}/lien-he` },
];

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: SITE_NAME,
  alternateName: [BRAND_NAME, "Sofa Phạm Gia", "sofaphamgia.com"],
  url: BASE_URL,
  inLanguage: "vi-VN",
  description:
    "Website chính thức của Sofa Phạm Gia, chuyên sofa và nội thất cao cấp với thiết kế tinh tế, chất liệu bền đẹp và giao hàng toàn quốc.",
  publisher: {
    "@id": `${BASE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/tim-kiem?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  "@id": `${BASE_URL}/#organization`,
  name: BRAND_NAME,
  alternateName: SITE_NAME,
  url: BASE_URL,
  logo: buildAbsoluteAssetUrl(BASE_URL, headerLogoSrc),
  image: buildAbsoluteAssetUrl(BASE_URL, headerLogoSrc),
  description:
    "Sofa Phạm Gia chuyên cung cấp sofa và nội thất cao cấp tại TP.HCM, giao hàng toàn quốc với dịch vụ tư vấn, lắp đặt và bảo hành.",
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

export function buildSiteNavigationSchema(categories: CategoryNavItem[] = []) {
  const categoryNavItems = categories.map((category) => ({
    name: `Sản phẩm ${category.name}`,
    url: `${BASE_URL}/san-pham?category=${category.slug}`,
  }));

  const navigationItems = [...PRIMARY_NAV_ITEMS, ...categoryNavItems];

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
    "@id": `${BASE_URL}/#webpage`,
    url: BASE_URL,
    name: SITE_NAME,
    headline: SITE_NAME,
    description:
      "Khám phá sofa và nội thất cao cấp tại Sofa Phạm Gia với nhiều mẫu mã sang trọng, bền đẹp và phù hợp mọi không gian sống.",
    isPartOf: {
      "@id": `${BASE_URL}/#website`,
    },
    about: {
      "@id": `${BASE_URL}/#organization`,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: buildAbsoluteAssetUrl(BASE_URL, headerLogoSrc),
    },
    breadcrumb: {
      "@id": `${BASE_URL}/#breadcrumb`,
    },
    inLanguage: "vi-VN",
  };
}

export function buildHomeBreadcrumbSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${BASE_URL}/#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: BASE_URL,
      },
    ],
  };
}

/** Tạo BreadcrumbList JSON-LD: hiển thị đường dẫn breadcrumb trên Google */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Tạo ItemList JSON-LD: hiển thị danh sách sản phẩm trên Google */
export function buildItemListSchema(name: string, url: string, items: { slug: string; title: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: `${BASE_URL}/san-pham/${item.slug}`,
    })),
  };
}
