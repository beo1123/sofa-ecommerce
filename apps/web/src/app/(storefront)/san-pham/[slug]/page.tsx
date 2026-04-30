import { getProductDetaiSSR } from "@/lib/products/productSSR";
import Script from "next/script";
import type { Metadata } from "next";
import { cache } from "react";
import ProductDetailPageClient from "@/components/Product-Detail/ProductDetailPageClient";
import { buildProductBreadcrumbSchema, buildProductSchema, generateProductMetadata } from "@repo/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getCachedProduct = cache(async (slug: string) => {
  return await getProductDetaiSSR(slug);
});

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;

  const data = await getCachedProduct(slug);
  if (!data?.product) {
    return {
      title: "Sản phẩm không tồn tại – Sofa Phạm gia",
      description: "Không tìm thấy sản phẩm này trong cửa hàng.",
    };
  }

  return generateProductMetadata(data.product);
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

  return (
    <>
      <Script id="breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(buildProductBreadcrumbSchema(product))}
      </Script>
      <Script id="product-jsonld" type="application/ld+json">
        {JSON.stringify(buildProductSchema(product))}
      </Script>
      <ProductDetailPageClient product={product} related={related} />
    </>
  );
}
