// =========================================================
// apps/api/src/routes/categories.ts
// Category routes: GET /categories
// =========================================================

import { Hono } from "hono";
import { prisma } from "@repo/db";
import type { ApiSuccess } from "@repo/types";

export const categoriesRouter = new Hono();

categoriesRouter.get("/", async (c) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, image: true },
  });

  const response: ApiSuccess<typeof categories> = {
    success: true,
    data: categories,
  };

  return c.json(response);
});

categoriesRouter.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          slug: true,
          title: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
        },
        take: 20,
      },
    },
  });

  if (!category) {
    return c.json(
      { success: false, error: { message: "Category not found", code: "NOT_FOUND" } },
      404
    );
  }

  const response: ApiSuccess<typeof category> = { success: true, data: category };
  return c.json(response);
});
