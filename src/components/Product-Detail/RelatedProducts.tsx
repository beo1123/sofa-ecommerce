"use client";

import React from "react";
import ProductCard from "../products/ProductCard";
import { motion } from "framer-motion";

export default function RelatedProducts({ items }: { items: any[] }) {
  if (!items?.length) return null;

  return (
    <section className="mt-14 border-t border-[var(--color-brand-50)] pt-10">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-300)]">
            Gợi ý đồng bộ
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-default)] tracking-tight">
            Sản phẩm cùng danh mục
          </h2>
        </div>
        <div className="h-[1px] flex-1 ml-6 bg-gradient-to-r from-[var(--color-brand-100)] to-transparent" />
      </div>

      {/* ===== GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
