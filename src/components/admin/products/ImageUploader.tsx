"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Star, Upload, X } from "lucide-react";
import axiosClient from "@/server/axiosClient";

interface ImageUploaderProps {
  images: { url: string; alt?: string; isPrimary?: boolean }[];
  onChange: (images: { url: string; alt?: string; isPrimary?: boolean }[]) => void;
  folder?: string;
  multiple?: boolean;
}

export default function ImageUploader({ images, onChange, folder = "products", multiple = true }: ImageUploaderProps) {
  const [activeRemoveIndex, setActiveRemoveIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, uploadFolder }: { file: File; uploadFolder: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", uploadFolder);

      const res = await axiosClient.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data?.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      await axiosClient.delete("/admin/upload", {
        data: { url },
      });
    },
  });

  const uploading = uploadMutation.isPending;
  const removing = deleteMutation.isPending;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    try {
      const selectedFiles = multiple ? Array.from(files) : [files[0]];
      const newImages = multiple ? [...images] : [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (!file) continue;

        const res = await uploadMutation.mutateAsync({ file, uploadFolder: folder });

        if (res?.url) {
          newImages.push({
            url: res.url,
            alt: file.name,
            isPrimary: newImages.length === 0,
          });
        }
      }

      onChange(newImages);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Upload thất bại");
    } finally {
      e.target.value = "";
    }
  };

  const handleRemove = async (index: number) => {
    const image = images[index];
    if (!image) return;

    setError(null);
    setActiveRemoveIndex(index);

    try {
      await deleteMutation.mutateAsync({ url: image.url });

      const updated = images.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0] = { ...updated[0], isPrimary: true };
      }
      onChange(updated);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Xóa ảnh thất bại");
    } finally {
      setActiveRemoveIndex(null);
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));

    const primaryImage = updated[index];
    const remainingImages = updated.filter((_, i) => i !== index);
    onChange([primaryImage, ...remainingImages]);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const [movedImage] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedImage);
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
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                {multiple && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleMove(i, "left")}
                      disabled={i === 0}
                      className="p-1 bg-white text-gray-800 rounded shadow hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Đưa ảnh sang trái">
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(i, "right")}
                      disabled={i === images.length - 1}
                      className="p-1 bg-white text-gray-800 rounded shadow hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Đưa ảnh sang phải">
                      <ArrowRight size={14} />
                    </button>
                  </>
                )}
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(i)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white text-gray-800 rounded shadow hover:bg-gray-100">
                    <Star size={12} />
                    Ảnh chính
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleRemove(i)}
                  disabled={removing}
                  className="p-1 bg-red-500 text-white rounded shadow hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Xóa ảnh">
                  {activeRemoveIndex === i ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                </button>
              </div>

              {/* Primary badge */}
              {img.isPrimary && (
                <span className="absolute top-1 left-1 text-[10px] bg-[var(--color-brand-300)] text-white px-1.5 py-0.5 rounded">
                  Chính
                </span>
              )}

              {multiple && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                  #{i + 1}
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
          multiple={multiple}
          onChange={handleUpload}
          disabled={uploading || removing}
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
