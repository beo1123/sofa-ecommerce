// =========================================================
// apps/api/src/controllers/products.controller.ts
// Business logic for product endpoints
// =========================================================

import type { Context } from "hono";
import { prisma } from "@repo/db";
import type { ApiSuccess, PaginationMeta } from "@repo/types";

function parsePagination(query: Record<string, string>) {
  const page = Math.max(1, Number(query.page ?? 1));
  const perPage = Math.min(100, Math.max(1, Number(query.perPage ?? 20)));
  return { page, perPage, skip: (page - 1) * perPage };
}

// ── GET /products ─────────────────────────────────────────
export async function listProducts(c: Context) {
  const query = c.req.query() as Record<string, string>;
  const { page, perPage, skip } = parsePagination(query);

  const category = query.category;
  const priceMin = query.priceMin ? Number(query.priceMin) : undefined;
  const priceMax = query.priceMax ? Number(query.priceMax) : undefined;
  const color = query.color;

  const where: Parameters<typeof prisma.product.findMany>[0]["where"] = {
    status: "PUBLISHED",
    ...(category ? { category: { slug: category } } : {}),
    ...(color
      ? {
          variants: {
            some: { attributes: { path: ["color"], equals: color } },
          },
        }
      : {}),
  };

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        category: { select: { name: true, slug: true, image: true } },
        variants: {
          select: { price: true },
          ...(priceMin !== undefined || priceMax !== undefined
            ? {
                where: {
                  price: {
                    ...(priceMin !== undefined ? { gte: priceMin } : {}),
                    ...(priceMax !== undefined ? { lte: priceMax } : {}),
                  },
                },
              }
            : {}),
        },
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
      category: p.category,
    };
  });

  const meta: PaginationMeta = { page, perPage, total };
  const response: ApiSuccess<typeof items> = { success: true, data: items, meta };
  return c.json(response);
}

// ── GET /products/:slug ───────────────────────────────────
export async function getProduct(c: Context) {
  const slug = c.req.param("slug");

  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { isPrimary: "desc" } },
      variants: { include: { inventory: true } },
      reviews: { where: { approved: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!p) {
    return c.json(
      { success: false, error: { message: "Product not found", code: "NOT_FOUND" } },
      404
    );
  }

  const reviewCount = p.reviews.length;
  const average =
    reviewCount > 0
      ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

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

  const response: ApiSuccess<unknown> = {
    success: true,
    data: {
      id: p.id,
      slug: p.slug,
      title: p.title,
      shortDescription: p.shortDescription,
      description: p.description,
      status: p.status,
      images: p.images,
      variants,
      category: p.category,
      reviewsSummary: { average, count: reviewCount },
    },
  };

  return c.json(response);
}
