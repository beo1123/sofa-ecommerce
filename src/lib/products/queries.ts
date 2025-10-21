import { QueryClient } from "@tanstack/react-query";
import { getProductDetaiSSR, getProductListSSR } from "./productSSR";

export const productKeys = {
  all: ["products"] as const,
  list: (params?: Record<string, any>) => [...productKeys.all, "list", params] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
};

// Fetcher dùng được cả client & server
export async function fetchProductList(params: any) {
  return await getProductListSSR(params);
}

export async function fetchProductDetail(slug: string) {
  return await getProductDetaiSSR(slug);
}

// Prefetch cho SSR
export async function prefetchProductList(queryClient: QueryClient, params: any) {
  const data = await queryClient.prefetchQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProductList(params),
  });
  return data;
}

export async function prefetchProductDetail(queryClient: QueryClient, slug: string) {
  await queryClient.prefetchQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => fetchProductDetail(slug),
  });
}
