// ./components/BestSellers.tsx
"use client";

import React from "react";
import Grid, { GridItem } from "../ui/Grid";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import Alert from "@/components/ui/Alert";
import { useBestSellerProducts } from "@/hooks/products/useBestSellerProducts";
import ProductCard from "../products/ProductCard";

export default function BestSellers() {
  const { products, loading, error, refetch } = useBestSellerProducts();

  return (
    <>
      <h2 className="mb-lg text-2xl font-semibold">Sản phẩm bán chạy trong tuần</h2>
      {loading ? (
        <Grid cols={1} responsive={{ sm: 2, md: 3, lg: 4 }} gap="lg">
          {Array.from({ length: 8 }).map((_, i) => (
            <GridItem key={i} className="bg-bg-muted rounded-md h-64 flex items-center justify-center animate-pulse">
              <div className="w-3/4 h-3/4 bg-white/30 rounded" />
            </GridItem>
          ))}
        </Grid>
      ) : error ? (
        <Alert title="Lỗi" description={error} variant="error" />
      ) : products.length === 0 ? (
        <div className="py-8 text-center">
          <Text muted>Không có sản phẩm bán chạy nào trong tuần.</Text>
          <div className="mt-4">
            <Button onClick={() => refetch()}>Thử lại</Button>
          </div>
        </div>
      ) : (
        <Grid cols={1} responsive={{ sm: 2, md: 3, lg: 4 }} gap="lg">
          {products.map((product) => (
            <GridItem key={product.id} className="h-full">
              {/* ProductCard đã được thiết kế full-height, responsive */}
              <ProductCard
                product={{
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  shortDescription: product.shortDescription,
                  priceMin: product.priceMin,
                  primaryImage: {
                    url: product.primaryImage?.url ?? undefined,
                    alt: product.primaryImage?.alt ?? product.title,
                  },
                }}
              />
            </GridItem>
          ))}
        </Grid>
      )}
    </>
  );
}
