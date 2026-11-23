import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "iffiqyzsfyvlpebvzurn.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  serverExternalPackages: ["@prisma/client", "@react-pdf/renderer"],

  cacheLife: {
    default: {
      stale: 300,
      revalidate: 600,
      expire: 3600,
    },
  },

  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
