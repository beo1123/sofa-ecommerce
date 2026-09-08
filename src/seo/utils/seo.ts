import { SITE_URL } from "@/seo/config/site";

const CANONICAL_MAYBE_REMOVE = new Set([
  "page",
  "perPage",
  "sort",
  "filter",
  "color",
  "material",
  "priceMin",
  "priceMax",
  "category",
]);

export function normalizeSeoText(value?: string | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function buildCanonicalUrl(input: string, keepCategory = true): string {
  try {
    const target = input.startsWith("http") ? input : `${SITE_URL}${input.startsWith("/") ? input : `/${input}`}`;
    const url = new URL(target);

    const params = new URLSearchParams();
    const rawParams = new URLSearchParams(url.search);

    rawParams.forEach((value, key) => {
      if (CANONICAL_MAYBE_REMOVE.has(key) && key !== "category") {
        return;
      }

      if (keepCategory || key !== "category") {
        params.append(key, value);
      }
    });

    url.search = params.toString();
    url.hash = "";

    return url.toString();
  } catch {
    return input;
  }
}

export function buildProductTitle(name: string): string {
  const cleaned = normalizeSeoText(name);
  return cleaned ? `${cleaned} - Sofa Phạm Gia` : "Sản phẩm - Sofa Phạm Gia";
}

export function buildCategoryTitle(name: string): string {
  const cleaned = normalizeSeoText(name);
  return cleaned ? `${cleaned} | Sofa Phạm Gia` : "Sản phẩm | Sofa Phạm Gia";
}
