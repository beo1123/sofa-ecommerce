import type { ProductFormData } from "@/components/admin/products/ProductForm";

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
}

export interface AdminMeta {
  page: number;
  perPage: number;
  total: number;
}

export interface AdminProductListItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  category?: { id: number; name: string; slug: string } | null;
  images?: { url: string; alt?: string; isPrimary?: boolean }[];
  variants?: { id: number; name: string; price: number | string }[];
  updatedAt: string;
}

export interface AdminProductDetail {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  status: string;
  category?: { id: number; name: string; slug: string } | null;
  images?: { url: string; alt?: string; isPrimary?: boolean }[];
  variants?: {
    id: number;
    name: string;
    price: number | string;
    compareAtPrice?: number | string | null;
    attributes?: { color?: string; material?: string } | null;
    inventory?: { sku?: string; quantity?: number }[];
  }[];
}

type ProductFormSubmitData = ProductFormData & {
  images: { url: string; alt?: string; isPrimary?: boolean }[];
  variants: {
    id?: number;
    name: string;
    sku?: string;
    price: number;
    compareAtPrice?: number;
    quantity?: number;
    color?: string;
    material?: string;
  }[];
};

export function getApiErrorMessage(err: any, fallback: string) {
  return err?.response?.data?.error?.message ?? fallback;
}

export function buildAdminProductPayload(data: ProductFormSubmitData, includeVariantId = false) {
  return {
    title: data.title,
    slug: data.slug,
    shortDescription: data.shortDescription || undefined,
    description: data.description || undefined,
    status: data.status || "DRAFT",
    categoryId: typeof data.categoryId === "number" && data.categoryId > 0 ? data.categoryId : undefined,
    images: data.images,
    variants: data.variants.map((variant) => ({
      ...(includeVariantId && variant.id ? { id: variant.id } : {}),
      name: variant.name,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
      attributes: {
        ...(variant.color ? { color: variant.color } : {}),
        ...(variant.material ? { material: variant.material } : {}),
      },
      inventory: variant.sku ? { sku: variant.sku, quantity: Number(variant.quantity ?? 0) } : undefined,
    })),
  };
}

export function mapAdminProductToFormDefaults(product: AdminProductDetail) {
  return {
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    status: product.status,
    categoryId: product.category?.id,
    images:
      product.images?.map((image) => ({
        url: image.url,
        alt: image.alt,
        isPrimary: image.isPrimary,
      })) ?? [],
    variants:
      product.variants?.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.inventory?.[0]?.sku ?? "",
        price: Number(variant.price),
        compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
        quantity: variant.inventory?.[0]?.quantity ?? 0,
        color: variant.attributes?.color ?? "",
        material: variant.attributes?.material ?? "",
      })) ?? [],
  };
}
