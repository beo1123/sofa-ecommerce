import { PrismaClient } from "../../../generated/prisma_client";
import { ProductService } from "@/services/products.service";
import { serializeData } from "./helpers";

const service = new ProductService(new PrismaClient());

export async function getProductListSSR(params: any) {
  return await service.listProducts(params);
}

export async function getProductDetaiSSR(slug: string) {
  const product = await service.getProductBySlug(slug);
  if (!product) return null;

  const related = await service.getRelatedProducts(slug);

  // ✅ Serialize ở đây
  const safeProduct = serializeData(product);
  const safeRelated = serializeData(related);

  return { product: safeProduct, related: safeRelated };
}
