import {
  formatColorLabel,
  getSwatchDedupeKey,
  getSwatchFilterValue,
  isLightColorSwatch,
  isSwatchMatch,
  normalizeHexColor,
  normalizeLegacyColorOption,
  resolveColorSwatch,
  toSixDigitHex,
} from "@/lib/color-swatch";
import { StorefrontService } from "@/services/storefront.service";

describe("color-swatch utilities", () => {
  it("normalizes common admin hex typos (double #, missing #, 7-digit typo) into valid CSS colors", () => {
    expect(normalizeHexColor("##A66A42")).toBe("#A66A42");
    expect(normalizeHexColor("##A65E36")).toBe("#A65E36");
    expect(normalizeHexColor("#8200000")).toBe("#820000");
    expect(normalizeHexColor("F3EFE6")).toBe("#F3EFE6");
    expect(resolveColorSwatch("##A66A42")).toBe("#A66A42");
    expect(resolveColorSwatch("#8200000")).toBe("#820000");
    expect(formatColorLabel("#8200000")).toBe("Đỏ đô");
    expect(toSixDigitHex("##A66A42")).toBe("#a66a42");
    expect(toSixDigitHex("#fff")).toBe("#ffffff");
  });

  it("preserves real hex/css colors from DB attributes instead of falling back to brown", () => {
    expect(normalizeLegacyColorOption("#FFFFFF")).toEqual({ name: "Trắng", hex: "#FFFFFF" });
    expect(normalizeLegacyColorOption("#0D0D0D")).toEqual({ name: "Đen tuyền", hex: "#0D0D0D" });
    expect(normalizeLegacyColorOption("#B3B3B3")).toEqual({ name: "Xám bạc", hex: "#B3B3B3" });
    expect(normalizeLegacyColorOption("#1E3A5F")).toEqual({ name: "Xanh navy", hex: "#1E3A5F" });
    expect(normalizeLegacyColorOption("#8B0000")).toEqual({ name: "Đỏ đô", hex: "#8B0000" });
  });

  it("maps Vietnamese color names to CSS tokens or realistic swatches", () => {
    expect(resolveColorSwatch("Trắng")).toBe("var(--color-bg-page)");
    expect(resolveColorSwatch("Đen")).toBe("var(--color-text-default)");
    expect(resolveColorSwatch("Xám")).toBe("var(--color-text-muted)");
    expect(resolveColorSwatch("Kem")).toBe("var(--color-bg-muted)");
    expect(resolveColorSwatch("Xanh rêu")).toBe("#4a6741");
    expect(resolveColorSwatch("Đỏ đô")).toBe("#8b0000");
  });

  it("detects light vs dark swatches accurately for check icon contrast", () => {
    expect(isLightColorSwatch("#FFFFFF")).toBe(true);
    expect(isLightColorSwatch("#fff")).toBe(true);
    expect(isLightColorSwatch("#F5F5F5")).toBe(true);
    expect(isLightColorSwatch("var(--color-bg-page)")).toBe(true);
    expect(isLightColorSwatch("var(--color-bg-muted)")).toBe(true);
    expect(isLightColorSwatch("#0D0D0D")).toBe(false);
    expect(isLightColorSwatch("#57412C")).toBe(false);
    expect(isLightColorSwatch("#1E3A5F")).toBe(false);
  });

  it("deduplicates same hex regardless of casing while keeping distinct shades separate", () => {
    const whiteUpper = normalizeLegacyColorOption("#FFFFFF");
    const whiteLower = normalizeLegacyColorOption("#ffffff");
    const brown1 = normalizeLegacyColorOption("#8B5A2B");
    const brown2 = normalizeLegacyColorOption("#7C4F28");

    expect(getSwatchDedupeKey(whiteUpper)).toBe(getSwatchDedupeKey(whiteLower));
    expect(getSwatchDedupeKey(brown1)).not.toBe(getSwatchDedupeKey(brown2));
    expect(isSwatchMatch(brown1, getSwatchFilterValue(brown1))).toBe(true);
    expect(isSwatchMatch(brown2, getSwatchFilterValue(brown1))).toBe(false);
    expect(formatColorLabel("#8B5A2B")).toBe("Nâu da bò");
  });
});

describe("StorefrontService color resolution", () => {
  it("loads actual hex codes from legacy variant attributes.color in published catalog", async () => {
    const mockDb = {
      category: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            workshopCode: "PGB-001",
            title: "Sofa băng hiện đại",
            slug: "sofa-bang-hien-dai",
            category: { name: "Sofa băng", slug: "sofa-bang" },
            images: [],
            materialOptions: [],
            colorOptions: [],
            allowCustomSize: true,
            createdAt: new Date("2026-01-01T00:00:00Z"),
            variants: [
              { price: 9500000, attributes: { color: "#FFFFFF", material: "Da Ý" } },
              { price: 9500000, attributes: { color: "#0D0D0D", material: "Da Ý" } },
              { price: 9500000, attributes: { color: "#ffffff", material: "Da Ý" } },
              { price: 9500000, attributes: { color: "#1E3A5F", material: "Vải nỉ" } },
            ],
          },
        ]),
      },
    } as any;

    const service = new StorefrontService(mockDb);
    const catalog = await service.getPublishedCatalog();

    expect(catalog.allColors).toEqual([
      { name: "Trắng", hex: "#FFFFFF" },
      { name: "Đen tuyền", hex: "#0D0D0D" },
      { name: "Xanh navy", hex: "#1E3A5F" },
    ]);
    expect(catalog.products[0].colorOptions).toEqual(catalog.allColors);
  });
});
