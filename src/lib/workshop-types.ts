// Shared workshop domain constants, types, and JSON parsers.
// Safe to import in both Server and Client Components (no PrismaClient runtime import).

export const WORKSHOP_STATUSES = [
  "new",
  "deposited",
  "production",
  "shipping",
  "done",
  "warranty",
  "cancelled",
] as const;

export type WorkshopStatus = (typeof WORKSHOP_STATUSES)[number];

export const WORKSHOP_STATUS_LABELS: Record<WorkshopStatus, string> = {
  new: "Đơn mới",
  deposited: "Đã cọc",
  production: "Đang sản xuất",
  shipping: "Đang giao",
  done: "Hoàn thành",
  warranty: "Bảo hành",
  cancelled: "Đã hủy",
};

export const INQUIRY_STATUSES = ["new", "processing", "closed_won", "closed_lost"] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Mới",
  processing: "Đang tư vấn",
  closed_won: "Chốt đơn",
  closed_lost: "Không chốt",
};

export const INQUIRY_SOURCES = ["web", "zalo", "fb", "tiktok", "walk-in"] as const;

export type InquirySource = (typeof INQUIRY_SOURCES)[number];

export const INQUIRY_SOURCE_LABELS: Record<InquirySource, string> = {
  web: "Website",
  zalo: "Zalo",
  fb: "Facebook",
  tiktok: "TikTok",
  "walk-in": "Showroom",
};

export const SHIPMENT_STATUSES = ["scheduled", "delivering", "done", "failed"] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  scheduled: "Đã lên lịch",
  delivering: "Đang giao",
  done: "Đã giao",
  failed: "Giao thất bại",
};

export interface ProductColorOption {
  name: string;
  hex: string;
}

export interface ProductMaterialOption {
  label: string;
  priceDelta: number;
  colors: ProductColorOption[];
}

export function isWorkshopStatus(value: string): value is WorkshopStatus {
  return (WORKSHOP_STATUSES as readonly string[]).includes(value);
}

export function isInquiryStatus(value: string): value is InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(value);
}

export function isInquirySource(value: string): value is InquirySource {
  return (INQUIRY_SOURCES as readonly string[]).includes(value);
}

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value);
}

export function parseColorOptions(raw: unknown): ProductColorOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      name: typeof item.name === "string" ? item.name : "",
      hex: typeof item.hex === "string" ? item.hex : "#57412c",
    }))
    .filter((item) => item.name.length > 0);
}

export function parseMaterialOptions(raw: unknown): ProductMaterialOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      label: typeof item.label === "string" ? item.label : "",
      priceDelta: typeof item.priceDelta === "number" && Number.isFinite(item.priceDelta) ? item.priceDelta : 0,
      colors: parseColorOptions(item.colors),
    }))
    .filter((item) => item.label.length > 0);
}
