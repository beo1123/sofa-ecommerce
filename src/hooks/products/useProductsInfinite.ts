"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";

export type ProductsPagePayload = {
  items: any[];
  meta: {
    page: number;
    perPage: number;
    total: number;
  };
};

export function useProductsInfinite(initialParams: ProductQueryParams, initialPageData?: ProductsPagePayload) {
  const { page = 1, perPage = 12, category, priceMin, priceMax, color, material } = initialParams;

  const filters = {
    ...(category ? { category } : {}),
    ...(priceMin !== undefined ? { priceMin } : {}),
    ...(priceMax !== undefined ? { priceMax } : {}),
    ...(color ? { color } : {}),
    ...(material ? { material } : {}),
  };

  return useInfiniteQuery({
    queryKey: ["products-infinite", filters, perPage, page],

    initialPageParam: page,

    initialData: initialPageData
      ? {
          pages: [initialPageData],
          pageParams: [page],
        }
      : undefined,

    queryFn: async ({ pageParam }) => {
      const res = await axiosClient.get("/products", {
        params: { ...filters, page: pageParam, perPage },
      });

      const body = res.data;

      return {
        items: body.data ?? [],
        meta: body.meta ?? { page: Number(pageParam), perPage, total: 0 },
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
