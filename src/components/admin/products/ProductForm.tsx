"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
import ImageUploader from "@/components/admin/products/ImageUploader";
import { Plus, Trash2 } from "lucide-react";

// ─── Zod Schema ──────────────────────────────────────────
const variantSchema = z.object({
  name: z.string().min(1, "Tên biến thể bắt buộc"),
  sku: z.string().min(1, "SKU bắt buộc"),
  price: z.coerce.number().min(0, "Giá >= 0"),
  compareAtPrice: z.coerce.number().optional(),
  quantity: z.coerce.number().int().min(0).optional(),
  color: z.string().optional(),
  material: z.string().optional(),
});

const productSchema = z.object({
  title: z.string().min(1, "Tên sản phẩm bắt buộc"),
  slug: z.string().min(1, "Slug bắt buộc"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  categoryId: z.number().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
type VariantData = z.infer<typeof variantSchema>;

// ─── Props ───────────────────────────────────────────────
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData> & {
    images?: { url: string; alt?: string; isPrimary?: boolean }[];
    variants?: (VariantData & { id?: number })[];
  };
  categories: Category[];
  onSubmit: (
    data: ProductFormData & {
      images: { url: string; alt?: string; isPrimary?: boolean }[];
      variants: VariantData[];
    }
  ) => Promise<void>;
  submitLabel?: string;
}

// ─── Component ───────────────────────────────────────────
export default function ProductForm({ defaultValues, categories, onSubmit, submitLabel = "Lưu" }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      shortDescription: defaultValues?.shortDescription ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status ?? "DRAFT",
      categoryId: defaultValues?.categoryId,
    },
  });

  const [images, setImages] = useState<{ url: string; alt?: string; isPrimary?: boolean }[]>(
    defaultValues?.images ?? []
  );

  const [variants, setVariants] = useState<VariantData[]>(
    defaultValues?.variants?.map((v) => ({
      name: v.name ?? "",
      sku: v.sku ?? "",
      price: v.price ?? 0,
      compareAtPrice: v.compareAtPrice,
      quantity: v.quantity ?? 0,
      color: v.color ?? "",
      material: v.material ?? "",
    })) ?? [{ name: "", sku: "", price: 0, quantity: 0, color: "", material: "" }]
  );

  const statusValue = watch("status") ?? "DRAFT";

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    register("title").onChange(e);
    const title = e.target.value;
    if (!defaultValues?.slug) {
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", sku: "", price: 0, quantity: 0, color: "", material: "" }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantData, value: string | number | undefined) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    // Validate variants
    const validVariants = variants.filter((v) => v.name && v.sku && v.price >= 0);
    await onSubmit({
      ...data,
      images,
      variants: validVariants,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tên sản phẩm"
              {...register("title")}
              onChange={handleTitleChange}
              error={errors.title?.message}
              required
            />
            <Input label="Slug (URL)" {...register("slug")} error={errors.slug?.message} required />
            <Input label="Mô tả ngắn" {...register("shortDescription")} fullWidth />
            <div className="flex items-end gap-4">
              <Dropdown
                label="Trạng thái"
                value={statusValue}
                onChange={(v) => setValue("status", v)}
                options={[
                  { label: "Nháp", value: "DRAFT" },
                  { label: "Đã đăng", value: "PUBLISHED" },
                  { label: "Lưu trữ", value: "ARCHIVED" },
                ]}
                fullWidth
              />
              <Dropdown
                label="Danh mục"
                value={String(watch("categoryId") ?? "")}
                onChange={(v) => setValue("categoryId", v ? Number(v) : undefined)}
                options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
                placeholder="Chọn danh mục"
                fullWidth
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-[var(--color-text-default)] mb-1">Mô tả chi tiết</label>
            <textarea
              {...register("description")}
              rows={5}
              className="block w-full px-3 py-2 border border-[var(--color-brand-100)] rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:border-[var(--color-brand-400)]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Hình ảnh</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader images={images} onChange={setImages} />
        </CardContent>
      </Card>

      {/* Variants */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Biến thể sản phẩm</CardTitle>
            <Button type="button" size="sm" variant="outline" leftIcon={<Plus size={14} />} onClick={addVariant}>
              Thêm biến thể
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variants.map((variant, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Heading level={6}>Biến thể #{i + 1}</Heading>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => removeVariant(i)}>
                      Xóa
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Input
                    label="Tên biến thể"
                    value={variant.name}
                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                    placeholder="VD: Lớn / Da / Xám"
                    required
                  />
                  <Input
                    label="SKU"
                    value={variant.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    placeholder="VD: SOFA-001-L"
                    required
                  />
                  <Input
                    label="Giá (VND)"
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                    required
                  />
                  <Input
                    label="Giá so sánh"
                    type="number"
                    value={variant.compareAtPrice ?? ""}
                    onChange={(e) =>
                      updateVariant(i, "compareAtPrice", e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                  <Input
                    label="Số lượng tồn kho"
                    type="number"
                    value={variant.quantity ?? 0}
                    onChange={(e) => updateVariant(i, "quantity", Number(e.target.value))}
                  />
                  <Input
                    label="Màu sắc"
                    value={variant.color ?? ""}
                    onChange={(e) => updateVariant(i, "color", e.target.value)}
                  />
                  <Input
                    label="Chất liệu"
                    value={variant.material ?? ""}
                    onChange={(e) => updateVariant(i, "material", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
