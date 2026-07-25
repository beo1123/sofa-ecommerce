"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import { ProductGalleryAnimatedImage } from "./ProductGalleryAnimatedImage";
import { ProductGalleryLightbox } from "./ProductGalleryLightbox";
import { ProductGalleryThumbnails } from "./ProductGalleryThumbnails";
import type { ProductGalleryImage } from "../../types/products/ProductImageGallery.types";

type ProductImageGalleryProps = {
  images: ProductGalleryImage[];
  title: string;
};

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const safeImages = useMemo(() => (Array.isArray(images) ? images : []), [images]);

  const [selectedImage, setSelectedImage] = useState<string>(safeImages[0]?.url ?? "");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [galleryDirection, setGalleryDirection] = useState<1 | -1>(1);
  const [lightboxDirection, setLightboxDirection] = useState<1 | -1>(1);
  const currentIndex = Math.max(
    safeImages.findIndex((img) => img.url === selectedImage),
    0
  );

  const nextImage = useCallback(() => {
    const next = (currentIndex + 1) % safeImages.length;
    setGalleryDirection(1);
    setLightboxDirection(1);
    setSelectedImage(safeImages[next].url);
  }, [currentIndex, safeImages]);

  const prevImage = useCallback(() => {
    const prev = (currentIndex - 1 + safeImages.length) % safeImages.length;
    setGalleryDirection(-1);
    setLightboxDirection(-1);
    setSelectedImage(safeImages[prev].url);
  }, [currentIndex, safeImages]);

  // --- Mobile Slide Handling ---
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const suppressImageClick = useRef(false);
  const lightboxTouchStartX = useRef(0);
  const lightboxTouchEndX = useRef(0);
  const isLightboxSwiping = useRef(false);

  useEffect(() => {
    if (!safeImages.length) {
      setSelectedImage("");
      return;
    }

    const hasSelectedImage = safeImages.some((img) => img.url === selectedImage);

    if (!hasSelectedImage) {
      setSelectedImage(safeImages[0].url);
    }
  }, [safeImages, selectedImage]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
        return;
      }

      if (safeImages.length <= 1) return;

      if (event.key === "ArrowRight") nextImage();
      if (event.key === "ArrowLeft") prevImage();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, nextImage, prevImage, safeImages.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    const startX = e.touches[0].clientX;
    touchStartX.current = startX;
    touchEndX.current = startX;
    isSwiping.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;

    if (Math.abs(touchStartX.current - touchEndX.current) > 10) {
      isSwiping.current = true;
    }
  };

  const onTouchEnd = () => {
    if (!isSwiping.current) return;

    const distance = touchStartX.current - touchEndX.current;
    suppressImageClick.current = true;

    if (Math.abs(distance) < 50) {
      isSwiping.current = false;
      return;
    }

    if (distance > 0) nextImage();
    else prevImage();

    isSwiping.current = false;
  };

  const onLightboxTouchStart = (e: React.TouchEvent) => {
    const startX = e.touches[0].clientX;
    lightboxTouchStartX.current = startX;
    lightboxTouchEndX.current = startX;
    isLightboxSwiping.current = false;
  };

  const onLightboxTouchMove = (e: React.TouchEvent) => {
    lightboxTouchEndX.current = e.touches[0].clientX;

    if (Math.abs(lightboxTouchStartX.current - lightboxTouchEndX.current) > 10) {
      isLightboxSwiping.current = true;
    }
  };

  const onLightboxTouchEnd = () => {
    if (!isLightboxSwiping.current) return;

    const distance = lightboxTouchStartX.current - lightboxTouchEndX.current;

    if (Math.abs(distance) < 50) {
      isLightboxSwiping.current = false;
      return;
    }

    if (distance > 0) nextImage();
    else prevImage();

    isLightboxSwiping.current = false;
  };

  const openLightbox = () => {
    if (suppressImageClick.current) {
      suppressImageClick.current = false;
      return;
    }

    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
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
    <div className="flex flex-col h-full">
      {/* Main Image — full-bleed, taller on mobile, fills grid cell height on desktop */}
      <div
        className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] bg-[var(--color-bg-muted)] overflow-hidden group cursor-zoom-in"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        aria-label={`Xem lớn ảnh ${currentIndex + 1} của ${title}`}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLightbox();
          }
        }}>
        <ProductGalleryAnimatedImage
          image={current}
          title={title}
          direction={galleryDirection}
          imageClassName="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          offset={48}
          scale={0.985}
          duration={0.24}
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent px-4 py-4 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur-sm">
            Chạm để xem lớn
          </span>
        </div>

        {/* Navigation */}
        {safeImages.length > 1 && (
          <>
            <Button
              onClick={(event) => {
                event.stopPropagation();
                prevImage();
              }}
              size="sm"
              aria-label="Ảnh trước"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-lg opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <ChevronLeft size={20} />
            </Button>

            <Button
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              size="sm"
              aria-label="Ảnh tiếp theo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 justify-center rounded-full shadow-lg opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <ChevronRight size={20} />
            </Button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {safeImages.length}
        </div>
      </div>
      <ProductGalleryThumbnails
        images={safeImages}
        title={title}
        selectedImage={selectedImage}
        onSelect={(imageUrl, index) => {
          setGalleryDirection(index >= currentIndex ? 1 : -1);
          setSelectedImage(imageUrl);
        }}
        containerClassName="flex flex-shrink-0 gap-2 overflow-x-auto bg-white px-3 py-2 no-scrollbar"
        buttonClassName="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all"
        selectedClassName="border-[var(--color-brand-400)] ring-2 ring-[var(--color-brand-200)]"
        idleClassName="border-transparent hover:border-[var(--color-brand-200)]"
      />

      <ProductGalleryLightbox
        isOpen={isLightboxOpen}
        images={safeImages}
        title={title}
        currentImage={current}
        currentIndex={currentIndex}
        selectedImage={selectedImage}
        direction={lightboxDirection}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
        onSelect={(imageUrl, index) => {
          setLightboxDirection(index >= currentIndex ? 1 : -1);
          setSelectedImage(imageUrl);
        }}
        onTouchStart={onLightboxTouchStart}
        onTouchMove={onLightboxTouchMove}
        onTouchEnd={onLightboxTouchEnd}
      />
    </div>
  );
}
