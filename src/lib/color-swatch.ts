import type { ProductColorOption } from "@/lib/workshop-types";

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
  "xám đậm": "#4b5563",
  "xam dam": "#4b5563",
  "xám nhạt": "#d1d5db",
  "xam nhat": "#d1d5db",
  "xám bạc": "#b3b3b3",
  bạc: "#c0c0c0",
  silver: "#c0c0c0",
  kem: "var(--color-bg-muted)",
  cream: "var(--color-bg-muted)",
  "kem sữa": "#f3ece4",
  be: "var(--color-brand-50)",
  beige: "var(--color-brand-50)",
  "be cát": "#c1ae9f",
  nâu: "var(--color-brand-300)",
  nau: "var(--color-brand-300)",
  "nâu bò": "var(--color-brand-400)",
  "nâu đậm": "#57412c",
  "nâu espresso": "#57412c",
  espresso: "#57412c",
  socola: "#4a2c1d",
  chocolate: "#4a2c1d",
  "da bò": "var(--color-brand-200)",
  caramel: "#a68d77",
  brown: "var(--color-brand-300)",
  "xanh navy": "#1e3a5f",
  navy: "#1e3a5f",
  "xanh rêu": "#4a6741",
  "xanh lá": "#3b7a57",
  "xanh dương": "#2563eb",
  "xanh coban": "#1d4ed8",
  xanh: "#3b6e8c",
  blue: "#2563eb",
  green: "#3b7a57",
  olive: "#556b2f",
  "đỏ đô": "#8b0000",
  "do do": "#8b0000",
  "đỏ rượu": "#800020",
  đỏ: "#b91c1c",
  red: "#b91c1c",
  "vàng kem": "#f5e6c8",
  vàng: "#d4a017",
  yellow: "#d4a017",
  "hồng đất": "#c08081",
  hồng: "#db7093",
  pink: "#db7093",
  cam: "#d97706",
  orange: "#d97706",
  tím: "#6d28d9",
  purple: "#6d28d9",
};

const SORTED_COLOR_NAME_ENTRIES = Object.entries(COLOR_NAME_MAP).sort((a, b) => b[0].length - a[0].length);

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

/**
 * Chuẩn hóa mã màu HEX chịu lỗi nhập tay phổ biến trong DB / form admin:
 * - "##A66A42" / "###FFF" (dư dấu #) -> "#A66A42" / "#FFF"
 * - "A66A42" (thiếu dấu # ở mã 6 ký tự) -> "#A66A42"
 * - "#8200000" (nhập dư 1 ký tự thành 7 ký tự hex) -> "#820000"
 */
export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("#")) {
    const body = trimmed.replace(/^[#\s]+/, "").replace(/\s+/g, "");
    if (/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(body)) {
      return `#${body}`;
    }
    if (/^[0-9A-Fa-f]{7}$/.test(body)) {
      return `#${body.slice(0, 6)}`;
    }
    return null;
  }

  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return `#${trimmed}`;
  }

  return null;
}

/**
 * Chuyển đổi mã hex (3/4/6/8 ký tự) về dạng #rrggbb để dùng cho <input type="color">.
 */
