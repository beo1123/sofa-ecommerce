"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { sdk } from "@repo/sdk";
import { BestSellerProduct } from "@repo/types";

export function useBestSellerProducts() {
  const [products, setProducts] = useState<BestSellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchBestSellers = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await sdk.client.get("/products/bestsellers", {
        signal: controller.signal,
      });

      if (res.data.success) {
        setProducts(res.data.data ?? []);
      } else {
        setError(res.data.error?.message || "Unknown API error");
      }
    } catch (err: any) {
      const canceled = err?.name === "AbortError" || err?.name === "CanceledError" || err?.message === "canceled";

      if (canceled) return;

      setError(err?.message || "Error fetching best sellers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBestSellers();
    return () => abortRef.current?.abort();
  }, [fetchBestSellers]);

  return {
    products,
    loading,
    error,
    refetch: fetchBestSellers,
  };
}
