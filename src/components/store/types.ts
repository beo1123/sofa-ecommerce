import type { ProductColorOption, ProductMaterialOption } from "@/lib/workshop-types";

export interface StoreCategoryFilterItem {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

export interface StoreProductCardItem {
  id: number;
  workshopCode: string | null;
  title: string;
  slug: string;
  categorySlug: string | null;
  categoryName: string | null;
  primaryImageUrl: string | null;
  primaryImageAlt: string | null;
  minPrice: number | null;
  materialOptions: ProductMaterialOption[];
  colorOptions: ProductColorOption[];
  allowCustomSize: boolean;
  createdAt: string;
}
