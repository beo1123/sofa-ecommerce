import { buildAdminProductPayload, mapAdminProductToFormDefaults } from "../adminProductUtils";

describe("adminProductUtils", () => {
  it("includes dimensions and customization note in admin payload metadata", () => {
    const payload = buildAdminProductPayload({
      title: "Sofa 3 chỗ",
      slug: "sofa-3-cho",
      description: "<p>Mô tả</p>",
      status: "PUBLISHED",
      images: [],
      variants: [{ name: "Mẫu 1", price: 1000000 }],
      length: "2.5",
      width: "1.8",
      customizationNote: "Có thể tùy chỉnh theo nhu cầu",
    } as any);

    expect(payload.metadata).toEqual({
      length: "2.5",
      width: "1.8",
      customizationNote: "Có thể tùy chỉnh theo nhu cầu",
    });
  });

  it("maps product metadata back into form defaults", () => {
    const defaults = mapAdminProductToFormDefaults({
      id: 1,
      title: "Sofa",
      slug: "sofa",
      status: "PUBLISHED",
      metadata: {
        length: "2.4",
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
