"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  IconArrowLeft,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconLoader2,
  IconPhotoUp,
  IconPlus,
  IconSearch,
  IconSend,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import TiptapBodyEditor from "@/components/admin/articles/TiptapBodyEditor";
import { createArticleCategoryInlineAction, saveArticleAction } from "@/app/(admin)/admin/articles/actions";
import { slugifyVi } from "@/lib/slug";
import type { ArticleStatus } from "@/lib/prisma";
import type {
  SerializedArticleCategory,
  SerializedArticleDetail,
  SerializedLinkedProductOption,
} from "@/components/admin/articles/types";

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: string;
  categoryId?: number;
}

interface ArticleFormProps {
  initialArticle?: SerializedArticleDetail | null;
  categories: SerializedArticleCategory[];
  products: SerializedLinkedProductOption[];
}

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const ARTICLE_STATUS_OPTIONS: Array<{ value: ArticleStatus; label: string }> = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "PUBLISHED", label: "Xuất bản" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

export default function ArticleForm({
  initialArticle = null,
  categories: initialCategories,
  products,
}: ArticleFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialArticle?.id);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<SerializedArticleCategory[]>(initialCategories);
  const [title, setTitle] = useState(initialArticle?.title ?? "");
  const [slug, setSlug] = useState(initialArticle?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initialArticle?.slug));
  const [categoryId, setCategoryId] = useState<string>(
    initialArticle?.categoryId ? String(initialArticle.categoryId) : ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    initialArticle?.coverImageUrl ?? initialArticle?.thumbnail ?? ""
  );
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt ?? "");
  const [bodyJson, setBodyJson] = useState<Record<string, unknown> | null>(initialArticle?.bodyJson ?? null);
  const [contentHtml, setContentHtml] = useState<string>(initialArticle?.content ?? "");
  const [linkedProductId, setLinkedProductId] = useState<number | null>(initialArticle?.linkedProductId ?? null);
  const [status, setStatus] = useState<ArticleStatus>(initialArticle?.status ?? "DRAFT");
  const [publishedAt, setPublishedAt] = useState<string>(toDatetimeLocalValue(initialArticle?.publishedAt));
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialArticle?.seoDescription ?? "");
  const [seoOpen, setSeoOpen] = useState(Boolean(initialArticle?.seoTitle || initialArticle?.seoDescription));

  // Inline create category state
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Searchable linked product selector
  const [productQuery, setProductQuery] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  // Cover upload & save feedback
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savingMode, setSavingMode] = useState<"draft" | "publish" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === linkedProductId) ?? null,
    [products, linkedProductId]
  );

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 12);
    return products
      .filter((p) => `${p.workshopCode ?? ""} ${p.title} ${p.slug}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [products, productQuery]);

  const categoryOptions = useMemo(
    () => [
      { label: "Chọn danh mục bài viết", value: "" },
      ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
    ],
    [categories]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) {
      setSlug(slugifyVi(val));
    }
  };

  const handleCreateCategoryInline = async () => {
    if (!newCategoryName.trim()) return;
    setErrorMsg(null);
    setCreatingCategory(true);
    const res = await createArticleCategoryInlineAction(newCategoryName.trim());
    setCreatingCategory(false);

    if (!res.ok || !res.data) {
      setErrorMsg(res.error ?? "Không thể tạo danh mục mới");
      return;
    }

    const created = res.data;
    setCategories((prev) => [...prev, created]);
    setCategoryId(String(created.id));
    setNewCategoryName("");
    setAddingCategory(false);
  };

  const handleCoverUpload = async (file: File) => {
    setErrorMsg(null);
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `articles/${slug || "draft"}`);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.url) {
        throw new Error(json?.error?.message ?? "Upload ảnh bìa thất bại");
      }
      setCoverImageUrl(json.data.url as string);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload ảnh bìa thất bại");
    } finally {
      setUploadingCover(false);
    }
  };

  const submitWithStatus = async (targetStatus: ArticleStatus, mode: "draft" | "publish") => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const finalSlug = (slug.trim() || slugifyVi(title)).toLowerCase();
    const cleanedHtml = contentHtml.trim();

    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề bài đăng");
      return;
    }
    if (!cleanedHtml || cleanedHtml === "<p></p>") {
      setErrorMsg("Vui lòng nhập nội dung bài viết");
      return;
    }

    setSavingMode(mode);
    const res = await saveArticleAction({
      id: initialArticle?.id,
      title: title.trim(),
      slug: finalSlug,
      categoryId: categoryId ? Number(categoryId) : null,
      coverImageUrl: coverImageUrl.trim() || null,
      excerpt: excerpt.trim().slice(0, 160) || null,
      content: cleanedHtml,
      bodyJson,
      linkedProductId,
      status: targetStatus,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
    });
    setSavingMode(null);

    if (!res.ok || !res.data) {
      setErrorMsg(res.error ?? "Lưu bài viết thất bại");
      return;
    }

    setStatus(targetStatus);
    if (res.data.publishedAt) {
      setPublishedAt(toDatetimeLocalValue(res.data.publishedAt));
    }

    setSuccessMsg(targetStatus === "PUBLISHED" ? "Đã xuất bản bài viết thành công" : "Đã lưu bản nháp bài viết");

    if (!isEditing) {
      router.push(`/admin/articles/${res.data.id}`);
      router.refresh();
    } else {
      router.refresh();
    }
  };

  const previewUrl = slug ? `/bai-viet/${slug}` : null;

  return (
    <div className="space-y-5">
      {/* Sticky header actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-brand-100 bg-bg-muted px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-400 transition-colors hover:border-brand-200 hover:bg-brand-50"
            aria-label="Quay lại danh sách bài đăng">
            <IconArrowLeft size={16} stroke={1.75} />
          </Link>
          <div>
            <h2 className="text-base font-bold text-brand-400">
              {isEditing ? "Chỉnh sửa bài đăng" : "Viết bài đăng mới"}
            </h2>
            <p className="text-xs text-text-muted">{slug ? `/bai-viet/${slug}` : "Tự tạo đường dẫn từ tiêu đề"}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge domain="article" status={status} />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            loading={savingMode === "draft"}
            disabled={savingMode !== null}
            onClick={() => submitWithStatus("DRAFT", "draft")}>
            Lưu nháp
          </Button>

          {previewUrl && isEditing ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-brand-300 bg-bg-page px-3 text-sm font-medium text-brand-400 transition-colors hover:bg-brand-50">
              <IconExternalLink size={15} stroke={1.75} />
              <span>Xem trước</span>
            </a>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              leftIcon={<IconExternalLink size={15} stroke={1.75} />}>
              Xem trước
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={savingMode === "publish"}
            disabled={savingMode !== null}
            leftIcon={<IconSend size={15} stroke={1.75} />}
            onClick={() => submitWithStatus(status === "ARCHIVED" ? "ARCHIVED" : "PUBLISHED", "publish")}>
            {status === "ARCHIVED" ? "Lưu trữ" : "Xuất bản"}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Two-column layout: main editor (8 cols) + sidebar metadata (4 cols) */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Main content column */}
        <div className="space-y-5 xl:col-span-8">
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-4">
            <Input
              label="Tiêu đề bài viết"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="VD: Cách chọn kích thước sofa góc chữ L cho phòng khách chung cư 20m²"
              fullWidth
            />

            <Input
              label="Đường dẫn (Slug)"
              required
              value={slug}
              onChange={(e) => {
                setSlug(slugifyVi(e.target.value));
                setSlugEdited(true);
              }}
              placeholder="cach-chon-kich-thuoc-sofa-goc-chu-l"
              helperText="Tự sinh từ tiêu đề, có thể chỉnh sửa trực tiếp"
              fullWidth
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="article-excerpt" className="text-sm font-medium text-text-default">
                  Đoạn trích dẫn (Excerpt)
                </label>
                <span
                  className={clsx("text-xs", excerpt.length >= 160 ? "text-amber-700 font-medium" : "text-text-muted")}>
                  {excerpt.length} / 160 ký tự
                </span>
              </div>
              <textarea
                id="article-excerpt"
                rows={3}
                maxLength={160}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value.slice(0, 160))}
                placeholder="Tóm tắt ngắn hiển thị ở danh sách bài viết và thẻ chia sẻ mạng xã hội (tối đa 160 ký tự)..."
                className="block w-full rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-sm text-text-default placeholder:text-text-muted/70 transition-colors hover:border-brand-200 focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-text-default mb-1.5">
                Nội dung bài viết <span className="text-red-600">*</span>
              </span>
              <TiptapBodyEditor
                initialBodyJson={initialArticle?.bodyJson ?? null}
                initialHtml={initialArticle?.content ?? ""}
                folder={`articles/${slug || "draft"}`}
                onChange={({ bodyJson: nextJson, html }) => {
                  setBodyJson(nextJson);
                  setContentHtml(html);
                }}
              />
            </div>
          </section>

          {/* Collapsible SEO Section */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page">
            <button
              type="button"
              onClick={() => setSeoOpen((prev) => !prev)}
              aria-expanded={seoOpen}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer">
              <div>
                <h3 className="text-sm font-semibold text-brand-400">Tối ưu SEO (seoTitle & seoDescription)</h3>
                <p className="text-xs text-text-muted">Tùy chỉnh tiêu đề và mô tả hiển thị trên Google Search</p>
              </div>
              {seoOpen ? (
                <IconChevronUp size={18} stroke={1.75} className="text-brand-300" />
              ) : (
                <IconChevronDown size={18} stroke={1.75} className="text-brand-300" />
              )}
            </button>

            {seoOpen && (
              <div className="space-y-4 border-t border-brand-100 px-5 py-4 animate-fadeIn">
                <Input
                  label="SEO Title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "Tiêu đề SEO (khuyến nghị ≤ 60 ký tự)"}
                  helperText={`${seoTitle.length} ký tự`}
                  fullWidth
                />

                <div>
                  <label htmlFor="article-seo-desc" className="block text-sm font-medium text-text-default mb-1.5">
                    SEO Description
                  </label>
                  <textarea
                    id="article-seo-desc"
                    rows={3}
                    maxLength={320}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder={excerpt || "Mô tả SEO hiển thị dưới tiêu đề bài viết trên kết quả tìm kiếm..."}
                    className="block w-full rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-sm text-text-default placeholder:text-text-muted/70 transition-colors hover:border-brand-200 focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
                  />
                  <p className="mt-1 text-xs text-text-muted">{seoDescription.length} / 160 ký tự khuyến nghị</p>
                </div>

                {/* SERP preview */}
                <div className="rounded-[8px] border border-brand-100 bg-bg-muted p-3.5 space-y-1">
                  <p className="text-[11px] text-brand-300">
                    https://sofaphamgia.com/bai-viet/{slug || "duong-dan-bai-viet"}
                  </p>
                  <p className="text-sm font-semibold text-brand-400">
                    {seoTitle || title || "Tiêu đề bài viết — Sofa Phạm Gia"}
                  </p>
                  <p className="line-clamp-2 text-xs text-text-muted">
                    {seoDescription ||
                      excerpt ||
                      "Kinh nghiệm chọn sofa xưởng đóng theo yêu cầu tại Sofa Phạm Gia TP.HCM."}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar settings column */}
        <div className="space-y-5 xl:col-span-4">
          {/* Publishing status & publishedAt */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-4">
            <h3 className="text-sm font-semibold text-brand-400">Xuất bản & Trạng thái</h3>

            <div className="grid grid-cols-3 gap-1.5">
              {ARTICLE_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={clsx(
                    "h-9 rounded-[8px] border text-xs font-medium transition-colors cursor-pointer",
                    status === opt.value
                      ? "border-brand-400 bg-brand-50 text-brand-400"
                      : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200"
                  )}>
                  {opt.label}
                </button>
              ))}
            </div>

            <Input
              label="Thời gian xuất bản (publishedAt)"
              type="datetime-local"
              inputSize="sm"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              helperText="Tự điền khi xuất bản lần đầu; có thể hẹn lịch hoặc sửa tay"
              fullWidth
            />
          </section>

          {/* Category select + inline create */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-brand-400">Danh mục bài viết</h3>
              <button
                type="button"
                onClick={() => setAddingCategory((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-400 cursor-pointer">
                <IconPlus size={14} stroke={1.75} />
                <span>Tạo nhanh</span>
              </button>
            </div>

            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categoryOptions}
              selectSize="sm"
              fullWidth
            />

            {addingCategory && (
              <div className="flex items-center gap-2 rounded-[8px] border border-brand-100 bg-bg-muted p-2 animate-fadeIn">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Tên danh mục mới..."
                  inputSize="sm"
                  fullWidth
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={creatingCategory}
                  onClick={handleCreateCategoryInline}>
                  <IconCheck size={15} stroke={1.75} />
                </Button>
              </div>
            )}
          </section>

          {/* Cover image uploader (Article.coverImageUrl) */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-brand-400">Ảnh bìa (coverImageUrl)</h3>
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline cursor-pointer">
                  <IconTrash size={13} stroke={1.75} />
                  <span>Gỡ ảnh</span>
                </button>
              )}
            </div>

            {coverImageUrl ? (
              <div className="overflow-hidden rounded-[8px] border border-brand-100 bg-brand-50">
                <img
                  src={coverImageUrl}
                  alt={title || "Ảnh bìa bài viết"}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-[8px] border-2 border-dashed border-brand-200 bg-bg-muted p-6 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/40 cursor-pointer">
                {uploadingCover ? (
                  <>
                    <IconLoader2 size={22} stroke={1.75} className="animate-spin text-brand-300" />
                    <span className="text-xs text-brand-400">Đang tải ảnh bìa...</span>
                  </>
                ) : (
                  <>
                    <IconPhotoUp size={22} stroke={1.75} className="text-brand-300" />
                    <span className="text-xs font-medium text-brand-400">Nhấn để tải ảnh bìa lên Cloudinary</span>
                    <span className="text-[11px] text-text-muted">Khuyến nghị tỷ lệ 16:9 hoặc 4:3</span>
                  </>
                )}
              </div>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleCoverUpload(file);
                e.target.value = "";
              }}
              className="hidden"
            />

            {coverImageUrl && (
              <Button
                type="button"
                variant="secondary"
                size="xs"
                fullWidth
                loading={uploadingCover}
                onClick={() => coverInputRef.current?.click()}>
                Đổi ảnh bìa khác
              </Button>
            )}
          </section>

          {/* Searchable linkedProductId selector */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-brand-400">Sản phẩm liên kết (linkedProductId)</h3>
              <p className="mt-0.5 text-xs text-text-muted">Gắn mẫu sofa nổi bật liên quan đến bài viết này.</p>
            </div>

            {selectedProduct ? (
              <div className="flex items-start justify-between gap-2 rounded-[8px] border border-brand-200 bg-brand-50/60 p-3">
                <div className="min-w-0">
                  {selectedProduct.workshopCode && (
                    <Badge variant="brand" className="mb-1">
                      {selectedProduct.workshopCode}
                    </Badge>
                  )}
                  <p className="text-xs font-semibold text-brand-400">{selectedProduct.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkedProductId(null)}
                  aria-label="Bỏ liên kết sản phẩm"
                  className="text-text-muted hover:text-red-600 cursor-pointer">
                  <IconX size={15} stroke={1.75} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  value={productQuery}
                  onFocus={() => setProductDropdownOpen(true)}
                  onChange={(e) => {
                    setProductQuery(e.target.value);
                    setProductDropdownOpen(true);
                  }}
                  placeholder="Tìm theo mã PGG-... hoặc tên sofa"
                  inputSize="sm"
                  fullWidth
                  leftIcon={<IconSearch size={15} stroke={1.75} />}
                />

                {productDropdownOpen && (
                  <div className="mt-1.5 max-h-56 overflow-y-auto rounded-[8px] border border-brand-100 bg-bg-page p-1 animate-fadeIn">
                    {filteredProducts.length === 0 ? (
                      <p className="px-2.5 py-3 text-center text-xs text-text-muted">Không tìm thấy sản phẩm</p>
                    ) : (
                      filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setLinkedProductId(p.id);
                            setProductQuery("");
                            setProductDropdownOpen(false);
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded-[8px] px-2.5 py-2 text-left text-xs hover:bg-brand-50 cursor-pointer">
                          <span className="truncate font-medium text-text-default">{p.title}</span>
                          {p.workshopCode && <Badge variant="brand">{p.workshopCode}</Badge>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
