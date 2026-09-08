import {
  generatePageMetadata,
  generateProductMetadata,
  generateCategoryMetadata,
} from "@/seo/generators/generateMetadata";
import { buildCanonicalUrl } from "@/seo/utils/seo";

describe("SEO generators", () => {
  it("builds product metadata from product data", () => {
    const metadata = generateProductMetadata({
      name: "Sofa Băng Hiện Đại PGB-077",
      slug: "sofa-bang-hien-dai-pgb-077",
      description: "Sofa băng hiện đại phù hợp phòng khách gia đình.",
      shortDescription: "Sofa băng hiện đại.",
      image: "/images/sofa.jpg",
    });

    expect(metadata.title).toBe("Sofa Băng Hiện Đại PGB-077 - Sofa Phạm Gia");
    expect(metadata.description).toContain("Sofa băng hiện đại");
    expect(metadata.alternates?.canonical).toBe("https://sofaphamgia.com/san-pham/sofa-bang-hien-dai-pgb-077");
  });

  it("builds category metadata with canonical URL", () => {
    const metadata = generateCategoryMetadata({
      name: "Sofa Băng",
      slug: "sofa-bang",
      description: "Bộ sưu tập sofa băng phòng khách hiện đại.",
    });

    expect(metadata.title).toBe("Sofa Băng Phòng Khách Hiện Đại | Sofa Phạm Gia");
    expect(metadata.alternates?.canonical).toBe("https://sofaphamgia.com/san-pham?category=sofa-bang");
  });

  it("normalizes and deduplicates canonical URLs", () => {
    expect(buildCanonicalUrl("https://sofaphamgia.com/san-pham?category=sofa-bang&page=2")).toBe(
      "https://sofaphamgia.com/san-pham?category=sofa-bang"
    );
  });

  it("builds shared metadata for static informational pages", () => {
    const metadata = generatePageMetadata({
      title: "Chính sách vận chuyển",
      description: "Thông tin giao hàng, phí ship và nhận hàng.",
      slug: "/chinh-sach-van-chuyen",
      type: "article",
    });

    expect(metadata.title).toBe("Chính sách vận chuyển | Sofa Phạm Gia");
    expect(metadata.description).toBe("Thông tin giao hàng, phí ship và nhận hàng.");
    expect(metadata.alternates?.canonical).toBe("https://sofaphamgia.com/chinh-sach-van-chuyen");
    expect(metadata.openGraph?.title).toBe("Chính sách vận chuyển | Sofa Phạm Gia");
  });
});
