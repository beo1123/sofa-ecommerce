"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Button, Spinner, Dropdown, Pagination, Badge } from "@/components/ui";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "CREATED", label: "Mới tạo" },
  { value: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "COD_PENDING", label: "COD - Chờ xử lý" },
  { value: "COD_COMPLETED", label: "COD - Hoàn thành" },
  { value: "FULFILLED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const STATUS_BADGE: Record<string, "default" | "success" | "warning" | "danger"> = {
  CREATED: "default",
  PENDING_PAYMENT: "warning",
  PAID: "success",
  COD_PENDING: "warning",
  COD_COMPLETED: "success",
  FULFILLED: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const perPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "orders", page, perPage, status],
    queryFn: async () => {
      const res = await adminApi.orders.list({
        page,
        perPage,
        status: status || undefined,
      });
      return res.data;
    },
  });

  const orders = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, perPage: 10, total: 0 };
  const totalPages = Math.ceil(meta.total / meta.perPage);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-default)]">Quản lý đơn hàng</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Dropdown
          value={status}
          onChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          placeholder="Trạng thái"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <p>Không thể tải danh sách đơn hàng</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p>Chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-[var(--color-brand-50)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-[var(--color-text-muted)] uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Tổng tiền</th>
                    <th className="px-4 py-3">Thanh toán</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div>{order.recipientName}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{order.phone}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[order.status] ?? "default"}>{order.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <Link href={`/orders/${order.id}`}>
                            <Button size="xs" variant="ghost" leftIcon={<Eye size={14} />}>
                              Chi tiết
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
