import type { ProductDetail } from "@repo/types";
import { buildCanonical, SITE_URL } from "../utils/canonical";
import { buildOpenGraphImage } from "../utils/openGraph";

const SITE_NAME = "Sofa Phạm Gia - Nội thất cao cấp";

export function generateBaseMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: "%s | Sofa Phạm Gia",
    },
    description:
      "Chuyên cung cấp sofa và nội thất cao cấp tại TP.HCM. Chất liệu bền đẹp, thiết kế tinh tế, giao hàng toàn quốc, bảo hành chính hãng.",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: SITE_NAME,
      url: SITE_URL,
      title: SITE_NAME,
      description:
        "Chuyên cung cấp sofa và nội thất cao cấp tại TP.HCM. Chất liệu bền đẹp, thiết kế tinh tế, giao hàng toàn quốc.",
      images: [buildOpenGraphImage(SITE_NAME)],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: "Chuyên cung cấp sofa và nội thất cao cấp tại TP.HCM.",
      images: [buildOpenGraphImage(SITE_NAME).url],
    },
  };
}

export function generateHomeMetadata() {
  return {
    title: SITE_NAME,
    description:
      "Sofa Phạm Gia mang đến sofa và nội thất cao cấp với thiết kế tinh tế, chất liệu bền đẹp, giao hàng toàn quốc và hỗ trợ tận tâm.",
    alternates: {
      canonical: SITE_URL,
    },
    openGraph: {
      title: SITE_NAME,
      description:
        "Sofa Phạm Gia mang đến sofa và nội thất cao cấp với thiết kế tinh tế, chất liệu bền đẹp và dịch vụ giao hàng toàn quốc.",
      url: SITE_URL,
      type: "website",
      images: [buildOpenGraphImage(SITE_NAME)],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description:
        "Sofa Phạm Gia mang đến sofa và nội thất cao cấp với thiết kế tinh tế, chất liệu bền đẹp và dịch vụ giao hàng toàn quốc.",
      images: [buildOpenGraphImage(SITE_NAME).url],
    },
  };
}

export function generateProductsMetadata(category?: { slug: string; name: string }) {
  const title = category ? `Sofa ${category.name} – Sofa Phạm Gia` : "Tất cả sản phẩm Sofa – Sofa Phạm Gia";
  const description = category
    ? `Khám phá bộ sưu tập ${category.name} cao cấp tại Sofa Phạm Gia. Chất liệu bền đẹp, thiết kế tinh tế, nhiều mẫu mã đa dạng.`
    : "Khám phá toàn bộ bộ sưu tập sofa cao cấp tại Sofa Phạm Gia. Nhiều kiểu dáng, màu sắc và chất liệu đa dạng, phù hợp mọi không gian.";

  const canonical = category ? buildCanonical("/san-pham", { category: category.slug }) : buildCanonical("/san-pham");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: [buildOpenGraphImage(title)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [buildOpenGraphImage(title).url],
    },
  };
}

export function generateProductMetadata(product: ProductDetail) {
  const title = `${product.title} – Sofa Phạm Gia`;
  const description = product.shortDescription ?? product.description ?? "";
  const canonical = buildCanonical(`/san-pham/${product.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: [buildOpenGraphImage(title, product.images?.[0]?.url)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [buildOpenGraphImage(title, product.images?.[0]?.url).url],
    },
  };
}
