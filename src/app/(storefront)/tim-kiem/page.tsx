// app/search/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useSearchInfinite } from "@/hooks/products/useSearchInfinite";
import ProductCard from "@/components/products/ProductCard";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
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
  const totalCount = data?.pages?.[0]?.meta?.total ?? items.length;

  return (
    <div className="py-4 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
      {/* Bento Search Hero */}
      <div className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] p-4 sm:p-8 lg:p-10 ring-1 ring-[var(--color-brand-50)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-page)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]">
            <Search size={13} />
            <span>Tìm kiếm sản phẩm</span>
          </span>
          <Heading level={1} className="text-xl sm:text-2xl lg:text-3xl text-[var(--color-text-default)]">
            Kết quả cho: “{query}”
          </Heading>
        </div>

        {!isLoading && (
          <div className="rounded-2xl bg-[var(--color-bg-page)] px-4 py-3 ring-1 ring-[var(--color-brand-50)]">
            <p className="text-xs text-[var(--color-text-muted)]">Tìm thấy</p>
            <p className="text-lg font-bold text-[var(--color-brand-400)]">{totalCount} thiết kế</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] p-6 sm:p-12 lg:p-14 text-center ring-1 ring-[var(--color-brand-50)] space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-bg-page)] text-[var(--color-brand-300)] ring-1 ring-[var(--color-brand-50)]">
            <Search size={24} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-default)]">
            Không tìm thấy sản phẩm nào khớp với “{query}”
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base font-medium text-[var(--color-text-muted)]">
            Hãy thử tìm bằng từ khóa ngắn gọn hơn hoặc khám phá toàn bộ danh mục sản phẩm của Sofa Phạm Gia.
          </p>
          <div className="pt-2">
            <Link href="/san-pham">
              <Button className="rounded-full bg-[var(--color-brand-400)] px-6 py-2.5 text-sm font-semibold text-[var(--color-bg-page)] hover:bg-[var(--color-brand-300)]">
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product: any, idx: number) => (
          <motion.div
            key={product.id ?? idx}
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
