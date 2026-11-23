import type { PrismaClient } from "@prisma/client";
import { toNumber } from "@/lib/format";
import { parseLegacyDimensionToCm } from "@/lib/dimensions";
import { resolveWorkshopCode } from "@/lib/slug";
import {
  formatColorLabel,
  getSwatchDedupeKey,
  normalizeLegacyColorOption,
  resolveColorSwatch,
} from "@/lib/color-swatch";
import {
  parseColorOptions,
  parseMaterialOptions,
  type ProductColorOption,
  type ProductMaterialOption,
} from "@/lib/workshop-types";
import type { StoreCategoryFilterItem, StoreProductCardItem } from "@/components/store/types";
import type { StoreProductDetailData } from "@/components/store/StoreProductDetail";

export class StorefrontService {
  constructor(private readonly db: PrismaClient) {}

  private resolveProductOptions(input: {
    materialOptions: unknown;
    colorOptions: unknown;
    variants: Array<{ attributes?: unknown }>;
  }): {
    materialOptions: ProductMaterialOption[];
    colorOptions: ProductColorOption[];
  } {
    let mats: ProductMaterialOption[] = parseMaterialOptions(input.materialOptions).map((mat) => ({
      ...mat,
      colors: mat.colors.map((c) => ({
        name: formatColorLabel(c.name) || c.name,
        hex: resolveColorSwatch(c.hex || c.name),
      })),
    }));

    if (mats.length === 0) {
      const legacyMats = new Set<string>();
      for (const v of input.variants) {
        const attr =
          v.attributes && typeof v.attributes === "object" ? (v.attributes as Record<string, unknown>) : null;
        if (attr && typeof attr.material === "string" && attr.material.trim()) {
          legacyMats.add(attr.material.trim());
        }
      }
      mats = Array.from(legacyMats).map((label) => ({
        label,
        priceDelta: 0,
        colors: [],
      }));
    }

    const productColorMap = new Map<string, ProductColorOption>();
    const addColor = (option: ProductColorOption) => {
      const key = getSwatchDedupeKey(option);
      if (!key) return;
      if (!productColorMap.has(key)) {
        productColorMap.set(key, option);
      }
    };

    for (const c of parseColorOptions(input.colorOptions)) {
      addColor({
        name: formatColorLabel(c.name) || c.name,
        hex: resolveColorSwatch(c.hex || c.name),
      });
    }

    for (const m of mats) {
      for (const c of m.colors) {
        addColor(c);
      }
    }

    if (productColorMap.size === 0) {
      for (const v of input.variants) {
        const attr =
          v.attributes && typeof v.attributes === "object" ? (v.attributes as Record<string, unknown>) : null;
        if (!attr) continue;
        const rawColor = typeof attr.color === "string" ? attr.color.trim() : "";
        const rawHex =
          typeof attr.hex === "string" && attr.hex.trim()
            ? attr.hex.trim()
            : typeof attr.colorHex === "string" && attr.colorHex.trim()
              ? attr.colorHex.trim()
              : "";

        if (rawColor && rawHex) {
          addColor({
            name: formatColorLabel(rawColor) || rawColor,
            hex: resolveColorSwatch(rawHex),
          });
        } else if (rawColor || rawHex) {
          addColor(normalizeLegacyColorOption(rawColor || rawHex));
        }
      }
    }

    return {
      materialOptions: mats,
      colorOptions: Array.from(productColorMap.values()),
    };
  }

