import { ProductQueryParams } from "@/types/products/ProductQueryParams";
import { Prisma, PrismaClient } from "@prisma/client";

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

    const variantWhere: Prisma.ProductVariantWhereInput = {
      product: {
        status: "PUBLISHED",
        ...(category ? { category: { slug: category } } : {}),
      },
      ...(variantAnd.length > 0 ? { AND: variantAnd } : {}),
    };

    // ✅ Transaction: count + ranked product ids by min variant price (asc)
    const [total, rankedProductIds] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.productVariant.groupBy({
        by: ["productId"],
        where: variantWhere,
        _min: { price: true },
        orderBy: [{ _min: { price: "asc" } }, { productId: "asc" }],
        skip,
        take: perPage,
      }),
    ]);

    const productIds = rankedProductIds.map((row) => row.productId);

    if (productIds.length === 0) {
      return { items: [], meta: { page, perPage, total } };
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
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
    });

    const productById = new Map(products.map((p) => [p.id, p]));
    const orderedProducts = productIds
      .map((id) => productById.get(id))
      .filter((p): p is (typeof products)[number] => Boolean(p));

    // ✅ Map lại output
    const items = orderedProducts.map((p) => {
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
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
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

  // =====================================================
  // 💰 Best-selling products (all-time, auto fallback)
  // =====================================================
  async getBestSellingProducts(limit = 8) {
    const top = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        order: { status: { in: ["PAID", "FULFILLED", "COD_COMPLETED"] } },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const ids = top.map((p) => p.productId!);
    const soldMap = Object.fromEntries(top.map((p) => [p.productId!, p._sum.quantity ?? 0]));

    const products = await this.prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        ...(ids.length ? { id: { in: ids } } : {}),
      },
      orderBy: ids.length ? { id: "asc" } : { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        variants: { select: { price: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
      },
    });

    // fallback nếu chưa đủ
    if (products.length < limit) {
      const fallback = await this.prisma.product.findMany({
        where: { status: "PUBLISHED", id: { notIn: ids } },
        orderBy: { createdAt: "desc" },
        take: limit - products.length,
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          variants: { select: { price: true } },
          images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
        },
      });
      products.push(...fallback);
    }

    return products.map((p) => {
      const prices = p.variants.map((v) => Number(v.price));
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        totalSold: soldMap[p.id] ?? 0,
        priceMin: Math.min(...prices),
        priceMax: Math.max(...prices),
        primaryImage: p.images[0] ?? null,
      };
    });
  }
  // =====================================================
  // 💰 Featured products (all-time, auto fallback)
  // =====================================================
  async getFeaturedProducts(limit = 8) {
    const reviewAgg = await this.prisma.review.groupBy({
      by: ["productId"],
      where: { approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingMap = Object.fromEntries(
      reviewAgg.map((r) => [
        r.productId,
        {
          avg: r._avg.rating ?? 0,
          count: r._count.rating ?? 0,
        },
      ])
    );

    const soldAgg = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        order: { status: { in: ["PAID", "FULFILLED", "COD_COMPLETED"] } },
      },
      _sum: { quantity: true },
    });

    const soldMap = Object.fromEntries(soldAgg.map((s) => [s.productId!, s._sum.quantity ?? 0]));

    const products = await this.prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        createdAt: true,
        variants: { select: { price: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, alt: true },
        },
      },
    });

    const scored = products.map((p) => {
      const r = ratingMap[p.id] ?? { avg: 0, count: 0 };
      const sold = soldMap[p.id] ?? 0;

      const score = (r.avg || 0) * 2 + Math.log((r.count || 0) + 1) + Math.log(sold + 1);

      return { ...p, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const selected = scored.slice(0, limit);

    return selected.map((p) => {
      const prices = p.variants.map((v) => Number(v.price));
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        score: p.score,
        avgRating: ratingMap[p.id]?.avg ?? 0,
        reviewCount: ratingMap[p.id]?.count ?? 0,
        totalSold: soldMap[p.id] ?? 0,
        priceMin: Math.min(...prices),
        priceMax: Math.max(...prices),
        primaryImage: p.images[0] ?? null,
      };
    });
  }
  // =====================================================
  // 🎨 getFilters - lấy unique materials + colors từ ProductVariant.attributes
  // =====================================================
  async getFilters() {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        product: { status: "PUBLISHED" },
      },
      select: {
        attributes: true,
        price: true,
      },
    });

    // Nếu không có variant → trả về rỗng
    if (!variants.length) {
      return {
        materials: [],
        colors: [],
        priceMin: 0,
        priceMax: 0,
      };
    }

    const materialSet = new Set<string>();
    const colorSet = new Set<string>();

    let minPrice = Number.MAX_SAFE_INTEGER;
    let maxPrice = 0;

    for (const v of variants) {
      const attrs = (v.attributes ?? {}) as Record<string, any>;

      // MATERIAL
      if (attrs.material) {
        materialSet.add(String(attrs.material).trim());
      }

      // COLOR
      if (attrs.color) {
        colorSet.add(String(attrs.color).trim());
      }

      // PRICE
      const price = Number(v.price);
      if (!isNaN(price)) {
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
      }
    }

    // Nếu minPrice vẫn là MAX_SAFE_INTEGER => không có price hợp lệ
    if (minPrice === Number.MAX_SAFE_INTEGER) minPrice = 0;

    return {
      materials: Array.from(materialSet),
      colors: Array.from(colorSet),
      priceMin: minPrice,
      priceMax: maxPrice,
    };
  }
}
