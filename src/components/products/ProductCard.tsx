"use client";

import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";
import { formatColorLabel, resolveColorSwatch } from "@/components/products/ProductFilters";
import Text from "@/components/ui/Text";
import Heading from "@/components/ui/Heading";
import { SafeImage } from "../ui/SafeImage";

export type ProductCardProps = {
  product: {
    id?: string | number;
    slug: string;
    title: string;
    shortDescription?: string | null;
    priceMin: number | null;
    priceMax?: number | null;
    variantsCount?: number;
    category?: {
      name: string;
      slug: string;
      image?: string | null;
    } | null;
    primaryImage?: { url?: string; alt?: string | null } | null;
    variants?: {
      id: number;
      price: number;
      compareAtPrice?: number | null;
      skuPrefix?: string | null;
      image?: string | null;
      attributes?: Record<string, string>;
      inventory?: { sku: string; available?: number }[];
    }[];
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const routeLink = `/san-pham/${product.slug}`;

  const firstVariantWithCompare = product.variants?.find(
    (v) => v.compareAtPrice != null && product.priceMin != null && v.compareAtPrice > product.priceMin
  );
  const compareAtPrice = firstVariantWithCompare?.compareAtPrice ?? null;

  const discountPercent =
    compareAtPrice && product.priceMin && compareAtPrice > product.priceMin
      ? Math.round(((compareAtPrice - product.priceMin) / compareAtPrice) * 100)
      : null;

  // Lấy danh sách chất liệu & màu sắc thực tế từ ProductVariant.attributes
  const materials = Array.from(
    new Set((product.variants ?? []).map((v) => v.attributes?.material?.trim()).filter((m): m is string => Boolean(m)))
  ).slice(0, 2);

  const colors = Array.from(
    new Set((product.variants ?? []).map((v) => v.attributes?.color?.trim()).filter((c): c is string => Boolean(c)))
  ).slice(0, 5);

  return (
    <article
      className="
        group relative flex flex-col h-full rounded-3xl overflow-hidden
        bg-[var(--color-bg-page)]
        ring-1 ring-[var(--color-brand-50)]
        hover:ring-[var(--color-brand-200)]
        shadow-[0_8px_30px_-12px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)]
        hover:shadow-[0_20px_40px_-15px_color-mix(in_srgb,var(--color-brand-400)_20%,transparent)]
        transition-all duration-500 ease-out hover:-translate-y-1
      ">
      {/* VISUAL-FIRST IMAGE CONTAINER */}
      <Link
        href={routeLink}
        className="block relative w-full aspect-[4/3] overflow-hidden bg-[var(--color-bg-muted)] flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-300)]">
        {product.primaryImage?.url ? (
          <SafeImage
            src={product.primaryImage.url}
            alt={product.primaryImage.alt ?? product.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]">
            <div className="p-[var(--spacing-sm)] rounded-full bg-[var(--color-bg-page)]/80 mb-[var(--spacing-xs)]">
              <ImageIcon className="w-7 h-7 text-[var(--color-brand-200)]" />
            </div>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Chưa có ảnh</span>
          </div>
        )}

        {/* Ambient gradient overlay khi hover */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-[var(--color-brand-400)]/25 via-transparent to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-500
          "
        />

        {/* Top badges: Category (trái) & Discount (phải) */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          {product.category?.name ? (
            <span
              className="
                px-3 py-1 rounded-full text-xs font-medium
                bg-[var(--color-bg-page)]/90 backdrop-blur-md
                text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]
              ">
              {product.category.name}
            </span>
          ) : (
            <span />
          )}

          {discountPercent && discountPercent > 0 ? (
            <span
              className="
                px-2.5 py-1 rounded-full text-xs font-semibold
                bg-[var(--color-brand-400)] text-[var(--color-bg-page)]
              ">
              -{discountPercent}%
            </span>
          ) : null}
        </div>

        {/* Micro-interaction quick view icon on hover */}
        <span
          aria-hidden="true"
          className="
            absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full
            bg-[var(--color-bg-page)]/95 text-[var(--color-brand-400)]
            opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-300 shadow-sm
          ">
          <ArrowUpRight size={18} />
        </span>
      </Link>

      {/* MINIMALIST EDITORIAL CONTENT */}
      <div className="p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] flex flex-col flex-grow justify-between gap-[var(--spacing-sm)]">
        <div className="space-y-1.5">
          {(materials.length > 0 || colors.length > 0) && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              {materials.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {materials.map((mat) => (
                    <span
                      key={mat}
                      className="text-xs px-2 py-0.5 rounded-md bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]">
                      {mat}
                    </span>
                  ))}
                </div>
              )}

              {colors.length > 0 && (
                <div className="flex items-center gap-1" aria-label="Màu sắc có sẵn">
                  {colors.map((c) => (
                    <span
                      key={c}
                      title={formatColorLabel(c)}
                      style={{ backgroundColor: resolveColorSwatch(c) }}
                      className="h-3.5 w-3.5 rounded-full border border-[var(--color-brand-200)] shadow-2xs"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <Link href={routeLink} className="block focus-visible:outline-none">
            <Heading
              level={3}
              className="text-base sm:text-lg font-semibold line-clamp-2 text-[var(--color-text-default)] group-hover:text-[var(--color-brand-300)] transition-colors duration-300">
              {product.title}
            </Heading>
          </Link>

          {product.shortDescription && (
            <Text muted className="text-xs sm:text-sm line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </Text>
          )}
        </div>

        <div className="pt-[var(--spacing-sm)] border-t border-[var(--color-brand-50)]/60 flex items-baseline justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <Text className="text-base sm:text-lg font-bold text-[var(--color-brand-400)]">
              {formatCurrency(product.priceMin)}
            </Text>
            {compareAtPrice && (
              <span className="text-xs line-through text-[var(--color-text-muted)]">
                {formatCurrency(compareAtPrice)}
              </span>
            )}
          </div>

          {typeof product.variantsCount === "number" && product.variantsCount > 1 && (
            <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
              {product.variantsCount} phiên bản
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
