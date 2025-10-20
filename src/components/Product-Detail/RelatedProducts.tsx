"use client";

import React from "react";
import ProductCard from "../products/ProductCard";
import { motion } from "framer-motion";

export default function RelatedProducts({ items }: { items: any[] }) {
  if (!items?.length) return null;

  return (
    <section className="mt-16 border-t border-gray-100 pt-10">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-brand-400)] tracking-tight">
          Sản phẩm liên quan
        </h2>
        <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-[var(--color-brand-100)] to-transparent" />
      </div>

      {/* ===== GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
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
