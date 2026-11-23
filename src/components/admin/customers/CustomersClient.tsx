"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { IconMapPin, IconSearch, IconShoppingBag, IconStar, IconUser } from "@tabler/icons-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Drawer from "@/components/ui/Drawer";
import { useAdminUIStore } from "@/store/useAdminUIStore";
import { formatDateVi, formatVnd } from "@/lib/format";
import type { SerializedCustomer } from "@/components/admin/customers/types";

interface CustomersClientProps {
  initialCustomers: SerializedCustomer[];
}

export default function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortBy, setSortBy] = useState<"lastOrder" | "orders" | "newest">("lastOrder");

  const activeCustomerId = useAdminUIStore((state) => state.activeCustomerId);
  const setActiveCustomerId = useAdminUIStore((state) => state.setActiveCustomerId);

  useEffect(() => {
    return () => {
      setActiveCustomerId(null);
    };
  }, [setActiveCustomerId]);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    for (const c of initialCustomers) {
      if (c.city) cities.add(c.city);
    }
    return [
      { label: "Tất cả thành phố", value: "" },
      ...Array.from(cities)
        .sort((a, b) => a.localeCompare(b, "vi"))
        .map((city) => ({ label: city, value: city })),
    ];
  }, [initialCustomers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = initialCustomers.filter((c) => {
      if (cityFilter && c.city !== cityFilter) return false;
      if (!q) return true;
      const haystack = [
        c.displayName ?? "",
        c.email,
        c.city ?? "",
        ...c.addresses.map((a) => `${a.phone ?? ""} ${a.line1} ${a.city}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...list].sort((a, b) => {
      if (sortBy === "orders") return b.orderCount - a.orderCount;
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const aTime = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
      const bTime = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
      return bTime - aTime;
    });
  }, [initialCustomers, search, cityFilter, sortBy]);

  const activeCustomer = useMemo(
    () => initialCustomers.find((c) => c.id === activeCustomerId) ?? null,
    [initialCustomers, activeCustomerId]
  );

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên khách hàng, email, SĐT..."
              inputSize="sm"
              fullWidth
              leftIcon={<IconSearch size={16} stroke={1.75} />}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              selectSize="sm"
              fullWidth
              options={cityOptions}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "lastOrder" | "orders" | "newest")}
              selectSize="sm"
              fullWidth
              options={[
                { value: "lastOrder", label: "Đơn gần nhất" },
                { value: "orders", label: "Nhiều đơn nhất" },
                { value: "newest", label: "Mới đăng ký" },
              ]}
            />
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Hiển thị <span className="font-semibold text-brand-400">{filtered.length}</span> / {initialCustomers.length}{" "}
          khách hàng
        </p>
      </div>

      {/* Table */}
      <div className="rounded-[12px] border border-brand-100 bg-bg-page">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-text-muted">Không tìm thấy khách hàng phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Thành phố</th>
                  <th className="px-3 py-3 text-right">Số đơn hàng</th>
                  <th className="px-4 py-3 text-right">Đơn gần nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60">
                {filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setActiveCustomerId(customer.id)}
                    className={clsx(
                      "transition-colors hover:bg-brand-50/40 cursor-pointer",
                      activeCustomerId === customer.id && "bg-brand-50/60"
                    )}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-xs font-semibold text-brand-400">
                          {(customer.displayName || customer.email).slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-brand-400">{customer.displayName || "Chưa cập nhật tên"}</p>
                          <p className="text-[11px] text-text-muted">
                            {customer.reviews.length} đánh giá · {customer.addresses.length} địa chỉ
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-xs text-text-default">{customer.email}</td>

                    <td className="px-3 py-3.5 text-xs text-text-default">
                      {customer.city || <span className="text-text-muted">—</span>}
                    </td>

                    <td className="px-3 py-3.5 text-right">
                      <p className="font-semibold text-brand-400">{customer.orderCount}</p>
                      {customer.totalSpent > 0 && (
                        <p className="text-[11px] text-text-muted">{formatVnd(customer.totalSpent)}</p>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right text-xs whitespace-nowrap text-text-muted">
                      {formatDateVi(customer.lastOrderDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      <Drawer
        open={Boolean(activeCustomer)}
        onClose={() => setActiveCustomerId(null)}
        widthClassName="w-full max-w-[520px]"
        title={activeCustomer ? activeCustomer.displayName || activeCustomer.email : ""}
        subtitle={
          activeCustomer ? `${activeCustomer.email} · Tham gia ${formatDateVi(activeCustomer.createdAt)}` : undefined
        }>
        {activeCustomer && (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2.5 rounded-[12px] border border-brand-100 bg-bg-muted p-3.5">
              <div className="rounded-[8px] border border-brand-100 bg-bg-page p-2.5">
                <p className="text-[11px] text-text-muted">Tổng đơn</p>
                <p className="mt-0.5 text-base font-bold text-brand-400">{activeCustomer.orderCount}</p>
              </div>
              <div className="rounded-[8px] border border-brand-100 bg-bg-page p-2.5">
                <p className="text-[11px] text-text-muted">Tổng chi tiêu</p>
                <p className="mt-0.5 text-sm font-bold text-brand-300">{formatVnd(activeCustomer.totalSpent)}</p>
              </div>
              <div className="rounded-[8px] border border-brand-100 bg-bg-page p-2.5">
                <p className="text-[11px] text-text-muted">Đánh giá</p>
                <p className="mt-0.5 text-base font-bold text-brand-400">{activeCustomer.reviews.length}</p>
              </div>
            </div>

            {/* Roles */}
            {activeCustomer.roles.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs text-text-muted mr-1">
                  <IconUser size={14} stroke={1.75} />
                  Vai trò:
                </span>
                {activeCustomer.roles.map((role) => (
                  <Badge key={role} variant="brand">
                    {role}
                  </Badge>
                ))}
              </div>
            )}

            {/* 1. Address list */}
            <section className="space-y-2.5">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
                <IconMapPin size={15} stroke={1.75} />
                <span>Sổ địa chỉ ({activeCustomer.addresses.length})</span>
              </h3>

              {activeCustomer.addresses.length === 0 ? (
                <p className="rounded-[8px] border border-dashed border-brand-100 bg-bg-muted px-3 py-4 text-center text-xs text-text-muted">
                  Khách hàng chưa lưu địa chỉ giao nhận nào.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeCustomer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-[12px] border border-brand-100 bg-bg-page p-3.5 text-xs space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-brand-400">
                          {addr.fullName}
                          {addr.phone ? ` · ${addr.phone}` : ""}
                        </span>
                        <div className="flex items-center gap-1">
                          {addr.isDefaultShipping && <Badge variant="success">Mặc định giao</Badge>}
                          {addr.isDefaultBilling && <Badge variant="muted">Hóa đơn</Badge>}
                        </div>
                      </div>
                      <p className="text-text-muted">
                        {[addr.line1, addr.line2, addr.city, addr.province, addr.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. Order history */}
            <section className="space-y-2.5">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
                <IconShoppingBag size={15} stroke={1.75} />
                <span>Lịch sử đơn hàng ({activeCustomer.orders.length})</span>
              </h3>

              {activeCustomer.orders.length === 0 ? (
                <p className="rounded-[8px] border border-dashed border-brand-100 bg-bg-muted px-3 py-4 text-center text-xs text-text-muted">
                  Chưa có đơn hàng nào gắn với tài khoản này.
                </p>
              ) : (
                <div className="divide-y divide-brand-100/60 rounded-[12px] border border-brand-100 bg-bg-page">
                  {activeCustomer.orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-3 p-3.5 text-xs">
                      <div>
                        <Link
                          href={`/admin/orders?orderId=${order.id}`}
                          className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
                          {order.orderNumber}
                        </Link>
                        <p className="mt-0.5 text-text-muted">
                          {formatDateVi(order.createdAt)} · Cọc {formatVnd(order.depositPaid)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold text-brand-400">{formatVnd(order.total)}</span>
                        <StatusBadge domain="workshop" status={order.workshopStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Reviews written */}
            <section className="space-y-2.5">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-300">
                <IconStar size={15} stroke={1.75} />
                <span>Đánh giá đã viết ({activeCustomer.reviews.length})</span>
              </h3>

              {activeCustomer.reviews.length === 0 ? (
                <p className="rounded-[8px] border border-dashed border-brand-100 bg-bg-muted px-3 py-4 text-center text-xs text-text-muted">
                  Khách hàng chưa viết đánh giá nào.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeCustomer.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-[12px] border border-brand-100 bg-bg-page p-3.5 text-xs space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={`/admin/products/${rev.productId}`}
                          className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
                          {rev.productTitle}
                        </Link>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-amber-700">{rev.rating}/5 ★</span>
                          <Badge variant={rev.approved ? "success" : "warning"}>
                            {rev.approved ? "Đã duyệt" : "Chờ duyệt"}
                          </Badge>
                        </div>
                      </div>
                      {rev.title && <p className="font-medium text-text-default">{rev.title}</p>}
                      {rev.body && <p className="text-text-muted">{rev.body}</p>}
                      <p className="text-[11px] text-text-muted">{formatDateVi(rev.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
