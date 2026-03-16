import { PrismaClient } from "@prisma/client";

export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  async getAll(page: number, perPage: number, skip: number) {
    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.category.count(),
    ]);
    return {
      success: true,
      data: items,
      meta: {
        page,
        perPage,
        total,
      },
    };
  }
}
