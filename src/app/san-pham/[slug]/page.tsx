// app/(store)/san-pham/[slug]/page.tsx
import { getProductDetaiSSR } from "@/lib/products/productSSR";
import Script from "next/script";
import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { prefetchProductDetail, productKeys } from "@/lib/products/queries";
import ProductDetailPageClient from "@/components/Product-Detail/ProductDetailPageClient";

/* ------------------ DYNAMIC METADATA GENERATOR ------------------ */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductDetaiSSR(slug);
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

/* ------------------ PAGE COMPONENT (SSR + React Query Hydration) ------------------ */
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const queryClient = new QueryClient();
  const { slug } = await params;
  await prefetchProductDetail(queryClient, slug);

  const data: any = queryClient.getQueryData(productKeys.detail(slug));
  const dehydratedState = dehydrate(queryClient);

  if (!data?.product) {
    return (
      <main className="container mx-auto py-12">
        <h1 className="text-2xl font-semibold">Không tìm thấy sản phẩm</h1>
      </main>
    );
  }

  const { product, related } = data;

  return (
    <HydrationBoundary state={dehydratedState}>
      <Script id="product-jsonld" type="application/ld+json">
        {JSON.stringify(product.jsonLd)}
      </Script>
      <ProductDetailPageClient product={product} related={related} />
    </HydrationBoundary>
  );
}
