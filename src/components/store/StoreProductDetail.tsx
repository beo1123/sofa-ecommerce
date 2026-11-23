"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  IconArmchair,
  IconBrandWhatsapp,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconPhone,
  IconRuler2,
  IconShieldCheck,
  IconStar,
} from "@tabler/icons-react";
import Input from "@/components/ui/Input";
import StoreProductCard from "@/components/store/StoreProductCard";
import { formatDateVi, formatVnd } from "@/lib/format";
import { cmToMetersInput, formatDimensionsMeters } from "@/lib/dimensions";
import { formatColorLabel, getSwatchDedupeKey, isLightColorSwatch, resolveColorSwatch } from "@/lib/color-swatch";
import { formatDescriptionHtml } from "@/lib/html-content";
import type { ProductColorOption, ProductMaterialOption } from "@/lib/workshop-types";
import type { StoreProductCardItem } from "@/components/store/types";

export interface StoreProductDetailData {
  id: number;
  workshopCode: string | null;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  priceNote: string | null;
  defaultWidthCm: number | null;
  defaultDepthCm: number | null;
  defaultHeightCm: number | null;
  allowCustomSize: boolean;
  categoryName: string | null;
  categorySlug: string | null;
  minPrice: number | null;
  images: Array<{ id: number; url: string; alt: string | null; isPrimary: boolean }>;
  variants: Array<{
    id: number;
    name: string;
    price: number;
    compareAtPrice: number | null;
    material?: string | null;
    colorKey?: string | null;
  }>;
  materialOptions: ProductMaterialOption[];
  colorOptions: ProductColorOption[];
  reviews: Array<{
    id: number;
    rating: number;
    title: string | null;
    body: string | null;
    authorName: string;
    createdAt: string;
  }>;
}

interface StoreProductDetailProps {
  product: StoreProductDetailData;
  relatedProducts: StoreProductCardItem[];
}

const HOTLINE_TEL = "tel:0932111620";
const ZALO_URL = "https://zalo.me/0932111620";

function getWarrantyByMaterial(materialLabel?: string): {
  frame: string;
  surface: string;
  cushion: string;
} {
  const lower = (materialLabel ?? "").toLowerCase();
  if (lower.includes("da bò") || lower.includes("da that") || lower.includes("da thật")) {
    return { frame: "5 năm", surface: "5 năm (da bò thật)", cushion: "3 năm" };
  }
  if (lower.includes("microfiber") || lower.includes("da ý") || lower.includes("da y")) {
    return { frame: "5 năm", surface: "3 năm (da Microfiber)", cushion: "3 năm" };
  }
  if (lower.includes("vải") || lower.includes("vai") || lower.includes("nỉ") || lower.includes("bố")) {
    return { frame: "5 năm", surface: "2 năm (vải/nỉ chống bám)", cushion: "3 năm" };
  }
  return { frame: "5 năm", surface: "2 – 3 năm theo chất liệu", cushion: "3 năm" };
}

