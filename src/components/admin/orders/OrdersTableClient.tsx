"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { IconSearch, IconEye, IconPrinter, IconRuler2 } from "@tabler/icons-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import WorkshopStatusPopover from "@/components/admin/orders/WorkshopStatusPopover";
import OrderDetailDrawer from "@/components/admin/orders/OrderDetailDrawer";
import { useAdminUIStore } from "@/store/useAdminUIStore";
import { formatDateVi, formatVnd } from "@/lib/format";
import { formatDimensionsMeters } from "@/lib/dimensions";
import { WORKSHOP_STATUSES, WORKSHOP_STATUS_LABELS, type WorkshopStatus } from "@/lib/workshop-types";
import type { SerializedAdminOrder } from "@/components/admin/orders/types";

interface OrdersTableClientProps {
  initialOrders: SerializedAdminOrder[];
  initialWorkshopStatus?: string;
  initialOrderId?: number | null;
}

const PAYMENT_OPTIONS = [
  { label: "Tất cả thanh toán", value: "" },
  { label: "COD", value: "COD" },
  { label: "VNPay", value: "VNPAY" },
  { label: "Ví điện tử", value: "WALLET" },
  { label: "Khác", value: "OTHER" },
];

export default function OrdersTableClient({
  initialOrders,
  initialWorkshopStatus = "",
  initialOrderId = null,
}: OrdersTableClientProps) {
  const [orders, setOrders] = useState<SerializedAdminOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialWorkshopStatus);
  const [paymentFilter, setPaymentFilter] = useState<string>("");

  const activeOrderId = useAdminUIStore((state) => state.activeOrderId);
  const setActiveOrderId = useAdminUIStore((state) => state.setActiveOrderId);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    if (initialOrderId) {
      setActiveOrderId(initialOrderId);
    }
    return () => {
      setActiveOrderId(null);
    };
  }, [initialOrderId, setActiveOrderId]);

  const handlePatchOrder = useCallback(
    (orderId: number, updater: (prev: SerializedAdminOrder) => SerializedAdminOrder) => {
      setOrders((prevList) => prevList.map((item) => (item.id === orderId ? updater(item) : item)));
    },
    []
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const s of WORKSHOP_STATUSES) counts[s] = 0;
    for (const order of orders) {
      counts[order.workshopStatus] = (counts[order.workshopStatus] ?? 0) + 1;
    }
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter && order.workshopStatus !== statusFilter) return false;
      if (paymentFilter && order.paymentMethod !== paymentFilter) return false;
      if (!q) return true;
      const haystack = [
        order.orderNumber,
        order.recipientName,
        order.phone,
        order.materialChoice ?? "",
        order.colorChoice ?? "",
        ...order.items.map((i) => i.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const activeOrder = useMemo(() => orders.find((o) => o.id === activeOrderId) ?? null, [orders, activeOrderId]);

  return (
    <div className="space-y-4">
      {/* Pipeline status pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setStatusFilter("")}
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
            statusFilter === ""
              ? "border-brand-400 bg-brand-400 text-white"
              : "border-brand-100 bg-bg-page text-text-default hover:border-brand-200 hover:bg-brand-50/60"
          )}>
          <span>Tất cả</span>
          <span className="opacity-80">({statusCounts.all})</span>
        </button>

        {WORKSHOP_STATUSES.map((status) => {
          const active = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(active ? "" : status)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                active
                  ? "border-brand-400 bg-brand-50 text-brand-400"
                  : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-400"
              )}>
              <span>{WORKSHOP_STATUS_LABELS[status]}</span>
              <span>({statusCounts[status] ?? 0})</span>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã đơn, tên khách, SĐT, sofa..."
              inputSize="sm"
              fullWidth
              leftIcon={<IconSearch size={16} stroke={1.75} />}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              selectSize="sm"
              fullWidth
              options={PAYMENT_OPTIONS}
            />
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Hiển thị <span className="font-semibold text-brand-400">{filteredOrders.length}</span> / {orders.length} đơn
          hàng
        </p>
      </div>

      {/* Orders table */}
      <div className="rounded-[12px] border border-brand-100 bg-bg-page">
        {filteredOrders.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-brand-400">Không tìm thấy đơn hàng phù hợp</p>
            <p className="mt-1 text-xs text-text-muted">Thử thay đổi bộ lọc trạng thái xưởng hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-3 py-3">Khách hàng</th>
                  <th className="px-3 py-3">Sản phẩm</th>
                  <th className="px-3 py-3">Kích thước</th>
                  <th className="px-3 py-3">Chất liệu / Màu</th>
                  <th className="px-3 py-3 text-right">Tổng tiền</th>
                  <th className="px-3 py-3 text-right">Đã cọc</th>
                  <th className="px-3 py-3">Thanh toán</th>
                  <th className="px-3 py-3">Trạng thái xưởng</th>
                  <th className="px-3 py-3">Ngày giao</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60">
                {filteredOrders.map((order) => {
                  const firstItem = order.items[0];
                  const extraItems = Math.max(0, order.items.length - 1);
                  const customSizeLabel = order.isCustomSize
                    ? formatDimensionsMeters(order.customWidthCm, order.customDepthCm, order.customHeightCm)
                    : null;

                  const remaining = Math.max(0, order.total - order.depositPaid);
                  const deliveryDate = order.deliverDate ?? order.shipment?.scheduledDate;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setActiveOrderId(order.id)}
                      className={clsx(
                        "transition-colors hover:bg-brand-50/40 cursor-pointer",
                        activeOrderId === order.id && "bg-brand-50/60"
                      )}>
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-semibold text-brand-400">{order.orderNumber}</p>
                        <p className="mt-0.5 text-[11px] text-text-muted">{formatDateVi(order.createdAt)}</p>
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <p className="font-medium text-text-default">{order.recipientName}</p>
                        <p className="text-xs text-text-muted">{order.phone}</p>
                      </td>

                      <td className="max-w-[200px] px-3 py-3.5 align-top">
                        <p className="truncate font-medium text-text-default">{firstItem?.name ?? "Đơn đặt đóng"}</p>
                        {extraItems > 0 && <p className="text-xs text-text-muted">+{extraItems} sản phẩm khác</p>}
                      </td>

                      <td className="px-3 py-3.5 align-top whitespace-nowrap">
                        {customSizeLabel ? (
                          <Badge variant="brand">
                            <IconRuler2 size={12} stroke={1.75} />
                            {customSizeLabel}
                          </Badge>
                        ) : (
                          <span className="text-xs text-text-muted">Tiêu chuẩn</span>
                        )}
                      </td>

                      <td className="max-w-[160px] px-3 py-3.5 align-top text-xs">
                        {order.materialChoice || order.colorChoice ? (
                          <div>
                            {order.materialChoice && (
                              <p className="truncate font-medium text-text-default">{order.materialChoice}</p>
                            )}
                            {order.colorChoice && <p className="truncate text-text-muted">{order.colorChoice}</p>}
                          </div>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5 align-top text-right whitespace-nowrap">
                        <p className="font-semibold text-brand-400">{formatVnd(order.total)}</p>
                      </td>

                      <td className="px-3 py-3.5 align-top text-right whitespace-nowrap">
                        <p className="font-medium text-green-700">{formatVnd(order.depositPaid)}</p>
                        {remaining > 0 && <p className="text-[11px] text-text-muted">Còn {formatVnd(remaining)}</p>}
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <Badge variant="muted">{order.paymentMethod}</Badge>
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <WorkshopStatusPopover
                          orderId={order.id}
                          currentStatus={order.workshopStatus}
                          onUpdated={(next: WorkshopStatus) =>
                            handlePatchOrder(order.id, (prev) => ({
                              ...prev,
                              workshopStatus: next,
                            }))
                          }
                        />
                      </td>

                      <td className="px-3 py-3.5 align-top text-xs whitespace-nowrap text-text-default">
                        {formatDateVi(deliveryDate)}
                      </td>

                      <td
                        className="px-4 py-3.5 align-top text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveOrderId(order.id)}
                            title="Xem chi tiết đơn hàng"
                            aria-label={`Xem chi tiết ${order.orderNumber}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-300 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-400 cursor-pointer">
                            <IconEye size={16} stroke={1.75} />
                          </button>
                          <a
                            href={`/api/admin/orders/${order.id}/invoice`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Xem hóa đơn PDF"
                            aria-label={`In hóa đơn ${order.orderNumber}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-300 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-400">
                            <IconPrinter size={16} stroke={1.75} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right-side 520px Drawer */}
      <OrderDetailDrawer order={activeOrder} onClose={() => setActiveOrderId(null)} onOrderPatched={handlePatchOrder} />
    </div>
  );
}
