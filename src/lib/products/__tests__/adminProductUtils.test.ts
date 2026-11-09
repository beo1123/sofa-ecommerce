import { buildAdminProductPayload, mapAdminProductToFormDefaults } from "../adminProductUtils";

describe("adminProductUtils", () => {
  it("includes dimensions and customization note in admin payload metadata and trims variant attributes", () => {
    const payload = buildAdminProductPayload({
      title: "Sofa 3 chỗ",
      slug: "sofa-3-cho",
      description: "<p>Mô tả</p>",
      status: "PUBLISHED",
      images: [],
      variants: [{ name: "Mẫu 1", price: 1000000, color: " Kem ", material: " Da bò " }],
      height: "2.5",
      width: "1.8",
      customizationNote: "Có thể tùy chỉnh theo nhu cầu",
    } as any);

    expect(payload.metadata).toEqual({
      height: "2.5",
      width: "1.8",
      customizationNote: "Có thể tùy chỉnh theo nhu cầu",
    });
    expect(payload.variants[0].attributes).toEqual({
      color: "Kem",
      material: "Da bò",
    });
  });

  it("maps product metadata back into form defaults", () => {
    const defaults = mapAdminProductToFormDefaults({
      id: 1,
      title: "Sofa",
      slug: "sofa",
      status: "PUBLISHED",
      metadata: {
        height: "2.4",
        width: "1.6",
        customizationNote: "Tùy chỉnh màu sắc",
      },
      images: [],
      variants: [],
    } as any);

    expect(defaults.height).toBe("2.4");
    expect(defaults.width).toBe("1.6");
    expect(defaults.customizationNote).toBe("Tùy chỉnh màu sắc");
  });
});
