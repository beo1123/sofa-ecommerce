import Link from "next/link";
import Grid, { GridItem } from "@/components/ui/Grid";
import ProductCard from "@/components/products/ProductCard";
import { ProductService } from "@/services/products.service";
import { prisma } from "@/lib/prisma";

const productService = new ProductService(prisma);

export default async function BestSellers() {
  const products = await productService.getBestSellingProducts(8);
  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)] mb-2">
            Được yêu thích nhất
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-text-default)]">
            Sản phẩm bán chạy trong tuần
          </h2>
        </div>
        <Link
          href="/san-pham"
          className="text-sm font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors">
          Xem toàn bộ sản phẩm →
        </Link>
      </div>

      <Grid cols={1} responsive={{ sm: 2, md: 3, lg: 4 }} gap="md">
        {products.map((product) => (
          <GridItem key={product.id}>
            <ProductCard
              product={{
                id: product.id,
                slug: product.slug,
                title: product.title,
                shortDescription: product.shortDescription ?? "",
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
    </div>
  );
}
