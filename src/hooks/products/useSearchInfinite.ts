"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "../common/useDebounce";
import axiosClient from "@/server/axiosClient";

export function useSearchInfinite(query: string, opts?: { perPage?: number }) {
  const perPage = opts?.perPage ?? 12;
  const debounced = useDebounce(query, 300);

  return useInfiniteQuery({
    queryKey: ["search-infinite", debounced, perPage],
    initialPageParam: 1,

    queryFn: async ({ pageParam = 1 }) => {
      if (!debounced.trim())
        return {
          items: [],
          meta: { page: 1, perPage, total: 0 },
        };

      const res = await axiosClient.get("/search", {
        params: { q: debounced, page: pageParam, perPage },
      });

      const body = res.data;

      if (!body.success) throw new Error(body.error?.message);

      return {
        items: body.data.items,
        meta: body.data.meta,
      };
    },

    getNextPageParam(lastPage) {
      const { page, perPage, total } = lastPage.meta;
      const maxPage = Math.ceil(total / perPage);

      return page < maxPage ? page + 1 : undefined;
    },

    enabled: !!debounced,
    staleTime: 30_000,
  });
}
