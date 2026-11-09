"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Star, Ruler, Palette, Layers, Sparkles, CheckCircle2, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/helpers";
import { formatColorLabel, isLightColorSwatch, resolveColorSwatch } from "@/components/products/ProductFilters";
import { PhoneIcon } from "../ui/Icon/PhoneIcon";
import { ZaloIcon } from "../ui/Icon/ZaloIcon";
import ProductPromotions from "./ProductPromotions";

type VariantAttributes = Record<string, string>;

interface InventoryItem {
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
}

interface ProductVariant {
  id: number;
  name: string;
  price: string;
  compareAtPrice: string | null;
  attributes: VariantAttributes;
  inventory: InventoryItem[];
}

interface Product {
  id: number;
  title: string;
  shortDescription?: string;
  description?: string;
  reviewsSummary?: { count?: number; average?: number } | null;
  metadata?: Record<string, unknown> | null;
  images?: { url: string }[];
  variants: ProductVariant[];
}

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
  onAddToCart?: () => void;
}

export function ProductInfo({ product, selectedVariant, onVariantChange }: ProductInfoProps) {
  // Build attribute list (unique values for each attribute key)
  const attributes: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const v of product.variants) {
      for (const key in v.attributes) {
        const val = v.attributes[key]?.trim();
        if (!val) continue;
        if (!map[key]) map[key] = [];
        if (!map[key].includes(val)) {
          map[key].push(val);
        }
      }
    }
    return map;
  }, [product.variants]);

  const [selectedAttributes, setSelectedAttributes] = useState<VariantAttributes>(selectedVariant?.attributes || {});

  useEffect(() => {
    if (selectedVariant?.attributes) {
      setSelectedAttributes(selectedVariant.attributes);
    }
  }, [selectedVariant]);

  const handleAttributeSelect = useCallback(
    (attrKey: string, value: string) => {
      const updated: VariantAttributes = { ...selectedAttributes, [attrKey]: value };
      const candidates = product.variants.filter((v) => v.attributes[attrKey]?.trim() === value);

      if (candidates.length === 0) {
        if (selectedVariant?.attributes) setSelectedAttributes(selectedVariant.attributes);
        return;
      }

      const exactMatch = candidates.find((v) =>
        Object.keys(updated).every((k) => updated[k] === undefined || v.attributes[k]?.trim() === updated[k]?.trim())
      );
      if (exactMatch) {
        setSelectedAttributes(exactMatch.attributes);
        if (exactMatch.id !== selectedVariant?.id) onVariantChange(exactMatch);
        return;
      }

      const score = (variant: ProductVariant) =>
        Object.keys(updated).reduce((s, k) => s + (variant.attributes[k]?.trim() === updated[k]?.trim() ? 1 : 0), 0);

      let best = candidates[0];
      let bestScore = score(best);

      for (let i = 1; i < candidates.length; i++) {
        const c = candidates[i];
        const s = score(c);
        if (s > bestScore) {
          best = c;
          bestScore = s;
        } else if (s === bestScore) {
          const bestAvailable = (best.inventory?.[0]?.available ?? 0) > 0 ? 1 : 0;
          const cAvailable = (c.inventory?.[0]?.available ?? 0) > 0 ? 1 : 0;
          if (cAvailable > bestAvailable) {
            best = c;
            bestScore = s;
          }
        }
      }

      setSelectedAttributes(best.attributes);
      if (best.id !== selectedVariant?.id) {
        onVariantChange(best);
      }
    },
    [product.variants, selectedAttributes, selectedVariant, onVariantChange]
  );

  const availableQty =
    selectedVariant?.inventory?.[0]?.available !== undefined ? selectedVariant.inventory[0].available : 0;

  const metadata = (product.metadata ?? {}) as Record<string, string | undefined>;
  const hasDimensions = Boolean(metadata.height || metadata.width);
  const hasCustomizationNote = Boolean(metadata.customizationNote);
  const heightText = metadata.height ?? "";
  const widthText = metadata.width ?? "";
  const colorOptions = attributes.color ?? [];
  const materialOptions = attributes.material ?? [];

  const currentPrice = selectedVariant?.price != null ? Number(selectedVariant.price) : null;
  const compareAtPrice = selectedVariant?.compareAtPrice != null ? Number(selectedVariant.compareAtPrice) : null;
  const hasDiscount = currentPrice != null && compareAtPrice != null && compareAtPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100) : 0;

  const reviewCount = Number(product.reviewsSummary?.count ?? 0);
  const reviewAverage = Number(product.reviewsSummary?.average ?? 0);

  const phone = process.env.NEXT_PUBLIC_PHONE_URL || "0932 111 620";

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-between gap-5 sm:gap-6">
      <div className="space-y-5 sm:space-y-6">
        {/* Header & Inventory Status */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]">
              <CheckCircle2 size={13} />
              {availableQty > 0 ? `Sẵn hàng (${availableQty} sản phẩm)` : "Đặt chế tác theo yêu cầu"}
            </span>
            {selectedVariant?.inventory?.[0]?.sku && (
              <span className="rounded-full bg-[var(--color-bg-muted)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                Mã: {selectedVariant.inventory[0].sku}
              </span>
            )}
            {reviewCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-400)]">
                <Star size={13} fill="var(--color-brand-300)" stroke="var(--color-brand-300)" />
                {reviewAverage.toFixed(1)} ({reviewCount} đánh giá)
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-text-default)] leading-snug">
            {product.title}
          </h1>
        </div>

        {/* Price Block */}
        <div className="rounded-2xl bg-[var(--color-bg-muted)] p-3.5 sm:p-4 ring-1 ring-[var(--color-brand-50)]">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
            Giá niêm yết
          </p>
          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
            <span className="font-bold text-[var(--color-brand-400)] text-2xl sm:text-3xl">
              {formatCurrency(currentPrice)}
            </span>

            {hasDiscount && (
              <>
                <span className="line-through text-[var(--color-text-muted)] text-sm sm:text-base">
                  {formatCurrency(compareAtPrice)}
                </span>
                <span className="rounded-full bg-[var(--color-brand-400)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-bg-page)]">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bento Specifications & Variant Selector */}
        {(hasDimensions || hasCustomizationNote || colorOptions.length > 0 || materialOptions.length > 0) && (
          <div className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)]/70 p-3.5 sm:p-5 ring-1 ring-[var(--color-brand-50)] space-y-3.5 sm:space-y-4">
            {/* Dimensions Bento Row */}
            {hasDimensions && (
              <div className="rounded-2xl bg-[var(--color-bg-page)] p-3.5 ring-1 ring-[var(--color-brand-50)]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)]">
                  <Ruler size={14} />
                  <span>Kích thước tiêu chuẩn</span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  {widthText && (
                    <div className="rounded-xl bg-[var(--color-bg-muted)] p-2.5 sm:p-3 ring-1 ring-[var(--color-brand-50)]">
                      <p className="text-xs text-[var(--color-text-muted)]">Chiều dài</p>
                      <p className="mt-0.5 text-sm sm:text-base font-bold text-[var(--color-text-default)]">
                        {widthText} m
                      </p>
                    </div>
                  )}
                  {heightText && (
                    <div className="rounded-xl bg-[var(--color-bg-muted)] p-2.5 sm:p-3 ring-1 ring-[var(--color-brand-50)]">
                      <p className="text-xs text-[var(--color-text-muted)]">Chiều sâu</p>
                      <p className="mt-0.5 text-sm sm:text-base font-bold text-[var(--color-text-default)]">
                        {heightText} m
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Color & Material Interactive Bento Cells */}
            {(colorOptions.length > 0 || materialOptions.length > 0) && (
              <div className="grid gap-3.5 grid-cols-1">
                {colorOptions.length > 0 && (
                  <div className="rounded-2xl bg-[var(--color-bg-page)] p-4 ring-1 ring-[var(--color-brand-50)]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-default)] whitespace-nowrap">
                        <Palette size={15} className="text-[var(--color-brand-300)] shrink-0" />
                        <span>Màu sắc</span>
                      </div>
                      {selectedAttributes.color && (
                        <span className="rounded-full bg-[var(--color-brand-50)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-brand-400)] whitespace-nowrap">
                          {formatColorLabel(selectedAttributes.color)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 rounded-xl bg-[var(--color-bg-muted)] p-3 ring-1 ring-[var(--color-brand-50)]">
                      <div className="flex flex-wrap items-center gap-3.5 max-h-32 overflow-y-auto p-1.5">
                        {colorOptions.map((color) => {
                          const isSelected = selectedAttributes.color?.trim() === color;
                          const label = formatColorLabel(color);
                          const isLight = isLightColorSwatch(color);
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleAttributeSelect("color", color)}
                              aria-label={`Chọn màu ${label}`}
                              aria-pressed={isSelected}
                              title={label}
                              style={{ backgroundColor: resolveColorSwatch(color) }}
                              className={`relative h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer border border-[var(--color-brand-200)] shadow-xs ${
                                isSelected
                                  ? "ring-2 ring-offset-2 ring-offset-[var(--color-bg-muted)] ring-[var(--color-brand-400)] scale-105"
                                  : "hover:scale-105 hover:ring-2 hover:ring-[var(--color-brand-200)]"
                              }`}>
                              {isSelected && (
                                <Check
                                  size={14}
                                  strokeWidth={3}
                                  className={
                                    isLight ? "text-[var(--color-text-default)]" : "text-[var(--color-bg-page)]"
                                  }
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {materialOptions.length > 0 && (
                  <div className="rounded-2xl bg-[var(--color-bg-page)] p-4 ring-1 ring-[var(--color-brand-50)]">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-default)]">
                      <Layers size={15} className="text-[var(--color-brand-300)] shrink-0" />
                      <span>Chất liệu</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {materialOptions.map((material) => {
                        const isSelected = selectedAttributes.material?.trim() === material;
                        return (
                          <button
                            key={material}
                            type="button"
                            onClick={() => handleAttributeSelect("material", material)}
                            aria-pressed={isSelected}
                            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[var(--color-brand-400)] text-[var(--color-bg-page)] shadow-sm ring-2 ring-[var(--color-brand-200)]"
                                : "bg-[var(--color-bg-muted)] text-[var(--color-text-default)] ring-1 ring-[var(--color-brand-100)] hover:ring-[var(--color-brand-300)]"
                            }`}>
                            {material}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customization Note */}
            <div className="rounded-2xl bg-[var(--color-bg-page)] p-3.5 ring-1 ring-[var(--color-brand-50)]">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)]">
                <Sparkles size={14} />
                <span>Tùy chỉnh theo không gian</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {hasCustomizationNote
                  ? metadata.customizationNote
                  : "Quý khách có thể tùy chỉnh màu sắc, chất liệu và kích thước theo yêu cầu riêng."}
              </p>
            </div>
          </div>
        )}
      </div>

      <ProductPromotions />

      {/* Contact / Consultation CTA */}
      <div className="space-y-2.5 sm:space-y-3 pt-1">
        <a
          href={`tel:${phone}`}
          className="w-full inline-flex items-center justify-center font-semibold transition-all bg-[var(--color-brand-50)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-100)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-300)] px-4 py-3 sm:py-3.5 text-sm sm:text-base lg:text-lg rounded-2xl ring-1 ring-[var(--color-brand-100)]">
          <span className="mr-2 shrink-0">
            <PhoneIcon />
          </span>
          <span>Gọi tư vấn: {phone}</span>
        </a>
        <Button
          fullWidth
          leftIcon={<ZaloIcon />}
          onClick={() => window.open(process.env.NEXT_PUBLIC_ZALO_URL, "_blank")}
          className="bg-[var(--color-brand-400)] hover:bg-[var(--color-brand-300)] text-[var(--color-bg-page)] py-3 sm:py-3.5 text-sm sm:text-base lg:text-lg font-semibold rounded-2xl shadow-sm">
          Nhắn Zalo Nhận Báo Giá & Mẫu Vải
        </Button>
      </div>
    </div>
  );
}
