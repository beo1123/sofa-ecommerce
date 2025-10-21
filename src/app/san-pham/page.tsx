import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { prefetchProductList, productKeys } from "@/lib/products/queries";
import ProductsPageClient from "@/components/products/ProductsPageClient";
import type { Metadata } from "next";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";

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

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const perPage = Number(sp.perPage ?? 12);

  const filterParams: ProductQueryParams = {
    page,
    perPage,
    category: sp.category,
    priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
    priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
    color: sp.color,
  };

  const queryClient = new QueryClient();

  await prefetchProductList(queryClient, filterParams);

  const data: any = queryClient.getQueryData(productKeys.list(filterParams));

  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <ProductsPageClient items={data.items} meta={data.meta} params={filterParams} />
    </HydrationBoundary>
  );
}
