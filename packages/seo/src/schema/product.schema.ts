import type { ProductDetail, ProductListItem } from "@repo/types";
import { buildCanonical, SITE_URL } from "../utils/canonical";

export function buildProductSchema(product: ProductDetail) {
  const lowestPrice = product.variants.length
    ? Math.min(...product.variants.map((variant) => Number(variant.price)))
    : 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription ?? product.description ?? "",
    image: product.images.map((image) => image.url),
    sku: product.variants[0]?.inventory?.[0]?.sku,
    brand: {
      "@type": "Brand",
      name: "Sofa Phạm Gia",
    },
    offers: {
      "@type": "Offer",
      price: lowestPrice,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: buildCanonical(`/san-pham/${product.slug}`),
    },
    aggregateRating:
      product.reviewsSummary.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(product.reviewsSummary.average.toFixed(1)),
            reviewCount: product.reviewsSummary.count,
          }
        : undefined,
  };
}

export function buildProductBreadcrumbSchema(product: Pick<ProductDetail, "title" | "slug">) {
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
        name: "Sản phẩm",
        item: buildCanonical("/san-pham"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: buildCanonical(`/san-pham/${product.slug}`),
      },
    ],
  };
}

export function buildProductListBreadcrumbSchema(category?: { slug: string; name: string }) {
  const categoryItem = category
    ? [
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: buildCanonical("/san-pham", { category: category.slug }),
        },
      ]
    : [];

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
        name: "Sản phẩm",
        item: buildCanonical("/san-pham"),
      },
      ...categoryItem,
    ],
  };
}

export function buildProductItemListSchema(items: ProductListItem[], category?: { slug: string; name: string }) {
  const listUrl = category ? buildCanonical("/san-pham", { category: category.slug }) : buildCanonical("/san-pham");

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category ? `Sofa ${category.name}` : "Tất cả sản phẩm Sofa",
    url: listUrl,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: buildCanonical(`/san-pham/${item.slug}`),
    })),
  };
}
