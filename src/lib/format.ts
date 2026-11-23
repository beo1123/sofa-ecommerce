const VI_CURRENCY = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const VI_NUMBER = new Intl.NumberFormat("vi-VN");

const VI_DATE = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

const VI_DATETIME = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value !== null && typeof value === "object" && "toNumber" in value) {
    const fn = (value as { toNumber?: unknown }).toNumber;
    if (typeof fn === "function") {
      const parsed = fn.call(value);
      return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
    }
  }
  return 0;
}

export function formatVnd(value: unknown): string {
  return VI_CURRENCY.format(toNumber(value));
}

export function formatNumberVi(value: unknown): string {
  return VI_NUMBER.format(toNumber(value));
}

export function formatVndCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}tỷ`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
  }
  if (abs >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return String(Math.round(value));
}

export function formatDateVi(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return VI_DATE.format(date);
}

export function formatDateTimeVi(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return VI_DATETIME.format(date);
}

export function formatDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
