import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // { protocol: "https", hostname: "cdn.jsdelivr.net" },
      // // thêm host Supabase nếu bạn dùng
      // { protocol: "https", hostname: "your-supabase-project.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],

    cacheLife: {
      default: {
        stale: 300,
        revalidate: 600,
        expire: 3600,
      },
    },
  },

  // ✅ Tối ưu cold start Prisma
  output: "standalone",

  // ✅ Performance và bảo mật
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // ✅ Giúp build không bị lỗi TypeScript hoặc ESLint không quan trọng
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
