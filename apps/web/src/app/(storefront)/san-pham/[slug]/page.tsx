import { getProductDetaiSSR } from "@/lib/products/productSSR";
import Script from "next/script";
import type { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import ProductDetailPageClient from "@/components/Product-Detail/ProductDetailPageClient";
import { buildBreadcrumbSchema } from "@/seo/schema";

const BASE_URL = "https://sofaphamgia.com";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getCachedProduct = cache(async (slug: string) => {
  return await getProductDetaiSSR(slug);
});

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;

  const data = await getCachedProduct(slug);
  if (!data?.product) {
    return {
      title: "Sản phẩm không tồn tại – Sofa Phạm gia",
      description: "Không tìm thấy sản phẩm này trong cửa hàng.",
    };
  }

  const { product } = data;
  const image = product.images?.[0]?.url;

  return {
    title: `${product.title} – Sofa Phạm gia`,
    description: product.shortDescription ?? product.description ?? "",
    openGraph: {
      title: `${product.title} – Sofa Phạm gia`,
      description: product.shortDescription ?? product.description ?? "",
      images: image ? [image] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription ?? "",
      images: image ? [image] : [],
    },
  };
}

/* ------------------ PAGE COMPONENT ------------------ */
export const revalidate = 3600;

export default async function ProductDetailPage(props: PageProps) {
  const params = await props.params;
  const slug = params.slug;

  const data = await getCachedProduct(slug);

  if (!data?.product) {
    return (
      <main className="container mx-auto py-12">
        <h1 className="text-2xl font-semibold">Không tìm thấy sản phẩm</h1>
      </main>
    );
  }

  const { product, related } = data;

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Trang chủ", url: BASE_URL },
    { name: "Sản phẩm", url: `${BASE_URL}/san-pham` },
    { name: product.title, url: `${BASE_URL}/san-pham/${slug}` },
  ]);

  return (
    <>
      <Script id="breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(breadcrumb)}
      </Script>
      <Script id="product-jsonld" type="application/ld+json">
        {JSON.stringify(product.jsonLd)}
      </Script>
      <ProductDetailPageClient product={product} related={related} />
    </>
  );
}
