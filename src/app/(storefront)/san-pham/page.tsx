import ProductsPageClient from "@/components/products/ProductsPageClient";
import type { Metadata } from "next";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";
import { getProductListSSR } from "@/lib/products/productSSR";
import { cache } from "react";
import { CategoryService } from "@/services/category.service";
import { prisma } from "@/lib/prisma";
import { ProductService } from "@/services/products.service";
import Script from "next/script";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/seo/schema";
import { generateCategoryMetadata } from "@/seo/generators/generateMetadata";
import { parseOptionalNumber, parsePositiveInt, parseStringParam } from "@/server/utils/api";

const BASE_URL = "https://sofaphamgia.com";
const categoryService = new CategoryService(prisma);
const productService = new ProductService(prisma);

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getCachedCategories = cache(async () => {
  return await categoryService.getAll(1, 100, 0);
});

const getCachedFilters = cache(async () => {
  return await productService.getFilters();
});

const getCachedProducts = cache(async (params: ProductQueryParams) => {
  return await getProductListSSR(params);
});

export async function generateMetadata(props: ProductsPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const categorySlug = parseStringParam(searchParams.category);
  const hasFilterOrPageParams = Boolean(
    parseStringParam(searchParams.material) ||
      parseStringParam(searchParams.color) ||
      parseOptionalNumber(searchParams.priceMin) !== undefined ||
      parseOptionalNumber(searchParams.priceMax) !== undefined ||
      parsePositiveInt(searchParams.page, 1) > 1
  );

  if (!categorySlug) {
    return {
      title: "Sofa Phòng Khách Cao Cấp | Sofa Phạm Gia",
      description:
        "Khám phá bộ sưu tập sofa phòng khách, sofa băng, sofa góc, sofa da và sofa vải cao cấp của Sofa Phạm Gia.",
      alternates: { canonical: `${BASE_URL}/san-pham` },
      ...(hasFilterOrPageParams ? { robots: { index: false, follow: true } } : {}),
    };
  }

  const result = await getCachedCategories();
  const category = result.data.find((c) => c.slug === categorySlug);

  if (!category) {
    return {
      title: "Danh mục không tồn tại | Sofa Phạm Gia",
      description: "Khám phá các mẫu sofa và nội thất cao cấp của Sofa Phạm Gia.",
      alternates: { canonical: `${BASE_URL}/san-pham` },
      robots: { index: false, follow: true },
    };
  }

  const meta = generateCategoryMetadata({
    name: category.name,
    slug: category.slug,
    description: `Bộ sưu tập ${category.name} với thiết kế hiện đại, chất liệu bền đẹp và phù hợp nhiều không gian sống.`,
  });

  if (hasFilterOrPageParams) {
    return {
      ...meta,
      robots: { index: false, follow: true },
    };
  }

  return meta;
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;

  const page = parsePositiveInt(searchParams.page, 1, 1, 10000);
  const perPage = parsePositiveInt(searchParams.perPage, 12, 1, 100);
  const categorySlug = parseStringParam(searchParams.category);

  const filterParams: ProductQueryParams = {
    page,
    perPage,
    category: categorySlug,
    priceMin: parseOptionalNumber(searchParams.priceMin),
    priceMax: parseOptionalNumber(searchParams.priceMax),
    color: parseStringParam(searchParams.color),
    material: parseStringParam(searchParams.material),
  };

  const [data, categories, filtersData] = await Promise.all([
    getCachedProducts(filterParams),
    getCachedCategories(),
    getCachedFilters(),
  ]);

  // JSON-LD: breadcrumb + danh sách sản phẩm
  const categoryName = categorySlug ? categories.data.find((c) => c.slug === categorySlug)?.name : undefined;
  const breadcrumbItems = [
    { name: "Trang chủ", url: BASE_URL },
    { name: "Sản phẩm", url: `${BASE_URL}/san-pham` },
    ...(categoryName ? [{ name: categoryName, url: `${BASE_URL}/san-pham?category=${categorySlug}` }] : []),
  ];
  const itemListName = categoryName ? `Sofa ${categoryName}` : "Tất cả sản phẩm Sofa";
  const itemListUrl = categorySlug ? `${BASE_URL}/san-pham?category=${categorySlug}` : `${BASE_URL}/san-pham`;

  return (
    <>
      <Script id="breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(buildBreadcrumbSchema(breadcrumbItems))}
      </Script>
      {data?.items?.length ? (
        <Script id="itemlist-jsonld" type="application/ld+json">
          {JSON.stringify(buildItemListSchema(itemListName, itemListUrl, data.items))}
        </Script>
      ) : null}
      <ProductsPageClient
        initialItems={data?.items ?? []}
        initialMeta={data.meta}
        initialParams={filterParams}
        categories={categories.data}
        filtersData={filtersData}
      />
    </>
  );
}
