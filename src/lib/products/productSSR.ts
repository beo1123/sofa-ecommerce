import { ProductService } from "@/services/products.service";
import { serializeData } from "../helpers";
import { prisma } from "../prisma";

const service = new ProductService(prisma);

export async function getProductListSSR(params: any) {
  return await service.listProducts(params);
}

export async function getProductDetaiSSR(slug: string) {
  const [product, related] = await Promise.all([service.getProductBySlug(slug), service.getRelatedProducts(slug)]);

  if (!product) return null;

  return {
    product: serializeData(product),
    related: serializeData(related),
  };
}
