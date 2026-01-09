import type { Metadata } from "next";

export const baseMetadata: Metadata = {
  metadataBase: new URL("https://sofaphamgia.com"),
  title: {
    default: "Sofa Phạm Gia",
    template: "%s | Sofa Phạm Gia",
  },
  verification: {
    google: "szWL9KSqiBBMMQ03bZxYnElo--gbw2QW7B3xA2XiJiI",
  },
  description: "Nội thất sang trọng cho ngôi nhà hiện đại. Chất liệu cao cấp, tay nghề thủ công.",
  applicationName: "Sofa Phạm Gia",

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
    siteName: "Sofa Phạm Gia",
    url: "https://sofaphamgia.com",
    title: "Sofa Phạm Gia",
    description: "Nội thất sofa cao cấp – thiết kế tinh tế, chất liệu bền đẹp, giao hàng toàn quốc.",
    images: [
      {
        url: "images/logo-removebg-preview.png",
        width: 1200,
        height: 630,
        alt: "Sofa Phạm Gia",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};
