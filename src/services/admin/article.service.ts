import { ArticleStatus, PrismaClient } from "@prisma/client";
import { fail } from "@/server/utils/api";

// ─── Types ────────────────────────────────────────────────
export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  status?: ArticleStatus;
  categoryId?: number;
  authorId?: number;
  publishedAt?: string;
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {}

// ─── Service ──────────────────────────────────────────────
export class AdminArticleService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Danh sách bài viết (admin – bao gồm DRAFT / ARCHIVED)
   */
  async listArticles(page: number, perPage: number) {
    const skip = (page - 1) * perPage;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        skip,
        take: perPage,
        orderBy: { updatedAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, displayName: true } },
        },
      }),
      this.prisma.article.count(),
    ]);

    return { items, meta: { page, perPage, total } };
  }

  /**
   * Chi tiết bài viết (admin)
   */
  async getArticle(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, displayName: true, email: true } },
      },
    });

    if (!article) {
      throw { status: 404, body: fail("Article not found", "NOT_FOUND") };
    }
    return article;
  }

  /**
   * Tạo bài viết mới
   */
  async createArticle(input: CreateArticleInput) {
    const existing = await this.prisma.article.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
    }

    const article = await this.prisma.article.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        thumbnail: input.thumbnail,
        status: input.status ?? "DRAFT",
        categoryId: input.categoryId,
        authorId: input.authorId,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : input.status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        category: true,
        author: { select: { id: true, displayName: true } },
      },
    });

    return article;
  }

  /**
   * Cập nhật bài viết
   */
  async updateArticle(id: number, input: UpdateArticleInput) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Article not found", "NOT_FOUND") };
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await this.prisma.article.findUnique({ where: { slug: input.slug } });
      if (slugTaken) {
        throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
      }
    }

    // Auto-set publishedAt nếu chuyển sang PUBLISHED lần đầu
    let publishedAt = input.publishedAt ? new Date(input.publishedAt) : undefined;
    if (input.status === "PUBLISHED" && !existing.publishedAt && !publishedAt) {
      publishedAt = new Date();
    }

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.authorId !== undefined && { authorId: input.authorId }),
        ...(publishedAt !== undefined && { publishedAt }),
      },
      include: {
        category: true,
        author: { select: { id: true, displayName: true } },
      },
    });

    return article;
  }

  /**
   * Xóa bài viết (soft delete → ARCHIVED)
   */
  async deleteArticle(id: number) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Article not found", "NOT_FOUND") };
    }

    await this.prisma.article.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return { id, archived: true };
  }
}
