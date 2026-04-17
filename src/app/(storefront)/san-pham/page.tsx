import ProductsPageClient from "@/components/products/ProductsPageClient";
import type { Metadata } from "next";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";
import { getProductListSSR } from "@/lib/products/productSSR";
import { cache } from "react";
import { CategoryService } from "@/services/category.service";
import { prisma } from "@/lib/prisma";
import { ProductService } from "@/services/products.service";
import Script from "next/script";
import { headerLogoSrc } from "@/lib/branding";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/seo/schema";

const BASE_URL = "https://sofaphamgia.com";
const categoryService = new CategoryService(prisma);
const productService = new ProductService(prisma);

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: ProductsPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const categorySlug = searchParams.category as string | undefined;

  let categoryName: string | undefined;
  if (categorySlug) {
    const result = await categoryService.getAll(1, 100, 0);
    categoryName = result.data.find((c) => c.slug === categorySlug)?.name;
  }

  const title = categoryName ? `Sofa ${categoryName} – Sofa Phạm Gia` : "Tất cả sản phẩm Sofa – Sofa Phạm Gia";
  const description = categoryName
    ? `Khám phá bộ sưu tập ${categoryName} cao cấp tại Sofa Phạm Gia. Chất liệu bền đẹp, thiết kế tinh tế, nhiều mẫu mã đa dạng.`
    : "Khám phá toàn bộ bộ sưu tập sofa cao cấp tại Sofa Phạm Gia. Nhiều kiểu dáng, màu sắc và chất liệu đa dạng, phù hợp mọi không gian.";
  const pageUrl = categorySlug ? `${BASE_URL}/san-pham?category=${categorySlug}` : `${BASE_URL}/san-pham`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      images: [{ url: headerLogoSrc, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const getCachedProducts = cache(async (params: ProductQueryParams) => {
  return await getProductListSSR(params);
});

export const revalidate = 3600;

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page ?? 1);
  const perPage = Number(searchParams.perPage ?? 12);
  const categorySlug = searchParams.category as string | undefined;

  const filterParams: ProductQueryParams = {
    page,
    perPage,
    category: categorySlug,
    priceMin: searchParams.priceMin ? Number(searchParams.priceMin) : undefined,
    priceMax: searchParams.priceMax ? Number(searchParams.priceMax) : undefined,
    color: searchParams.color as string | undefined,
  };

  const [data, categories, filtersData] = await Promise.all([
    getCachedProducts(filterParams),
    categoryService.getAll(1, 50, 0),
    productService.getFilters(),
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

  if (!data?.items?.length) {
    return (
      <>
        <Script id="breadcrumb-jsonld" type="application/ld+json">
          {JSON.stringify(buildBreadcrumbSchema(breadcrumbItems))}
        </Script>
        <main className="min-h-screen bg-[var(--color-bg-muted)]">
          <section className="container mx-auto px-4 py-10">
            <div className="text-center py-10 text-gray-500">Không có sản phẩm nào.</div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Script id="breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(buildBreadcrumbSchema(breadcrumbItems))}
      </Script>
      <Script id="itemlist-jsonld" type="application/ld+json">
        {JSON.stringify(buildItemListSchema(itemListName, itemListUrl, data.items))}
      </Script>
      <ProductsPageClient
        initialItems={data.items}
        initialMeta={data.meta}
        initialParams={filterParams}
        categories={categories.data}
        filtersData={filtersData}
      />
    </>
  );
}
