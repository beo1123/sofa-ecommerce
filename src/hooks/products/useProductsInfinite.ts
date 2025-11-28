"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";

export function useProductsInfinite(initialParams: any) {
  const { page = 1, perPage = 12, ...filters } = initialParams;

  return useInfiniteQuery({
    queryKey: ["products-infinite", filters, perPage],

    initialPageParam: page,

    queryFn: async ({ pageParam }) => {
      const res = await axiosClient.get("/products", {
        params: { ...filters, page: pageParam, perPage },
      });

      const body = res.data;

      return {
        items: body.data,
        meta: body.meta,
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
