"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SafeImage } from "../ui/SafeImage";
import type { ProductGalleryImage, SlideDirection } from "../../types/products/ProductImageGallery.types";

type ProductGalleryAnimatedImageProps = {
  image: ProductGalleryImage;
  title: string;
  direction: SlideDirection;
  imageClassName: string;
  sizes: string;
  offset: number;
  scale: number;
  duration: number;
};

export function ProductGalleryAnimatedImage({
  image,
  title,
  direction,
  imageClassName,
  sizes,
  offset,
  scale,
  duration,
}: ProductGalleryAnimatedImageProps) {
  return (
    <AnimatePresence initial={false} custom={direction} mode="wait">
      <motion.div
        key={image.url}
        custom={direction}
        variants={{
          enter: (currentDirection: SlideDirection) => ({
            opacity: 0,
            x: currentDirection > 0 ? offset : -offset,
            scale,
          }),
          center: {
            opacity: 1,
            x: 0,
            scale: 1,
          },
          exit: (currentDirection: SlideDirection) => ({
            opacity: 0,
            x: currentDirection > 0 ? -offset : offset,
            scale,
          }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration, ease: "easeOut" }}
        className="absolute inset-0">
        <SafeImage src={image.url} alt={image.alt || title} fill className={imageClassName} sizes={sizes} priority />
      </motion.div>
    </AnimatePresence>
  );
}
