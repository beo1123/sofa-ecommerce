import type { Metadata } from "next";

export const baseMetadata: Metadata = {
  metadataBase: new URL("https://sofaphamgia.com"),
  title: {
    default: "Sofa Phạm Gia – Nội Thất Sofa Cao Cấp",
    template: "%s | Sofa Phạm Gia",
  },
  description:
    "Chuyên cung cấp sofa và nội thất cao cấp tại TP.HCM. Chất liệu bền đẹp, thiết kế tinh tế, giao hàng toàn quốc, bảo hành chính hãng.",
  keywords: [
    "sofa",
    "sofa cao cấp",
    "nội thất",
    "sofa phòng khách",
    "sofa góc",
    "sofa da",
    "ghế sofa",
    "Phạm Gia",
    "sofa tphcm",
    "mua sofa",
  ],
  applicationName: "Sofa Phạm Gia",
  verification: {
    google: "szWL9KSqiBBMMQ03bZxYnElo--gbw2QW7B3xA2XiJiI",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Sofa Phạm Gia",
    url: "https://sofaphamgia.com",
    title: "Sofa Phạm Gia – Nội Thất Sofa Cao Cấp",
    description:
      "Chuyên cung cấp sofa và nội thất cao cấp tại TP.HCM. Chất liệu bền đẹp, thiết kế tinh tế, giao hàng toàn quốc.",
    images: [
      {
        url: "/images/logo-removebg-preview.png",
        width: 1200,
        height: 630,
        alt: "Sofa Phạm Gia – Nội thất cao cấp",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Sofa Phạm Gia – Nội Thất Sofa Cao Cấp",
    description: "Chuyên cung cấp sofa và nội thất cao cấp tại TP.HCM.",
    images: ["/images/logo-removebg-preview.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};
