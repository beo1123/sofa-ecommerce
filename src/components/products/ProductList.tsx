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

  if (!items.length) {
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
      {/* Responsive grid: 1 → 2 → 3 → 4 cột */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-6">
        {items.map((product, idx) => (
          <motion.div
            key={product.id ?? idx}
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
