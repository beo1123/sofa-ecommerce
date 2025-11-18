"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../common/useDebounce";
import axiosClient from "@/server/axiosClient";

export function useSearch(query: string, opts?: { page?: Number; perPage?: Number; enabled?: boolean }) {
  const page = opts?.page ?? 1;
  const perPage = opts?.perPage ?? 10;
  const debounced = useDebounce(query, 300);
  return useQuery({
    queryKey: ["search", debounced, page, perPage],
    queryFn: async () => {
      if (!debounced.trim()) return { items: [], meta: { total: 0, page, perPage } };
      const res = await axiosClient.get("/search", { params: { q: debounced, page: page, perPage: perPage } });
      const body = res.data;
      if (!body.success) throw new Error(body.error?.message || "Search failed");
      return body.data;
    },
    enabled: opts!.enabled ?? true,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}
