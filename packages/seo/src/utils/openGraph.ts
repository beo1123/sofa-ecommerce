import { SITE_URL } from "./canonical";

export const DEFAULT_OG_IMAGE = "/images/LOGO_SOFA.png";

export function toAbsoluteAssetUrl(assetPath: string) {
  return new URL(assetPath, SITE_URL).toString();
}

export function buildOpenGraphImage(title: string, imageUrl?: string | null) {
  const url = imageUrl ? toAbsoluteAssetUrl(imageUrl) : toAbsoluteAssetUrl(DEFAULT_OG_IMAGE);

  return {
    url,
    width: 1200,
    height: 630,
    alt: title,
  };
}
