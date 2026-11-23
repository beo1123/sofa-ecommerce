import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "@/lib/prisma";
import { StorefrontService } from "@/services/storefront.service";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/seo/schema";
import { generateCategoryMetadata } from "@/seo/generators/generateMetadata";
import { parseOptionalNumber, parseStringParam } from "@/server/utils/api";
import StoreProductListing, { type StoreSortKey } from "@/components/store/StoreProductListing";

export const dynamic = "force-dynamic";

const BASE_URL = "https://sofaphamgia.com";
const storefrontService = new StorefrontService(prisma);

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: ProductsPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const categorySlug = parseStringParam(searchParams.category);
  const hasFilterParams = Boolean(
    parseStringParam(searchParams.material) ||
      parseStringParam(searchParams.color) ||
      parseOptionalNumber(searchParams.priceMin) !== undefined ||
      parseOptionalNumber(searchParams.priceMax) !== undefined
  );

  if (!categorySlug) {
    return {
      title: "Sofa Phòng Khách Đóng Tại Xưởng | Sofa Phạm Gia",
      description:
        "Khám phá bộ sưu tập sofa góc, sofa băng, sofa da và sofa vải đóng theo yêu cầu tại xưởng Sofa Phạm Gia TP.HCM.",
      alternates: { canonical: `${BASE_URL}/san-pham` },
      ...(hasFilterParams ? { robots: { index: false, follow: true } } : {}),
    };
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { name: true, slug: true },
  });

  if (!category) {
    return {
      title: "Danh mục sản phẩm | Sofa Phạm Gia",
      description: "Bộ sưu tập sofa đóng trực tiếp tại xưởng Sofa Phạm Gia.",
      alternates: { canonical: `${BASE_URL}/san-pham` },
      robots: { index: false, follow: true },
    };
  }

  const meta = generateCategoryMetadata({
    name: category.name,
    slug: category.slug,
    description: `Bộ sưu tập ${category.name} sản xuất trực tiếp tại xưởng Sofa Phạm Gia — tùy chỉnh kích thước, chất liệu và màu sắc.`,
  });

  return hasFilterParams ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function ProductsPage(props: ProductsPageProps) {
  const [searchParams, catalog] = await Promise.all([props.searchParams, storefrontService.getPublishedCatalog()]);

  const categoryParam = parseStringParam(searchParams.category) ?? "";
  const materialParam = parseStringParam(searchParams.material) ?? "";
  const colorParam = parseStringParam(searchParams.color) ?? "";
  const sortParam = parseStringParam(searchParams.sort);
  const initialSort: StoreSortKey = sortParam === "price_asc" || sortParam === "price_desc" ? sortParam : "newest";

  const { min: minBound, max: maxBound } = catalog.priceBounds;
  const rawPriceMin = parseOptionalNumber(searchParams.priceMin);
  const rawPriceMax = parseOptionalNumber(searchParams.priceMax);
  const initialPriceMin = rawPriceMin !== undefined ? Math.max(minBound, Math.min(rawPriceMin, maxBound)) : minBound;
  const initialPriceMax =
    rawPriceMax !== undefined ? Math.min(maxBound, Math.max(rawPriceMax, initialPriceMin)) : maxBound;

  const activeCategoryName = catalog.categories.find((c) => c.slug === categoryParam)?.name;
  const breadcrumbItems = [
    { name: "Trang chủ", url: BASE_URL },
    { name: "Sản phẩm", url: `${BASE_URL}/san-pham` },
    ...(activeCategoryName
      ? [
          {
            name: activeCategoryName,
            url: `${BASE_URL}/san-pham?category=${categoryParam}`,
          },
        ]
      : []),
  ];

  const schemaItems = catalog.products.slice(0, 20).map((p) => ({
    title: p.title,
    slug: p.slug,
    images: p.primaryImageUrl ? [{ url: p.primaryImageUrl }] : [],
    variants: p.minPrice !== null ? [{ price: p.minPrice }] : [],
  }));

  return (
    <>
      <Script id="breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(buildBreadcrumbSchema(breadcrumbItems))}
      </Script>
      {schemaItems.length > 0 && (
        <Script id="itemlist-jsonld" type="application/ld+json">
          {JSON.stringify(
            buildItemListSchema(
              activeCategoryName ? `Sofa ${activeCategoryName}` : "Tất cả sản phẩm Sofa Phạm Gia",
              categoryParam ? `${BASE_URL}/san-pham?category=${categoryParam}` : `${BASE_URL}/san-pham`,
              schemaItems
            )
          )}
        </Script>
      )}

      <StoreProductListing
        products={catalog.products}
        categories={catalog.categories}
        allMaterials={catalog.allMaterials}
        allColors={catalog.allColors}
        priceBounds={catalog.priceBounds}
        initialFilters={{
          category: categoryParam,
          material: materialParam,
          color: colorParam,
          priceMin: initialPriceMin,
          priceMax: initialPriceMax,
          sort: initialSort,
        }}
      />
    </>
  );
}
