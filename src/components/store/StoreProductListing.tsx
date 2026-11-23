"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  IconAdjustmentsHorizontal,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconFilterOff,
  IconX,
} from "@tabler/icons-react";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import StoreProductCard from "@/components/store/StoreProductCard";
import { formatVnd, formatVndCompact } from "@/lib/format";
import {
  formatColorLabel,
  getSwatchDedupeKey,
  getSwatchFilterValue,
  isLightColorSwatch,
  isSwatchMatch,
  resolveColorSwatch,
} from "@/lib/color-swatch";
import type { ProductColorOption } from "@/lib/workshop-types";
import type { StoreCategoryFilterItem, StoreProductCardItem } from "@/components/store/types";

export type StoreSortKey = "newest" | "price_asc" | "price_desc";

interface StoreProductListingProps {
  products: StoreProductCardItem[];
  categories: StoreCategoryFilterItem[];
  allMaterials: string[];
  allColors: ProductColorOption[];
  priceBounds: { min: number; max: number };
  initialFilters: {
    category: string;
    material: string;
    color: string;
    priceMin: number;
    priceMax: number;
    sort: StoreSortKey;
  };
}

const SORT_OPTIONS: Array<{ value: StoreSortKey; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
];

export default function StoreProductListing({
  products,
  categories,
  allMaterials,
  allColors,
  priceBounds,
  initialFilters,
}: StoreProductListingProps) {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category);
  const [selectedMaterial, setSelectedMaterial] = useState(initialFilters.material);
  const [selectedColor, setSelectedColor] = useState(initialFilters.color);
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin);
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax);
  const [sort, setSort] = useState<StoreSortKey>(initialFilters.sort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  const INITIAL_VISIBLE_COLORS = 15;

  const visibleColors = useMemo(() => {
    if (showAllColors || allColors.length <= INITIAL_VISIBLE_COLORS) {
      return allColors;
    }
    const sliced = allColors.slice(0, INITIAL_VISIBLE_COLORS);
    if (selectedColor && !sliced.some((c) => isSwatchMatch(c, selectedColor))) {
      const matched = allColors.find((c) => isSwatchMatch(c, selectedColor));
      if (matched) {
        return [matched, ...sliced.slice(0, INITIAL_VISIBLE_COLORS - 1)];
      }
    }
    return sliced;
  }, [allColors, showAllColors, selectedColor]);

  const hiddenColorCount = Math.max(0, allColors.length - INITIAL_VISIBLE_COLORS);

  const activeColorObj = useMemo(
    () => (selectedColor ? (allColors.find((c) => isSwatchMatch(c, selectedColor)) ?? null) : null),
    [allColors, selectedColor]
  );

  const activeColorLabel = activeColorObj ? formatColorLabel(activeColorObj.name) : formatColorLabel(selectedColor);
  const activeColorBg = activeColorObj ? resolveColorSwatch(activeColorObj.hex) : resolveColorSwatch(selectedColor);

  const stepSize = useMemo(() => {
    const span = priceBounds.max - priceBounds.min;
    return span > 20_000_000 ? 1_000_000 : 500_000;
  }, [priceBounds]);

  const syncUrl = (next: {
    category: string;
    material: string;
    color: string;
    priceMin: number;
    priceMax: number;
    sort: StoreSortKey;
  }) => {
    const params = new URLSearchParams();
    if (next.category) params.set("category", next.category);
    if (next.material) params.set("material", next.material);
    if (next.color) params.set("color", next.color);
    if (next.priceMin > priceBounds.min) {
      params.set("priceMin", String(next.priceMin));
    }
    if (next.priceMax < priceBounds.max) {
      params.set("priceMax", String(next.priceMax));
    }
    if (next.sort !== "newest") params.set("sort", next.sort);

    const qs = params.toString();
    router.replace(qs ? `/san-pham?${qs}` : "/san-pham", { scroll: false });
  };

  const applyFilter = (
    patch: Partial<{
      category: string;
      material: string;
      color: string;
      priceMin: number;
      priceMax: number;
      sort: StoreSortKey;
    }>
  ) => {
    const next = {
      category: patch.category ?? selectedCategory,
      material: patch.material ?? selectedMaterial,
      color: patch.color ?? selectedColor,
      priceMin: patch.priceMin ?? priceMin,
      priceMax: patch.priceMax ?? priceMax,
      sort: patch.sort ?? sort,
    };
    setSelectedCategory(next.category);
    setSelectedMaterial(next.material);
    setSelectedColor(next.color);
    setPriceMin(next.priceMin);
    setPriceMax(next.priceMax);
    setSort(next.sort);
    syncUrl(next);
  };

  const resetFilters = () => {
    applyFilter({
      category: "",
      material: "",
      color: "",
      priceMin: priceBounds.min,
      priceMax: priceBounds.max,
      sort: "newest",
    });
  };

  const filteredProducts = useMemo(() => {
    const matQuery = selectedMaterial.toLowerCase();
    const hasPriceFilter = priceMin > priceBounds.min || priceMax < priceBounds.max;

    const list = products.filter((p) => {
      if (selectedCategory && p.categorySlug !== selectedCategory) return false;

      if (matQuery) {
        const hasMat = p.materialOptions.some((m) => m.label.toLowerCase() === matQuery);
        if (!hasMat) return false;
      }

      if (selectedColor) {
        const hasColor = p.colorOptions.some((c) => isSwatchMatch(c, selectedColor));
        if (!hasColor) return false;
      }

      if (hasPriceFilter) {
        if (p.minPrice === null) return false;
        if (p.minPrice < priceMin || p.minPrice > priceMax) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "price_asc") {
        return (a.minPrice ?? Number.MAX_SAFE_INTEGER) - (b.minPrice ?? Number.MAX_SAFE_INTEGER);
      }
      if (sort === "price_desc") {
        return (b.minPrice ?? -1) - (a.minPrice ?? -1);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, selectedMaterial, selectedColor, priceMin, priceMax, priceBounds, sort]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const hasActiveFilters = Boolean(
    selectedCategory || selectedMaterial || selectedColor || priceMin > priceBounds.min || priceMax < priceBounds.max
  );

  const filterSidebarContent = (
    <div className="space-y-6">
      {/* 1. Category */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Danh mục Sofa</h3>
        <ul className="mt-2.5 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => applyFilter({ category: "" })}
              className={clsx(
                "flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-sm transition-colors cursor-pointer",
                selectedCategory === ""
                  ? "bg-brand-50 font-semibold text-brand-400"
                  : "text-text-default hover:bg-brand-50/60 hover:text-brand-400"
              )}>
              <span>Tất cả sản phẩm</span>
              <span className="text-xs text-text-muted">{products.length}</span>
            </button>
          </li>
          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => applyFilter({ category: active ? "" : cat.slug })}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-sm transition-colors cursor-pointer",
                    active
                      ? "bg-brand-50 font-semibold text-brand-400"
                      : "text-text-default hover:bg-brand-50/60 hover:text-brand-400"
                  )}>
                  <span className="truncate">{cat.name}</span>
                  <span className="text-xs text-text-muted">{cat.productCount}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2. Material from materialOptions JSON */}
      {allMaterials.length > 0 && (
        <div className="border-t border-brand-100 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Chất liệu bọc</h3>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {allMaterials.map((mat) => {
              const active = selectedMaterial === mat;
              return (
                <button
                  key={mat}
                  type="button"
                  onClick={() => applyFilter({ material: active ? "" : mat })}
                  className={clsx(
                    "rounded-[20px] border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                    active
                      ? "border-brand-400 bg-brand-400 text-white"
                      : "border-brand-100 bg-bg-page text-text-default hover:border-brand-300"
                  )}>
                  {mat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Color swatch picker */}
      {allColors.length > 0 && (
        <div className="border-t border-brand-100 pt-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Màu sắc</h3>
            {selectedColor && (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-brand-300">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-brand-200"
                  style={{ backgroundColor: activeColorBg }}
                />
                <span className="truncate">{activeColorLabel}</span>
              </span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2.5">
            {visibleColors.map((swatch) => {
              const active = isSwatchMatch(swatch, selectedColor);
              const swatchBg = resolveColorSwatch(swatch.hex);
              const label = formatColorLabel(swatch.name);
              const isLight = isLightColorSwatch(swatchBg) || isLightColorSwatch(swatch.name);
              return (
                <button
                  key={getSwatchDedupeKey(swatch)}
                  type="button"
                  title={label}
                  aria-label={`Chọn màu ${label}`}
                  aria-pressed={active}
                  onClick={() => applyFilter({ color: active ? "" : getSwatchFilterValue(swatch) })}
                  className={clsx(
                    "relative flex h-7 w-7 items-center justify-center rounded-full border transition-transform hover:scale-105 cursor-pointer focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50",
                    active ? "border-brand-400 ring-2 ring-brand-300 ring-offset-2" : "border-brand-200"
                  )}
                  style={{ backgroundColor: swatchBg }}>
                  {active && <IconCheck size={14} stroke={2.5} className={isLight ? "text-brand-400" : "text-white"} />}
                </button>
              );
            })}
          </div>

          {hiddenColorCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllColors((prev) => !prev)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-[8px] border border-brand-100 bg-bg-page py-1.5 text-xs font-medium text-brand-400 transition-colors hover:border-brand-200 hover:bg-brand-50/60 cursor-pointer">
              {showAllColors ? (
                <>
                  <span>Thu gọn bảng màu</span>
                  <IconChevronUp size={14} stroke={1.75} />
                </>
              ) : (
                <>
                  <span>Xem thêm {hiddenColorCount} màu</span>
                  <IconChevronDown size={14} stroke={1.75} />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 4. Price range slider */}
      {priceBounds.max > priceBounds.min && (
        <div className="border-t border-brand-100 pt-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Khoảng giá</h3>

          <div className="flex items-center justify-between text-xs font-semibold text-brand-300">
            <span>{formatVndCompact(priceMin)}</span>
            <span>–</span>
            <span>{formatVndCompact(priceMax)}</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label htmlFor="filter-price-min" className="block text-[11px] text-text-muted mb-1">
                Từ: {formatVnd(priceMin)}
              </label>
              <input
                id="filter-price-min"
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={stepSize}
                value={priceMin}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), priceMax);
                  applyFilter({ priceMin: val });
                }}
                className="w-full accent-brand-400 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="filter-price-max" className="block text-[11px] text-text-muted mb-1">
                Đến: {formatVnd(priceMax)}
              </label>
              <input
                id="filter-price-max"
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={stepSize}
                value={priceMax}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), priceMin);
                  applyFilter({ priceMax: val });
                }}
                className="w-full accent-brand-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reset button */}
      {hasActiveFilters && (
        <div className="border-t border-brand-100 pt-4">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<IconFilterOff size={15} stroke={1.75} />}
            onClick={resetFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="py-6 lg:py-8">
      {/* Breadcrumb + Heading */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-brand-100 pb-5">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-muted">
            <Link href="/" className="hover:text-brand-300">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-brand-300">
              Sản phẩm
            </Link>
            {activeCategoryObj && (
              <>
                <span>/</span>
                <span className="font-medium text-brand-400">{activeCategoryObj.name}</span>
              </>
            )}
          </nav>

          <h1 className="mt-2 text-2xl font-bold text-brand-400 sm:text-3xl">
            {activeCategoryObj ? activeCategoryObj.name : "Bộ sưu tập Sofa Phạm Gia"}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Sản xuất trực tiếp tại xưởng TP.HCM — Tùy chỉnh kích thước, chất liệu da/vải và màu sắc theo phòng khách.
          </p>
        </div>

        <Link
          href="/lien-he"
          className="inline-flex h-10 items-center rounded-[8px] border border-brand-300 bg-bg-page px-4 text-sm font-medium text-brand-400 transition-colors hover:bg-brand-50">
          Đặt đóng kích thước riêng
        </Link>
      </div>

      {/* Main layout: 240px filter sidebar + grid */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Desktop 240px sidebar */}
        <aside className="hidden w-[240px] shrink-0 rounded-[12px] border border-brand-100 bg-bg-muted p-4 lg:block">
          {filterSidebarContent}
        </aside>

        {/* Right product catalog area */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Toolbar: count + mobile filter btn + sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-brand-100 bg-bg-muted px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-brand-200 bg-bg-page px-3 text-xs font-medium text-brand-400 lg:hidden cursor-pointer">
                <IconAdjustmentsHorizontal size={15} stroke={1.75} />
                <span>Bộ lọc</span>
              </button>

              <p className="text-xs text-text-muted">
                Tìm thấy <span className="font-semibold text-brand-400">{filteredProducts.length}</span> mẫu sofa
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted hidden sm:inline">Sắp xếp:</span>
              <div className="w-44">
                <Select
                  aria-label="Sắp xếp sản phẩm"
                  value={sort}
                  onChange={(e) => applyFilter({ sort: e.target.value as StoreSortKey })}
                  selectSize="sm"
                  fullWidth
                  options={SORT_OPTIONS}
                />
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeCategoryObj && (
                <button
                  type="button"
                  onClick={() => applyFilter({ category: "" })}
                  className="inline-flex items-center gap-1 rounded-[20px] bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-400 cursor-pointer">
                  <span>Danh mục: {activeCategoryObj.name}</span>
                  <IconX size={13} stroke={1.75} />
                </button>
              )}
              {selectedMaterial && (
                <button
                  type="button"
                  onClick={() => applyFilter({ material: "" })}
                  className="inline-flex items-center gap-1 rounded-[20px] bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-400 cursor-pointer">
                  <span>Chất liệu: {selectedMaterial}</span>
                  <IconX size={13} stroke={1.75} />
                </button>
              )}
              {selectedColor && (
                <button
                  type="button"
                  onClick={() => applyFilter({ color: "" })}
                  className="inline-flex items-center gap-1.5 rounded-[20px] bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-400 cursor-pointer">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-brand-200"
                    style={{ backgroundColor: activeColorBg }}
                  />
                  <span>Màu: {activeColorLabel}</span>
                  <IconX size={13} stroke={1.75} />
                </button>
              )}
              {(priceMin > priceBounds.min || priceMax < priceBounds.max) && (
                <button
                  type="button"
                  onClick={() =>
                    applyFilter({
                      priceMin: priceBounds.min,
                      priceMax: priceBounds.max,
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-[20px] bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-400 cursor-pointer">
                  <span>
                    Giá: {formatVndCompact(priceMin)} – {formatVndCompact(priceMax)}
                  </span>
                  <IconX size={13} stroke={1.75} />
                </button>
              )}
            </div>
          )}

          {/* Product Grid: auto-fill minmax 220px */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-[12px] border border-brand-100 bg-bg-muted px-6 py-16 text-center space-y-3">
              <p className="text-base font-semibold text-brand-400">Không tìm thấy mẫu sofa phù hợp bộ lọc</p>
              <p className="mx-auto max-w-md text-xs text-text-muted">
                Bạn có thể xóa bộ lọc để xem toàn bộ sản phẩm, hoặc gửi kích thước & mẫu mong muốn để xưởng Sofa Phạm
                Gia báo giá trực tiếp.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
                <Link
                  href="/lien-he"
                  className="inline-flex h-8 items-center rounded-[8px] bg-brand-400 px-3.5 text-sm font-medium text-white hover:bg-brand-300">
                  Nhận tư vấn đặt đóng
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {filteredProducts.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        side="left"
        widthClassName="w-[300px]"
        title="Lọc sản phẩm"
        subtitle={`${filteredProducts.length} mẫu phù hợp`}>
        {filterSidebarContent}
      </Drawer>
    </div>
  );
}
