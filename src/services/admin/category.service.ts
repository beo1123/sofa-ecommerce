import { Prisma, PrismaClient } from "@prisma/client";
import { fail } from "@/server/utils/api";
import { deleteFolderIfEmpty, deleteImageByUrl, getCloudinaryFolderFromUrl } from "@/lib/upload";

export interface CategoryListFilters {
  q?: string;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  image?: string | null;
}

export class AdminCategoryService {
  constructor(private prisma: PrismaClient) {}

  async listCategories(page: number, perPage: number, filters: CategoryListFilters = {}) {
    const skip = (page - 1) * perPage;
    const q = filters.q?.trim();

    const where: Prisma.CategoryWhereInput = q
      ? {
          OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      items,
      meta: { page, perPage, total },
    };
  }

  async createCategory(input: CategoryPayload) {
    const name = input.name.trim();
    const slug = input.slug.trim();

    if (!name || !slug) {
      throw { status: 400, body: fail("Name and slug are required", "INVALID_BODY") };
    }

    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
      select: { id: true, name: true, slug: true },
    });

    if (existing) {
      if (existing.slug === slug) {
        throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
      }
      throw { status: 400, body: fail("Category name already exists", "DUPLICATE_NAME") };
    }

    return this.prisma.category.create({
      data: {
        name,
        slug,
        image: input.image?.trim() || null,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async updateCategory(id: number, input: Partial<CategoryPayload>) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Category not found", "NOT_FOUND") };
    }

    const nextName = input.name?.trim();
    const nextSlug = input.slug?.trim();

    if (nextName === "" || nextSlug === "") {
      throw { status: 400, body: fail("Name and slug cannot be empty", "INVALID_BODY") };
    }

    if (nextName || nextSlug) {
      const duplicate = await this.prisma.category.findFirst({
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

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(nextName !== undefined && { name: nextName }),
        ...(nextSlug !== undefined && { slug: nextSlug }),
        ...(input.image !== undefined && { image: input.image?.trim() || null }),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Remove previous Cloudinary image when a new image is set or image is cleared.
    if (input.image !== undefined && existing.image && existing.image !== updated.image) {
      await deleteImageByUrl(existing.image);
      const oldFolder = getCloudinaryFolderFromUrl(existing.image);
      if (oldFolder) {
        await deleteFolderIfEmpty(oldFolder);
      }
    }

    return updated;
  }

  async deleteCategory(id: number) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        image: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      throw { status: 404, body: fail("Category not found", "NOT_FOUND") };
    }

    if (existing._count.products > 0) {
      throw {
        status: 400,
        body: fail("Category has related products. Reassign or remove products before deleting.", "CATEGORY_IN_USE"),
      };
    }

    if (existing.image) {
      await deleteImageByUrl(existing.image);
    }

    await this.prisma.category.delete({ where: { id } });

    if (existing.image) {
      const folder = getCloudinaryFolderFromUrl(existing.image);
      if (folder) {
        await deleteFolderIfEmpty(folder);
      }
    }

    return { id, deleted: true };
  }
}
