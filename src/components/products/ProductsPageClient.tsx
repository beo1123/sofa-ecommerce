"use client";

import { useState, useEffect, useRef } from "react";
import ProductList from "@/components/products/ProductList";
import ProductFilters from "@/components/products/ProductFilters";
import { Filter, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";
import { useProductsInfinite } from "@/hooks/products/useProductsInfinite";
import Spinner from "@/components/ui/Spinner";

type ProductsPageProps = {
  initialItems: any[];
  initialMeta: { page: number; perPage: number; total: number };
  initialParams: ProductQueryParams;
};

export default function ProductsPageClient({ initialItems, initialMeta, initialParams }: ProductsPageProps) {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const params = initialParams;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductsInfinite(params);

  const items = data?.pages ? data.pages.flatMap((p) => p.items) : initialItems;

  const meta = data?.pages?.[0]?.meta ?? initialMeta;

  const currentFilters = {
    category: params.category ?? "",
    priceMin: params.priceMin ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    color: params.color ?? "",
  };

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <main className="min-h-screen bg-[var(--color-bg-muted)]">
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-8 text-center lg:text-left">Tất cả sản phẩm</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <ProductFilters currentFilters={currentFilters} />
            </div>
          </aside>

          <div className="flex flex-col w-full">
            <ProductList items={items} />

            <div ref={loadMoreRef} className="py-10 flex justify-center">
              {isFetchingNextPage && <Spinner size={30} />}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Button
          onClick={() => setShowMobileFilter(true)}
          className="rounded-full w-14 h-14 flex items-center justify-center bg-[var(--color-brand-400)] hover:bg-[var(--color-brand-300)] text-white shadow-lg"
          aria-label="Mở bộ lọc">
          <Filter size={24} />
        </Button>
      </div>

      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilter(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full bg-white z-50 lg:hidden overflow-y-auto shadow-lg">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text-default)]">Bộ lọc</h2>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Đóng bộ lọc">
                  <X size={24} className="text-[var(--color-text-default)]" />
                </button>
              </div>

              <div className="p-4">
                <ProductFilters currentFilters={currentFilters} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
