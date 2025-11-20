import { ArticleStatus, PrismaClient } from "@prisma/client";

export class ArticleService {
  constructor(private prisma: PrismaClient) {}

  ///Get article by category
  async getArticleByCategory(slug: string) {
    const category = await this.prisma.articleCategory.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!category) {
      throw {
        status: 404,
        body: {
          success: true,
          error: { message: "Category not found", code: "CATEGORY_NOT_FOUND" },
        },
      };
    }

    const articles = await this.prisma.article.findMany({
      where: { categoryId: category.id, status: ArticleStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "asc" },
    });
    return {
      success: true,
      data: {
        category,
        articles,
      },
    };
  }
  //get latest article
  async getLatestArticle(limit: number = 5) {
    const articles = await this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "asc" },
      take: limit,
    });
    return {
      success: true,
      data: {
        articles,
      },
    };
  }
  //get All article
  async getAllArticle(page: number, perPage: number, skip: number) {
    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          publishedAt: true,
        },
        skip,
        take: perPage,
        orderBy: { publishedAt: "desc" },
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
  //get article detail by slug
  async getArticleBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        thumbnail: true,
        publishedAt: true,
        status: true,

        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!article || article.status !== "PUBLISHED") {
      throw {
        status: 404,
        body: {
          success: false,
          error: {
            message: "Article not found",
            code: "ARTICLE_NOT_FOUND",
          },
        },
      };
    }

    return {
      success: true,
      data: article,
    };
  }
}
