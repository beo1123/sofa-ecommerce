"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "../ui/SafeImage";
import Button from "../ui/Button";

type ProductImageGalleryProps = {
  images: { url: string; alt?: string }[];
  title: string;
};

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const safeImages = Array.isArray(images) ? images : [];

  const [selectedImage, setSelectedImage] = useState<string>(safeImages[0]?.url ?? "");
  const currentIndex = safeImages.findIndex((img) => img.url === selectedImage);

  const nextImage = () => {
    const next = (currentIndex + 1) % safeImages.length;
    setSelectedImage(safeImages[next].url);
  };

  const prevImage = () => {
    const prev = (currentIndex - 1 + safeImages.length) % safeImages.length;
    setSelectedImage(safeImages[prev].url);
  };

  // --- Mobile Slide Handling ---
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) < 50) return;

    if (distance > 0) nextImage();
    else prevImage();
  };

  if (safeImages.length === 0 || !selectedImage) {
    return (
      <div className="flex items-center justify-center h-96 bg-[var(--color-bg-muted)]">
        <p className="text-[var(--color-text-muted)]">Không có hình ảnh</p>
      </div>
    );
  }

  const current = safeImages[currentIndex];

  return (
    <div className="p-6 lg:p-8">
      {/* Main Image */}
      <div
        className="
          relative aspect-square bg-[var(--color-bg-muted)]
          rounded-2xl overflow-hidden group mb-4
        "
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}>
        <SafeImage
          key={current.url}
          src={current.url}
          alt={current.alt || title}
          fill
          className="object-cover transition-all duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {/* Navigation */}
        {safeImages.length > 1 && (
          <>
            <Button
              onClick={prevImage}
              size="sm"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={20} />
            </Button>

            <Button
              onClick={nextImage}
              size="sm"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={20} />
            </Button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {safeImages.length}
        </div>
      </div>

      <div
        className="
          flex gap-3 overflow-x-auto no-scrollbar py-1
        ">
        {safeImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img.url)}
            className={`
              relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all 
              ${
                selectedImage === img.url
                  ? "border-[var(--color-brand-400)] ring-2 ring-[var(--color-brand-200)]"
                  : "border-transparent hover:border-[var(--color-brand-200)]"
              }
            `}>
            <SafeImage
              src={img.url}
              alt={img.alt || `${title} ${idx + 1}`}
              fill
              className="object-cover"
              sizes="100px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
