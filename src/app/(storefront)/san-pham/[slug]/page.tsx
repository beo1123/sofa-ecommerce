import React, { cache } from "react";
import { notFound } from "next/navigation";
import Script from "next/script";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StorefrontService } from "@/services/storefront.service";
import { buildBreadcrumbSchema } from "@/seo/schema";
import { generateProductMetadata } from "@/seo/generators/generateMetadata";
import StoreProductDetail from "@/components/store/StoreProductDetail";

export const revalidate = 3600;

const BASE_URL = "https://sofaphamgia.com";
const storefrontService = new StorefrontService(prisma);

const getCachedDetail = cache(async (slug: string) => {
  return storefrontService.getProductDetailWithRelated(slug);
});

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const result = await getCachedDetail(slug);

  if (!result) {
    return {
      title: "Sản phẩm không tồn tại – Sofa Phạm Gia",
      description: "Không tìm thấy sản phẩm này trong cửa hàng.",
    };
  }

  const { product } = result;
  return generateProductMetadata({
    name: product.title,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    image: product.images[0]?.url,
  });
}

export default async function ProductDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const result = await getCachedDetail(slug);

  if (!result) {
    notFound();
  }

  const { product, relatedProducts } = result;

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Trang chủ", url: BASE_URL },
    { name: "Sản phẩm", url: `${BASE_URL}/san-pham` },
    ...(product.categoryName && product.categorySlug
      ? [
          {
            name: product.categoryName,
            url: `${BASE_URL}/san-pham?category=${product.categorySlug}`,
          },
        ]
      : []),
    { name: product.title, url: `${BASE_URL}/san-pham/${slug}` },
  ]);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    sku: product.workshopCode ?? product.slug,
    image: product.images.map((i) => i.url),
    description: product.shortDescription ?? product.description ?? undefined,
    brand: { "@type": "Brand", name: "Sofa Phạm Gia" },
    ...(product.minPrice !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "VND",
            price: product.minPrice,
            availability: "https://schema.org/InStock",
            url: `${BASE_URL}/san-pham/${slug}`,
          },
        }
      : {}),
    ...(product.reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1),
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  };

  return (
    <>
      <Script id="breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </Script>
      <Script id="product-jsonld" type="application/ld+json">
        {JSON.stringify(productJsonLd)}
      </Script>

      <StoreProductDetail product={product} relatedProducts={relatedProducts} />
    </>
  );
}
