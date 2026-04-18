// =========================================================
// apps/api/src/services/category.service.ts
// Category service for public API and admin operations
// =========================================================

import { prisma, type Prisma } from "@repo/db";
import type { CreateCategoryInput, UpdateCategoryInput } from "@repo/types";
import { fail } from "../lib/response.js";

export class CategoryService {
  // =====================================================
  // 📦 PUBLIC: Get all categories
  // =====================================================
  async getAllCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, image: true },
    });
    return categories;
  }

  // =====================================================
  // 📦 PUBLIC: Get category by slug
  // =====================================================
  async getCategoryBySlug(slug: string) {
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
      throw { status: 404, body: fail("Category not found", "NOT_FOUND") };
    }

    return category;
  }

  // =====================================================
  // 🔒 ADMIN: List categories with pagination
  // =====================================================
  async adminListCategories(page: number, perPage: number, filters: { q?: string } = {}) {
    const skip = (page - 1) * perPage;
    const q = filters.q?.trim();

    const where: Prisma.CategoryWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { products: true } },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return { items, meta: { page, perPage, total } };
  }

  // =====================================================
  // 🔒 ADMIN: Create category
  // =====================================================
  async adminCreateCategory(input: CreateCategoryInput) {
    const name = input.name.trim();
    const slug = input.slug.trim();

    if (!name || !slug) {
      throw { status: 400, body: fail("Name and slug are required", "INVALID_BODY") };
    }

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
      select: { id: true, name: true, slug: true },
    });

    if (existing) {
      if (existing.slug === slug) {
        throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
      }
      throw { status: 400, body: fail("Category name already exists", "DUPLICATE_NAME") };
    }

    return prisma.category.create({
      data: {
        name,
        slug,
        image: input.image?.trim() || null,
      },
      include: { _count: { select: { products: true } } },
    });
  }

  // =====================================================
  // 🔒 ADMIN: Update category
  // =====================================================
  async adminUpdateCategory(id: number, input: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Category not found", "NOT_FOUND") };
    }

    const nextName = input.name?.trim();
    const nextSlug = input.slug?.trim();

    if (nextName === "" || nextSlug === "") {
      throw { status: 400, body: fail("Name and slug cannot be empty", "INVALID_BODY") };
    }

    if (nextName || nextSlug) {
      const duplicate = await prisma.category.findFirst({
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
        throw { status: 400, body: fail("Category name already exists", "DUPLICATE_NAME") };
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...(nextName !== undefined && { name: nextName }),
        ...(nextSlug !== undefined && { slug: nextSlug }),
        ...(input.image !== undefined && { image: input.image?.trim() || null }),
      },
      include: { _count: { select: { products: true } } },
    });
  }

  // =====================================================
  // 🔒 ADMIN: Delete category
  // =====================================================
  async adminDeleteCategory(id: number) {
    const existing = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        image: true,
        _count: { select: { products: true } },
      },
    });

    if (!existing) {
      throw { status: 404, body: fail("Category not found", "NOT_FOUND") };
    }

    if (existing._count.products > 0) {
      throw {
        status: 400,
        body: fail(
          "Category has related products. Reassign or remove products before deleting.",
          "CATEGORY_IN_USE"
        ),
      };
    }

    await prisma.category.delete({ where: { id } });

    return { id, deleted: true };
  }
}

export const categoryService = new CategoryService();