export function toSixDigitHex(value: string): string | null {
  const normalized = normalizeHexColor(value);
  if (!normalized) return null;
  const body = normalized.slice(1);
  if (body.length === 3 || body.length === 4) {
    const [r, g, b] = body.slice(0, 3).split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (body.length === 6 || body.length === 8) {
    return `#${body.slice(0, 6)}`.toLowerCase();
  }
  return null;
}

export function isHexOrCssColor(value: string): boolean {
  const trimmed = value.trim();
  return normalizeHexColor(trimmed) !== null || /^(rgb|rgba|hsl|hsla)\(/i.test(trimmed);
}

export function isCssColorVariable(value: string): boolean {
  return /^var\(--[a-zA-Z0-9-_]+\)$/.test(value.trim());
}

/**
 * Trả về mã màu thực tế để tô màu cho chấm tròn (swatch) qua inline style:
 * - Nếu dữ liệu từ DB là mã hex (#8B5A2B, ##A66A42, #8200000, #FFFFFF...) hoặc rgb/hsl/var(--...) -> chuẩn hóa & giữ nguyên đúng màu thật.
 * - Nếu dữ liệu từ DB là tên màu tiếng Việt ("Kem", "Xám"...) -> ánh xạ sang biến CSS token / mã màu tương ứng.
 */
export function resolveColorSwatch(colorValue: string): string {
  const trimmed = colorValue.trim();
  if (!trimmed) return "var(--color-brand-200)";

  const normalizedHex = normalizeHexColor(trimmed);
  if (normalizedHex) {
    return normalizedHex;
  }

  if (/^(rgb|rgba|hsl|hsla)\(/i.test(trimmed) || isCssColorVariable(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.toLowerCase();
  if (COLOR_NAME_MAP[normalized]) {
    return COLOR_NAME_MAP[normalized];
  }

  for (const [key, token] of SORTED_COLOR_NAME_ENTRIES) {
    if (normalized.includes(key)) return token;
  }

  return "var(--color-brand-200)";
}

/**
 * Chuyển đổi mã màu hex (#8B5A2B...) sang tên màu tiếng Việt thân thiện để hiển thị tooltip / badge.
 */
export function formatColorLabel(colorValue: string): string {
  const trimmed = colorValue.trim();
  if (!trimmed) return "";

  const hexNormalized = normalizeHexColor(trimmed);
  const candidate = hexNormalized ?? trimmed;
  const lower = candidate.toLowerCase();
  if (HEX_COLOR_LABELS[lower]) {
    return HEX_COLOR_LABELS[lower];
  }

  const hexMatch = lower.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .slice(0, 3)
        .split("")
        .map((ch) => ch + ch)
        .join("");
    } else if (hex.length === 8) {
      hex = hex.slice(0, 6);
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
 * Kiểm tra màu nền sáng để đổi màu icon dấu tích (Check) bên trong chấm tròn.
 */
export function isLightColorSwatch(colorValue: string): boolean {
  const hexNormalized = normalizeHexColor(colorValue);
  const trimmed = (hexNormalized ?? colorValue).trim().toLowerCase();
  if (
    trimmed.includes("trắng") ||
    trimmed.includes("white") ||
    trimmed.includes("kem") ||
    trimmed.includes("be") ||
    trimmed === "var(--color-bg-page)" ||
    trimmed === "var(--color-bg-muted)" ||
    trimmed === "var(--color-brand-50)" ||
    trimmed === "#ffffff" ||
    trimmed === "#fff" ||
    trimmed === "#b3b3b3"
  ) {
    return true;
  }

  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .slice(0, 3)
        .split("")
        .map((ch) => ch + ch)
        .join("");
    } else if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65;
  }
  return false;
}

/**
 * Chuyển đổi giá trị màu lưu ở ProductVariant.attributes.color (ví dụ "#8B5A2B" hoặc "Kem")
 * sang chuẩn ProductColorOption giữ đúng mã màu thực tế để render bằng style={{ backgroundColor }}.
 */
export function normalizeLegacyColorOption(rawColor: string): ProductColorOption {
  const trimmed = rawColor.trim();
  const swatchColor = resolveColorSwatch(trimmed);
  const label = formatColorLabel(trimmed);
  return {
    name: label || trimmed,
    hex: swatchColor,
  };
}

/**
 * Khóa duy nhất để gom trùng màu giữa các biến thể / sản phẩm:
 * - Nếu là mã màu hex/rgb/hsl -> gom theo mã màu viết thường (#FFFFFF === #ffffff)
 *   nhưng vẫn giữ tách biệt 2 sắc độ khác nhau có cùng tên nhóm màu.
 * - Nếu dùng CSS variable / tên màu -> gom theo tên màu viết thường.
 */
export function getSwatchDedupeKey(swatch: ProductColorOption): string {
  const hex = swatch.hex.trim();
  if (isHexOrCssColor(hex)) {
    return hex.toLowerCase();
  }
  return swatch.name.trim().toLowerCase();
}

export function getSwatchFilterValue(swatch: ProductColorOption): string {
  const hex = swatch.hex.trim();
  if (isHexOrCssColor(hex)) {
    return hex.toLowerCase();
  }
  return swatch.name.trim();
}

export function isSwatchMatch(swatch: ProductColorOption, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  const normalized = trimmed.toLowerCase();
  if (isHexOrCssColor(normalized)) {
    return swatch.hex.trim().toLowerCase() === normalized;
  }
  return swatch.name.trim().toLowerCase() === normalized || swatch.hex.trim().toLowerCase() === normalized;
}
