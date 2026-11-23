import { containsHtmlTags, formatDescriptionHtml, sanitizeRichHtml } from "@/lib/html-content";

describe("html-content helpers", () => {
  it("preserves rich HTML headings, paragraphs, strong text, and bullet lists from DB product descriptions", () => {
    const raw =
      "<h1>Sofa Băng Gia Đình PGB-103 – Thiết Kế Hiện Đại</h1>" +
      "<p><strong>Sofa băng gia đình PGB-103</strong> là lựa chọn hoàn hảo.</p>" +
      "<h2>1. Kích thước gọn gàng</h2>" +
      "<ul><li><p>Chiều dài: 1800 mm (1m8).</p></li><li><p>Chiều sâu: 850 mm (85cm).</p></li></ul>";

    expect(containsHtmlTags(raw)).toBe(true);
    expect(formatDescriptionHtml(raw)).toBe(raw);
  });

  it("strips dangerous script tags, inline event handlers, and javascript URLs", () => {
    const dirty =
      '<p onclick="alert(1)">An toàn</p>' +
      '<script>alert("xss")</script>' +
      '<a href="javascript:alert(2)">Bấm vào</a>' +
      '<img src="https://example.com/sofa.jpg" onerror="evil()" />';

    const cleaned = sanitizeRichHtml(dirty);
    expect(cleaned).not.toContain("<script");
    expect(cleaned).not.toContain("onclick");
    expect(cleaned).not.toContain("onerror");
    expect(cleaned).not.toContain("javascript:");
    expect(cleaned).toContain("An toàn");
    expect(cleaned).toContain("https://example.com/sofa.jpg");
  });

  it("converts plain text descriptions safely to escaped HTML paragraphs", () => {
    const plain = "Khung gỗ dầu tự nhiên <100%>\nBảo hành 5 năm\n\nGiao lắp tận nơi TP.HCM";
    expect(containsHtmlTags(plain)).toBe(false);
    expect(formatDescriptionHtml(plain)).toBe(
      "<p>Khung gỗ dầu tự nhiên &lt;100%&gt;<br />Bảo hành 5 năm</p><p>Giao lắp tận nơi TP.HCM</p>"
    );
  });

  it("returns empty string for null or blank inputs", () => {
    expect(formatDescriptionHtml(null)).toBe("");
    expect(formatDescriptionHtml("   ")).toBe("");
  });
});
