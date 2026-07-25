"use client";

import type { TouchEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Button from "../ui/Button";
import { ProductGalleryAnimatedImage } from "./ProductGalleryAnimatedImage";
import { ProductGalleryThumbnails } from "./ProductGalleryThumbnails";
import type { ProductGalleryImage, SlideDirection } from "../../types/products/ProductImageGallery.types";

type ProductGalleryLightboxProps = {
  isOpen: boolean;
  images: ProductGalleryImage[];
  title: string;
  currentImage: ProductGalleryImage;
  currentIndex: number;
  selectedImage: string;
  direction: SlideDirection;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (imageUrl: string, index: number) => void;
  onTouchStart: (event: TouchEvent) => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchEnd: () => void;
};

export function ProductGalleryLightbox({
  isOpen,
  images,
  title,
  currentImage,
  currentIndex,
  selectedImage,
  direction,
  onClose,
  onPrev,
  onNext,
  onSelect,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: ProductGalleryLightboxProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Xem ảnh sản phẩm ${title}`}
      onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng xem ảnh"
        className="absolute right-4 top-4 z-[95] flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white transition hover:bg-white/20">
        <X size={22} />
      </button>

      {images.length > 1 && (
        <>
          <Button
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
            size="sm"
            aria-label="Ảnh trước trong chế độ xem lớn"
            className="absolute left-6 top-1/2 z-[95] hidden h-11 w-11 -translate-y-1/2 rounded-full bg-white/12 text-white hover:bg-white/20 sm:flex">
            <ChevronLeft size={22} />
          </Button>

          <Button
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            size="sm"
            aria-label="Ảnh tiếp theo trong chế độ xem lớn"
            className="absolute right-6 top-1/2 z-[95] hidden h-11 w-11 -translate-y-1/2 rounded-full bg-white/12 text-white hover:bg-white/20 sm:flex">
            <ChevronRight size={22} />
          </Button>
        </>
      )}

      <div
        className="flex h-full w-full items-center justify-center p-0 sm:p-8"
        onClick={(event) => event.stopPropagation()}>
        <div className="flex h-full w-full max-w-6xl flex-col items-center gap-3 sm:max-h-full sm:gap-4">
          <div
            className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-white/5 sm:h-[78vh] sm:rounded-2xl"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}>
            <ProductGalleryAnimatedImage
              image={currentImage}
              title={title}
              direction={direction}
              imageClassName="object-contain"
              sizes="100vw"
              offset={72}
              scale={0.98}
              duration={0.26}
            />
          </div>

          <div className="absolute bottom-5 left-4 right-4 z-[95] flex items-center justify-between gap-3 text-white/90 sm:static sm:w-full">
            <p className="max-w-[70%] text-sm sm:max-w-none sm:text-base">{currentImage.alt || title}</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          <ProductGalleryThumbnails
            images={images}
            title={title}
            selectedImage={selectedImage}
            onSelect={onSelect}
            containerClassName="flex w-full gap-2 overflow-x-auto px-4 pb-4 sm:px-0 sm:pb-1"
            buttonClassName="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20"
            selectedClassName="border-white"
            idleClassName="border-white/20"
          />
        </div>
      </div>
    </div>
  );
}
