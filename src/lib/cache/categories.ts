import { cache } from "react";
import { prisma } from "@/lib/prisma";

export interface SharedCategoryItem {
  id: number;
  name: string;
  slug: string;
}

/**
 * Request-scoped React cache for Storefront Category navigation & footer.
 * Deduplicates RootLayout + StorefrontLayout + Footer into 1 single DB query per request.
 */
export const getSharedCategories = cache(async (): Promise<SharedCategoryItem[]> => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
});
