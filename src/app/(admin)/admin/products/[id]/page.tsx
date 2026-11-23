import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import { parseLegacyDimensionToCm } from "@/lib/dimensions";
import { resolveWorkshopCode } from "@/lib/slug";
import { parseColorOptions, parseMaterialOptions } from "@/lib/workshop-types";
import ProductForm from "@/components/admin/products/ProductForm";
import type { SerializedProductDetail } from "@/components/admin/products/types";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] },
        variants: { orderBy: { id: "asc" } },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { displayName: true, email: true } },
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const metadataMap: Record<string, string> = {};
  if (product.metadata && typeof product.metadata === "object" && !Array.isArray(product.metadata)) {
    for (const [k, v] of Object.entries(product.metadata as Record<string, unknown>)) {
      if (v !== null && v !== undefined) {
        metadataMap[k] = typeof v === "string" ? v : JSON.stringify(v);
      }
    }
  }

  const rawMeta =
    product.metadata && typeof product.metadata === "object" && !Array.isArray(product.metadata)
      ? (product.metadata as Record<string, unknown>)
      : null;

  const serializedProduct: SerializedProductDetail = {
    id: product.id,
    workshopCode: resolveWorkshopCode(product.workshopCode, product.title),
    title: product.title,
    slug: product.slug,
    status: product.status,
    categoryId: product.categoryId,
    shortDescription: product.shortDescription,
    description: product.description,
    priceNote:
      product.priceNote ??
      (typeof rawMeta?.customizationNote === "string" && rawMeta.customizationNote.trim()
        ? rawMeta.customizationNote.trim()
        : null),
    defaultWidthCm: product.defaultWidthCm ?? parseLegacyDimensionToCm(rawMeta?.width),
    defaultDepthCm: product.defaultDepthCm ?? parseLegacyDimensionToCm(rawMeta?.depth ?? rawMeta?.height),
    defaultHeightCm: product.defaultHeightCm,
    allowCustomSize: product.allowCustomSize,
    materialOptions: parseMaterialOptions(product.materialOptions),
    colorOptions: parseColorOptions(product.colorOptions),
    metadata: metadataMap,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      skuPrefix: v.skuPrefix,
      price: toNumber(v.price),
      compareAtPrice: v.compareAtPrice !== null ? toNumber(v.compareAtPrice) : null,
      attributes:
        v.attributes && typeof v.attributes === "object" && !Array.isArray(v.attributes)
          ? (v.attributes as Record<string, unknown>)
          : null,
      image: v.image,
    })),
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
    })),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      approved: r.approved,
      authorName: r.user?.displayName ?? r.user?.email ?? "Khách hàng",
      authorEmail: r.user?.email ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  return <ProductForm initialProduct={serializedProduct} categories={categories} />;
}
