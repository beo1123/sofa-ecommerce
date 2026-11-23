"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  IconArrowLeft,
  IconCheck,
  IconFileDescription,
  IconPhoto,
  IconPlus,
  IconRuler2,
  IconSearch,
  IconStar,
  IconTag,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import ImageUploader, { type UploadedImageItem } from "@/components/admin/products/ImageUploader";
import TiptapBodyEditor from "@/components/admin/articles/TiptapBodyEditor";
import { deleteReviewAction, moderateReviewAction, saveProductAction } from "@/app/(admin)/admin/products/actions";
import { extractWorkshopCodeFromTitle, resolveWorkshopCode, slugifyVi, suggestWorkshopPrefix } from "@/lib/slug";
import {
  DEFAULT_PRODUCT_VARIANTS,
  DEFAULT_SWATCH_HEX,
  DEFAULT_VARIANT_ATTRIBUTES_JSON,
  SOFA_COLOR_PRESETS,
} from "@/lib/sofa-presets";
import { normalizeHexColor, resolveColorSwatch, toSixDigitHex } from "@/lib/color-swatch";
import { cmToMetersInput, metersInputToCm } from "@/lib/dimensions";
import { formatDateVi } from "@/lib/format";
import type { ProductStatus } from "@/lib/prisma";
import type { ProductMaterialOption } from "@/lib/workshop-types";
import type {
  SerializedCategoryOption,
  SerializedProductDetail,
  SerializedProductReview,
} from "@/components/admin/products/types";

export interface ProductFormData {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  status: string;
  categoryId?: number;
  height?: string;
  width?: string;
  customizationNote?: string;
}

type ProductTabId = "basic" | "pricing" | "dimensions" | "images" | "seo" | "reviews";

interface VariantDraft {
  id?: number;
  name: string;
  price: string;
  compareAtPrice: string;
  skuPrefix: string;
  attributesText: string;
  image: string;
}

interface MetadataRow {
  key: string;
  value: string;
}

interface ProductFormProps {
  initialProduct?: SerializedProductDetail | null;
  categories: SerializedCategoryOption[];
}

function extractColorFromAttributesJson(raw: string): { cssColor: string; pickerHex: string } | null {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && typeof parsed === "object" && typeof parsed.color === "string" && parsed.color.trim()) {
      const cssColor = resolveColorSwatch(parsed.color);
      const pickerHex = toSixDigitHex(parsed.color) ?? toSixDigitHex(cssColor) ?? DEFAULT_SWATCH_HEX;
      return { cssColor, pickerHex };
    }
  } catch {
    return null;
  }
  return null;
}

function setColorInAttributesJson(raw: string, nextHex: string): string {
  const upperHex = nextHex.toUpperCase();
  try {
    const parsed = raw.trim() ? (JSON.parse(raw) as Record<string, unknown>) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return JSON.stringify({ ...parsed, color: upperHex });
    }
  } catch {
    // Fallback to clean JSON object when current text is invalid JSON
  }
  return JSON.stringify({ color: upperHex, material: "Vải" });
}

