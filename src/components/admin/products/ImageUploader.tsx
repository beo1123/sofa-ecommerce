"use client";

import React, { useId, useState } from "react";
import clsx from "clsx";
import { IconArrowLeft, IconArrowRight, IconLoader2, IconPhotoUp, IconTrash } from "@tabler/icons-react";

export interface UploadedImageItem {
  id?: number;
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
}

interface ImageUploaderProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  folder?: string;
  multiple?: boolean;
  label?: string;
}

export default function ImageUploader({
  images,
  onChange,
  folder = "products",
  multiple = true,
  label = "Hình ảnh sản phẩm",
}: ImageUploaderProps) {
  const radioGroupName = useId();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeRemoveIndex, setActiveRemoveIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setError("Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, WebP, AVIF)");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const selectedFiles = multiple ? files : [files[0]];
      const nextImages: UploadedImageItem[] = multiple ? [...images] : [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();

        if (!res.ok || !json?.data?.url) {
          throw new Error(json?.error?.message ?? "Upload ảnh thất bại");
        }

        nextImages.push({
          url: json.data.url as string,
          alt: file.name.replace(/\.[^/.]+$/, ""),
          isPrimary: nextImages.length === 0,
        });
      }

      if (nextImages.length > 0 && !nextImages.some((img) => img.isPrimary)) {
        nextImages[0] = { ...nextImages[0], isPrimary: true };
      }

      onChange(nextImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (uploading || activeRemoveIndex !== null) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = async (index: number) => {
    const target = images[index];
    if (!target) return;

    setError(null);
    setActiveRemoveIndex(index);

    try {
      await fetch("/api/admin/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target.url }),
      }).catch(() => undefined);

      const next = images.filter((_, idx) => idx !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      onChange(next);
    } catch {
      setError("Không thể xóa ảnh");
    } finally {
      setActiveRemoveIndex(null);
    }
  };

  const handleSetPrimary = (index: number) => {
    const next = images.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
    }));
    onChange(next);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  const handleAltChange = (index: number, alt: string) => {
    const next = images.map((img, idx) => (idx === index ? { ...img, alt } : img));
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-text-default">{label}</span>
          <span className="text-xs text-text-muted">{images.length} ảnh · Chọn radio để đặt ảnh đại diện chính</span>
        </div>
      )}

      {/* Drag-drop zone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={clsx(
          "flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed p-7 text-center transition-colors cursor-pointer",
          dragActive
            ? "border-brand-300 bg-brand-50/60"
            : "border-brand-200 bg-bg-muted hover:border-brand-300 hover:bg-brand-50/40",
          uploading && "opacity-70 cursor-wait"
        )}>
        {uploading ? (
          <>
            <IconLoader2 size={24} stroke={1.75} className="animate-spin text-brand-300" />
            <span className="text-sm font-medium text-brand-400">Đang tải ảnh lên Cloudinary...</span>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-300">
              <IconPhotoUp size={20} stroke={1.75} />
            </span>
            <p className="text-sm font-medium text-brand-400">Kéo thả ảnh vào đây hoặc nhấn để chọn file</p>
            <p className="text-xs text-text-muted">Hỗ trợ JPEG, PNG, WebP, AVIF (tối đa 10 MB/ảnh)</p>
          </>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          onChange={handleFileInput}
          disabled={uploading || activeRemoveIndex !== null}
          className="hidden"
        />
      </label>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Preview strip */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((img, idx) => (
            <div
              key={`${img.url}-${idx}`}
              className={clsx(
                "flex flex-col overflow-hidden rounded-[12px] border bg-bg-page transition-colors",
                img.isPrimary ? "border-brand-400" : "border-brand-100"
              )}>
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
                <img src={img.url} alt={img.alt ?? `Ảnh ${idx + 1}`} className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-[20px] bg-bg-page/90 px-2 py-0.5 text-[11px] font-medium text-brand-400">
                  #{idx + 1}
                </span>
                {img.isPrimary && (
                  <span className="absolute right-2 top-2 rounded-[20px] bg-brand-400 px-2 py-0.5 text-[11px] font-medium text-white">
                    Ảnh chính
                  </span>
                )}
              </div>

              <div className="space-y-2 p-2.5">
                <input
                  type="text"
                  value={img.alt ?? ""}
                  onChange={(e) => handleAltChange(idx, e.target.value)}
                  placeholder="Mô tả ảnh (alt SEO)"
                  className="w-full rounded-[8px] border border-brand-100 bg-bg-page px-2 py-1 text-xs text-text-default placeholder:text-text-muted/70 focus:border-brand-300 focus:outline-none focus:ring-[3px] focus:ring-brand-50"
                />

                <div className="flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-400 cursor-pointer">
                    <input
                      type="radio"
                      name={radioGroupName}
                      checked={Boolean(img.isPrimary)}
                      onChange={() => handleSetPrimary(idx)}
                      className="h-3.5 w-3.5 accent-brand-400"
                    />
                    <span>Ảnh chính</span>
                  </label>

                  <div className="flex items-center gap-1">
                    {multiple && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "left")}
                          disabled={idx === 0}
                          aria-label="Chuyển sang trái"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-brand-100 text-brand-300 hover:border-brand-200 hover:bg-brand-50 disabled:opacity-40 cursor-pointer">
                          <IconArrowLeft size={14} stroke={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "right")}
                          disabled={idx === images.length - 1}
                          aria-label="Chuyển sang phải"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-brand-100 text-brand-300 hover:border-brand-200 hover:bg-brand-50 disabled:opacity-40 cursor-pointer">
                          <IconArrowRight size={14} stroke={1.75} />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      disabled={activeRemoveIndex !== null}
                      aria-label="Xóa ảnh"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-brand-100 text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-40 cursor-pointer">
                      {activeRemoveIndex === idx ? (
                        <IconLoader2 size={14} stroke={1.75} className="animate-spin" />
                      ) : (
                        <IconTrash size={14} stroke={1.75} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
