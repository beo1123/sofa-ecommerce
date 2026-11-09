import { buildApplyFilterUrl, buildResetFilterUrl, formatColorLabel, resolveColorSwatch } from "../ProductFilters";

describe("ProductFilters URL & swatch helpers", () => {
  it("TC-08: preserves category, applies selected material/color/price, and removes page param", () => {
    const url = buildApplyFilterUrl("category=sofa-bang&page=3", {
      material: "Da bò",
      color: "Kem",
      priceRange: [8000000, 20000000],
      defaultMin: 5000000,
      defaultMax: 25000000,
      hasValidPriceBounds: true,
    });

    expect(url).toContain("category=sofa-bang");
    expect(url).toContain("material=Da+b%C3%B2");
    expect(url).toContain("color=Kem");
    expect(url).toContain("priceMin=8000000");
    expect(url).toContain("priceMax=20000000");
    expect(url).not.toContain("page=");
  });

  it("omits priceMin and priceMax when slider stays at default bounds", () => {
    const url = buildApplyFilterUrl("category=sofa-goc&priceMin=8000000", {
      material: "",
      color: "",
      priceRange: [5000000, 25000000],
      defaultMin: 5000000,
      defaultMax: 25000000,
      hasValidPriceBounds: true,
    });

    expect(url).toBe("/san-pham?category=sofa-goc");
  });

  it("TC-09: resets material, color, and price filters while preserving active category", () => {
    const url = buildResetFilterUrl("category=sofa-bang&material=Da&color=Kem&priceMin=10000000&page=2");
    expect(url).toBe("/san-pham?category=sofa-bang");

    const allUrl = buildResetFilterUrl("material=Da&color=Kem");
    expect(allUrl).toBe("/san-pham");
  });

  it("maps Vietnamese color names to design tokens and preserves DB hex codes in resolveColorSwatch", () => {
    expect(resolveColorSwatch("Xám")).toBe("var(--color-text-muted)");
    expect(resolveColorSwatch("Kem")).toBe("var(--color-bg-muted)");
    expect(resolveColorSwatch("Da bò")).toBe("var(--color-brand-200)");
    expect(resolveColorSwatch("Đen")).toBe("var(--color-text-default)");
    expect(resolveColorSwatch("#8B5A2B")).toBe("#8B5A2B");
    expect(resolveColorSwatch("#FFFFFF")).toBe("#FFFFFF");
  });

  it("formats raw hex color codes into human-friendly Vietnamese labels", () => {
    expect(formatColorLabel("#8B5A2B")).toBe("Nâu da bò");
    expect(formatColorLabel("#FFFFFF")).toBe("Trắng");
    expect(formatColorLabel("#0D0D0D")).toBe("Đen tuyền");
    expect(formatColorLabel("#8b0000")).toBe("Đỏ đô");
  });
});
