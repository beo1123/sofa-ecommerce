// =========================================================
// apps/api/src/services/article.service.ts
// Article service for public API and admin operations
// =========================================================

import { prisma, type Prisma, type ArticleStatus } from "@repo/db";
import type { CreateArticleInput, UpdateArticleInput, AdminArticleFilters } from "@repo/types";
import { fail } from "../lib/response.js";

export class ArticleService {
  // =====================================================
  // 📰 PUBLIC: Get articles by category
  // =====================================================
  async getArticlesByCategory(slug: string) {
    const category = await prisma.articleCategory.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!category) {
      throw { status: 404, body: fail("Category not found", "CATEGORY_NOT_FOUND") };
    }

    const articles = await prisma.article.findMany({
      where: { categoryId: category.id, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    return { category, articles };
  }

  // =====================================================
  // 📰 PUBLIC: Get latest articles
  // =====================================================
  async getLatestArticles(limit: number = 5) {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    return articles;
  }

  // =====================================================
  // 📰 PUBLIC: Get all articles (paginated)
  // =====================================================
  async getAllArticles(page: number, perPage: number) {
    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
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
      prisma.article.count({ where: { status: "PUBLISHED" } }),
    ]);

    return { items, meta: { page, perPage, total } };
  }

  // =====================================================
  // 📰 PUBLIC: Get article by slug
  // =====================================================
  async getArticleBySlug(slug: string) {
    const article = await prisma.article.findUnique({
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
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, displayName: true } },
      },
    });

    if (!article || article.status !== "PUBLISHED") {
      throw { status: 404, body: fail("Article not found", "ARTICLE_NOT_FOUND") };
    }

    return article;
  }

  // =====================================================
  // 📰 PUBLIC: Get related articles
  // =====================================================
  async getRelatedArticles(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, categoryId: true, status: true },
    });

    if (!article || article.status !== "PUBLISHED") {
      throw { status: 404, body: fail("Article not found", "ARTICLE_NOT_FOUND") };
    }

    const related = await prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        status: "PUBLISHED",
        id: { not: article.id },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });

    return related;
  }

  // =====================================================
  // 🔒 ADMIN: List articles
  // =====================================================
  async adminListArticles(page: number, perPage: number, filters: AdminArticleFilters = {}) {
    const skip = (page - 1) * perPage;
    const q = filters.q?.trim();

    const where: Prisma.ArticleWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.article.findMany({
        skip,
        take: perPage,
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, displayName: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return { items, meta: { page, perPage, total } };
  }

  // =====================================================
  // 🔒 ADMIN: Get article by ID
  // =====================================================
  async adminGetArticle(id: number) {
    const article = await prisma.article.findUnique({
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

  // =====================================================
  // 🔒 ADMIN: Create article
  // =====================================================
  async adminCreateArticle(input: CreateArticleInput) {
    const existing = await prisma.article.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
    }

    const article = await prisma.article.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        thumbnail: input.thumbnail?.trim() || null,
        status: (input.status as ArticleStatus) ?? "DRAFT",
        categoryId: input.categoryId,
        authorId: input.authorId,
        publishedAt: input.publishedAt
          ? new Date(input.publishedAt)
          : input.status === "PUBLISHED"
            ? new Date()
            : null,
      },
      include: {
        category: true,
        author: { select: { id: true, displayName: true } },
      },
    });

    return article;
  }

  // =====================================================
  // 🔒 ADMIN: Update article
  // =====================================================
  async adminUpdateArticle(id: number, input: UpdateArticleInput) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Article not found", "NOT_FOUND") };
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await prisma.article.findUnique({ where: { slug: input.slug } });
      if (slugTaken) {
        throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
      }
    }

    // Auto-set publishedAt if publishing for first time
    let publishedAt = input.publishedAt ? new Date(input.publishedAt) : undefined;
    if (input.status === "PUBLISHED" && !existing.publishedAt && !publishedAt) {
      publishedAt = new Date();
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail?.trim() || null }),
        ...(input.status !== undefined && { status: input.status as ArticleStatus }),
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

  // =====================================================
  // 🔒 ADMIN: Delete article (soft delete → archive, then hard delete)
  // =====================================================
  async adminDeleteArticle(id: number) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Article not found", "NOT_FOUND") };
    }

    if (existing.status === "ARCHIVED") {
      await prisma.article.delete({ where: { id } });
      return { id, deleted: true };
    }

    await prisma.article.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return { id, archived: true };
  }
}

export const articleService = new ArticleService();
