"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Star, Trash2, Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface ImageUploaderProps {
  images: { url: string; alt?: string; isPrimary?: boolean }[];
  onChange: (images: { url: string; alt?: string; isPrimary?: boolean }[]) => void;
  multiple?: boolean;
}

/**
 * Simple ImageUploader using URL input instead of file upload.
 * For production, integrate with your upload API.
 */
export default function ImageUploader({ images, onChange, multiple = true }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAddImage = () => {
    if (!urlInput.trim()) {
      setError("Vui lòng nhập URL ảnh");
      return;
    }

    try {
      new URL(urlInput); // Validate URL
    } catch {
      setError("URL không hợp lệ");
      return;
    }

    setError(null);
    const newImages = multiple ? [...images] : [];
    newImages.push({
      url: urlInput.trim(),
      alt: "",
      isPrimary: newImages.length === 0,
    });
    onChange(newImages);
    setUrlInput("");
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0] = { ...updated[0], isPrimary: true };
    }
    onChange(updated);
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
                    Chính
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="p-1 bg-red-500 text-white rounded shadow hover:bg-red-600"
                  aria-label="Xóa ảnh">
                  <Trash2 size={14} />
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

      {/* Add image by URL */}
      <div className="flex gap-2">
        <Input
          placeholder="Nhập URL ảnh (https://...)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          fullWidth
        />
        <Button type="button" onClick={handleAddImage} leftIcon={<Plus size={16} />}>
          Thêm
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
