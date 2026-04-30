import ProductsPageClient from "@/components/products/ProductsPageClient";
import type { Metadata } from "next";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";
import { getProductListSSR } from "@/lib/products/productSSR";
import { cache } from "react";
import Script from "next/script";
import { sdk } from "@repo/sdk";
import { buildProductItemListSchema, buildProductListBreadcrumbSchema, generateProductsMetadata } from "@repo/seo";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: ProductsPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const categorySlug = searchParams.category as string | undefined;

  let category: { slug: string; name: string } | undefined;
  if (categorySlug) {
    const categories = await sdk.categories.getAll();
    category = categories.find((item) => item.slug === categorySlug);
  }

  return generateProductsMetadata(category);
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
    sdk.categories.getAll(),
    sdk.products.getFilters(),
  ]);

  // JSON-LD: breadcrumb + danh sách sản phẩm
  const selectedCategory = categorySlug ? categories.find((item) => item.slug === categorySlug) : undefined;

  if (!data?.items?.length) {
    return (
      <>
        <Script id="breadcrumb-jsonld" type="application/ld+json">
          {JSON.stringify(buildProductListBreadcrumbSchema(selectedCategory))}
        </Script>
        <main className="min-h-screen bg-bg-muted">
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
        {JSON.stringify(buildProductListBreadcrumbSchema(selectedCategory))}
      </Script>
      <Script id="itemlist-jsonld" type="application/ld+json">
        {JSON.stringify(buildProductItemListSchema(data.items, selectedCategory))}
      </Script>
      <ProductsPageClient
        initialItems={data.items}
        initialMeta={data.meta}
        initialParams={filterParams}
        categories={categories}
        filtersData={filtersData}
      />
    </>
  );
}
