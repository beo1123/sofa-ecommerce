"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Spinner } from "@/components/ui";

export default function AdminDashboardPage() {
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["admin", "products", "count"],
    queryFn: async () => {
      const res = await adminApi.products.list({ perPage: 1 });
      return res.data;
    },
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["admin", "orders", "count"],
    queryFn: async () => {
      const res = await adminApi.orders.list({ perPage: 1 });
      return res.data;
    },
  });

  const { data: articles, isLoading: loadingArticles } = useQuery({
    queryKey: ["admin", "articles", "count"],
    queryFn: async () => {
      const res = await adminApi.articles.list({ perPage: 1 });
      return res.data;
    },
  });

  const isLoading = loadingProducts || loadingOrders || loadingArticles;

  return (
    <main className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-text-default)] mb-6">Dashboard</h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Connected to API via <code className="bg-gray-100 px-1 py-0.5 rounded">@repo/api</code>
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Sản phẩm" value={products?.meta?.total ?? 0} />
          <StatCard label="Đơn hàng" value={orders?.meta?.total ?? 0} />
          <StatCard label="Bài viết" value={articles?.meta?.total ?? 0} />
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-6 rounded-lg border border-[var(--color-brand-50)] bg-white">
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <p className="text-3xl font-bold text-[var(--color-text-default)] mt-2">
        {value.toLocaleString("vi-VN")}
      </p>
    </div>
  );
}
