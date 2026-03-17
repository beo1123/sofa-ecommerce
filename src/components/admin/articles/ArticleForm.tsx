"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Upload, Loader2 } from "lucide-react";
import axiosClient from "@/server/axiosClient";

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
  defaultValues?: Partial<ArticleFormData> & { thumbnail?: string | null };
  categories: ArticleCategory[];
  onSubmit: (data: ArticleFormData & { thumbnail?: string }) => Promise<void>;
  submitLabel?: string;
}

// ─── Component ───────────────────────────────────────────
export default function ArticleForm({ defaultValues, categories, onSubmit, submitLabel = "Lưu" }: ArticleFormProps) {
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

  const [thumbnail, setThumbnail] = useState<string>(defaultValues?.thumbnail ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const statusValue = watch("status") ?? "DRAFT";

  // Auto-generate slug
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

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "articles");

      const res = await axiosClient.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setThumbnail(res.data.data.url);
      }
    } catch (err: any) {
      setUploadError(err?.response?.data?.error?.message ?? "Upload ảnh thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleFormSubmit = async (data: ArticleFormData) => {
    await onSubmit({
      ...data,
      thumbnail: thumbnail || undefined,
    });
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
                onChange={(v) => setValue("categoryId", Number(v))}
                options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
                placeholder="Chọn danh mục"
                fullWidth
              />
            </div>
            <Input label="Tóm tắt" {...register("excerpt")} />
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {thumbnail ? (
              <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-gray-200">
                <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setThumbnail("")}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">
                  ×
                </button>
              </div>
            ) : null}
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[var(--color-brand-300)] transition-colors">
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} className="text-[var(--color-text-muted)]" />
              )}
              <span className="text-sm">{uploading ? "Đang upload..." : "Chọn ảnh"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          {uploadError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {uploadError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Nội dung</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            {...register("content")}
            rows={15}
            className="block w-full px-3 py-2 border border-[var(--color-brand-100)] rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:border-[var(--color-brand-400)] font-mono text-sm"
            placeholder="Viết nội dung bài viết (hỗ trợ HTML)..."
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
