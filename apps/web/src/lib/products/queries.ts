import { QueryClient } from "@tanstack/react-query";
import { sdk } from "@repo/sdk";

export const productKeys = {
  all: ["products"] as const,
  list: (params?: Record<string, any>) => [...productKeys.all, "list", params] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
};

// Fetcher dùng được cả client & server
export async function fetchProductList(params: any) {
  return await sdk.productApi.list(params);
}

export async function fetchProductDetail(slug: string) {
  const product = await sdk.productApi.detail(slug).catch(() => null);
  if (!product) return null;
  const related = await sdk.productApi.related(slug).catch(() => []);
  return { product, related };
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
