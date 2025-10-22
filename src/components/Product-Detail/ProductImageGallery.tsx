"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductImageGalleryProps = {
  images: any[];
  title: string;
};

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-[var(--color-bg-muted)]">
        <p className="text-[var(--color-text-muted)]">Không có hình ảnh</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Main Image */}
      <div className="relative aspect-square bg-[var(--color-bg-muted)] rounded-2xl overflow-hidden group mb-4">
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].alt || title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {selectedImage + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
        {images.slice(0, 8).map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === idx
                ? "border-[var(--color-brand-400)] ring-2 ring-[var(--color-brand-200)]"
                : "border-transparent hover:border-[var(--color-brand-200)]"
            }`}>
            <Image src={img.url} alt={img.alt || `${title} ${idx + 1}`} fill className="object-cover" sizes="100px" />
          </button>
        ))}
      </div>
    </div>
  );
}
