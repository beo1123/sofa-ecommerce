/* eslint-disable no-unused-vars */
import { PrismaClient, Prisma } from "../../generated/prisma_client";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";

export class ProductService {
  constructor(private prisma: PrismaClient) {}

  // =====================================================
  // 📦 1. List products with filters + pagination
  // =====================================================
  async listProducts(params: ProductQueryParams) {
    const { page, perPage, category, priceMin, priceMax, color } = params;
    const skip = (page - 1) * perPage;

    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
    };

    // ✅ Filter by category
    if (category) {
      where.metadata = {
        path: ["category"],
        equals: category,
      };
    }

    // ✅ Filter by price
    if (priceMin || priceMax) {
      where.variants = {
        some: {
          price: {
            ...(priceMin ? { gte: priceMin } : {}),
            ...(priceMax ? { lte: priceMax } : {}),
          },
        },
      };
    }

    // ✅ Filter by color
    if (color) {
      where.variants = {
        some: {
          ...(where.variants?.some || {}),
          attributes: {
            path: ["color"],
            equals: color,
          },
        },
      };
    }

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          variants: { select: { price: true } },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, alt: true },
          },
        },
      }),
    ]);

    const items = products.map((p) => {
      const prices = p.variants.map((v) => Number(v.price));
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        priceMin: prices.length ? Math.min(...prices) : null,
        priceMax: prices.length ? Math.max(...prices) : null,
        primaryImage: p.images[0] ?? null,
        variantsCount: p.variants.length,
      };
    });

    return { items, meta: { page, perPage, total } };
  }

  // =====================================================
  // 🧾 2. Get product detail by slug
  // =====================================================
  async getProductBySlug(slug: string) {
    const p = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { isPrimary: "desc" } },
        variants: { include: { inventory: true } },
        reviews: true,
      },
    });

    if (!p) return null;

    const reviewCount = p.reviews.length;
    const average = reviewCount > 0 ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

    const breakdown = p.reviews.reduce<Record<number, number>>((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {});

    const variants = p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      attributes: v.attributes,
      inventory: v.inventory.map((i) => ({
        sku: i.sku,
        quantity: i.quantity,
        reserved: i.reserved,
        available: i.quantity - i.reserved,
      })),
    }));

    const allPrices = p.variants.map((v) => Number(v.price));
    const lowestPrice = allPrices.length ? Math.min(...allPrices) : null;

    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: p.title,
      description: p.shortDescription ?? p.description ?? "",
      image: p.images.map((i) => i.url),
      offers: {
        "@type": "Offer",
        price: lowestPrice,
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
      },
    };

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      shortDescription: p.shortDescription,
      description: p.description,
      images: p.images,
      variants,
      reviewsSummary: { average, count: reviewCount, breakdown },
      jsonLd,
    };
  }

  // =====================================================
  // 🪄 3. Related products by category
  // =====================================================
  async getRelatedProducts(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { metadata: true },
    });
    if (!product) return [];

    const category = (product.metadata as any)?.category ?? null;

    const related = await this.prisma.product.findMany({
      where: {
        id: { not: id },
        status: "PUBLISHED",
        ...(category
          ? {
              metadata: {
                path: ["category"],
                equals: category,
              },
            }
          : {}),
      },
      take: 8,
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        variants: { select: { price: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, alt: true },
        },
      },
    });

    return related.map((p) => {
      const prices = p.variants.map((v) => Number(v.price));
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        priceMin: prices.length ? Math.min(...prices) : null,
        priceMax: prices.length ? Math.max(...prices) : null,
        primaryImage: p.images[0] ?? null,
        variantsCount: p.variants.length,
      };
    });
  }
}