  async getPublishedCatalog(): Promise<{
    products: StoreProductCardItem[];
    categories: StoreCategoryFilterItem[];
    allMaterials: string[];
    allColors: ProductColorOption[];
    priceBounds: { min: number; max: number };
  }> {
    const [categories, products] = await Promise.all([
      this.db.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { products: { where: { status: "PUBLISHED" } } },
          },
        },
      }),
      this.db.product.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true, slug: true } },
          images: {
            orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
            take: 1,
            select: { url: true, alt: true },
          },
          variants: { select: { price: true, attributes: true } },
        },
      }),
    ]);

    const materialSet = new Set<string>();
    const colorMap = new Map<string, ProductColorOption>();
    const allMinPrices: number[] = [];

    const serializedProducts: StoreProductCardItem[] = products.map((p) => {
      const prices = p.variants.map((v) => toNumber(v.price)).filter((n) => n > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      if (minPrice !== null) allMinPrices.push(minPrice);

      const { materialOptions: mats, colorOptions } = this.resolveProductOptions({
        materialOptions: p.materialOptions,
        colorOptions: p.colorOptions,
        variants: p.variants,
      });

      for (const m of mats) materialSet.add(m.label);

      for (const c of colorOptions) {
        const key = getSwatchDedupeKey(c);
        if (key && !colorMap.has(key)) {
          colorMap.set(key, c);
        }
      }

      return {
        id: p.id,
        workshopCode: resolveWorkshopCode(p.workshopCode, p.title),
        title: p.title,
        slug: p.slug,
        categorySlug: p.category?.slug ?? null,
        categoryName: p.category?.name ?? null,
        primaryImageUrl: p.images[0]?.url ?? null,
        primaryImageAlt: p.images[0]?.alt ?? null,
        minPrice,
        materialOptions: mats,
        colorOptions,
        allowCustomSize: p.allowCustomSize,
        createdAt: p.createdAt.toISOString(),
      };
    });

    const minBound = allMinPrices.length > 0 ? Math.floor(Math.min(...allMinPrices) / 500_000) * 500_000 : 0;
    const maxBound = allMinPrices.length > 0 ? Math.ceil(Math.max(...allMinPrices) / 500_000) * 500_000 : 50_000_000;

    return {
      products: serializedProducts,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      })),
      allMaterials: Array.from(materialSet).sort((a, b) => a.localeCompare(b, "vi")),
      allColors: Array.from(colorMap.values()),
      priceBounds: { min: minBound, max: maxBound },
    };
  }

  async getProductDetailWithRelated(slug: string): Promise<{
    product: StoreProductDetailData;
    relatedProducts: StoreProductCardItem[];
  } | null> {
    const product = await this.db.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] },
        variants: { orderBy: { price: "asc" } },
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          include: { user: { select: { displayName: true, email: true } } },
        },
      },
    });

    if (!product || product.status === "ARCHIVED") {
      return null;
    }

    const relatedRaw = await this.db.product.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: product.id },
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        category: { select: { name: true, slug: true } },
        images: {
          orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
          take: 1,
          select: { url: true, alt: true },
        },
        variants: { select: { price: true, attributes: true } },
      },
    });

    const prices = product.variants.map((v) => toNumber(v.price)).filter((n) => n > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const legacyMeta =
      product.metadata && typeof product.metadata === "object" ? (product.metadata as Record<string, unknown>) : null;
    const resolvedWidthCm = product.defaultWidthCm ?? parseLegacyDimensionToCm(legacyMeta?.width);
    const resolvedDepthCm = product.defaultDepthCm ?? parseLegacyDimensionToCm(legacyMeta?.depth ?? legacyMeta?.height);
    const resolvedHeightCm = product.defaultHeightCm ?? null;
    const resolvedDetailOptions = this.resolveProductOptions({
      materialOptions: product.materialOptions,
      colorOptions: product.colorOptions,
      variants: product.variants,
    });

    return {
      product: {
        id: product.id,
        workshopCode: resolveWorkshopCode(product.workshopCode, product.title),
        title: product.title,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        priceNote: product.priceNote,
        defaultWidthCm: resolvedWidthCm,
        defaultDepthCm: resolvedDepthCm,
        defaultHeightCm: resolvedHeightCm,
        allowCustomSize: product.allowCustomSize,
        categoryName: product.category?.name ?? null,
        categorySlug: product.category?.slug ?? null,
        minPrice,
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
        })),
        variants: product.variants.map((v) => {
          const attr =
            v.attributes && typeof v.attributes === "object" ? (v.attributes as Record<string, unknown>) : null;
          const rawMaterial =
            attr && typeof attr.material === "string" && attr.material.trim() ? attr.material.trim() : null;
          const rawColor =
            attr && typeof attr.color === "string" && attr.color.trim()
              ? attr.color.trim()
              : attr && typeof attr.hex === "string" && attr.hex.trim()
                ? attr.hex.trim()
                : null;
          const colorKey = rawColor ? getSwatchDedupeKey(normalizeLegacyColorOption(rawColor)) : null;

          return {
            id: v.id,
            name: v.name,
            price: toNumber(v.price),
            compareAtPrice: v.compareAtPrice !== null ? toNumber(v.compareAtPrice) : null,
            material: rawMaterial,
            colorKey,
          };
        }),
        materialOptions: resolvedDetailOptions.materialOptions,
        colorOptions: resolvedDetailOptions.colorOptions,
        reviews: product.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          authorName: r.user?.displayName ?? "Khách hàng Sofa Phạm Gia",
          createdAt: r.createdAt.toISOString(),
        })),
      },
      relatedProducts: relatedRaw.map((rel) => {
        const relPrices = rel.variants.map((v) => toNumber(v.price)).filter((n) => n > 0);
        const relOptions = this.resolveProductOptions({
          materialOptions: rel.materialOptions,
          colorOptions: rel.colorOptions,
          variants: rel.variants,
        });
        return {
          id: rel.id,
          workshopCode: resolveWorkshopCode(rel.workshopCode, rel.title),
          title: rel.title,
          slug: rel.slug,
          categorySlug: rel.category?.slug ?? null,
          categoryName: rel.category?.name ?? null,
          primaryImageUrl: rel.images[0]?.url ?? null,
          primaryImageAlt: rel.images[0]?.alt ?? null,
          minPrice: relPrices.length > 0 ? Math.min(...relPrices) : null,
          materialOptions: relOptions.materialOptions,
          colorOptions: relOptions.colorOptions,
          allowCustomSize: rel.allowCustomSize,
          createdAt: rel.createdAt.toISOString(),
        };
      }),
    };
  }
}
