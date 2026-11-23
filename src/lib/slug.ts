export function slugifyVi(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function suggestWorkshopPrefix(categoryName?: string | null): string {
  if (!categoryName) return "PG-";
  const normalized = slugifyVi(categoryName);
  if (normalized.includes("goc") || normalized.includes("chu-l")) return "PGG-";
  if (normalized.includes("bang") || normalized.includes("vang")) return "PGB-";
  if (normalized.includes("giuong") || normalized.includes("bed")) return "PGD-";
  if (normalized.includes("don") || normalized.includes("armchair")) return "PGA-";
  if (normalized.includes("ban") || normalized.includes("tra")) return "PGBT-";
  if (normalized.includes("don-ghe") || normalized.includes("ottoman")) return "PGO-";
  return "PG-";
}

const WORKSHOP_CODE_PATTERN = /\b(PG[A-Z]{0,4}-\d+[A-Z0-9-]*|PG[A-Z]{0,4}\d+[A-Z0-9-]*)\b/gi;

/**
 * Tự động tách mã xưởng bắt đầu bằng "PG" (VD: PGB-015, PGG-01, PG-12, PGB015) từ tên sản phẩm.
 * Ưu tiên mã xuất hiện ở cuối tên sản phẩm.
 */
export function extractWorkshopCodeFromTitle(title?: string | null): string | null {
  if (!title) return null;
  const matches = title.match(WORKSHOP_CODE_PATTERN);
  if (!matches || matches.length === 0) return null;
  return matches[matches.length - 1].toUpperCase();
}

/**
 * Ưu tiên mã xưởng đã lưu rõ ràng; nếu trống hoặc chỉ là tiền tố chưa hoàn chỉnh ("PGG-")
 * thì tự động tách từ tên sản phẩm.
 */
export function resolveWorkshopCode(workshopCode: string | null | undefined, title?: string | null): string | null {
  const trimmed = workshopCode?.trim();
  if (trimmed && !trimmed.endsWith("-")) {
    return trimmed.toUpperCase();
  }
  return extractWorkshopCodeFromTitle(title) ?? (trimmed ? trimmed.toUpperCase() : null);
}
