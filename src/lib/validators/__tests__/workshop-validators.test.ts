import { slugifyVi, suggestWorkshopPrefix } from "@/lib/slug";
import { createInquirySchema } from "@/lib/validators/inquiry";
import { saveCouponSchema } from "@/lib/validators/coupon";
import { addDepositLogSchema, updateWorkshopStatusSchema } from "@/lib/validators/order";
import { parseMaterialOptions } from "@/lib/workshop-types";

describe("Workshop domain helpers & Zod validators", () => {
  it("slugifies Vietnamese text and suggests workshop prefixes by category", () => {
    expect(slugifyVi("Sofa Góc Chữ L Đóng Tại Xưởng TP.HCM")).toBe("sofa-goc-chu-l-dong-tai-xuong-tphcm");
    expect(suggestWorkshopPrefix("Sofa Góc Chữ L")).toBe("PGG-");
    expect(suggestWorkshopPrefix("Sofa Băng Hiện Đại")).toBe("PGB-");
    expect(suggestWorkshopPrefix("Sofa Giường Thông Minh")).toBe("PGD-");
  });

  it("validates consultation inquiry payload", () => {
    const valid = createInquirySchema.safeParse({
      name: "Anh Minh",
      phone: "0932 111 620",
      district: "Quận 7",
      budgetMin: 15_000_000,
      budgetMax: 25_000_000,
      source: "web",
    });
    expect(valid.success).toBe(true);

    const invalid = createInquirySchema.safeParse({
      name: "A",
      phone: "abc",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces conditional PERCENT vs FIXED coupon validation", () => {
    expect(
      saveCouponSchema.safeParse({
        code: "SOFA10",
        type: "PERCENT",
        percent: 10,
        active: true,
      }).success
    ).toBe(true);

    expect(
      saveCouponSchema.safeParse({
        code: "SOFA10",
        type: "PERCENT",
        active: true,
      }).success
    ).toBe(false);

    expect(
      saveCouponSchema.safeParse({
        code: "GIAM1TR",
        type: "FIXED",
        amount: 1_000_000,
        active: true,
      }).success
    ).toBe(true);
  });

  it("validates workshop order status and deposit log inputs", () => {
    expect(
      updateWorkshopStatusSchema.safeParse({
        orderId: 1,
        workshopStatus: "production",
      }).success
    ).toBe(true);

    expect(
      addDepositLogSchema.safeParse({
        orderId: 1,
        amount: -500,
      }).success
    ).toBe(false);
  });

  it("safely parses Product.materialOptions JSON", () => {
    const parsed = parseMaterialOptions([
      {
        label: "Da Microfiber Ý",
        priceDelta: 2_500_000,
        colors: [{ name: "Nâu da bò", hex: "#826851" }],
      },
      { label: "" },
      null,
    ]);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].label).toBe("Da Microfiber Ý");
    expect(parsed[0].colors[0].name).toBe("Nâu da bò");
  });
});
