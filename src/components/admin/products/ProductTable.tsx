"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { IconSearch, IconEdit, IconTrash, IconExternalLink, IconMessageStar, IconLoader2 } from "@tabler/icons-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatVnd } from "@/lib/format";
import { deleteProductAction, updateProductStatusAction } from "@/app/(admin)/admin/products/actions";
import type { ProductStatus } from "@/lib/prisma";
import type { SerializedCategoryOption, SerializedProductListItem } from "@/components/admin/products/types";

interface ProductTableProps {
  initialProducts: SerializedProductListItem[];
  categories: SerializedCategoryOption[];
}

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "", label: "Tất cả" },
  { value: "PUBLISHED", label: "Đang hiển thị" },
  { value: "DRAFT", label: "Bản nháp" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

export default function ProductTable({ initialProducts, categories }: ProductTableProps) {
  const [products, setProducts] = useState<SerializedProductListItem[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [{ label: "Tất cả danh mục", value: "" }, ...categories.map((c) => ({ label: c.name, value: String(c.id) }))],
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (categoryId && String(p.categoryId ?? "") !== categoryId) return false;
      if (!q) return true;
      const haystack = [
        p.workshopCode ?? "",
        p.title,
        p.slug,
        p.categoryName ?? "",
        ...p.materialOptions.map((m) => m.label),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, search, categoryId, statusFilter]);

  const handleCycleStatus = async (product: SerializedProductListItem) => {
    const order: ProductStatus[] = ["PUBLISHED", "DRAFT", "ARCHIVED"];
    const nextStatus = order[(order.indexOf(product.status) + 1) % order.length];

    setFeedbackError(null);
    setBusyId(product.id);
    const prevStatus = product.status;

    setProducts((list) => list.map((item) => (item.id === product.id ? { ...item, status: nextStatus } : item)));

    const res = await updateProductStatusAction(product.id, nextStatus);
    setBusyId(null);

    if (!res.ok) {
      setProducts((list) => list.map((item) => (item.id === product.id ? { ...item, status: prevStatus } : item)));
      setFeedbackError(res.error ?? "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (product: SerializedProductListItem) => {
    const confirmed = window.confirm(`Xóa sản phẩm "${product.title}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    setFeedbackError(null);
    setBusyId(product.id);
    const res = await deleteProductAction(product.id);
    setBusyId(null);

    if (!res.ok) {
      setFeedbackError(res.error ?? "Không thể xóa sản phẩm");
      return;
    }

    setProducts((list) => list.filter((item) => item.id !== product.id));
  };

  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value;
          const count = tab.value === "" ? products.length : products.filter((p) => p.status === tab.value).length;
          return (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                active
                  ? "border-brand-400 bg-brand-400 text-white"
                  : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-400"
              )}>
              <span>{tab.label}</span>
              <span className="opacity-80">({count})</span>
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
              placeholder="Tìm mã xưởng (PGG-...), tên sofa..."
              inputSize="sm"
              fullWidth
              leftIcon={<IconSearch size={16} stroke={1.75} />}
            />
          </div>

          <div className="w-full sm:w-52">
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              selectSize="sm"
              fullWidth
              options={categoryOptions}
            />
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Hiển thị <span className="font-semibold text-brand-400">{filteredProducts.length}</span> / {products.length}{" "}
          sản phẩm
        </p>
      </div>

      {feedbackError && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          {feedbackError}
        </div>
      )}

      {/* Product table */}
      <div className="rounded-[12px] border border-brand-100 bg-bg-page">
        {filteredProducts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-brand-400">Chưa có sản phẩm phù hợp</p>
            <p className="mt-1 text-xs text-text-muted">Thêm mẫu sofa mới hoặc thay đổi điều kiện lọc ở trên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                  <th className="px-4 py-3">Mã xưởng</th>
                  <th className="px-3 py-3">Sản phẩm</th>
                  <th className="px-3 py-3">Danh mục</th>
                  <th className="px-3 py-3">Chất liệu</th>
                  <th className="px-3 py-3 text-right">Giá từ</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60">
                {filteredProducts.map((product) => {
                  const isBusy = busyId === product.id;

                  return (
                    <tr key={product.id} className="transition-colors hover:bg-brand-50/40">
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        {product.workshopCode ? (
                          <Badge variant="brand">{product.workshopCode}</Badge>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-[8px] border border-brand-100 bg-brand-50">
                            {product.primaryImageUrl ? (
                              <img
                                src={product.primaryImageUrl}
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-brand-200">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
                              {product.title}
                            </Link>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                              <span>{product.variantCount} biến thể</span>
                              {product.allowCustomSize && <span>· Đặt kích thước riêng</span>}
                              {product.pendingReviewCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                  <IconMessageStar size={12} stroke={1.75} />
                                  {product.pendingReviewCount} đánh giá chờ duyệt
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-top text-xs text-text-default whitespace-nowrap">
                        {product.categoryName ?? <span className="text-text-muted">Chưa phân loại</span>}
                      </td>

                      <td className="max-w-[220px] px-3 py-3.5 align-top">
                        {product.materialOptions.length === 0 ? (
                          <span className="text-xs text-text-muted">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {product.materialOptions.slice(0, 3).map((mat) => (
                              <Badge key={mat.label} variant="muted">
                                {mat.label}
                              </Badge>
                            ))}
                            {product.materialOptions.length > 3 && (
                              <Badge variant="neutral">+{product.materialOptions.length - 3}</Badge>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3.5 align-top text-right whitespace-nowrap">
                        {product.minPrice !== null ? (
                          <span className="font-semibold text-brand-400">{formatVnd(product.minPrice)}</span>
                        ) : (
                          <span className="text-xs text-text-muted">Liên hệ</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <StatusBadge
                          domain="product"
                          status={product.status}
                          interactive
                          onClick={() => handleCycleStatus(product)}
                          rightIcon={
                            isBusy ? <IconLoader2 size={12} stroke={1.75} className="animate-spin" /> : undefined
                          }
                        />
                      </td>

                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            title="Chỉnh sửa sản phẩm"
                            aria-label={`Chỉnh sửa ${product.title}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-300 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-400">
                            <IconEdit size={16} stroke={1.75} />
                          </Link>
                          <Link
                            href={`/san-pham/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Xem trang sản phẩm"
                            aria-label={`Xem ${product.title}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-300 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-400">
                            <IconExternalLink size={16} stroke={1.75} />
                          </Link>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(product)}
                            title="Xóa sản phẩm"
                            aria-label={`Xóa ${product.title}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-40 cursor-pointer">
                            <IconTrash size={16} stroke={1.75} />
                          </button>
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
    </div>
  );
}
