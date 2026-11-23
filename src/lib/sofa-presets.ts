import type { ProductColorOption } from "@/lib/workshop-types";

export const DEFAULT_SWATCH_HEX = "#826851";

export const SOFA_COLOR_PRESETS: ProductColorOption[] = [
  { name: "Kem sữa", hex: "#e5ddda" },
  { name: "Be cát", hex: "#c1ae9f" },
  { name: "Nâu nhạt", hex: "#a68d77" },
  { name: "Nâu da bò", hex: "#826851" },
  { name: "Nâu espresso", hex: "#57412c" },
  { name: "Xám ghi", hex: "#6b7280" },
  { name: "Xám đậm", hex: "#374151" },
];

export interface DefaultVariantPreset {
  name: string;
  attributes: {
    color: string;
    material: string;
  };
}

export const DEFAULT_PRODUCT_VARIANTS: DefaultVariantPreset[] = [
  { name: "Vải", attributes: { color: "#F3EFE6", material: "Vải" } },
  { name: "Simili", attributes: { color: "#9A9DA1", material: "Simili" } },
  { name: "Da", attributes: { color: "#55585C", material: "Da" } },
];

export const DEFAULT_VARIANT_ATTRIBUTES_JSON = JSON.stringify(DEFAULT_PRODUCT_VARIANTS[0].attributes);
