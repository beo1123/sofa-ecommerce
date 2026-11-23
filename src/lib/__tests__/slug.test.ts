import { extractWorkshopCodeFromTitle, resolveWorkshopCode, slugifyVi, suggestWorkshopPrefix } from "@/lib/slug";

describe("slug & workshop code helpers", () => {
  it("extracts PG workshop codes from the end of product titles", () => {
    expect(extractWorkshopCodeFromTitle("Sofa Băng Đầu Bật Đôi PGB-015")).toBe("PGB-015");
    expect(extractWorkshopCodeFromTitle("Sofa băng da hiện đại PGB-001")).toBe("PGB-001");
    expect(extractWorkshopCodeFromTitle("Sofa góc chữ L bọc da Microfiber Ý PGG-01")).toBe("PGG-01");
    expect(extractWorkshopCodeFromTitle("Sofa Giường Thông Minh PGD-05")).toBe("PGD-05");
    expect(extractWorkshopCodeFromTitle("Sofa Băng Gia Đình pg-103")).toBe("PG-103");
    expect(extractWorkshopCodeFromTitle("Sofa Băng PGB015")).toBe("PGB015");
    expect(extractWorkshopCodeFromTitle("Sofa Phòng Khách Hiện Đại")).toBeNull();
  });

  it("resolves explicit workshop code first and falls back to title extraction", () => {
    expect(resolveWorkshopCode("PGG-09", "Sofa Băng PGB-015")).toBe("PGG-09");
    expect(resolveWorkshopCode(null, "Sofa Băng Đầu Bật Đôi PGB-015")).toBe("PGB-015");
    expect(resolveWorkshopCode("", "Sofa băng da hiện đại PGB-001")).toBe("PGB-001");
    expect(resolveWorkshopCode("PGB-", "Sofa Băng Đầu Bật Đôi PGB-015")).toBe("PGB-015");
  });

  it("slugifies Vietnamese product names and suggests workshop prefixes", () => {
    expect(slugifyVi("Sofa Băng Đầu Bật Đôi PGB-015")).toBe("sofa-bang-dau-bat-doi-pgb-015");
    expect(suggestWorkshopPrefix("Sofa Góc Chữ L")).toBe("PGG-");
    expect(suggestWorkshopPrefix("Sofa Băng")).toBe("PGB-");
  });
});
