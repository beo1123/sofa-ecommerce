"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import RichTextEditor from "@/components/ui/RichTextEditor";
import ArticleThumbnailUploader from "@/components/admin/articles/ArticleThumbnailUploader";
import { makeAssetFolderSegment } from "@/lib/articles/adminArticleUtils";
import { useArticleThumbnail } from "@/hooks/articles/useArticleThumbnail";
import { useArticleContentImageUpload } from "@/hooks/articles/useArticleContentImageUpload";

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

  const statusValue = watch("status") ?? "DRAFT";
  const titleValue = watch("title") ?? "";
  const slugValue = watch("slug") ?? "";
  const contentValue = watch("content") ?? "";
  const titleField = register("title");

  const uploadFolder = `articles/${makeAssetFolderSegment(slugValue || titleValue || "untitled-article")}`;
  const { thumbnail, uploadError, uploadThumbnail, removeThumbnail, isUploading, isDeleting } = useArticleThumbnail(
    defaultValues?.thumbnail
  );
  const {
    uploadImage: uploadContentImage,
    removeImage: removeContentImage,
    cleanupUnusedImages,
    error: contentImageError,
    isUploading: isUploadingContentImage,
    isDeleting: isDeletingContentImage,
  } = useArticleContentImageUpload();

  // Auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    titleField.onChange(e);
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

  const handleFormSubmit = async (data: ArticleFormData) => {
    await cleanupUnusedImages(data.content, defaultValues?.content ?? "");

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
              {...titleField}
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
            <Input label="Tóm tắt" {...register("excerpt")} fullWidth />
          </div>
        </CardContent>
      </Card>

      {/* Thumbnail */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleThumbnailUploader
            thumbnail={thumbnail}
            onUpload={(file) => uploadThumbnail(file, uploadFolder)}
            onRemove={removeThumbnail}
            uploading={isUploading}
            deleting={isDeleting}
            error={uploadError}
          />
        </CardContent>
      </Card>

      {/* Content */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Nội dung</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={contentValue}
            onChange={(html) => setValue("content", html, { shouldDirty: true, shouldValidate: true })}
            placeholder="Soạn nội dung bài viết với heading, danh sách, liên kết và định dạng nâng cao..."
            minHeight={320}
            onImageUpload={(file) => uploadContentImage(file, `${uploadFolder}/content`)}
            imageUploading={isUploadingContentImage}
            onImageRemove={removeContentImage}
            imageRemoving={isDeletingContentImage}
          />
          {contentImageError && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {contentImageError}
            </p>
          )}
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
