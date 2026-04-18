// app/search/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useSearchInfinite } from "@/hooks/products/useSearchInfinite";
import ProductCard from "@/components/products/ProductCard";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("q") || "";

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchInfinite(query, { perPage: 12 });

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Heading level={2} className="text-2xl font-semibold mb-6">
        Kết quả tìm kiếm cho: “{query}”
      </Heading>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <p className="text-center text-[var(--color-text-muted)]">Không tìm thấy sản phẩm nào phù hợp.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:gap-6 [@media(min-width:640px)]:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {items.map((product: any, idx: number) => (
          <motion.div
            key={product.id ?? idx}
            className="min-w-[170px] sm:min-w-0"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {/* Spinner load more */}
      <div ref={loadMoreRef} className="flex justify-center py-10">
        {isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
}
