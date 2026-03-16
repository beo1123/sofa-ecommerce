const BASE_URL = "https://sofaphamgia.com";

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sofa Phạm Gia",
  alternateName: "SofaPhamGia",
  url: BASE_URL,
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
  name: "Sofa Phạm Gia",
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo-removebg-preview.png`,
  sameAs: ["https://www.facebook.com/sofaphamgia", "https://www.tiktok.com/@sofaphamgia"],
};

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
