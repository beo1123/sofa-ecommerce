import { sdk } from "@repo/sdk";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";

export async function getProductListSSR(params: ProductQueryParams) {
  return await sdk.products.list(params);
}

export async function getProductDetaiSSR(slug: string) {
  const product = await sdk.products.getBySlug(slug).catch(() => null);
  if (!product) return null;
  const related = await sdk.products.getRelated(slug).catch(() => []);

  return { product, related };
}
