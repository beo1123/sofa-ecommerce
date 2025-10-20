// app/(store)/san-pham/page.tsx
import { getProductListSSR } from "@/lib/products/queries";
import ProductsPageClient from "@/components/products/ProductsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh sách sản phẩm – Sofa Ecommerce",
  description: "Khám phá bộ sưu tập sofa cao cấp, nhiều kiểu dáng và màu sắc.",
  openGraph: {
    title: "Danh sách sản phẩm – Sofa Ecommerce",
    description: "Tổng hợp các sản phẩm sofa mới nhất.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sofa Ecommerce – Danh sách sản phẩm",
  },
};

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const perPage = Number(params.perPage ?? 12);

  const { items, meta } = await getProductListSSR({
    page,
    perPage,
    category: params.category,
    priceMin: params.priceMin ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    color: params.color,
  });

  return (
    <ProductsPageClient
      items={items}
      meta={meta}
      params={{
        category: params.category ?? "",
        priceMin: params.priceMin ?? "",
        priceMax: params.priceMax ?? "",
        color: params.color ?? "",
      }}
    />
  );
}