export default function StoreProductDetail({ product, relatedProducts }: StoreProductDetailProps) {
  // Gallery state
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Configurator state (dimensions edited in meters, DB stores integer cm)
  const [sizeMode, setSizeMode] = useState<"standard" | "custom">("standard");
  const [customWidth, setCustomWidth] = useState(cmToMetersInput(product.defaultWidthCm));
  const [customDepth, setCustomDepth] = useState(cmToMetersInput(product.defaultDepthCm));
  const [customHeight, setCustomHeight] = useState(cmToMetersInput(product.defaultHeightCm));
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);
  const [selectedColorKey, setSelectedColorKey] = useState<string>(() => {
    const firstMatColors = product.materialOptions[0]?.colors ?? [];
    if (firstMatColors.length > 0) return getSwatchDedupeKey(firstMatColors[0]);
    return product.colorOptions[0] ? getSwatchDedupeKey(product.colorOptions[0]) : "";
  });

  const selectedMaterial = product.materialOptions[selectedMaterialIdx] ?? null;

  const availableColors = useMemo<ProductColorOption[]>(() => {
    if (selectedMaterial && selectedMaterial.colors.length > 0) {
      return selectedMaterial.colors;
    }
    return product.colorOptions;
  }, [selectedMaterial, product.colorOptions]);

  const activeColor = useMemo(() => {
    return availableColors.find((c) => getSwatchDedupeKey(c) === selectedColorKey) ?? availableColors[0] ?? null;
  }, [availableColors, selectedColorKey]);

  const activeColorKey = activeColor ? getSwatchDedupeKey(activeColor) : "";
  const activeColorName = activeColor ? formatColorLabel(activeColor.name) : "";

  const activeVariant = useMemo(() => {
    if (product.variants.length === 0) return null;
    const matLabel = selectedMaterial?.label.trim().toLowerCase() ?? "";
    const colorKey = activeColorKey.trim().toLowerCase();

    const exact = product.variants.find((v) => {
      const vMat = (v.material ?? "").trim().toLowerCase();
      const vColor = (v.colorKey ?? "").trim().toLowerCase();
      return (!matLabel || vMat === matLabel) && (!colorKey || vColor === colorKey);
    });
    if (exact) return exact;

    if (matLabel) {
      const byMat = product.variants.find((v) => (v.material ?? "").trim().toLowerCase() === matLabel);
      if (byMat) return byMat;
    }

    if (colorKey) {
      const byColor = product.variants.find((v) => (v.colorKey ?? "").trim().toLowerCase() === colorKey);
      if (byColor) return byColor;
    }

    return product.variants[0] ?? null;
  }, [product.variants, selectedMaterial, activeColorKey]);

  const descriptionHtml = useMemo(() => formatDescriptionHtml(product.description), [product.description]);

  const estimatedPrice = useMemo(() => {
    const base = activeVariant?.price ?? product.minPrice;
    if (base === null) return null;
    const delta = selectedMaterial?.priceDelta ?? 0;
    return Math.max(0, base + delta);
  }, [activeVariant, product.minPrice, selectedMaterial]);

  const warranty = useMemo(() => getWarrantyByMaterial(selectedMaterial?.label), [selectedMaterial]);

  const defaultDimensionLabel = useMemo(() => {
    return (
      formatDimensionsMeters(product.defaultWidthCm, product.defaultDepthCm, product.defaultHeightCm) ??
      "Kích thước tiêu chuẩn xưởng"
    );
  }, [product.defaultWidthCm, product.defaultDepthCm, product.defaultHeightCm]);

  const avgRating = useMemo(() => {
    if (product.reviews.length === 0) return null;
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / product.reviews.length).toFixed(1);
  }, [product.reviews]);

  const consultQueryNote = useMemo(() => {
    const parts = [
      product.workshopCode ? `[${product.workshopCode}]` : "",
      product.title,
      sizeMode === "custom"
        ? `Kích thước riêng: ${customWidth || "?"}×${customDepth || "?"}×${customHeight || "?"} m`
        : `Kích thước: ${defaultDimensionLabel}`,
      selectedMaterial ? `Chất liệu: ${selectedMaterial.label}` : "",
      activeColorName ? `Màu: ${activeColorName}` : "",
    ].filter(Boolean);
    return parts.join(" · ");
  }, [
    product.workshopCode,
    product.title,
    sizeMode,
    customWidth,
    customDepth,
    customHeight,
    defaultDimensionLabel,
    selectedMaterial,
    activeColorName,
  ]);

  const images = product.images;
  const activeImage = images[activeImageIdx] ?? images[0] ?? null;

  return (
    <div className="py-6 lg:py-8 space-y-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
        <Link href="/" className="hover:text-brand-300">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/san-pham" className="hover:text-brand-300">
          Sản phẩm
        </Link>
        {product.categoryName && product.categorySlug && (
          <>
            <span>/</span>
            <Link href={`/san-pham?category=${product.categorySlug}`} className="hover:text-brand-300">
              {product.categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-medium text-brand-400">{product.title}</span>
      </nav>

      {/* Main 2-column grid: Left gallery + Right sticky panel */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* LEFT: Image gallery + Description */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px] border border-brand-100 bg-brand-50">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={activeImage.alt || product.title}
                  className="h-full w-full object-cover animate-fadeIn"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-brand-200">
                  <IconArmchair size={42} stroke={1.5} />
                  <span className="text-xs">Chưa có hình ảnh sản phẩm</span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Ảnh trước"
                    onClick={() => setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-100 bg-bg-page/90 text-brand-400 transition-colors hover:bg-bg-page cursor-pointer">
                    <IconChevronLeft size={18} stroke={1.75} />
                  </button>
                  <button
                    type="button"
                    aria-label="Ảnh tiếp theo"
                    onClick={() => setActiveImageIdx((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-100 bg-bg-page/90 text-brand-400 transition-colors hover:bg-bg-page cursor-pointer">
                    <IconChevronRight size={18} stroke={1.75} />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-[20px] bg-bg-page/90 px-2.5 py-1 text-xs font-medium text-brand-400">
                    {activeImageIdx + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`Xem ảnh ${idx + 1}`}
                    className={clsx(
                      "aspect-[4/3] overflow-hidden rounded-[8px] border bg-brand-50 transition-all cursor-pointer",
                      idx === activeImageIdx
                        ? "border-brand-400 ring-2 ring-brand-50"
                        : "border-brand-100 hover:border-brand-200 opacity-80 hover:opacity-100"
                    )}>
                    <img
                      src={img.url}
                      alt={img.alt || `${product.title} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Overview & Detailed Description */}
          {(product.shortDescription || descriptionHtml) && (
            <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-semibold text-brand-400">Thông tin chi tiết sản phẩm</h2>
              {product.shortDescription && (
                <p className="text-sm font-medium leading-relaxed text-text-default">{product.shortDescription}</p>
              )}
              {descriptionHtml && (
                <div
                  className={clsx(
                    "tiptap-editor-content max-w-none break-words text-sm leading-relaxed text-text-default",
                    "[&_h1]:mb-3 [&_h1]:mt-1 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:leading-snug [&_h1]:text-brand-400 sm:[&_h1]:text-2xl",
                    "[&_h2]:mb-2.5 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-brand-400",
                    "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-brand-400",
                    "[&_p]:my-2.5 [&_p]:leading-relaxed [&_p]:text-text-default",
                    "[&_strong]:font-semibold [&_strong]:text-brand-400",
                    "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
                    "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
                    "[&_li>p]:my-0.5",
                    "[&_blockquote]:my-4 [&_blockquote]:rounded-r-[8px] [&_blockquote]:border-l-4 [&_blockquote]:border-brand-300 [&_blockquote]:bg-bg-muted [&_blockquote]:px-4 [&_blockquote]:py-2.5 [&_blockquote]:italic [&_blockquote]:text-text-muted",
                    "[&_hr]:my-5 [&_hr]:border-brand-100",
                    "[&_a]:font-medium [&_a]:text-brand-300 [&_a]:underline hover:[&_a]:text-brand-400",
                    "[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[12px] [&_img]:border [&_img]:border-brand-100"
                  )}
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              )}
            </section>
          )}
        </div>

        {/* RIGHT: Sticky Workshop Panel */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:col-span-5">
          <div className="rounded-[12px] border border-brand-100 bg-bg-page p-5 sm:p-6 space-y-5">
            {/* Code + Title + Price */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {product.workshopCode ? (
                  <p className="text-xs font-medium text-text-muted">Mã xưởng: {product.workshopCode}</p>
                ) : (
                  <span className="text-xs text-text-muted">Xưởng Sofa Phạm Gia</span>
                )}

                {avgRating && (
                  <a
                    href="#danh-gia"
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-400">
                    <IconStar size={14} stroke={1.75} />
                    <span>
                      {avgRating} ({product.reviews.length} đánh giá)
                    </span>
                  </a>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-snug text-brand-400">{product.title}</h1>

              <div className="flex flex-wrap items-baseline gap-2.5 pt-1">
                <p className="text-xl font-bold text-brand-300">
                  {estimatedPrice !== null
                    ? product.materialOptions.length > 0 && selectedMaterial
                      ? formatVnd(estimatedPrice)
                      : `Giá từ ${formatVnd(estimatedPrice)}`
                    : "Liên hệ báo giá"}
                </p>
                {activeVariant?.compareAtPrice &&
                  estimatedPrice !== null &&
                  activeVariant.compareAtPrice > estimatedPrice && (
                    <span className="text-sm text-text-muted line-through">
                      {formatVnd(activeVariant.compareAtPrice)}
                    </span>
                  )}
              </div>
            </div>

            {/* Configurator */}
            <div className="space-y-4 rounded-[12px] border border-brand-100 bg-bg-muted p-4">
              {/* Size select: defaultWidth×Depth / custom toggle */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-400">
                    <IconRuler2 size={14} stroke={1.75} />
                    <span>Kích thước</span>
                  </span>
                  <span className="text-[11px] text-text-muted">{defaultDimensionLabel}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSizeMode("standard")}
                    className={clsx(
                      "rounded-[8px] border px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer",
                      sizeMode === "standard"
                        ? "border-brand-400 bg-brand-50 text-brand-400"
                        : "border-brand-100 bg-bg-page text-text-default hover:border-brand-200"
                    )}>
                    <p className="font-semibold">Tiêu chuẩn</p>
                    <p className="mt-0.5 text-[11px] text-text-muted truncate">{defaultDimensionLabel}</p>
                  </button>

                  <button
                    type="button"
                    disabled={!product.allowCustomSize}
                    onClick={() => setSizeMode("custom")}
                    className={clsx(
                      "rounded-[8px] border px-3 py-2 text-left text-xs font-medium transition-colors",
                      !product.allowCustomSize
                        ? "border-brand-100/60 bg-bg-page/50 text-text-muted/60 cursor-not-allowed"
                        : sizeMode === "custom"
                          ? "border-brand-400 bg-brand-50 text-brand-400 cursor-pointer"
                          : "border-brand-100 bg-bg-page text-text-default hover:border-brand-200 cursor-pointer"
                    )}>
                    <p className="font-semibold">Đặt riêng</p>
                    <p className="mt-0.5 text-[11px] text-text-muted">
                      {product.allowCustomSize ? "Theo diện tích phòng" : "Chỉ có size chuẩn"}
                    </p>
                  </button>
                </div>

                {sizeMode === "custom" && product.allowCustomSize && (
                  <div className="mt-3 grid grid-cols-3 gap-2 animate-fadeIn">
                    <Input
                      label="Dài (m)"
                      type="number"
                      step="0.05"
                      min={0.6}
                      max={6}
                      inputSize="sm"
                      fullWidth
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      placeholder="2.6"
                    />
                    <Input
                      label="Sâu (m)"
                      type="number"
                      step="0.05"
                      min={0.5}
                      max={3}
                      inputSize="sm"
                      fullWidth
                      value={customDepth}
                      onChange={(e) => setCustomDepth(e.target.value)}
                      placeholder="0.9"
                    />
                    <Input
                      label="Cao (m)"
                      type="number"
                      step="0.05"
                      min={0.4}
                      max={1.5}
                      inputSize="sm"
                      fullWidth
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      placeholder="0.85"
                    />
                  </div>
                )}
              </div>

              {/* Material select */}
              {product.materialOptions.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-brand-400 mb-2">
                    Chất liệu bọc
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.materialOptions.map((mat, idx) => {
                      const active = idx === selectedMaterialIdx;
                      return (
                        <button
                          key={mat.label}
                          type="button"
                          onClick={() => setSelectedMaterialIdx(idx)}
                          className={clsx(
                            "rounded-[8px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                            active
                              ? "border-brand-400 bg-brand-400 text-white"
                              : "border-brand-100 bg-bg-page text-text-default hover:border-brand-300"
                          )}>
                          <span>{mat.label}</span>
                          {mat.priceDelta !== 0 && (
                            <span className="ml-1 opacity-85">
                              ({mat.priceDelta > 0 ? "+" : ""}
                              {formatVnd(mat.priceDelta)})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color swatch row */}
              {availableColors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-400">Màu sắc</span>
                    <span className="text-xs font-medium text-brand-300">{activeColorName}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((swatch) => {
                      const key = getSwatchDedupeKey(swatch);
                      const active = key === activeColorKey;
                      const swatchBg = resolveColorSwatch(swatch.hex);
                      const label = formatColorLabel(swatch.name);
                      const isLight = isLightColorSwatch(swatchBg) || isLightColorSwatch(swatch.name);
                      return (
                        <button
                          key={key}
                          type="button"
                          title={label}
                          aria-label={`Chọn màu ${label}`}
                          aria-pressed={active}
                          onClick={() => setSelectedColorKey(key)}
                          className={clsx(
                            "flex h-8 w-8 items-center justify-center rounded-full border transition-transform hover:scale-105 cursor-pointer focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50",
                            active ? "border-brand-400 ring-2 ring-brand-300 ring-offset-2" : "border-brand-200"
                          )}
                          style={{ backgroundColor: swatchBg }}>
                          {active && (
                            <IconCheck size={14} stroke={2.5} className={isLight ? "text-brand-400" : "text-white"} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Price note */}
            <p className="text-xs italic text-text-muted">
              * {product.priceNote || "Giá cuối phụ thuộc kích thước và chất liệu thực tế."}
            </p>

            {/* Primary CTAs */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-brand-400 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-300 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
                <IconBrandWhatsapp size={18} stroke={1.75} />
                <span>Nhắn tư vấn Zalo</span>
              </a>

              <a
                href={HOTLINE_TEL}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-brand-300 bg-bg-page px-4 text-sm font-semibold text-brand-400 transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
                <IconPhone size={18} stroke={1.75} />
                <span>Gọi Mr. Giang</span>
              </a>
            </div>

            <div className="text-center">
              <Link
                href={`/lien-he?note=${encodeURIComponent(consultQueryNote)}`}
                className="text-xs font-medium text-brand-300 underline-offset-4 hover:text-brand-400 hover:underline">
                Gửi yêu cầu báo giá chi tiết theo cấu hình vừa chọn →
              </Link>
            </div>

            {/* Warranty mini-table */}
            <div className="overflow-hidden rounded-[12px] border border-brand-100">
              <div className="flex items-center gap-1.5 border-b border-brand-100 bg-bg-muted px-3.5 py-2.5 text-xs font-semibold text-brand-400">
                <IconShieldCheck size={15} stroke={1.75} />
                <span>Chính sách bảo hành tại xưởng</span>
              </div>
              <table className="w-full border-collapse text-xs">
                <tbody className="divide-y divide-brand-100/70">
                  <tr>
                    <td className="bg-bg-muted/40 px-3.5 py-2 font-medium text-text-muted">Khung gỗ tự nhiên</td>
                    <td className="px-3.5 py-2 text-right font-semibold text-brand-400">{warranty.frame}</td>
                  </tr>
                  <tr>
                    <td className="bg-bg-muted/40 px-3.5 py-2 font-medium text-text-muted">Bề mặt da / vải</td>
                    <td className="px-3.5 py-2 text-right font-semibold text-brand-400">{warranty.surface}</td>
                  </tr>
                  <tr>
                    <td className="bg-bg-muted/40 px-3.5 py-2 font-medium text-text-muted">Đệm mút & lò xo</td>
                    <td className="px-3.5 py-2 text-right font-semibold text-brand-400">{warranty.cushion}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deposit note */}
            <p className="text-sm leading-relaxed text-text-muted">
              Đặt cọc 30% khi chốt kích thước và mẫu da/vải tại xưởng; thanh toán 70% còn lại sau khi kiểm tra & giao
              lắp hoàn thiện tận nhà tại TP.HCM.
            </p>
          </div>
        </aside>
      </div>

      {/* BELOW FOLD 1: Approved Reviews */}
      <section id="danh-gia" className="rounded-[12px] border border-brand-100 bg-bg-page p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-brand-400">Đánh giá từ khách hàng ({product.reviews.length})</h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Trải nghiệm thực tế của khách hàng đã đặt đóng mẫu sofa này tại Sofa Phạm Gia.
            </p>
          </div>

          {avgRating && (
            <div className="flex items-center gap-2 rounded-[12px] border border-brand-100 bg-bg-muted px-4 py-2">
              <span className="text-xl font-bold text-brand-400">{avgRating}</span>
              <div className="text-xs text-text-muted">
                <p className="font-semibold text-amber-700">★★★★★</p>
                <p>{product.reviews.length} đánh giá</p>
              </div>
            </div>
          )}
        </div>

        {product.reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">Chưa có đánh giá công khai cho sản phẩm này.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {product.reviews.map((rev) => (
              <article key={rev.id} className="rounded-[12px] border border-brand-100 bg-bg-muted p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-brand-400">{rev.authorName}</span>
                  <span className="text-xs text-text-muted">{formatDateVi(rev.createdAt)}</span>
                </div>
                <p className="text-xs font-semibold text-amber-700">
                  {"★".repeat(Math.max(1, Math.min(5, rev.rating)))}
                  {"☆".repeat(Math.max(0, 5 - rev.rating))} ({rev.rating}/5)
                </p>
                {rev.title && <p className="text-sm font-semibold text-text-default">{rev.title}</p>}
                {rev.body && <p className="text-xs leading-relaxed text-text-muted">{rev.body}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* BELOW FOLD 2: Related products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-brand-400">Mẫu sofa tương tự tại xưởng</h2>
            <Link
              href={product.categorySlug ? `/san-pham?category=${product.categorySlug}` : "/san-pham"}
              className="text-xs font-medium text-brand-300 hover:text-brand-400 hover:underline">
              Xem thêm →
            </Link>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {relatedProducts.map((rel) => (
              <StoreProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
