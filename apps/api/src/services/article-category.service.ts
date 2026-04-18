// =========================================================
// apps/api/src/services/article-category.service.ts
// Article Category service for public API and admin operations
// =========================================================

import { prisma, type Prisma } from "@repo/db";
import type { CreateArticleCategoryInput, UpdateArticleCategoryInput } from "@repo/types";
import { fail } from "../lib/response.js";

export class ArticleCategoryService {
  // =====================================================
  // 📰 PUBLIC: Get all article categories
  // =====================================================
  async getAllArticleCategories() {
    const categories = await prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
    return categories;
  }

  // =====================================================
  // 🔒 ADMIN: List article categories with pagination
  // =====================================================
  async adminListArticleCategories(page: number, perPage: number, filters: { q?: string } = {}) {
    const skip = (page - 1) * perPage;
    const q = filters.q?.trim();

    const where: Prisma.ArticleCategoryWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await prisma.$transaction([
      prisma.articleCategory.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { articles: true } },
        },
      }),
      prisma.articleCategory.count({ where }),
    ]);

    return { items, meta: { page, perPage, total } };
  }

  // =====================================================
  // 🔒 ADMIN: Create article category
  // =====================================================
  async adminCreateArticleCategory(input: CreateArticleCategoryInput) {
    const name = input.name.trim();
    const slug = input.slug.trim();

    if (!name || !slug) {
      throw { status: 400, body: fail("Name and slug are required", "INVALID_BODY") };
    }

    const existing = await prisma.articleCategory.findFirst({
      where: { OR: [{ name }, { slug }] },
      select: { id: true, name: true, slug: true },
    });

    if (existing) {
      if (existing.slug === slug) {
        throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
      }
      throw { status: 400, body: fail("Article category name already exists", "DUPLICATE_NAME") };
    }

    return prisma.articleCategory.create({
      data: { name, slug },
      include: { _count: { select: { articles: true } } },
    });
  }

  // =====================================================
  // 🔒 ADMIN: Update article category
  // =====================================================
  async adminUpdateArticleCategory(id: number, input: UpdateArticleCategoryInput) {
    const existing = await prisma.articleCategory.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Article category not found", "NOT_FOUND") };
    }

    const nextName = input.name?.trim();
    const nextSlug = input.slug?.trim();

    if (nextName === "" || nextSlug === "") {
      throw { status: 400, body: fail("Name and slug cannot be empty", "INVALID_BODY") };
    }

    if (nextName || nextSlug) {
      const duplicate = await prisma.articleCategory.findFirst({
        where: {
          id: { not: id },
          OR: [...(nextName ? [{ name: nextName }] : []), ...(nextSlug ? [{ slug: nextSlug }] : [])],
        },
        select: { id: true, name: true, slug: true },
      });

      if (duplicate) {
        if (nextSlug && duplicate.slug === nextSlug) {
          throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
        }
        throw { status: 400, body: fail("Article category name already exists", "DUPLICATE_NAME") };
      }
    }

    return prisma.articleCategory.update({
      where: { id },
      data: {
        ...(nextName !== undefined && { name: nextName }),
        ...(nextSlug !== undefined && { slug: nextSlug }),
      },
      include: { _count: { select: { articles: true } } },
    });
  }

  // =====================================================
  // 🔒 ADMIN: Delete article category
  // =====================================================
  async adminDeleteArticleCategory(id: number) {
    const existing = await prisma.articleCategory.findUnique({
      where: { id },
      select: {
        id: true,
        _count: { select: { articles: true } },
      },
    });

    if (!existing) {
      throw { status: 404, body: fail("Article category not found", "NOT_FOUND") };
    }

    if (existing._count.articles > 0) {
      throw {
        status: 400,
        body: fail(
          "Article category has related articles. Reassign or archive those articles before deleting.",
          "CATEGORY_IN_USE"
        ),
      };
    }

    await prisma.articleCategory.delete({ where: { id } });
    return { id, deleted: true };
  }
}

export const articleCategoryService = new ArticleCategoryService();
