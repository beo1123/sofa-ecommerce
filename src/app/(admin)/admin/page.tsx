import React from "react";
import Link from "next/link";
import {
  IconShoppingBag,
  IconTools,
  IconTruckDelivery,
  IconCash,
  IconMessageDots,
  IconArrowRight,
  IconPlus,
} from "@tabler/icons-react";
import { prisma } from "@/lib/prisma";
import { AdminDashboardService } from "@/services/admin/dashboard.service";
import { formatDateVi, formatNumberVi, formatVnd } from "@/lib/format";
import { INQUIRY_SOURCE_LABELS, isInquirySource } from "@/lib/workshop-types";
import StatusBadge from "@/components/ui/StatusBadge";
import Badge from "@/components/ui/Badge";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";

export const dynamic = "force-dynamic";

const dashboardService = new AdminDashboardService(prisma);

export default async function AdminDashboardPage() {
  const {
    dateParts: { year, month, day },
    kpis,
    revenueSeries,
    categorySeries,
    recentOrders,
    pendingInquiriesCount,
    recentPendingInquiries,
  } = await dashboardService.getSummary();

  const statCards = [
    {
      label: "Đơn hôm nay",
      value: formatNumberVi(kpis.ordersTodayCount),
      hint: `Ngày ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
      icon: IconShoppingBag,
      href: "/admin/orders",
    },
    {
      label: "Chờ sản xuất",
      value: formatNumberVi(kpis.productionCount),
      hint: "Đơn đang gia công tại xưởng",
      icon: IconTools,
      href: "/admin/orders?workshopStatus=production",
    },
    {
      label: "Đang giao",
      value: formatNumberVi(kpis.shippingCount),
      hint: "Đơn đang vận chuyển đến khách",
      icon: IconTruckDelivery,
      href: "/admin/shipments",
    },
    {
      label: "Doanh thu tháng",
      value: formatVnd(kpis.monthlyRevenue),
      hint: `Tháng ${String(month).padStart(2, "0")}/${year}`,
      icon: IconCash,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-400">Tổng quan xưởng Sofa Phạm Gia</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Theo dõi nhanh đơn đặt đóng, tiến độ sản xuất, vận chuyển và yêu cầu tư vấn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-brand-300 bg-bg-page px-3.5 text-sm font-medium text-brand-400 transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
            <IconPlus size={16} stroke={1.75} aria-hidden="true" />
            <span>Thêm sản phẩm</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-brand-400 px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-300 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
            <span>Quản lý đơn hàng</span>
            <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* 4-column stat grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-[12px] border border-brand-100 bg-bg-muted p-5 transition-colors hover:border-brand-300 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-medium text-text-muted">{card.label}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-300 transition-colors group-hover:border-brand-200 group-hover:text-brand-400">
                  <Icon size={18} stroke={1.75} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-brand-400">{card.value}</p>
              <p className="mt-1 text-xs text-text-muted">{card.hint}</p>
            </Link>
          );
        })}
      </div>

      {/* Pending inquiries count card */}
      <section className="rounded-[12px] border border-brand-100 bg-bg-muted p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-brand-100 bg-brand-50 text-brand-400">
              <IconMessageDots size={20} stroke={1.75} aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-brand-400">Yêu cầu tư vấn chờ xử lý</h3>
                <Badge variant={pendingInquiriesCount > 0 ? "warning" : "neutral"}>{pendingInquiriesCount} mới</Badge>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">
                {pendingInquiriesCount > 0
                  ? `Có ${pendingInquiriesCount} khách hàng đang chờ liên hệ tư vấn kích thước & báo giá.`
                  : "Tất cả yêu cầu tư vấn đã được phân công xử lý."}
              </p>
            </div>
          </div>

          <Link
            href="/admin/inquiries"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-brand-300 bg-bg-page px-3.5 text-sm font-medium text-brand-400 transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
            <span>Mở danh sách Leads</span>
            <IconArrowRight size={15} stroke={1.75} aria-hidden="true" />
          </Link>
        </div>

        {recentPendingInquiries.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-brand-100 pt-4 sm:grid-cols-2 xl:grid-cols-4">
            {recentPendingInquiries.map((inq) => {
              const sourceLabel = isInquirySource(inq.source) ? INQUIRY_SOURCE_LABELS[inq.source] : inq.source;
              return (
                <Link
                  key={inq.id}
                  href="/admin/inquiries?status=new"
                  className="rounded-[8px] border border-brand-100 bg-bg-page p-3 transition-colors hover:border-brand-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-text-default">{inq.name}</span>
                    <Badge variant="brand">{sourceLabel}</Badge>
                  </div>
                  <p className="mt-1 text-xs font-medium text-brand-300">{inq.phone}</p>
                  <p className="mt-0.5 truncate text-[11px] text-text-muted">
                    {inq.district ? `${inq.district} · ` : ""}
                    {formatDateVi(inq.createdAt)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <DashboardCharts revenueSeries={revenueSeries} categorySeries={categorySeries} />

      {/* Recent 10 orders table */}
      <section className="rounded-[12px] border border-brand-100 bg-bg-page">
        <div className="flex items-center justify-between gap-3 border-b border-brand-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-brand-400">10 đơn hàng gần nhất</h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Cập nhật trạng thái sản xuất, tiền cọc và lịch giao từ trang Đơn hàng
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 transition-colors hover:text-brand-400">
            <span>Xem tất cả</span>
            <IconArrowRight size={14} stroke={1.75} aria-hidden="true" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-text-muted">Chưa có đơn hàng nào trong hệ thống.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                  <th className="px-5 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-right">Đã cọc</th>
                  <th className="px-4 py-3">Thanh toán</th>
                  <th className="px-4 py-3">Trạng thái xưởng</th>
                  <th className="px-5 py-3 text-right">Ngày đặt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60">
                {recentOrders.map((order) => {
                  const primaryItem = order.items[0]?.name ?? "Đơn đặt đóng";
                  const extraCount = Math.max(0, order._count.items - 1);

                  return (
                    <tr key={order.id} className="transition-colors hover:bg-brand-50/40">
                      <td className="px-5 py-3.5 font-semibold text-brand-400">
                        <Link
                          href={`/admin/orders?orderId=${order.id}`}
                          className="hover:text-brand-300 hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-text-default">{order.recipientName}</p>
                        <p className="text-xs text-text-muted">{order.phone}</p>
                      </td>
                      <td className="max-w-[220px] px-4 py-3.5">
                        <p className="truncate text-text-default">{primaryItem}</p>
                        {extraCount > 0 && <p className="text-xs text-text-muted">+{extraCount} sản phẩm khác</p>}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-brand-400">{formatVnd(order.total)}</td>
                      <td className="px-4 py-3.5 text-right text-text-muted">{formatVnd(order.depositPaid)}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant="muted">{order.paymentMethod}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge domain="workshop" status={order.workshopStatus} />
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-text-muted">
                        {formatDateVi(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
