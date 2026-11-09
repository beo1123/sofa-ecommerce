"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import PriceRangeSlider from "@/components/ui/PriceRangeSlider";

type FiltersData = {
  materials: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
};

type Filters = {
  priceMin?: number;
  priceMax?: number;
  material?: string;
  color?: string;
};

const COLOR_NAME_MAP: Record<string, string> = {
  trắng: "var(--color-bg-page)",
  trang: "var(--color-bg-page)",
  white: "var(--color-bg-page)",
  đen: "var(--color-text-default)",
  den: "var(--color-text-default)",
  black: "var(--color-text-default)",
  xám: "var(--color-text-muted)",
  xam: "var(--color-text-muted)",
  ghi: "var(--color-text-muted)",
  gray: "var(--color-text-muted)",
  grey: "var(--color-text-muted)",
  kem: "var(--color-bg-muted)",
  cream: "var(--color-bg-muted)",
  be: "var(--color-brand-50)",
  beige: "var(--color-brand-50)",
  nâu: "var(--color-brand-300)",
  nau: "var(--color-brand-300)",
  "nâu bò": "var(--color-brand-400)",
  "da bò": "var(--color-brand-200)",
  brown: "var(--color-brand-300)",
};

const HEX_COLOR_LABELS: Record<string, string> = {
  "#ffffff": "Trắng",
  "#fff": "Trắng",
  "#fafafa": "Trắng kem",
  "#f5f5f5": "Trắng sứ",
  "#000000": "Đen",
  "#000": "Đen",
  "#0d0d0d": "Đen tuyền",
  "#111111": "Đen",
  "#1a1a1a": "Đen than",
  "#808080": "Xám đậm",
  "#666666": "Xám chì",
  "#b3b3b3": "Xám bạc",
  "#cccccc": "Xám sáng",
  "#d3d3d3": "Xám nhạt",
  "#8b5a2b": "Nâu da bò",
  "#8b4513": "Nâu gỗ",
  "#a0522d": "Nâu đất",
  "#57412c": "Nâu đậm",
  "#826851": "Nâu óc chó",
  "#a68d77": "Nâu caramel",
  "#c1ae9f": "Be trầm",
  "#e5ddda": "Kem be",
  "#8b0000": "Đỏ đô",
  "#800000": "Đỏ rượu",
};

export function isHexOrCssColor(value: string): boolean {
  const trimmed = value.trim();
  return (
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed) ||
    /^(rgb|rgba|hsl|hsla)\(/i.test(trimmed)
  );
}

/**
 * Trả về mã màu thực tế để tô màu cho chấm tròn (swatch):
 * - Nếu dữ liệu từ DB là mã hex (#8B5A2B, #FFFFFF...) -> giữ nguyên để hiển thị đúng màu thật.
 * - Nếu dữ liệu từ DB là tên màu tiếng Việt ("Kem", "Xám"...) -> ánh xạ sang biến CSS token.
 */
export function resolveColorSwatch(colorValue: string): string {
  const trimmed = colorValue.trim();
  if (isHexOrCssColor(trimmed)) {
    return trimmed;
  }
  const normalized = trimmed.toLowerCase();
  if (COLOR_NAME_MAP[normalized]) {
    return COLOR_NAME_MAP[normalized];
  }
  for (const [key, token] of Object.entries(COLOR_NAME_MAP)) {
    if (normalized.includes(key)) return token;
  }
  return "var(--color-brand-200)";
}

/**
 * Chuyển đổi mã màu hex (#8B5A2B...) sang tên màu tiếng Việt thân thiện để người dùng dễ hiểu.
 */
export function formatColorLabel(colorValue: string): string {
  const trimmed = colorValue.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (HEX_COLOR_LABELS[lower]) {
    return HEX_COLOR_LABELS[lower];
  }

  const hexMatch = lower.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

    if (l >= 0.92) return "Trắng";
    if (l <= 0.12) return "Đen";
    if (s <= 0.12) {
      if (l < 0.45) return "Xám đậm";
      if (l < 0.72) return "Xám ghi";
      return "Xám bạc";
    }

    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;

    if (h < 15 || h >= 345) return l < 0.4 ? "Đỏ đô" : "Đỏ";
    if (h >= 15 && h < 45) {
      if (l > 0.75) return "Kem be";
      return l < 0.38 ? "Nâu đậm" : "Nâu da bò";
    }
    if (h >= 45 && h < 70) return l > 0.75 ? "Kem sáng" : "Vàng kem";
    if (h >= 70 && h < 170) return "Xanh rêu";
    if (h >= 170 && h < 260) return l < 0.35 ? "Xanh navy" : "Xanh dương";
    return "Hồng đất";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Kiểm tra màu nền sáng để đổi màu icon dấu tích (Check) bên trong chấm tròn
 */
export function isLightColorSwatch(colorValue: string): boolean {
  const trimmed = colorValue.trim().toLowerCase();
  if (
    trimmed.includes("trắng") ||
    trimmed.includes("white") ||
    trimmed.includes("kem") ||
    trimmed.includes("be") ||
    trimmed === "#ffffff" ||
    trimmed === "#fff" ||
    trimmed === "#b3b3b3"
  ) {
    return true;
  }
  const hexMatch = trimmed.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65;
  }
  return false;
}

