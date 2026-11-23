import type { ProductStatus } from "@/lib/prisma";
import type { ProductColorOption, ProductMaterialOption } from "@/lib/workshop-types";

export interface SerializedCategoryOption {
  id: number;
  name: string;
  slug: string;
}

export interface SerializedProductListItem {
  id: number;
  workshopCode: string | null;
  title: string;
  slug: string;
  status: ProductStatus;
  categoryId: number | null;
  categoryName: string | null;
  primaryImageUrl: string | null;
  minPrice: number | null;
  variantCount: number;
  reviewCount: number;
  pendingReviewCount: number;
  materialOptions: ProductMaterialOption[];
  allowCustomSize: boolean;
  updatedAt: string;
}

export interface SerializedProductVariant {
  id?: number;
  name: string;
  skuPrefix: string | null;
  price: number;
  compareAtPrice: number | null;
  attributes: Record<string, unknown> | null;
  image: string | null;
}

export interface SerializedProductImage {
  id?: number;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

export interface SerializedProductReview {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  approved: boolean;
  authorName: string;
  authorEmail: string | null;
  createdAt: string;
}

export interface SerializedProductDetail {
  id: number;
  workshopCode: string | null;
  title: string;
  slug: string;
  status: ProductStatus;
  categoryId: number | null;
  shortDescription: string | null;
  description: string | null;
  priceNote: string | null;
  defaultWidthCm: number | null;
  defaultDepthCm: number | null;
  defaultHeightCm: number | null;
  allowCustomSize: boolean;
  materialOptions: ProductMaterialOption[];
  colorOptions: ProductColorOption[];
  metadata: Record<string, string>;
  variants: SerializedProductVariant[];
  images: SerializedProductImage[];
  reviews: SerializedProductReview[];
}
