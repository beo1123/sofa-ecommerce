import { getProductDetaiSSR } from "@/lib/products/productSSR";
import Script from "next/script";
import RelatedProducts from "@/components/Product-Detail/RelatedProducts";
import type { Metadata } from "next";
import AddToCartButton from "@/components/Product-Detail/AddToCartButton";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { prefetchProductDetail, productKeys } from "@/lib/products/queries";

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
      <main className="container mx-auto py-8">
        <Script id="product-jsonld" type="application/ld+json">
          {JSON.stringify(product.jsonLd)}
        </Script>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="h-96 bg-gray-100 flex items-center justify-center">
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.images[0].alt ?? product.title}
                  className="max-h-96 object-contain"
                />
              ) : (
                <div>No image</div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              {product.images?.map((img: any, index: number) => (
                <img
                  key={`${img.url}-${index}`}
                  src={img.url}
                  alt={img.alt ?? product.title}
                  className="w-20 h-20 object-cover rounded border"
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl font-semibold">{product.title}</h1>
            <p className="text-sm text-muted">{product.shortDescription}</p>

            <div className="mt-4 text-lg font-bold">
              {product.variants?.length ? `${Number(product.variants[0].price).toLocaleString()} ₫` : "Liên hệ"}
            </div>

            <div className="mt-6">
              <AddToCartButton productId={product.id} />
            </div>

            <div className="mt-6 text-sm">
              ⭐ {product.reviewsSummary.average.toFixed(1)} ({product.reviewsSummary.count} đánh giá)
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-medium mb-3">Mô tả</h2>
          <div
            className="prose"
            dangerouslySetInnerHTML={{
              __html: product.description ?? product.shortDescription ?? "",
            }}
          />
        </section>

        <RelatedProducts items={related} />
      </main>
    </HydrationBoundary>
  );
}
