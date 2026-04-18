"use client";

import Image, { ImageProps } from "next/image";
import React, { useState } from "react";

const FALLBACK_URL = "/images/404.jpg";

type SafeImageProps = ImageProps & {
  fallbackSrc?: string;
  priority?: boolean;
};

export function SafeImage({
  src,
  alt,
  fallbackSrc = FALLBACK_URL,
  onError,
  priority,
  loading,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
    onError?.(event);
  };

  const fetchPriority = priority ? "high" : undefined;
  const loadingMode = priority ? undefined : loading || "lazy";

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "image"}
      onError={handleError}
      fetchPriority={fetchPriority}
      loading={loadingMode}
      unoptimized={props.unoptimized ?? false}
    />
  );
}
