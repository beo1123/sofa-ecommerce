"use client";

import { SafeImage } from "../ui/SafeImage";
import type { ProductGalleryImage } from "../../types/products/ProductImageGallery.types";

type ProductGalleryThumbnailsProps = {
  images: ProductGalleryImage[];
  title: string;
  selectedImage: string;
  onSelect: (imageUrl: string, index: number) => void;
  containerClassName: string;
  buttonClassName: string;
  selectedClassName: string;
  idleClassName: string;
};

export function ProductGalleryThumbnails({
  images,
  title,
  selectedImage,
  onSelect,
  containerClassName,
  buttonClassName,
  selectedClassName,
  idleClassName,
}: ProductGalleryThumbnailsProps) {
  if (images.length <= 1) return null;

  return (
    <div className={containerClassName}>
      {images.map((image, index) => (
        <button
          key={`${image.url}-${index}`}
          type="button"
          onClick={() => onSelect(image.url, index)}
          aria-label={`Chọn ảnh ${index + 1}`}
          className={`${buttonClassName} ${selectedImage === image.url ? selectedClassName : idleClassName}`}>
          <SafeImage
            src={image.url}
            alt={image.alt || `${title} ${index + 1}`}
            fill
            className="object-cover"
            sizes="80px"
          />
        </button>
      ))}
    </div>
  );
}
