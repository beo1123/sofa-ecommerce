const HTML_TAG_PATTERN =
  /<\/?(h[1-6]|p|div|ul|ol|li|strong|b|em|i|u|s|br|hr|blockquote|pre|code|table|thead|tbody|tr|th|td|img|a|span)\b[^>]*>/i;

const DANGEROUS_BLOCK_TAG_PATTERN =
  /<\s*(script|iframe|object|embed|style|form|input|textarea|select|button|meta|link|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;

const DANGEROUS_VOID_TAG_PATTERN =
  /<\s*(script|iframe|object|embed|style|form|input|textarea|select|button|meta|link|base)\b[^>]*\/?>/gi;

const EVENT_HANDLER_ATTR_PATTERN = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

const UNSAFE_URI_ATTR_PATTERN =
  /\s+(href|src|xlink:href)\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*'|[^\s>]*(?:javascript:|vbscript:))/gi;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function containsHtmlTags(value: string): boolean {
  return HTML_TAG_PATTERN.test(value);
}

/**
 * Làm sạch HTML mô tả sản phẩm / bài viết trước khi render bằng dangerouslySetInnerHTML:
 * loại bỏ thẻ thực thi (script, iframe, style, form...), inline event handler (on*) và URL javascript:.
 */
export function sanitizeRichHtml(rawHtml: string): string {
  return rawHtml
    .replace(DANGEROUS_BLOCK_TAG_PATTERN, "")
    .replace(DANGEROUS_VOID_TAG_PATTERN, "")
    .replace(EVENT_HANDLER_ATTR_PATTERN, "")
    .replace(UNSAFE_URI_ATTR_PATTERN, "")
    .trim();
}

/**
 * Chuẩn hóa nội dung mô tả (HTML hoặc plain text) thành HTML an toàn để hiển thị.
 * - Nếu nội dung đã là HTML (ví dụ từ TipTap / DB) -> làm sạch và giữ nguyên định dạng.
 * - Nếu là văn bản thuần (plain text) -> escape HTML và chuyển xuống dòng thành đoạn <p>/<br />.
 */
export function formatDescriptionHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (containsHtmlTags(trimmed)) {
    return sanitizeRichHtml(trimmed);
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("");
}
