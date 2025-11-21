import { PrismaClient } from "@prisma/client";

export class ArticleCategory {
  constructor(private prisma: PrismaClient) {}

  async getAllArticleCategory(page: number, perPage: number, skip: number) {
    const [items, total] = await Promise.all([
      this.prisma.articleCategory.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: perPage,
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.article.count(),
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