export function buildApplyFilterUrl(
  currentSearch: string,
  values: {
    material?: string;
    color?: string;
    priceRange?: [number, number];
    defaultMin?: number;
    defaultMax?: number;
    hasValidPriceBounds?: boolean;
  }
): string {
  const params = new URLSearchParams(currentSearch);
  params.delete("page");

  values.material ? params.set("material", values.material) : params.delete("material");
  values.color ? params.set("color", values.color) : params.delete("color");

  if (values.hasValidPriceBounds && values.priceRange) {
    const minBound = values.defaultMin ?? 0;
    const maxBound = values.defaultMax ?? 50000000;

    if (values.priceRange[0] > minBound) {
      params.set("priceMin", String(values.priceRange[0]));
    } else {
      params.delete("priceMin");
    }

    if (values.priceRange[1] < maxBound) {
      params.set("priceMax", String(values.priceRange[1]));
    } else {
      params.delete("priceMax");
    }
  }

  const query = params.toString();
  return query ? `/san-pham?${query}` : "/san-pham";
}

export function buildResetFilterUrl(currentSearch: string): string {
  const source = new URLSearchParams(currentSearch);
  const params = new URLSearchParams();
  const category = source.get("category");
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `/san-pham?${query}` : "/san-pham";
}

export default function ProductFilters({
  filtersData,
  currentFilters,
  onClose,
  variant = "sidebar",
}: {
  filtersData: FiltersData;
  currentFilters: Filters;
  onClose?: () => void;
  variant?: "sidebar" | "drawer";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasValidPriceBounds =
    Number.isFinite(filtersData.priceMin) &&
    Number.isFinite(filtersData.priceMax) &&
    filtersData.priceMax > filtersData.priceMin;

  const defaultMin = hasValidPriceBounds ? filtersData.priceMin : 0;
  const defaultMax = hasValidPriceBounds ? filtersData.priceMax : 50000000;

  const [material, setMaterial] = useState(currentFilters.material ?? "");
  const [color, setColor] = useState(currentFilters.color ?? "");
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentFilters.priceMin ?? defaultMin,
    currentFilters.priceMax ?? defaultMax,
  ]);

  const INITIAL_VISIBLE_MATERIALS = 6;
  const visibleMaterials = useMemo(() => {
    if (showAllMaterials || filtersData.materials.length <= INITIAL_VISIBLE_MATERIALS) {
      return filtersData.materials;
    }
    const sliced = filtersData.materials.slice(0, INITIAL_VISIBLE_MATERIALS);
    if (material && !sliced.includes(material) && filtersData.materials.includes(material)) {
      return [material, ...sliced.slice(0, INITIAL_VISIBLE_MATERIALS - 1)];
    }
    return sliced;
  }, [filtersData.materials, showAllMaterials, material]);

  const hiddenMaterialCount = Math.max(0, filtersData.materials.length - INITIAL_VISIBLE_MATERIALS);

  const INITIAL_VISIBLE_COLORS = 10; // 2 hàng x 5 cột gọn gàng, không bị tràn ngang
  const visibleColors = useMemo(() => {
    if (showAllColors || filtersData.colors.length <= INITIAL_VISIBLE_COLORS) {
      return filtersData.colors;
    }
    const sliced = filtersData.colors.slice(0, INITIAL_VISIBLE_COLORS);
    if (color && !sliced.includes(color) && filtersData.colors.includes(color)) {
      return [color, ...sliced.slice(0, INITIAL_VISIBLE_COLORS - 1)];
    }
    return sliced;
  }, [filtersData.colors, showAllColors, color]);

  const hiddenColorCount = Math.max(0, filtersData.colors.length - INITIAL_VISIBLE_COLORS);

  const isPriceModified = hasValidPriceBounds && (priceRange[0] > defaultMin || priceRange[1] < defaultMax);

  const selectedFilterCount = (material ? 1 : 0) + (color ? 1 : 0) + (isPriceModified ? 1 : 0);

  useEffect(() => {
    setMaterial(currentFilters.material ?? "");
    setColor(currentFilters.color ?? "");
    setPriceRange([currentFilters.priceMin ?? defaultMin, currentFilters.priceMax ?? defaultMax]);
  }, [
    currentFilters.material,
    currentFilters.color,
    currentFilters.priceMin,
    currentFilters.priceMax,
    defaultMin,
    defaultMax,
  ]);

  const handleApply = () => {
    const targetUrl = buildApplyFilterUrl(searchParams.toString(), {
      material,
      color,
      priceRange,
      defaultMin,
      defaultMax,
      hasValidPriceBounds,
    });
    onClose?.();
    router.push(targetUrl);
  };

  const handleReset = () => {
    setMaterial("");
    setColor("");
    setPriceRange([defaultMin, defaultMax]);
    const targetUrl = buildResetFilterUrl(searchParams.toString());
    onClose?.();
    router.push(targetUrl);
  };

  const isDrawer = variant === "drawer";

  return (
    <div
      className={
        isDrawer
          ? "flex flex-col flex-1 min-h-0 w-full"
          : "p-5 space-y-5 w-full bg-[var(--color-bg-page)] rounded-3xl ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_36px_-16px_color-mix(in_srgb,var(--color-brand-400)_12%,transparent)]"
      }>
      {/* HEADER (chỉ hiển thị trên Desktop Sidebar để không lặp tiêu đề với Mobile Drawer) */}
      {!isDrawer && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-brand-50)] pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]">
              <SlidersHorizontal size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[var(--color-text-default)] leading-tight">Bộ lọc sản phẩm</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">Tinh chỉnh theo không gian</p>
            </div>
          </div>

          {selectedFilterCount > 0 && (
            <span className="shrink-0 rounded-full bg-[var(--color-brand-400)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-bg-page)]">
              {selectedFilterCount}
            </span>
          )}
        </div>
      )}

      {/* FILTER SECTIONS CONTAINER (Scrollable inside Mobile Drawer, normal flow on Desktop) */}
      <div className={isDrawer ? "flex-1 overflow-y-auto p-5 space-y-5" : "space-y-5"}>
        {/* 1. CHẤT LIỆU — Tactile Bento Filter Pills */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Layers size={15} className="text-[var(--color-brand-300)] shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-default)]">
                Chất liệu
              </span>
            </div>

            {material && (
              <button
                type="button"
                onClick={() => setMaterial("")}
                className="text-xs font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors cursor-pointer">
                Bỏ chọn
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-[var(--color-bg-muted)]/75 p-3 ring-1 ring-[var(--color-brand-50)]">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMaterial("")}
                aria-pressed={material === ""}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  material === ""
                    ? "bg-[var(--color-brand-400)] text-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-400)] shadow-xs"
                    : "bg-[var(--color-bg-page)] text-[var(--color-text-default)] ring-1 ring-[var(--color-brand-100)] hover:ring-[var(--color-brand-300)]"
                }`}>
                <span>Tất cả</span>
              </button>

              {visibleMaterials.map((m) => {
                const isSelected = material === m;
                const formatted = m.charAt(0).toUpperCase() + m.slice(1);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMaterial(isSelected ? "" : m)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-brand-400)] text-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-400)] shadow-xs"
                        : "bg-[var(--color-bg-page)] text-[var(--color-text-default)] ring-1 ring-[var(--color-brand-100)] hover:ring-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)]/40"
                    }`}>
                    {isSelected && <Check size={12} strokeWidth={2.5} />}
                    <span>{formatted}</span>
                  </button>
                );
              })}
            </div>

            {hiddenMaterialCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllMaterials((prev) => !prev)}
                className="mt-2.5 pt-2 border-t border-[var(--color-brand-50)] w-full flex items-center justify-center gap-1 text-xs font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors cursor-pointer">
                {showAllMaterials ? (
                  <>
                    <span>Thu gọn chất liệu</span>
                    <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    <span>Xem thêm {hiddenMaterialCount} chất liệu</span>
                    <ChevronDown size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        {/* 2. MÀU SẮC — 5-Column Swatch Grid + Selected Preview Bar */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Palette size={15} className="text-[var(--color-brand-300)] shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-default)]">
                Bảng màu
              </span>
            </div>

            <button
              type="button"
              onClick={() => setColor("")}
              aria-pressed={color === ""}
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                color === ""
                  ? "bg-[var(--color-brand-400)] text-[var(--color-bg-page)]"
                  : "bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-100)]"
              }`}>
              Tất cả
            </button>
          </div>

          <div className="rounded-2xl bg-[var(--color-bg-muted)]/75 p-3 ring-1 ring-[var(--color-brand-50)] space-y-2.5">
            {color && (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--color-bg-page)] px-3 py-1.5 ring-1 ring-[var(--color-brand-50)]">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-[var(--color-brand-200)] shrink-0"
                    style={{ backgroundColor: resolveColorSwatch(color) }}
                  />
                  <span className="text-xs font-semibold text-[var(--color-text-default)] truncate">
                    {formatColorLabel(color)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setColor("")}
                  aria-label="Bỏ chọn màu"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] cursor-pointer">
                  <X size={13} />
                </button>
              </div>
            )}

            <div
              className={`grid grid-cols-5 gap-3 place-items-center p-2 ${
                showAllColors ? "max-h-44 overflow-y-auto" : ""
              }`}>
              {visibleColors.map((c) => {
                const isSelected = color === c;
                const swatchColor = resolveColorSwatch(c);
                const label = formatColorLabel(c);
                const isLight = isLightColorSwatch(c);

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(isSelected ? "" : c)}
                    aria-label={`Lọc theo màu ${label}`}
                    aria-pressed={isSelected}
                    title={label}
                    style={{ backgroundColor: swatchColor }}
                    className={`relative h-7 w-7 shrink-0 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer border border-[var(--color-brand-200)] shadow-2xs ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-offset-[var(--color-bg-muted)] ring-[var(--color-brand-400)] scale-105"
                        : "hover:scale-105 hover:ring-2 hover:ring-[var(--color-brand-200)]"
                    }`}>
                    {isSelected && (
                      <Check
                        size={13}
                        strokeWidth={3}
                        className={isLight ? "text-[var(--color-text-default)]" : "text-[var(--color-bg-page)]"}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {hiddenColorCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllColors((prev) => !prev)}
                className="pt-2 border-t border-[var(--color-brand-50)] w-full flex items-center justify-center gap-1 text-xs font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors cursor-pointer">
                {showAllColors ? (
                  <>
                    <span>Thu gọn bảng màu</span>
                    <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    <span>Xem thêm {hiddenColorCount} màu</span>
                    <ChevronDown size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        {/* 3. KHOẢNG GIÁ — Bento Range Card */}
        {hasValidPriceBounds && (
          <section className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Banknote size={15} className="text-[var(--color-brand-300)] shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-default)]">
                  Khoảng giá
                </span>
              </div>

              {isPriceModified && (
                <button
                  type="button"
                  onClick={() => setPriceRange([defaultMin, defaultMax])}
                  className="text-xs font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors cursor-pointer">
                  Mặc định
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-[var(--color-bg-muted)]/75 p-3 ring-1 ring-[var(--color-brand-50)]">
              <PriceRangeSlider
                min={defaultMin}
                max={defaultMax}
                step={100000}
                value={priceRange}
                onChange={setPriceRange}
              />
            </div>
          </section>
        )}
      </div>

      {/* 4. ACTION FOOTER — Nằm gọn trong luồng Flex của Drawer (không dùng fixed tràn ra ngoài) */}
      <div
        className={
          isDrawer
            ? "shrink-0 bg-[var(--color-bg-muted)]/60 px-5 py-4 border-t border-[var(--color-brand-50)] flex items-center gap-2.5"
            : "flex items-center gap-2.5 pt-2 border-t border-[var(--color-brand-50)]"
        }>
        <Button
          className="rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold shrink-0"
          size="sm"
          variant="outline"
          leftIcon={<RotateCcw size={14} />}
          onClick={handleReset}>
          Đặt lại
        </Button>
        <Button
          className="flex-1 justify-center rounded-2xl bg-[var(--color-brand-400)] py-2.5 text-xs sm:text-sm font-semibold text-[var(--color-bg-page)] hover:bg-[var(--color-brand-300)] shadow-sm"
          size="sm"
          onClick={handleApply}>
          Áp dụng{selectedFilterCount > 0 ? ` (${selectedFilterCount})` : ""}
        </Button>
      </div>
    </div>
  );
}
