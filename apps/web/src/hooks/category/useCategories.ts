"use client";

import { sdk } from "@repo/sdk";
import { CategoryResponse } from "@repo/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function useCategories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [meta, setMeta] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCategories = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(false);
    setError(null);
    try {
      const res = await sdk.client.get("/categories", { signal: controller.signal });
      if (res.data.success) {
        setCategories(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      } else {
        setError(res.data.error?.message || "Unknown API error");
      }
    } catch (err: any) {
      const canceled = err?.name === "AbortError" || err?.name === "CanceledError" || err?.message === "canceled";

      if (canceled) return;

      setError(err?.message || "Error fetching categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();

    return () => abortRef.current?.abort();
  }, [fetchCategories]);

  return {
    categories,
    meta,
    loading,
    error,
    refetch: fetchCategories,
  };
}
