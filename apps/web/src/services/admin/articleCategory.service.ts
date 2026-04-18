import { Prisma, PrismaClient } from "@prisma/client";
import { fail } from "@/server/utils/api";

export interface ArticleCategoryListFilters {
  q?: string;
}

export interface ArticleCategoryPayload {
  name: string;
  slug: string;
}

export class AdminArticleCategoryService {
  constructor(private prisma: PrismaClient) {}

  async listArticleCategories(page: number, perPage: number, filters: ArticleCategoryListFilters = {}) {
    const skip = (page - 1) * perPage;
    const q = filters.q?.trim();

    const where: Prisma.ArticleCategoryWhereInput = q
      ? {
          OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.articleCategory.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { articles: true },
          },
        },
      }),
      this.prisma.articleCategory.count({ where }),
    ]);

    return {
      items,
      meta: { page, perPage, total },
    };
  }

  async createArticleCategory(input: ArticleCategoryPayload) {
    const name = input.name.trim();
    const slug = input.slug.trim();

    if (!name || !slug) {
      throw { status: 400, body: fail("Name and slug are required", "INVALID_BODY") };
    }

    const existing = await this.prisma.articleCategory.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
      select: { id: true, name: true, slug: true },
    });

    if (existing) {
      if (existing.slug === slug) {
        throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
      }
      throw { status: 400, body: fail("Article category name already exists", "DUPLICATE_NAME") };
    }

    return this.prisma.articleCategory.create({
      data: { name, slug },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async updateArticleCategory(id: number, input: Partial<ArticleCategoryPayload>) {
    const existing = await this.prisma.articleCategory.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Article category not found", "NOT_FOUND") };
    }

    const nextName = input.name?.trim();
    const nextSlug = input.slug?.trim();

    if (nextName === "" || nextSlug === "") {
      throw { status: 400, body: fail("Name and slug cannot be empty", "INVALID_BODY") };
    }

    if (nextName || nextSlug) {
      const duplicate = await this.prisma.articleCategory.findFirst({
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

    return this.prisma.articleCategory.update({
      where: { id },
      data: {
        ...(nextName !== undefined && { name: nextName }),
        ...(nextSlug !== undefined && { slug: nextSlug }),
      },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async deleteArticleCategory(id: number) {
    const existing = await this.prisma.articleCategory.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: { articles: true },
        },
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

    await this.prisma.articleCategory.delete({ where: { id } });
    return { id, deleted: true };
  }
}
