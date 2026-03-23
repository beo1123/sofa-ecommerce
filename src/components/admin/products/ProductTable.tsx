"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Pencil, Trash2 } from "lucide-react";

interface Product {
  id: number;
  title: string;
  slug: string;
  status: string;
  category?: { id: number; name: string; slug: string } | null;
  images?: { url: string; alt?: string }[];
  variants?: { id: number; name: string; price: number | string }[];
  updatedAt: string;
}

interface ProductTableProps {
  products: Product[];
  onDelete: (product: Product) => void;
  deleting?: number | null;
}

const STATUS_BADGE: Record<string, "default" | "success" | "warning" | "danger"> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Đã đăng",
  DRAFT: "Nháp",
  ARCHIVED: "Đã lưu trữ",
};

export default function ProductTable({ products, onDelete, deleting }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-text-muted)]">
        <p>Chưa có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-[var(--color-text-muted)] uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Ảnh</th>
            <th className="px-4 py-3">Tên sản phẩm</th>
            <th className="px-4 py-3">Danh mục</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Biến thể</th>
            <th className="px-4 py-3">Giá thấp nhất</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => {
            const primaryImage = product.images?.[0];
            const prices = (product.variants ?? []).map((v) => Number(v.price));
            const minPrice = prices.length > 0 ? Math.min(...prices) : null;

            return (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                {/* Image */}
                <td className="px-4 py-3">
                  {primaryImage ? (
                    <img
                      src={primaryImage.url}
                      alt={primaryImage.alt ?? product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                      N/A
                    </div>
                  )}
                </td>

                {/* Title */}
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-[var(--color-text-default)] hover:text-[var(--color-brand-300)] transition-colors">
                    {product.title}
                  </Link>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">/{product.slug}</p>
                </td>

                {/* Category */}
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{product.category?.name ?? "—"}</td>

                {/* Status */}
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE[product.status] ?? "default"}>
                    {STATUS_LABEL[product.status] ?? product.status}
                  </Badge>
                </td>

                {/* Variants count */}
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{product.variants?.length ?? 0}</td>

                {/* Min price */}
                <td className="px-4 py-3 font-medium">
                  {minPrice != null
                    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(minPrice)
                    : "—"}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button size="xs" variant="ghost" leftIcon={<Pencil size={14} />}>
                        Sửa
                      </Button>
                    </Link>
                    <Button
                      size="xs"
                      variant="danger"
                      leftIcon={<Trash2 size={14} />}
                      loading={deleting === product.id}
                      onClick={() => onDelete(product)}>
                      {product.status === "ARCHIVED" ? "Xóa vĩnh viễn" : "Lưu trữ"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