const PRODUCT_STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: "PUBLISHED", label: "Đang hiển thị" },
  { value: "DRAFT", label: "Bản nháp" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

export default function ProductForm({ initialProduct = null, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct?.id);

  const [activeTab, setActiveTab] = useState<ProductTabId>("basic");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tab 1: Basic
  const [workshopCode, setWorkshopCode] = useState(initialProduct?.workshopCode ?? "");
  const [workshopCodeEdited, setWorkshopCodeEdited] = useState(Boolean(initialProduct?.workshopCode));
  const [title, setTitle] = useState(initialProduct?.title ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initialProduct?.slug));
  const [categoryId, setCategoryId] = useState<string>(
    initialProduct?.categoryId ? String(initialProduct.categoryId) : ""
  );
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status ?? "PUBLISHED");
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");

  // Tab 2: Pricing & Variants & Material Options
  const [priceNote, setPriceNote] = useState(initialProduct?.priceNote ?? "Giá cuối phụ thuộc kích thước và chất liệu");
  const [variants, setVariants] = useState<VariantDraft[]>(() => {
    if (initialProduct && initialProduct.variants.length > 0) {
      return initialProduct.variants.map((v) => ({
        id: v.id,
        name: v.name,
        price: String(v.price),
        compareAtPrice: v.compareAtPrice !== null ? String(v.compareAtPrice) : "",
        skuPrefix: v.skuPrefix ?? "",
        attributesText: v.attributes ? JSON.stringify(v.attributes) : "",
        image: v.image ?? "",
      }));
    }
    return DEFAULT_PRODUCT_VARIANTS.map((preset) => ({
      name: preset.name,
      price: "",
      compareAtPrice: "",
      skuPrefix: "",
      attributesText: JSON.stringify(preset.attributes),
      image: "",
    }));
  });
  const [materialOptions, setMaterialOptions] = useState<ProductMaterialOption[]>(
    initialProduct?.materialOptions ?? []
  );

  // Tab 3: Dimensions (displayed & edited in meters, stored in DB as integer cm)
  const [defaultWidthM, setDefaultWidthM] = useState(cmToMetersInput(initialProduct?.defaultWidthCm));
  const [defaultDepthM, setDefaultDepthM] = useState(cmToMetersInput(initialProduct?.defaultDepthCm));
  const [defaultHeightM, setDefaultHeightM] = useState(cmToMetersInput(initialProduct?.defaultHeightCm));
  const [allowCustomSize, setAllowCustomSize] = useState(initialProduct?.allowCustomSize ?? true);

  // Tab 4: Images
  const [images, setImages] = useState<UploadedImageItem[]>(
    initialProduct?.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? "",
      isPrimary: img.isPrimary,
    })) ?? []
  );

  // Tab 5: SEO metadata key-value pairs
  const [metadataRows, setMetadataRows] = useState<MetadataRow[]>(() => {
    const entries = Object.entries(initialProduct?.metadata ?? {});
    if (entries.length > 0) {
      return entries.map(([key, value]) => ({ key, value }));
    }
    return [
      { key: "seoTitle", value: "" },
      { key: "seoDescription", value: "" },
    ];
  });

  // Tab 6: Reviews moderation
  const [reviews, setReviews] = useState<SerializedProductReview[]>(initialProduct?.reviews ?? []);
  const [reviewFilter, setReviewFilter] = useState<"all" | "approved" | "pending">("all");
  const [busyReviewId, setBusyReviewId] = useState<number | null>(null);

  const categoryOptions = useMemo(
    () => [
      { label: "Chọn danh mục sản phẩm", value: "" },
      ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
    ],
    [categories]
  );

  const pendingReviewsCount = useMemo(() => reviews.filter((r) => !r.approved).length, [reviews]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "approved") return reviews.filter((r) => r.approved);
    if (reviewFilter === "pending") return reviews.filter((r) => !r.approved);
    return reviews;
  }, [reviews, reviewFilter]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) {
      setSlug(slugifyVi(val));
    }
    if (!workshopCodeEdited) {
      const extracted = extractWorkshopCodeFromTitle(val);
      if (extracted) {
        setWorkshopCode(extracted);
      }
    }
  };

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    if (!workshopCodeEdited && !extractWorkshopCodeFromTitle(title)) {
      const cat = categories.find((c) => String(c.id) === nextCategoryId);
      setWorkshopCode(suggestWorkshopPrefix(cat?.name));
    }
  };

  // Variants helpers
  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        price: "",
        compareAtPrice: "",
        skuPrefix: workshopCode || "",
        attributesText: DEFAULT_VARIANT_ATTRIBUTES_JSON,
        image: "",
      },
    ]);
  };

  const updateVariant = (idx: number, patch: Partial<VariantDraft>) => {
    setVariants((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Material options helpers
  const addMaterialOption = () => {
    setMaterialOptions((prev) => [
      ...prev,
      {
        label: "",
        priceDelta: 0,
        colors: [{ name: "Nâu da bò", hex: DEFAULT_SWATCH_HEX }],
      },
    ]);
  };

  const updateMaterialOption = (idx: number, patch: Partial<ProductMaterialOption>) => {
    setMaterialOptions((prev) => prev.map((mat, i) => (i === idx ? { ...mat, ...patch } : mat)));
  };

  const removeMaterialOption = (idx: number) => {
    setMaterialOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const addColorToMaterial = (matIdx: number) => {
    setMaterialOptions((prev) =>
      prev.map((mat, i) =>
        i === matIdx
          ? {
              ...mat,
              colors: [...mat.colors, { name: "Màu mới", hex: DEFAULT_SWATCH_HEX }],
            }
          : mat
      )
    );
  };

  const updateMaterialColor = (matIdx: number, colorIdx: number, patch: { name?: string; hex?: string }) => {
    setMaterialOptions((prev) =>
      prev.map((mat, i) => {
        if (i !== matIdx) return mat;
        return {
          ...mat,
          colors: mat.colors.map((c, ci) => (ci === colorIdx ? { ...c, ...patch } : c)),
        };
      })
    );
  };

  const removeMaterialColor = (matIdx: number, colorIdx: number) => {
    setMaterialOptions((prev) =>
      prev.map((mat, i) => (i === matIdx ? { ...mat, colors: mat.colors.filter((_, ci) => ci !== colorIdx) } : mat))
    );
  };

  // Review moderation handlers
  const handleModerateReview = async (reviewId: number, approved: boolean) => {
    setBusyReviewId(reviewId);
    const res = await moderateReviewAction(reviewId, approved);
    setBusyReviewId(null);
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, approved } : r)));
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("Xóa đánh giá này?")) return;
    setBusyReviewId(reviewId);
    const res = await deleteReviewAction(reviewId);
    setBusyReviewId(null);
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Parse & validate variants JSON attributes
    const parsedVariants = [];
    for (let i = 0; i < variants.length; i += 1) {
      const row = variants[i];
      if (!row.name.trim() && !row.price.trim()) continue;
      if (!row.name.trim()) {
        setActiveTab("pricing");
        setErrorMessage(`Biến thể #${i + 1}: vui lòng nhập tên biến thể`);
        return;
      }
      const priceNum = Number(row.price);
      if (!Number.isFinite(priceNum) || priceNum < 0 || row.price.trim() === "") {
        setActiveTab("pricing");
        setErrorMessage(`Biến thể "${row.name}": giá bán không hợp lệ`);
        return;
      }

      let attributesObj: Record<string, unknown> | null = null;
      if (row.attributesText.trim()) {
        try {
          const parsed = JSON.parse(row.attributesText);
          if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            throw new Error("NOT_OBJECT");
          }
          const attrRecord = { ...(parsed as Record<string, unknown>) };
          if (typeof attrRecord.color === "string") {
            const fixedHex = normalizeHexColor(attrRecord.color);
            if (fixedHex) attrRecord.color = fixedHex.toUpperCase();
          }
          attributesObj = attrRecord;
        } catch {
          setActiveTab("pricing");
          setErrorMessage(
            `Biến thể "${row.name}": thuộc tính attributes phải là JSON object hợp lệ (VD: {"size":"2m6"})`
          );
          return;
        }
      }

      parsedVariants.push({
        id: row.id,
        name: row.name.trim(),
        skuPrefix: row.skuPrefix.trim() || null,
        price: priceNum,
        compareAtPrice: row.compareAtPrice.trim() !== "" ? Number(row.compareAtPrice) : null,
        attributes: attributesObj,
        image: row.image.trim() || null,
      });
    }

    // Filter valid materialOptions
    const cleanedMaterials = materialOptions
      .filter((m) => m.label.trim().length > 0)
      .map((m) => ({
        label: m.label.trim(),
        priceDelta: Number.isFinite(m.priceDelta) ? m.priceDelta : 0,
        colors: m.colors
          .filter((c) => c.name.trim().length > 0)
          .map((c) => ({
            name: c.name.trim(),
            hex: /^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : DEFAULT_SWATCH_HEX,
          })),
      }));

    // Build metadata object from key-value pairs
    const metadataObj: Record<string, string> = {};
    for (const row of metadataRows) {
      const k = row.key.trim();
      const v = row.value.trim();
      if (k && v) metadataObj[k] = v;
    }

    setSaving(true);
    const res = await saveProductAction({
      id: initialProduct?.id,
      workshopCode: resolveWorkshopCode(workshopCode, title),
      title: title.trim(),
      slug: (slug.trim() || slugifyVi(title)).toLowerCase(),
      categoryId: categoryId ? Number(categoryId) : null,
      status,
      shortDescription: shortDescription.trim() || null,
      description: description || null,
      priceNote: priceNote.trim() || null,
      defaultWidthCm: metersInputToCm(defaultWidthM),
      defaultDepthCm: metersInputToCm(defaultDepthM),
      defaultHeightCm: metersInputToCm(defaultHeightM),
      allowCustomSize,
      materialOptions: cleanedMaterials,
      colorOptions: cleanedMaterials.flatMap((m) => m.colors),
      metadata: Object.keys(metadataObj).length > 0 ? metadataObj : null,
      variants: parsedVariants,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt ?? null,
        isPrimary: Boolean(img.isPrimary),
      })),
    });
    setSaving(false);

    if (!res.ok || !res.data) {
      setErrorMessage(res.error ?? "Lưu sản phẩm thất bại");
      return;
    }

    setSuccessMessage(isEditing ? "Đã cập nhật sản phẩm thành công" : "Đã tạo sản phẩm mới");

    if (!isEditing) {
      router.push(`/admin/products/${res.data.id}`);
      router.refresh();
    } else {
      router.refresh();
    }
  };

  const tabs: Array<{
    id: ProductTabId;
    label: string;
    icon: React.ComponentType<{ size?: number; stroke?: number }>;
    badge?: number;
  }> = [
    { id: "basic", label: "Cơ bản", icon: IconFileDescription },
    {
      id: "pricing",
      label: "Giá & Biến thể",
      icon: IconTag,
      badge: variants.filter((v) => v.name.trim()).length,
    },
    { id: "dimensions", label: "Kích thước", icon: IconRuler2 },
    { id: "images", label: "Hình ảnh", icon: IconPhoto, badge: images.length },
    { id: "seo", label: "SEO", icon: IconSearch },
    {
      id: "reviews",
      label: "Đánh giá",
      icon: IconStar,
      badge: pendingReviewsCount || undefined,
    },
  ];

  const seoTitlePreview =
    metadataRows.find((r) => r.key === "seoTitle")?.value || title || "Tên mẫu sofa — Sofa Phạm Gia";
  const seoDescPreview =
    metadataRows.find((r) => r.key === "seoDescription")?.value ||
    shortDescription ||
    "Sofa đóng theo yêu cầu tại xưởng Sofa Phạm Gia TP.HCM. Bảo hành khung gỗ, đệm mút và bề mặt.";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Top sticky action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-brand-100 bg-bg-muted px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-400 transition-colors hover:border-brand-200 hover:bg-brand-50"
            aria-label="Quay lại danh sách sản phẩm">
            <IconArrowLeft size={16} stroke={1.75} />
          </Link>
          <div>
            <h2 className="text-base font-bold text-brand-400">
              {isEditing ? `Chỉnh sửa: ${title || "Sản phẩm"}` : "Thêm sản phẩm mới"}
            </h2>
            <p className="text-xs text-text-muted">
              {workshopCode ? `Mã xưởng ${workshopCode} · ` : ""}
              {slug ? `/san-pham/${slug}` : "Chưa có đường dẫn"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge domain="product" status={status} />
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/admin/products")}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={saving}
            leftIcon={<IconCheck size={16} stroke={1.75} />}>
            {isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-[8px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Tab navigation */}
      <div
        role="tablist"
        aria-label="Các mục thông tin sản phẩm"
        className="flex flex-wrap gap-1 border-b border-brand-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                active
                  ? "border-brand-400 text-brand-400 bg-brand-50/50 rounded-t-[8px]"
                  : "border-transparent text-text-muted hover:text-brand-400 hover:bg-brand-50/30 rounded-t-[8px]"
              )}>
              <Icon size={16} stroke={1.75} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="rounded-[20px] bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-400">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CƠ BẢN */}
      {activeTab === "basic" && (
        <div className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Mã xưởng (Workshop Code)"
              value={workshopCode}
              onChange={(e) => {
                setWorkshopCode(e.target.value.toUpperCase());
                setWorkshopCodeEdited(true);
              }}
              placeholder="VD: PGG-01, PGB-03"
              helperText="Tự gợi ý PGG- / PGB- theo danh mục, có thể sửa tự do"
              fullWidth
            />

            <Select
              label="Danh mục"
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              options={categoryOptions}
              fullWidth
            />

            <div>
              <span className="block text-sm font-medium text-text-default mb-1.5">Trạng thái hiển thị</span>
              <div className="grid grid-cols-3 gap-1.5">
                {PRODUCT_STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={clsx(
                      "h-10 rounded-[8px] border text-xs font-medium transition-colors cursor-pointer",
                      status === opt.value
                        ? "border-brand-400 bg-brand-50 text-brand-400"
                        : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200"
                    )}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Tên sản phẩm"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="VD: Sofa góc chữ L bọc da Microfiber Ý PGG-01"
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
              placeholder="sofa-goc-chu-l-pgg-01"
              helperText="Tự động tạo từ tên sản phẩm"
              fullWidth
            />
          </div>

          <div>
            <label htmlFor="product-short-desc" className="block text-sm font-medium text-text-default mb-1.5">
              Mô tả ngắn
            </label>
            <textarea
              id="product-short-desc"
              rows={3}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Tóm tắt ngắn nổi bật: khung gỗ dầu tự nhiên, nệm D40 chống xẹp..."
              className="block w-full rounded-[8px] border border-brand-100 bg-bg-page px-3 py-2 text-sm text-text-default placeholder:text-text-muted/70 transition-colors hover:border-brand-200 focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="block text-sm font-medium text-text-default">Mô tả chi tiết sản phẩm</span>
              <span className="text-[11px] text-text-muted">Hỗ trợ soạn thảo trực quan & mã HTML</span>
            </div>
            <TiptapBodyEditor
              key={initialProduct?.id ?? "new"}
              initialHtml={description}
              folder={`products/${slug || "draft"}`}
              placeholder="Mô tả chi tiết cấu tạo khung, đệm, bề mặt da/vải, hướng dẫn bảo quản và chính sách bảo hành xưởng..."
              onChange={({ html }) => setDescription(html === "<p></p>" ? "" : html)}
            />
          </div>
        </div>
      )}

      {/* TAB 2: GIÁ & BIẾN THỂ */}
      {activeTab === "pricing" && (
        <div className="space-y-5">
          {/* Price note + ProductVariant table */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-4">
            <Input
              label="Ghi chú giá (hiển thị dưới giá trên trang chi tiết)"
              value={priceNote}
              onChange={(e) => setPriceNote(e.target.value)}
              placeholder="Giá cuối phụ thuộc kích thước và chất liệu"
              fullWidth
            />

            <div className="flex items-center justify-between gap-2 pt-2">
              <div>
                <h3 className="text-sm font-semibold text-brand-400">Bảng biến thể sản phẩm (ProductVariant)</h3>
                <p className="text-xs text-text-muted">
                  Giá thấp nhất trong danh sách sẽ hiển thị là &ldquo;Giá từ X đ&rdquo; ngoài cửa hàng.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconPlus size={15} stroke={1.75} />}
                onClick={addVariantRow}>
                Thêm biến thể
              </Button>
            </div>

            <div className="overflow-x-auto rounded-[8px] border border-brand-100">
              <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-100 bg-bg-muted font-medium text-text-muted">
                    <th className="px-3 py-2.5">Tên biến thể *</th>
                    <th className="px-3 py-2.5">Giá bán (VND) *</th>
                    <th className="px-3 py-2.5">Giá gốc (VND)</th>
                    <th className="px-3 py-2.5">SKU Prefix</th>
                    <th className="px-3 py-2.5">Attributes JSON</th>
                    <th className="px-3 py-2.5 text-right">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100/60">
                  {variants.map((variant, idx) => (
                    <tr key={variant.id ?? `new-${idx}`}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(idx, { name: e.target.value })}
                          placeholder="VD: 2m6 / Da Microfiber / Nâu"
                          className="h-8 w-full rounded-[8px] border border-brand-100 bg-bg-page px-2.5 text-xs focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
                        />
                      </td>
                      <td className="p-2 w-36">
                        <input
                          type="number"
                          min={0}
                          step={100000}
                          value={variant.price}
                          onChange={(e) => updateVariant(idx, { price: e.target.value })}
                          placeholder="16500000"
                          className="h-8 w-full rounded-[8px] border border-brand-100 bg-bg-page px-2.5 text-xs focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
                        />
                      </td>
                      <td className="p-2 w-36">
                        <input
                          type="number"
                          min={0}
                          step={100000}
                          value={variant.compareAtPrice}
                          onChange={(e) =>
                            updateVariant(idx, {
                              compareAtPrice: e.target.value,
                            })
                          }
                          placeholder="19000000"
                          className="h-8 w-full rounded-[8px] border border-brand-100 bg-bg-page px-2.5 text-xs focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
                        />
                      </td>
                      <td className="p-2 w-32">
                        <input
                          type="text"
                          value={variant.skuPrefix}
                          onChange={(e) => updateVariant(idx, { skuPrefix: e.target.value })}
                          placeholder="PGG01-26"
                          className="h-8 w-full rounded-[8px] border border-brand-100 bg-bg-page px-2.5 text-xs focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
                        />
                      </td>
                      <td className="p-2">
                        {(() => {
                          const preview = extractColorFromAttributesJson(variant.attributesText);
                          return (
                            <div className="flex items-center gap-2">
                              <label
                                title={
                                  preview ? `Màu hiện tại: ${preview.cssColor} (bấm để chọn màu)` : "Bấm để chọn mã màu"
                                }
                                style={{
                                  backgroundColor: preview ? preview.cssColor : "var(--color-bg-muted)",
                                }}
                                className="relative h-6 w-6 shrink-0 cursor-pointer overflow-hidden rounded-full border border-brand-200 transition-transform hover:scale-105">
                                <input
                                  type="color"
                                  aria-label={`Chọn màu cho biến thể ${variant.name || idx + 1}`}
                                  value={preview?.pickerHex ?? DEFAULT_SWATCH_HEX}
                                  onChange={(e) =>
                                    updateVariant(idx, {
                                      attributesText: setColorInAttributesJson(variant.attributesText, e.target.value),
                                    })
                                  }
                                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                              </label>
                              <input
                                type="text"
                                value={variant.attributesText}
                                onChange={(e) =>
                                  updateVariant(idx, {
                                    attributesText: e.target.value,
                                  })
                                }
                                placeholder={DEFAULT_VARIANT_ATTRIBUTES_JSON}
                                className="h-8 w-full rounded-[8px] border border-brand-100 bg-bg-page px-2.5 font-mono text-[11px] focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
                              />
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          aria-label="Xóa biến thể"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 text-red-600 hover:border-red-300 hover:bg-red-50 cursor-pointer">
                          <IconTrash size={14} stroke={1.75} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Material Options & Color Swatches Builder */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-brand-400">
                  Cấu hình Chất liệu & Bảng màu (materialOptions)
                </h3>
                <p className="text-xs text-text-muted">
                  Dùng cho bộ lọc danh sách sản phẩm và bộ chọn cấu hình trên trang chi tiết.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconPlus size={15} stroke={1.75} />}
                onClick={addMaterialOption}>
                Thêm chất liệu
              </Button>
            </div>

            {materialOptions.length === 0 ? (
              <div className="rounded-[8px] border border-dashed border-brand-100 bg-bg-muted px-4 py-6 text-center text-xs text-text-muted">
                Chưa có tùy chọn chất liệu (VD: Vải bố chống thấm, Da Hàn Quốc, Da Microfiber Ý, Da bò thật...).
              </div>
            ) : (
              <div className="space-y-3">
                {materialOptions.map((mat, matIdx) => (
                  <div key={matIdx} className="rounded-[12px] border border-brand-100 bg-bg-muted p-4 space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                      <div className="sm:col-span-6">
                        <Input
                          label="Tên chất liệu"
                          inputSize="sm"
                          fullWidth
                          value={mat.label}
                          onChange={(e) =>
                            updateMaterialOption(matIdx, {
                              label: e.target.value,
                            })
                          }
                          placeholder="VD: Da Microfiber Ý"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <Input
                          label="Chênh lệch giá (VND)"
                          type="number"
                          step={100000}
                          inputSize="sm"
                          fullWidth
                          value={String(mat.priceDelta)}
                          onChange={(e) =>
                            updateMaterialOption(matIdx, {
                              priceDelta: Number(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="sm:col-span-2 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMaterialOption(matIdx)}
                          leftIcon={<IconTrash size={14} stroke={1.75} />}>
                          Xóa
                        </Button>
                      </div>
                    </div>

                    {/* Swatches */}
                    <div className="space-y-2 border-t border-brand-100 pt-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-brand-400">Bảng màu ({mat.colors.length})</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {SOFA_COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              title={`Thêm nhanh ${preset.name}`}
                              onClick={() =>
                                updateMaterialOption(matIdx, {
                                  colors: [...mat.colors, { ...preset }],
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-[20px] border border-brand-100 bg-bg-page px-2 py-0.5 text-[11px] text-text-muted hover:border-brand-300 cursor-pointer">
                              <span
                                className="h-2.5 w-2.5 rounded-full border border-brand-100"
                                style={{ backgroundColor: preset.hex }}
                              />
                              <span>{preset.name}</span>
                            </button>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => addColorToMaterial(matIdx)}
                            leftIcon={<IconPlus size={12} stroke={1.75} />}>
                            Màu tùy chỉnh
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {mat.colors.map((color, colorIdx) => (
                          <div
                            key={colorIdx}
                            className="flex items-center gap-2 rounded-[8px] border border-brand-100 bg-bg-page px-2.5 py-1.5">
                            <input
                              type="color"
                              value={color.hex}
                              onChange={(e) =>
                                updateMaterialColor(matIdx, colorIdx, {
                                  hex: e.target.value,
                                })
                              }
                              aria-label="Chọn mã màu"
                              className="h-6 w-6 shrink-0 cursor-pointer rounded border border-brand-100 bg-transparent p-0"
                            />
                            <input
                              type="text"
                              value={color.name}
                              onChange={(e) =>
                                updateMaterialColor(matIdx, colorIdx, {
                                  name: e.target.value,
                                })
                              }
                              placeholder="Tên màu"
                              className="min-w-0 flex-1 bg-transparent text-xs text-text-default focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeMaterialColor(matIdx, colorIdx)}
                              aria-label="Xóa màu"
                              className="text-text-muted hover:text-red-600 cursor-pointer">
                              <IconX size={14} stroke={1.75} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: KÍCH THƯỚC */}
      {activeTab === "dimensions" && (
        <div className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-brand-400">Kích thước tiêu chuẩn (m)</h3>
            <p className="mt-0.5 text-xs text-text-muted">
              Thông số kích thước mặc định tính theo mét (VD: 2.6 m, 0.9 m, 0.85 m) hiển thị trong bộ cấu hình sản phẩm.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Chiều dài / Rộng (m)"
              type="number"
              step="0.05"
              min={0.2}
              max={10}
              value={defaultWidthM}
              onChange={(e) => setDefaultWidthM(e.target.value)}
              placeholder="VD: 2.6"
              fullWidth
            />
            <Input
              label="Chiều sâu (m)"
              type="number"
              step="0.05"
              min={0.2}
              max={10}
              value={defaultDepthM}
              onChange={(e) => setDefaultDepthM(e.target.value)}
              placeholder="VD: 0.9"
              fullWidth
            />
            <Input
              label="Chiều cao (m)"
              type="number"
              step="0.05"
              min={0.2}
              max={4}
              value={defaultHeightM}
              onChange={(e) => setDefaultHeightM(e.target.value)}
              placeholder="VD: 0.85"
              fullWidth
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-brand-100 bg-bg-muted p-4">
            <div>
              <p className="text-sm font-medium text-brand-400">Cho phép đặt đóng kích thước riêng (allowCustomSize)</p>
              <p className="mt-0.5 text-xs text-text-muted">
                Bật tùy chọn này để khách nhập kích thước riêng theo phòng khách trên trang sản phẩm.
              </p>
            </div>
            <label className="inline-flex items-center gap-2.5 text-sm font-medium text-brand-400 cursor-pointer">
              <input
                type="checkbox"
                checked={allowCustomSize}
                onChange={(e) => setAllowCustomSize(e.target.checked)}
                className="h-5 w-5 rounded border-brand-200 accent-brand-400"
              />
              <span>{allowCustomSize ? "Đang bật" : "Đang tắt"}</span>
            </label>
          </div>

          {(defaultWidthM || defaultDepthM || defaultHeightM) && (
            <div className="rounded-[8px] border border-brand-100 bg-brand-50/50 px-4 py-3 text-xs text-brand-400">
              Hiển thị kích thước mẫu:{" "}
              <span className="font-semibold">
                {defaultWidthM || "—"} × {defaultDepthM || "—"} × {defaultHeightM || "—"} m
              </span>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HÌNH ẢNH */}
      {activeTab === "images" && (
        <div className="rounded-[12px] border border-brand-100 bg-bg-page p-5">
          <ImageUploader images={images} onChange={setImages} folder={`products/${slug || "draft"}`} multiple />
        </div>
      )}

      {/* TAB 5: SEO */}
      {activeTab === "seo" && (
        <div className="space-y-5">
          {/* SERP & Slug Preview */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-muted p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">Xem trước đường dẫn & SEO</p>
            <div className="rounded-[8px] border border-brand-100 bg-bg-page p-4 space-y-1">
              <p className="text-xs text-brand-300">https://sofaphamgia.com/san-pham/{slug || "ten-san-pham"}</p>
              <p className="text-base font-semibold text-brand-400">{seoTitlePreview}</p>
              <p className="line-clamp-2 text-xs text-text-muted">{seoDescPreview}</p>
            </div>
          </section>

          {/* Key-Value metadata editor */}
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-brand-400">Trường Metadata JSON (Key – Value)</h3>
                <p className="text-xs text-text-muted">Lưu các khóa SEO và thông tin bổ sung vào `Product.metadata`.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconPlus size={15} stroke={1.75} />}
                onClick={() => setMetadataRows((prev) => [...prev, { key: "", value: "" }])}>
                Thêm khóa
              </Button>
            </div>

            <div className="space-y-2.5">
              {metadataRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center">
                  <div className="sm:col-span-4">
                    <Input
                      value={row.key}
                      onChange={(e) =>
                        setMetadataRows((prev) => prev.map((r, i) => (i === idx ? { ...r, key: e.target.value } : r)))
                      }
                      placeholder="Khóa (VD: seoTitle, warrantyFrame)"
                      inputSize="sm"
                      fullWidth
                    />
                  </div>
                  <div className="sm:col-span-7">
                    <Input
                      value={row.value}
                      onChange={(e) =>
                        setMetadataRows((prev) => prev.map((r, i) => (i === idx ? { ...r, value: e.target.value } : r)))
                      }
                      placeholder="Giá trị"
                      inputSize="sm"
                      fullWidth
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMetadataRows((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label="Xóa khóa metadata"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 text-red-600 hover:border-red-300 hover:bg-red-50 cursor-pointer">
                      <IconTrash size={14} stroke={1.75} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 6: ĐÁNH GIÁ */}
      {activeTab === "reviews" && (
        <div className="rounded-[12px] border border-brand-100 bg-bg-page p-5 space-y-4">
          {!isEditing ? (
            <p className="py-8 text-center text-sm text-text-muted">
              Hãy lưu sản phẩm trước để xem và duyệt đánh giá từ khách hàng.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-brand-400">Đánh giá của khách hàng ({reviews.length})</h3>
                  <p className="text-xs text-text-muted">
                    Chỉ đánh giá đã duyệt mới hiển thị công khai trên trang chi tiết sản phẩm.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: "all", label: `Tất cả (${reviews.length})` },
                      {
                        id: "approved",
                        label: `Đã duyệt (${reviews.filter((r) => r.approved).length})`,
                      },
                      {
                        id: "pending",
                        label: `Chờ duyệt (${pendingReviewsCount})`,
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReviewFilter(item.id)}
                      className={clsx(
                        "rounded-[20px] border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                        reviewFilter === item.id
                          ? "border-brand-400 bg-brand-400 text-white"
                          : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200"
                      )}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredReviews.length === 0 ? (
                <div className="rounded-[8px] border border-dashed border-brand-100 bg-bg-muted px-4 py-10 text-center text-xs text-text-muted">
                  Chưa có đánh giá nào trong mục này.
                </div>
              ) : (
                <div className="divide-y divide-brand-100/60 rounded-[8px] border border-brand-100">
                  {filteredReviews.map((rev) => {
                    const isBusy = busyReviewId === rev.id;
                    return (
                      <div
                        key={rev.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-text-default">{rev.authorName}</span>
                            <Badge variant={rev.approved ? "success" : "warning"}>
                              {rev.approved ? "Đã duyệt" : "Chờ duyệt"}
                            </Badge>
                            <span className="text-xs font-semibold text-amber-700">{rev.rating}/5 ★</span>
                            <span className="text-xs text-text-muted">{formatDateVi(rev.createdAt)}</span>
                          </div>
                          {rev.title && <p className="text-sm font-medium text-brand-400">{rev.title}</p>}
                          {rev.body && <p className="text-xs leading-relaxed text-text-muted">{rev.body}</p>}
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          {rev.approved ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              loading={isBusy}
                              onClick={() => handleModerateReview(rev.id, false)}>
                              Ẩn đánh giá
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="primary"
                              size="xs"
                              loading={isBusy}
                              leftIcon={<IconCheck size={13} stroke={1.75} />}
                              onClick={() => handleModerateReview(rev.id, true)}>
                              Duyệt
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            disabled={isBusy}
                            onClick={() => handleDeleteReview(rev.id)}>
                            Xóa
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
}
