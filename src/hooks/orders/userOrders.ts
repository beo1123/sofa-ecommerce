import axiosClient from "@/lib/axiosClient";
import { UserOrder } from "@/types/order/order";
import { useEffect, useState } from "react";

export function useOrders() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/orders");
      setOrders(res.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, refetch: fetchOrders };
}
