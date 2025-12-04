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
          name: true,
          slug: true,
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
