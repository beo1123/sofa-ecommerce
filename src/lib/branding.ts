const DEFAULT_HEADER_LOGO = "/images/logo-removebg-preview.png";

export const headerLogoSrc = process.env.NEXT_PUBLIC_HEADER_LOGO || DEFAULT_HEADER_LOGO;

export function buildAbsoluteAssetUrl(baseUrl: string, assetPath: string) {
  return new URL(assetPath, baseUrl).toString();
}
