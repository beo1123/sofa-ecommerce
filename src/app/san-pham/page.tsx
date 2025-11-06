import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { prefetchProductList, productKeys } from "@/lib/products/queries";
import ProductsPageClient from "@/components/products/ProductsPageClient";
import type { Metadata } from "next";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

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
