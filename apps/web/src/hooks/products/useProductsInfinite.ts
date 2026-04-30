"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { sdk } from "@repo/sdk";

export function useProductsInfinite(initialParams: any) {
  const { page = 1, perPage = 12, ...filters } = initialParams;

  return useInfiniteQuery({
    queryKey: ["products-infinite", filters, perPage],

    initialPageParam: page,

    queryFn: async ({ pageParam }) => {
      const result = await sdk.products.list({
        ...filters,
        page: Number(pageParam),
        perPage,
      });

      return {
        items: result.items,
        meta: result.meta,
      };
    },

    getNextPageParam(lastPage) {
      if (!lastPage?.meta) return undefined;

      const { page, perPage, total } = lastPage.meta;
      const maxPage = Math.ceil(total / perPage);

      return page < maxPage ? page + 1 : undefined;
    },

    staleTime: 30000,
  });
}
