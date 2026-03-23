"use client";

import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import axiosClient from "@/server/axiosClient";

interface ImageUploaderProps {
  images: { url: string; alt?: string; isPrimary?: boolean }[];
  onChange: (images: { url: string; alt?: string; isPrimary?: boolean }[]) => void;
  folder?: string;
}

export default function ImageUploader({ images, onChange, folder = "products" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newImages = [...images];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("folder", folder);

        const res = await axiosClient.post("/admin/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data?.success) {
          newImages.push({
            url: res.data.data.url,
            alt: files[i].name,
            isPrimary: newImages.length === 0,
          });
        }
      }

      onChange(newImages);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Upload thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--color-text-default)]">Hình ảnh sản phẩm</label>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative group rounded-lg border-2 overflow-hidden aspect-square ${
                img.isPrimary ? "border-[var(--color-brand-300)]" : "border-gray-200"
              }`}>
              <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(i)}
                    className="px-2 py-1 text-xs bg-white text-gray-800 rounded shadow hover:bg-gray-100">
                    Ảnh chính
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="p-1 bg-red-500 text-white rounded shadow hover:bg-red-600">
                  <X size={14} />
                </button>
              </div>

              {/* Primary badge */}
              {img.isPrimary && (
                <span className="absolute top-1 left-1 text-[10px] bg-[var(--color-brand-300)] text-white px-1.5 py-0.5 rounded">
                  Chính
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <label
        className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          uploading
            ? "border-gray-300 bg-gray-50"
            : "border-gray-300 hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)]/30"
        }`}>
        {uploading ? (
          <>
            <Loader2 size={24} className="animate-spin text-[var(--color-brand-300)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Đang upload...</span>
          </>
        ) : (
          <>
            <Upload size={24} className="text-[var(--color-text-muted)]" />
            <span className="text-sm text-[var(--color-text-muted)]">Click để upload ảnh (JPEG, PNG, WebP)</span>
          </>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
