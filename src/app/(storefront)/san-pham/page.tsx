import ProductsPageClient from "@/components/products/ProductsPageClient";
import type { Metadata } from "next";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";
import { getProductListSSR } from "@/lib/products/productSSR";
import { cache } from "react";

export const metadata: Metadata = {
  title: "Danh sách sản phẩm – Sofa Ecommerce",
  description: "Khám phá bộ sưu tập sofa cao cấp, nhiều kiểu dáng và màu sắc.",
  openGraph: {
    title: "Danh sách sản phẩm – Sofa Ecommerce",
    description: "Tổng hợp các sản phẩm sofa mới nhất.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sofa Ecommerce – Danh sách sản phẩm",
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getCachedProducts = cache(async (params: ProductQueryParams) => {
  return await getProductListSSR(params);
});

export const revalidate = 0;

export default async function ProductsPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page ?? 1);
  const perPage = Number(searchParams.perPage ?? 12);

  const filterParams: ProductQueryParams = {
    page,
    perPage,
    category: searchParams.category as string | undefined,
    priceMin: searchParams.priceMin ? Number(searchParams.priceMin) : undefined,
    priceMax: searchParams.priceMax ? Number(searchParams.priceMax) : undefined,
    color: searchParams.color as string | undefined,
  };

  const data = await getCachedProducts(filterParams);

  if (!data?.items?.length) {
    return (
      <main className="min-h-screen bg-[var(--color-bg-muted)]">
        <section className="container mx-auto px-4 py-10">
          <div className="text-center py-10 text-gray-500">Không có sản phẩm nào.</div>
        </section>
      </main>
    );
  }

  return <ProductsPageClient initialItems={data.items} initialMeta={data.meta} initialParams={filterParams} />;
}
