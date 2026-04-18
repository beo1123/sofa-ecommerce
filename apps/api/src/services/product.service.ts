// =========================================================
// apps/api/src/services/product.service.ts
// Product service for public API and admin operations
// =========================================================

import { prisma, type Prisma, type ProductStatus, type PrismaClient } from "@repo/db";
import type {
  CreateProductInput,
  UpdateProductInput,
  AdminProductFilters,
  ProductQueryParams,
} from "@repo/types";
import { fail } from "../lib/response.js";

// ─── Service ──────────────────────────────────────────────
export class ProductService {
  // =====================================================
  // 📦 PUBLIC: List products with filters + pagination
  // =====================================================
  async listProducts(params: ProductQueryParams) {
    const { page, perPage, category, priceMin, priceMax, color, material } = params;
    const skip = (page - 1) * perPage;

    const where: Prisma.ProductWhereInput = {
      status: "PUBLISHED",
    };

    if (category) {
      where.category = { slug: category };
    }

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

    const [total, rankedProductIds] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.productVariant.groupBy({
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

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        category: { select: { id: true, name: true, slug: true, image: true } },
        variants: {
          select: {
            id: true,
            price: true,
            skuPrefix: true,
            inventory: { take: 1, select: { sku: true } },
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
        category: p.category
          ? { name: p.category.name, slug: p.category.slug, image: p.category.image }
          : null,
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
  // 🧾 PUBLIC: Get product detail by slug
  // =====================================================
  async getProductBySlug(slug: string) {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { isPrimary: "desc" } },
        variants: { include: { inventory: true } },
        reviews: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!p) return null;

    const reviewCount = p.reviews.length;
    const average =
      reviewCount > 0 ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

    const breakdown = p.reviews.reduce<Record<number, number>>((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {});

    const variants = p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
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
      status: p.status,
      images: p.images,
      variants,
      category: p.category,
      reviewsSummary: { average, count: reviewCount, breakdown },
      jsonLd,
    };
  }

  // =====================================================
  // 🪄 PUBLIC: Related products by slug
  // =====================================================
  async getRelatedProducts(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { metadata: true, categoryId: true },
    });
    if (!product) return [];

    const related = await prisma.product.findMany({
      where: {
        slug: { not: slug },
        status: "PUBLISHED",
        ...(product.categoryId ? { categoryId: product.categoryId } : {}),
      },
      orderBy: { createdAt: "desc" },
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
            skuPrefix: true,
            inventory: { take: 1, select: { sku: true } },
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
  // 🔍 PUBLIC: Search products
  // =====================================================
  async searchProducts(q: string, page = 1, perPage = 12) {
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

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
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
  // 💰 PUBLIC: Best-selling products
  // =====================================================
  async getBestSellingProducts(limit = 8) {
    const top = await prisma.orderItem.groupBy({
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
    const soldMap = Object.fromEntries(
      top.map((p) => [p.productId!, p._sum.quantity ?? 0])
    );

    const products = await prisma.product.findMany({
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

    // fallback if not enough
    if (products.length < limit) {
      const fallback = await prisma.product.findMany({
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
        priceMin: prices.length ? Math.min(...prices) : null,
        priceMax: prices.length ? Math.max(...prices) : null,
        primaryImage: p.images[0] ?? null,
      };
    });
  }

  // =====================================================
  // ⭐ PUBLIC: Featured products
  // =====================================================
  async getFeaturedProducts(limit = 8) {
    const reviewAgg = await prisma.review.groupBy({
      by: ["productId"],
      where: { approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingMap = Object.fromEntries(
      reviewAgg.map((r) => [
        r.productId,
        { avg: r._avg.rating ?? 0, count: r._count.rating ?? 0 },
      ])
    );

    const soldAgg = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        order: { status: { in: ["PAID", "FULFILLED", "COD_COMPLETED"] } },
      },
      _sum: { quantity: true },
    });

    const soldMap = Object.fromEntries(
      soldAgg.map((s) => [s.productId!, s._sum.quantity ?? 0])
    );

    const products = await prisma.product.findMany({
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
        priceMin: prices.length ? Math.min(...prices) : null,
        priceMax: prices.length ? Math.max(...prices) : null,
        primaryImage: p.images[0] ?? null,
      };
    });
  }

  // =====================================================
  // 🎨 PUBLIC: Get filters
  // =====================================================
  async getFilters() {
    const variants = await prisma.productVariant.findMany({
      where: { product: { status: "PUBLISHED" } },
      select: { attributes: true, price: true },
    });

    if (!variants.length) {
      return { materials: [], colors: [], priceMin: 0, priceMax: 0 };
    }

    const materialSet = new Set<string>();
    const colorSet = new Set<string>();
    let minPrice = Number.MAX_SAFE_INTEGER;
    let maxPrice = 0;

    for (const v of variants) {
      const attrs = (v.attributes ?? {}) as Record<string, unknown>;
      if (attrs.material) materialSet.add(String(attrs.material).trim());
      if (attrs.color) colorSet.add(String(attrs.color).trim());
      const price = Number(v.price);
      if (!isNaN(price)) {
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
      }
    }

    if (minPrice === Number.MAX_SAFE_INTEGER) minPrice = 0;

    return {
      materials: Array.from(materialSet),
      colors: Array.from(colorSet),
      priceMin: minPrice,
      priceMax: maxPrice,
    };
  }

  // =====================================================
  // 🔒 ADMIN: List products (all statuses)
  // =====================================================
  async adminListProducts(page: number, perPage: number, filters: AdminProductFilters = {}) {
    const skip = (page - 1) * perPage;
    const q = filters.q?.trim();

    const where: Prisma.ProductWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        skip,
        take: perPage,
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          variants: { select: { id: true, name: true, price: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, meta: { page, perPage, total } };
  }

  // =====================================================
  // 🔒 ADMIN: Get product by ID
  // =====================================================
  async adminGetProduct(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] },
        variants: { include: { inventory: true } },
        category: true,
      },
    });

    if (!product) {
      throw { status: 404, body: fail("Product not found", "NOT_FOUND") };
    }
    return product;
  }

  // =====================================================
  // 🔒 ADMIN: Create product
  // =====================================================
  async adminCreateProduct(input: CreateProductInput) {
    const existing = await prisma.product.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
    }

    const product = await prisma.product.create({
      data: {
        title: input.title,
        slug: input.slug,
        shortDescription: input.shortDescription,
        description: input.description,
        status: (input.status as ProductStatus) ?? "DRAFT",
        category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        images: input.images?.length
          ? {
              create: input.images.map((img, i) => ({
                url: img.url,
                alt: img.alt ?? input.title,
                isPrimary: img.isPrimary ?? i === 0,
              })),
            }
          : undefined,
        variants: input.variants?.length
          ? {
              create: input.variants.map((v) => ({
                name: v.name,
                skuPrefix: v.skuPrefix,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                attributes: (v.attributes as Prisma.InputJsonValue) ?? Prisma.JsonNull,
                image: v.image,
                inventory: v.inventory
                  ? {
                      create: {
                        sku: v.inventory.sku,
                        quantity: v.inventory.quantity ?? 0,
                        location: v.inventory.location,
                      },
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        variants: { include: { inventory: true } },
      },
    });

    return product;
  }

  // =====================================================
  // 🔒 ADMIN: Update product
  // =====================================================
  async adminUpdateProduct(id: number, input: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Product not found", "NOT_FOUND") };
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await prisma.product.findUnique({ where: { slug: input.slug } });
      if (slugTaken) {
        throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.shortDescription !== undefined && { shortDescription: input.shortDescription }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status as ProductStatus }),
        ...(input.categoryId !== undefined && {
          category: input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true },
        }),
        ...(input.metadata !== undefined && {
          metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        }),
      },
      include: {
        images: true,
        variants: { include: { inventory: true } },
        category: true,
      },
    });

    // Update images if provided
    if (input.images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (input.images.length > 0) {
        await prisma.productImage.createMany({
          data: input.images.map((img, i) => ({
            productId: id,
            url: img.url,
            alt: img.alt ?? product.title,
            isPrimary: img.isPrimary ?? i === 0,
          })),
        });
      }
    }

    // Update variants if provided
    if (input.variants) {
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id },
        include: { inventory: true },
      });

      const existingMap = new Map(existingVariants.map((variant) => [variant.id, variant]));

      for (const variant of input.variants) {
        if (variant.id && existingMap.has(variant.id)) {
          const current = existingMap.get(variant.id)!;

          await prisma.productVariant.update({
            where: { id: current.id },
            data: {
              name: variant.name,
              skuPrefix: variant.skuPrefix,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice,
              attributes: (variant.attributes as Prisma.InputJsonValue) ?? Prisma.JsonNull,
              image: variant.image,
            },
          });

          if (variant.inventory) {
            const currentInventory = current.inventory[0];

            if (currentInventory) {
              await prisma.inventory.update({
                where: { id: currentInventory.id },
                data: {
                  sku: variant.inventory.sku,
                  quantity: variant.inventory.quantity ?? 0,
                  location: variant.inventory.location,
                },
              });
            } else {
              await prisma.inventory.create({
                data: {
                  variantId: current.id,
                  sku: variant.inventory.sku,
                  quantity: variant.inventory.quantity ?? 0,
                  location: variant.inventory.location,
                },
              });
            }
          }

          continue;
        }

        // Create new variant
        await prisma.productVariant.create({
          data: {
            productId: id,
            name: variant.name,
            skuPrefix: variant.skuPrefix,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            attributes: (variant.attributes as Prisma.InputJsonValue) ?? Prisma.JsonNull,
            image: variant.image,
            inventory: variant.inventory
              ? {
                  create: {
                    sku: variant.inventory.sku,
                    quantity: variant.inventory.quantity ?? 0,
                    location: variant.inventory.location,
                  },
                }
              : undefined,
          },
        });
      }
    }

    return this.adminGetProduct(id);
  }

  // =====================================================
  // 🔒 ADMIN: Delete product (soft delete → ARCHIVED, then hard delete)
  // =====================================================
  async adminDeleteProduct(id: number) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Product not found", "NOT_FOUND") };
    }

    if (existing.status === "ARCHIVED") {
      // Hard delete
      await prisma.$transaction(async (tx) => {
        await tx.wishlistItem.deleteMany({ where: { productId: id } });
        await tx.review.deleteMany({ where: { productId: id } });
        await tx.inventory.deleteMany({ where: { variant: { productId: id } } });
        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.product.delete({ where: { id } });
      });

      return { id, deleted: true };
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return { id, archived: true };
  }
}

export const productService = new ProductService();
