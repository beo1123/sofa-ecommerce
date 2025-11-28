"use client";

import React from "react";
import ProductCard from "./ProductCard";
import Spinner from "@/components/ui/Spinner";
import Text from "@/components/ui/Text";
import { motion } from "framer-motion";

type ProductListProps = {
  items?: any[];
  loading?: boolean;
};

export default function ProductList({ items = [], loading = false }: ProductListProps) {
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
      <div className="text-center py-16">
        <Text className="text-[var(--color-text-muted)] text-lg">
          😕 Không có sản phẩm nào phù hợp với bộ lọc hiện tại.
        </Text>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 [@media(min-width:640px)]:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {safeItems.map((product, idx) => (
          <motion.div
            key={product?.id ?? product?.slug ?? `product-${idx}`}
            className="min-w-[170px] sm:min-w-0"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
