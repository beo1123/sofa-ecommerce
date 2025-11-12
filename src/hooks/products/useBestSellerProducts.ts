"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axiosClient from "@/lib/axiosClient";
import axios from "axios";
import { ApiResponse } from "@/server/utils/api";
import { BestSellerProduct } from "@/types/products/BestSellerProduct ";

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
      const res = await axiosClient.get<ApiResponse<BestSellerProduct[]>>("/products/bestsellers", {
        signal: controller.signal,
      });

      if (res.data.success) {
        setProducts(res.data.data ?? []);
      } else {
        setError(res.data.error?.message || "Unknown API error");
      }
    } catch (err: any) {
      const canceled =
        err?.name === "CanceledError" ||
        err?.message === "canceled" ||
        err?.code === "ERR_CANCELED" ||
        axios.isCancel(err);

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
