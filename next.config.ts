const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
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

  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
