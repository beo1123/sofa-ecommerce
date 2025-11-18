import { getProductDetaiSSR } from "@/lib/products/productSSR";
import Script from "next/script";
import type { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import ProductDetailPageClient from "@/components/Product-Detail/ProductDetailPageClient";

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
      title: "Sản phẩm không tồn tại – Sofa Ecommerce",
      description: "Không tìm thấy sản phẩm này trong cửa hàng.",
    };
  }

  const { product } = data;
  const image = product.images?.[0]?.url;

  return {
    title: `${product.title} – Sofa Ecommerce`,
    description: product.shortDescription ?? product.description ?? "",
    openGraph: {
      title: `${product.title} – Sofa Ecommerce`,
      description: product.shortDescription ?? product.description ?? "",
      images: image ? [image] : [],
      type: "website", // ✅ giữ chuẩn type Next.js
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
export const revalidate = 600;

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

  return (
    <>
      <Script id="product-jsonld" type="application/ld+json">
        {JSON.stringify(product.jsonLd)}
      </Script>
      <ProductDetailPageClient product={product} related={related} />
    </>
  );
}
