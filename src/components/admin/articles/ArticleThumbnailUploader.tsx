"use client";

import React from "react";
import { Loader2, Upload, X } from "lucide-react";

interface ArticleThumbnailUploaderProps {
  thumbnail: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  uploading?: boolean;
  deleting?: boolean;
  error?: string | null;
}

export default function ArticleThumbnailUploader({
  thumbnail,
  onUpload,
  onRemove,
  uploading = false,
  deleting = false,
  error,
}: ArticleThumbnailUploaderProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await onUpload(file);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {thumbnail ? (
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:w-64">
            <img src={thumbnail} alt="Thumbnail bài viết" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => void onRemove()}
              disabled={deleting || uploading}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Xóa ảnh bài viết">
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            </button>
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-[var(--color-text-muted)] sm:w-64">
            Chưa có ảnh đại diện
          </div>
        )}

        <label
          className={`flex min-h-40 flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors ${
            uploading || deleting
              ? "border-gray-300 bg-gray-50"
              : "border-gray-300 hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)]/30"
          }`}>
          {uploading ? (
            <>
              <Loader2 size={22} className="animate-spin text-[var(--color-brand-300)]" />
              <span className="text-sm text-[var(--color-text-muted)]">Đang tải ảnh lên Cloudinary...</span>
            </>
          ) : (
            <>
              <Upload size={22} className="text-[var(--color-text-muted)]" />
              <span className="text-sm font-medium text-[var(--color-text-default)]">
                {thumbnail ? "Thay ảnh đại diện" : "Tải ảnh đại diện"}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                JPEG, PNG, WebP hoặc AVIF. Ảnh sẽ được lưu theo folder riêng của bài viết.
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => void handleFileChange(e)}
            disabled={uploading || deleting}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
