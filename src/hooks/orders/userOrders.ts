"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import type { ApiResponse } from "@/server/utils/api";
import type { UserOrder } from "@/types/order/order";

export function useOrders() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchOrders = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await axiosClient.get<ApiResponse<UserOrder[]>>("/orders", {
        signal: controller.signal,
      });
      console.log("API raw response:", res.data);
      if (res.data.success) setOrders(res.data.data ?? []);
      else setError(res.data.error?.message || "Unknown API error");
    } catch (err: any) {
      const canceled = err?.name === "CanceledError" || err?.message === "canceled" || err?.code === "ERR_CANCELED";
      if (canceled) return;
      setError(err?.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    return () => abortRef.current?.abort();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
