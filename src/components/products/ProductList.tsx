"use client";

import React from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import Spinner from "@/components/ui/Spinner";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

type ProductListProps = {
  items?: any[];
  loading?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
};

export default function ProductList({
  items = [],
  loading = false,
  hasActiveFilters = false,
  onClearFilters,
}: ProductListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size={40} />
      </div>
    );
  }

  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  if (!safeItems.length) {
    return (
      <div
        className="
          text-center py-16 px-[var(--spacing-lg)]
          bg-[var(--color-bg-page)] rounded-3xl
          ring-1 ring-[var(--color-brand-50)]
          shadow-[0_8px_30px_-12px_color-mix(in_srgb,var(--color-brand-400)_8%,transparent)]
        ">
        <Text className="text-[var(--color-text-default)] font-semibold text-lg">Không tìm thấy sản phẩm phù hợp</Text>
        <Text className="text-[var(--color-text-muted)] font-medium text-sm sm:text-base mt-2 max-w-2xl mx-auto">
          Hãy thử chọn danh mục khác hoặc điều chỉnh lại bộ lọc chất liệu, màu sắc và khoảng giá.
        </Text>
        <div className="mt-[var(--spacing-lg)] flex flex-wrap items-center justify-center gap-3">
          {hasActiveFilters && onClearFilters && (
            <Button size="sm" variant="primary" onClick={onClearFilters}>
              Xóa bộ lọc hiện tại
            </Button>
          )}
          <Link
            href="/san-pham"
            className="
              inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl
              border border-[var(--color-brand-300)] text-[var(--color-brand-400)]
              hover:bg-[var(--color-brand-50)] transition-colors
            ">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[var(--spacing-md)] sm:gap-[var(--spacing-lg)]">
        {safeItems.map((product, idx) => (
          <motion.div
            key={product?.id ?? product?.slug ?? `product-${idx}`}
            className="h-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.24) }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
