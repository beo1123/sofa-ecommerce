"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductList from "@/components/products/ProductList";
import ProductFilters, { formatColorLabel, resolveColorSwatch } from "@/components/products/ProductFilters";
import { X, ImageIcon, Sofa, AlertCircle, ArrowUpRight, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";
import { useProductsInfinite } from "@/hooks/products/useProductsInfinite";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency } from "@/lib/helpers";

type ProductsPageProps = {
  initialItems: any[];
  initialMeta: { page: number; perPage: number; total: number };
  initialParams: ProductQueryParams;
  categories: { name: string; slug: string; image?: string | null }[];
  filtersData: {
    materials: string[];
    colors: string[];
    priceMin: number;
    priceMax: number;
  };
};
export default function ProductsPageClient({
  initialItems,
  initialMeta,
  initialParams,
  categories,
  filtersData,
}: ProductsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const params = initialParams;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } = useProductsInfinite(params, {
    items: initialItems,
    meta: initialMeta,
  });

  const items = data?.pages ? data.pages.flatMap((p) => p.items) : initialItems;
  const totalCount = data?.pages?.[0]?.meta?.total ?? initialMeta.total;

  const currentFilters = {
    priceMin: params.priceMin !== undefined ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax !== undefined ? Number(params.priceMax) : undefined,
    color: params.color ?? "",
    material: params.material ?? "",
  };

  const activeFilterCount = [
    currentFilters.material,
    currentFilters.color,
    currentFilters.priceMin !== undefined || currentFilters.priceMax !== undefined ? "price" : "",
  ].filter(Boolean).length;

  const activeCategory = categories.find((category) => category.slug === params.category);
  const isInvalidCategory = Boolean(params.category && !activeCategory);

  const removeSingleFilter = (key: "material" | "color" | "price") => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("page");
    if (key === "price") {
      nextParams.delete("priceMin");
      nextParams.delete("priceMax");
    } else {
      nextParams.delete(key);
    }
    const query = nextParams.toString();
    router.push(query ? `/san-pham?${query}` : "/san-pham");
  };

  const clearAllFilters = () => {
    const nextParams = new URLSearchParams();
    if (activeCategory) {
      nextParams.set("category", activeCategory.slug);
    }
    const query = nextParams.toString();
    router.push(query ? `/san-pham?${query}` : "/san-pham");
  };

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isError) {
        fetchNextPage();
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  // Khóa cuộn trang & bắt phím Escape khi mở drawer bộ lọc trên mobile
  useEffect(() => {
    if (!showMobileFilter) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMobileFilter(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMobileFilter]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] rounded-2xl sm:rounded-3xl my-3 sm:my-6">
      <section className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-8">
        {/* BENTO EDITORIAL HERO HEADER */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          <div
            className="
              lg:col-span-8 rounded-2xl sm:rounded-3xl
              bg-gradient-to-br from-[var(--color-bg-page)] via-[var(--color-bg-page)] to-[var(--color-brand-50)]
              p-5 sm:p-7 lg:p-8
              ring-1 ring-[var(--color-brand-50)]
              shadow-[0_12px_36px_-16px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)]
              flex flex-col justify-between
            ">
            <div>
              <p className="mb-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-brand-300)]">
                Sofa Phạm Gia • Bộ sưu tập nội thất
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-brand-400)] leading-tight">
                {activeCategory ? activeCategory.name : "Bộ sưu tập sản phẩm"}
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm sm:text-base font-medium leading-relaxed text-[var(--color-text-muted)]">
                Khám phá những thiết kế sofa được tuyển chọn cho không gian sống tiện nghi, sang trọng và ấm cúng.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[var(--color-brand-400)]">
              <span className="px-3 py-1.5 rounded-full bg-[var(--color-bg-muted)] ring-1 ring-[var(--color-brand-50)]">
                {totalCount} mẫu thiết kế
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[var(--color-bg-muted)] ring-1 ring-[var(--color-brand-50)]">
                {categories.length} danh mục chuyên biệt
              </span>
            </div>
          </div>

          <div
            className="
              lg:col-span-4 rounded-2xl sm:rounded-3xl
              bg-[var(--color-brand-400)] text-[var(--color-bg-page)]
              p-5 sm:p-7 lg:p-8
              flex flex-col justify-between
              shadow-[0_12px_36px_-16px_color-mix(in_srgb,var(--color-brand-400)_25%,transparent)]
            ">
            <div className="space-y-1.5">
              <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[var(--color-brand-100)]">
                May đo theo không gian
              </span>
              <h2 className="text-lg sm:text-xl font-semibold leading-snug">
                Tùy chỉnh kích thước, chất liệu & màu sắc theo yêu cầu
              </h2>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-[var(--color-brand-50)] leading-relaxed">
              Mỗi sản phẩm đều có nhiều tùy chọn phiên bản chất liệu và bảng màu đa dạng trong kho dữ liệu.
            </p>
          </div>
        </header>

        {isInvalidCategory && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl ring-1 ring-[var(--color-brand-200)] bg-[var(--color-brand-50)] px-4 py-3.5 text-sm text-[var(--color-brand-400)]">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-[var(--color-brand-300)] flex-shrink-0" />
              <span>
                Danh mục <strong>“{params.category}”</strong> không tồn tại hoặc đã được thay đổi.
              </span>
            </div>
            <Link
              href="/san-pham"
              className="font-semibold text-[var(--color-brand-400)] underline hover:text-[var(--color-brand-300)]">
              Xem tất cả sản phẩm
            </Link>
          </div>
        )}

        {/* BENTO CATEGORY NAVIGATION SHOWCASE — Mobile/Tablet: Horizontal Snap Rail | Desktop: 5-col Bento Grid */}
        <section
          aria-labelledby="category-heading"
          className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-page)] p-4 sm:p-6 lg:p-7 ring-1 ring-[var(--color-brand-50)] shadow-[0_8px_30px_-12px_color-mix(in_srgb,var(--color-brand-400)_8%,transparent)] space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 border-b border-[var(--color-brand-50)] pb-3.5">
            <div>
              <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-300)] mb-0.5">
                Danh mục nội thất
              </span>
              <h2 id="category-heading" className="text-lg sm:text-2xl font-bold text-[var(--color-text-default)]">
                Khám phá theo danh mục
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--color-text-muted)]">
              Chọn danh mục để lọc chính xác dòng sofa phù hợp với phòng khách của bạn
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 p-1">
            {/* Thẻ "Tất cả sản phẩm" — Full-width (2 cột) trên Mobile/Tablet, 1 cột trên Desktop */}
            <Link
              href="/san-pham"
              aria-current={!params.category ? "page" : undefined}
              className={`col-span-2 lg:col-span-1 group relative flex min-h-[104px] sm:min-h-[124px] lg:min-h-[148px] flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-300)] ${
                !params.category
                  ? "bg-[var(--color-brand-400)] text-[var(--color-bg-page)] ring-2 ring-offset-2 ring-[var(--color-brand-400)] shadow-md"
                  : "bg-[var(--color-bg-muted)] text-[var(--color-text-default)] ring-1 ring-[var(--color-brand-100)] hover:ring-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)]/60"
              }`}>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                    !params.category
                      ? "bg-[var(--color-bg-page)]/15 text-[var(--color-bg-page)]"
                      : "bg-[var(--color-bg-page)] text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]"
                  }`}>
                  <Sofa size={18} strokeWidth={1.8} />
                </span>
                {!params.category && (
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-[var(--color-bg-page)]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-bg-page)]">
                    Đang xem
                  </span>
                )}
              </div>

              <div className="pt-2">
                <p className="text-sm sm:text-base font-bold leading-snug">Tất cả danh mục</p>
                <p
                  className={`mt-0.5 text-xs ${
                    !params.category ? "text-[var(--color-brand-50)]" : "text-[var(--color-text-muted)]"
                  }`}>
                  Toàn bộ thiết kế ({totalCount})
                </p>
              </div>
            </Link>

            {/* Các thẻ danh mục từ DB — Lưới 2x2 trên Mobile/Tablet, 4 cột tiếp theo trên Desktop */}
            {categories.map((category) => {
              const isActive = params.category === category.slug;
              return (
                <Link
                  key={category.slug}
                  href={`/san-pham?category=${encodeURIComponent(category.slug)}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex min-h-[124px] sm:min-h-[140px] lg:min-h-[148px] flex-col justify-between overflow-hidden rounded-2xl bg-[var(--color-brand-50)] transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-300)] ${
                    isActive
                      ? "ring-2 ring-offset-2 ring-[var(--color-brand-400)] shadow-md"
                      : "ring-1 ring-[var(--color-brand-100)] hover:ring-[var(--color-brand-300)]"
                  }`}>
                  {category.image ? (
                    <SafeImage
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-muted)] text-[var(--color-brand-300)]">
                      <ImageIcon size={28} strokeWidth={1.5} />
                    </span>
                  )}

                  {/* Lớp phủ tương phản ấm để ảnh nền trắng vẫn nổi bật rõ chữ */}
                  <span
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      isActive
                        ? "bg-gradient-to-t from-[var(--color-brand-400)]/90 via-[var(--color-brand-400)]/35 to-[var(--color-brand-400)]/10"
                        : "bg-gradient-to-t from-[var(--color-text-default)]/80 via-[var(--color-text-default)]/20 to-transparent group-hover:from-[var(--color-brand-400)]/85"
                    }`}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-1.5 p-2.5 sm:p-3">
                    {isActive ? (
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-[var(--color-bg-page)] px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-[var(--color-brand-400)] shadow-xs">
                        Đang chọn
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-page)]/85 text-[var(--color-brand-400)] backdrop-blur-xs transition-transform duration-300 group-hover:scale-110">
                      <ArrowUpRight size={13} />
                    </span>
                  </div>

                  <div className="relative z-10 p-2.5 sm:p-3.5 pt-0">
                    <p className="line-clamp-1 text-xs sm:text-base font-bold text-[var(--color-bg-page)] drop-shadow-xs">
                      {category.name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-[var(--color-brand-50)] line-clamp-1">
                      Khám phá ngay →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ASYMMETRIC SIDEBAR + PRODUCT GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <ProductFilters
                variant="sidebar"
                filtersData={filtersData}
                currentFilters={currentFilters}
                onClose={() => setShowMobileFilter(false)}
              />
            </div>
          </aside>

          <div className="flex flex-col w-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center justify-between w-full lg:w-auto gap-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Hiển thị <span className="font-semibold text-[var(--color-text-default)]">{totalCount}</span> sản phẩm
                  {activeCategory ? ` thuộc danh mục ${activeCategory.name}` : ""}
                </p>

                <button
                  type="button"
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-page)] px-3.5 py-2 text-xs font-bold text-[var(--color-text-default)] ring-1 ring-[var(--color-brand-100)] hover:ring-[var(--color-brand-300)] shadow-2xs cursor-pointer shrink-0">
                  <SlidersHorizontal size={14} className="text-[var(--color-brand-400)]" />
                  <span>Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-400)] text-[10px] font-bold text-[var(--color-bg-page)]">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {currentFilters.material && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-200)] px-3 py-1 text-xs font-medium text-[var(--color-text-default)]">
                      Chất liệu: {currentFilters.material}
                      <button
                        type="button"
                        onClick={() => removeSingleFilter("material")}
                        aria-label={`Bỏ lọc chất liệu ${currentFilters.material}`}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] cursor-pointer">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {currentFilters.color && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-200)] px-3 py-1 text-xs font-medium text-[var(--color-text-default)]">
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-[var(--color-brand-200)] flex-shrink-0"
                        style={{ backgroundColor: resolveColorSwatch(currentFilters.color) }}
                        aria-hidden="true"
                      />
                      Màu: {formatColorLabel(currentFilters.color)}
                      <button
                        type="button"
                        onClick={() => removeSingleFilter("color")}
                        aria-label={`Bỏ lọc màu ${formatColorLabel(currentFilters.color)}`}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] cursor-pointer">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {(currentFilters.priceMin !== undefined || currentFilters.priceMax !== undefined) && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-200)] px-3 py-1 text-xs font-medium text-[var(--color-text-default)]">
                      Giá: {formatCurrency(currentFilters.priceMin ?? filtersData.priceMin)} –{" "}
                      {formatCurrency(currentFilters.priceMax ?? filtersData.priceMax)}
                      <button
                        type="button"
                        onClick={() => removeSingleFilter("price")}
                        aria-label="Bỏ lọc khoảng giá"
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] cursor-pointer">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-[var(--color-brand-400)] underline hover:text-[var(--color-brand-300)] cursor-pointer">
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            <ProductList
              items={items}
              hasActiveFilters={activeFilterCount > 0 || isInvalidCategory}
              onClearFilters={clearAllFilters}
            />

            <div ref={loadMoreRef} className="py-10 flex flex-col items-center justify-center gap-3">
              {isFetchingNextPage && <Spinner size={30} />}
              {isError && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-[var(--color-brand-400)]">
                    Không thể tải thêm sản phẩm. Vui lòng thử lại.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => fetchNextPage()}>
                    Thử lại
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {!showMobileFilter && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden">
          <Button
            onClick={() => setShowMobileFilter(true)}
            className="rounded-full px-5 py-3 flex items-center gap-2 bg-[var(--color-brand-400)] hover:bg-[var(--color-brand-300)] text-[var(--color-bg-page)] shadow-lg ring-1 ring-[var(--color-bg-page)]/20"
            aria-label="Mở bộ lọc">
            <SlidersHorizontal size={16} />
            <span className="text-xs font-bold tracking-wide">Bộ lọc tìm kiếm</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-bg-page)] text-[11px] font-bold text-[var(--color-brand-400)]">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      )}

      <AnimatePresence>
        {showMobileFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilter(false)}
              className="fixed inset-0 bg-[var(--color-text-default)]/50 backdrop-blur-sm z-[60] lg:hidden"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-filter-heading"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-[90vw] max-w-[380px] bg-[var(--color-bg-page)] z-[70] lg:hidden flex flex-col overflow-hidden shadow-2xl border-l border-[var(--color-brand-50)]">
              <div className="shrink-0 bg-[var(--color-bg-muted)]/70 border-b border-[var(--color-brand-50)] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-bg-page)] text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)] shadow-2xs">
                    <SlidersHorizontal size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="mobile-filter-heading"
                      className="text-base font-bold text-[var(--color-text-default)] leading-tight">
                      Bộ lọc sản phẩm
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">Tinh chỉnh theo không gian</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileFilter(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-page)] hover:bg-[var(--color-brand-50)] text-[var(--color-text-default)] ring-1 ring-[var(--color-brand-50)] transition-colors cursor-pointer"
                  aria-label="Đóng bộ lọc">
                  <X size={18} />
                </button>
              </div>

              <ProductFilters
                variant="drawer"
                filtersData={filtersData}
                currentFilters={currentFilters}
                onClose={() => setShowMobileFilter(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
