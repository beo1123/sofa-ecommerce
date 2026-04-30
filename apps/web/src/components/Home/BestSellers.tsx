import Grid, { GridItem } from "@repo/ui/Grid";
import ProductCard from "@/components/products/ProductCard";
import { sdk } from "@repo/sdk";

export default async function BestSellers() {
  const products = await sdk.products.getBestSellers(8);
  return (
    <>
      <h2 className="mb-lg text-2xl font-semibold">Sản phẩm bán chạy trong tuần</h2>

      <div className="block md:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide pb-5">
        <div className="flex gap-4">
          {products.map((product) => (
            <div key={product.id} className="min-w-[70%] sm:min-w-[50%]">
              <ProductCard
                product={{
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  shortDescription: product.shortDescription ?? "",
                  priceMin: product.priceMin ?? 0,
                  primaryImage: {
                    url: product.primaryImage?.url ?? undefined,
                    alt: product.primaryImage?.alt ?? product.title,
                  },
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <Grid cols={1} responsive={{ sm: 2, md: 3, lg: 4 }} gap="lg">
          {products.map((product) => (
            <GridItem key={product.id}>
              <ProductCard
                product={{
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  shortDescription: product.shortDescription ?? "",
                  priceMin: product.priceMin ?? 0,
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
    </>
  );
}
