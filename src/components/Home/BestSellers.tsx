import Grid, { GridItem } from "@/components/ui/Grid";
import ProductCard from "@/components/products/ProductCard";
import { ProductService } from "@/services/products.service";
import { prisma } from "@/lib/prisma";

const productService = new ProductService(prisma);

export default async function BestSellers() {
  const products = await productService.getBestSellingProducts(8);
  return (
    <>
      <h2 className="mb-lg text-2xl font-semibold">Sản phẩm bán chạy trong tuần</h2>

      <Grid cols={1} responsive={{ sm: 2, md: 3, lg: 4 }} gap="lg">
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
    </>
  );
}
