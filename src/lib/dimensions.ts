/**
 * Chuyển đổi đơn vị kích thước giữa mét (m - hiển thị & nhập liệu trên UI)
 * và centimet (cm - lưu dạng số nguyên Int trong PostgreSQL).
 */

export function cmToMetersInput(cm: number | null | undefined): string {
  if (cm === null || cm === undefined || !Number.isFinite(cm) || cm <= 0) return "";
  return Number((cm / 100).toFixed(2)).toString();
}

export function metersInputToCm(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) return null;
  const meters = Number(normalized);
  if (!Number.isFinite(meters) || meters <= 0) return null;
  const cm = Math.round(meters * 100);
  return cm > 0 ? cm : null;
}

/**
 * Chuẩn hóa số đo legacy lưu trong Product.metadata (ví dụ "2.4" hoặc "2,4" mét, hoặc "240" cm) sang cm.
 */
export function parseLegacyDimensionToCm(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return raw <= 20 ? Math.round(raw * 100) : Math.round(raw);
  }
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(",", ".")
    .replace(/\s*(cm|m)\s*$/i, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0) return null;
  if (/cm\s*$/i.test(raw.trim())) return Math.round(num);
  if (/m\s*$/i.test(raw.trim())) return Math.round(num * 100);
  return num <= 20 ? Math.round(num * 100) : Math.round(num);
}

export function formatDimensionsMeters(
  widthCm: number | null | undefined,
  depthCm: number | null | undefined,
  heightCm: number | null | undefined
): string | null {
  const w = cmToMetersInput(widthCm);
  const d = cmToMetersInput(depthCm);
  const h = cmToMetersInput(heightCm);

  if (!w && !d && !h) return null;
  if (w && d && h) return `${w} × ${d} × ${h} m`;
  if (w && d) return `${w} × ${d} m`;
  return `${w || "—"} × ${d || "—"} × ${h || "—"} m`;
}
