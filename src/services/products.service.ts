import { PrismaClient, Prisma } from "../../generated/prisma_client";
import { ProductQueryParams } from "@/types/products/ProductQueryParams";

export class ProductService {
  constructor(private prisma: PrismaClient) {}

  // =====================================================
  // 📦 1. List products with filters + pagination
  // =====================================================
  async listProducts(params: ProductQueryParams) {
    const { page, perPage, category, priceMin, priceMax, color, material } = params;
    const skip = (page - 1) * perPage;

    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
    };

    // ✅ Lọc theo category slug (từ bảng Category thực)
    if (category) {
      where.category = { slug: category };
    }

    // ✅ Lọc theo variant attributes & price
    const variantAnd: Prisma.ProductVariantWhereInput[] = [];

    if (priceMin !== undefined || priceMax !== undefined) {
      const priceCond: Prisma.DecimalFilter = {};
      if (priceMin !== undefined) priceCond.gte = Number(priceMin);
      if (priceMax !== undefined) priceCond.lte = Number(priceMax);
      variantAnd.push({ price: priceCond });
    }

    if (color) {
      variantAnd.push({
        attributes: { path: ["color"], equals: color },
      });
    }

    if (material) {
      variantAnd.push({
        attributes: { path: ["material"], equals: material },
      });
    }

    if (variantAnd.length > 0) {
      where.variants = {
        some: variantAnd.length === 1 ? variantAnd[0] : { AND: variantAnd },
      };
    }

    // ✅ Transaction: count + findMany
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
          category: { select: { id: true, name: true, slug: true } }, // ✅ include category
          variants: {
            select: {
              id: true,
              price: true,
              skuPrefix: true, // ✅ thêm
              inventory: {
                take: 1, // chỉ cần sku đầu tiên
                select: { sku: true },
              },
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, alt: true },
          },
        },
      }),
    ]);

    // ✅ Map lại output
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
        category: p.category ? { name: p.category.name, slug: p.category.slug } : null, // ✅ thêm category
        variants: p.variants.map((v) => ({
          id: v.id,
          skuPrefix: v.skuPrefix,
          inventory: v.inventory,
          price: Number(v.price),
        })),
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
  // 🪄 3. Related products by slug
  // =====================================================
  async getRelatedProducts(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { metadata: true },
    });
    if (!product) return [];

    const category = (product.metadata as any)?.category ?? null;

    const related = await this.prisma.product.findMany({
      where: {
        slug: { not: slug },
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
        variants: {
          select: {
            id: true,
            price: true,
            skuPrefix: true, // ✅ thêm
            inventory: {
              take: 1, // chỉ cần sku đầu tiên
              select: { sku: true },
            },
          },
        },
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
        variants: p.variants.map((v) => ({
          id: v.id,
          skuPrefix: v.skuPrefix,
          inventory: v.inventory,
          price: Number(v.price),
        })),
      };
    });
  }

  // =====================================================
  // 🔍 4. Search products (ILIKE, paginated)
  // =====================================================
  async SearchProducts(q: string, page = 1, perPage = 12) {
    const skip = (page - 1) * perPage;
    const query = (q ?? "").trim();
    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { shortDescription: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ];
    }
    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: "desc" },
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
      };
    });
    return { items, meta: { page, perPage, total } };
  }
}
