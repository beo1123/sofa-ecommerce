"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import RichTextEditor from "@/components/ui/RichTextEditor";
import ArticleImageUploader, { type ArticleImage } from "@/components/admin/articles/ArticleImageUploader";

// ─── Zod Schema ──────────────────────────────────────────
const articleSchema = z.object({
  title: z.string().min(1, "Tiêu đề bắt buộc"),
  slug: z.string().min(1, "Slug bắt buộc"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Nội dung bắt buộc"),
  status: z.string().optional(),
  categoryId: z.number().optional(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

// ─── Props ───────────────────────────────────────────────
interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
}

interface ArticleFormProps {
  defaultValues?: Partial<ArticleFormData> & {
    images?: ArticleImage[];
  };
  categories: ArticleCategory[];
  onSubmit: (data: ArticleFormData & { images: ArticleImage[] }) => Promise<void>;
  /** Present when editing – enables immediate per-image DB deletion */
  articleId?: number;
  submitLabel?: string;
}

// ─── Helpers ─────────────────────────────────────────────
const makeFolderSafe = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

// ─── Component ───────────────────────────────────────────
export default function ArticleForm({
  defaultValues,
  categories,
  onSubmit,
  articleId,
  submitLabel = "Lưu",
}: ArticleFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      excerpt: defaultValues?.excerpt ?? "",
      content: defaultValues?.content ?? "",
      status: defaultValues?.status ?? "DRAFT",
      categoryId: defaultValues?.categoryId,
    },
  });

  const [images, setImages] = useState<ArticleImage[]>(defaultValues?.images ?? []);

  const statusValue = watch("status") ?? "DRAFT";
  const slugValue = watch("slug") ?? "";
  const titleValue = watch("title") ?? "";
  const contentValue = watch("content") ?? "";

  // Compute upload folder from slug / title (like ProductForm)
  const folderSegment = makeFolderSafe(slugValue || titleValue || "untitled-article");
  const uploadFolder = `articles/${folderSegment}`;

  // Auto-generate slug from title (only when creating)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    register("title").onChange(e);
    const title = e.target.value;
    if (!defaultValues?.slug) {
      const slug = makeFolderSafe(title);
      setValue("slug", slug);
    }
  };

  const handleFormSubmit = async (data: ArticleFormData) => {
    await onSubmit({ ...data, images });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Thông tin bài viết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tiêu đề"
              {...register("title")}
              onChange={handleTitleChange}
              error={errors.title?.message}
              required
            />
            <Input label="Slug (URL)" {...register("slug")} error={errors.slug?.message} required />
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
            <Input label="Tóm tắt" {...register("excerpt")} />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Hình ảnh</CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleImageUploader images={images} onChange={setImages} folder={uploadFolder} articleId={articleId} />
        </CardContent>
      </Card>

      {/* Content – WYSIWYG editor */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Nội dung</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={contentValue}
            onChange={(html) => setValue("content", html, { shouldValidate: true })}
            placeholder="Viết nội dung bài viết..."
            minHeight={320}
          />
          {errors.content?.message && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.content.message}
            </p>
          )}
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
