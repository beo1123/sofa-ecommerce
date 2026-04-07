import { ArticleStatus, Prisma, PrismaClient } from "@prisma/client";
import { fail } from "@/server/utils/api";
import {
  deleteFolderIfEmpty,
  deleteImageByUrl,
  deleteResourcesByPrefix,
  getCloudinaryFolderFromUrl,
} from "@/lib/upload";
import { extractImageUrlsFromHtml } from "@/lib/articles/adminArticleUtils";

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

export interface ArticleListFilters {
  q?: string;
  status?: ArticleStatus;
  categoryId?: number;
}

function getFolderCleanupChain(folder: string) {
  const segments = folder.split("/").filter(Boolean);
  const folders: string[] = [];

  for (let length = segments.length; length >= 2; length -= 1) {
    folders.push(segments.slice(0, length).join("/"));
  }

  return folders;
}

function getArticleRootFolder(folder: string) {
  const segments = folder.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  return segments.slice(0, 2).join("/");
}

async function cleanupRemovedArticleImages(imageUrls: string[]) {
  if (!imageUrls.length) return;

  await Promise.allSettled(imageUrls.map((url) => deleteImageByUrl(url)));

  const folders = [
    ...new Set(
      imageUrls
        .map((url) => getCloudinaryFolderFromUrl(url))
        .filter(Boolean)
        .flatMap((folder) => getFolderCleanupChain(folder as string))
    ),
  ].sort((a, b) => b.length - a.length);

  await Promise.allSettled(folders.map((folder) => deleteFolderIfEmpty(folder)));
}

async function cleanupArticleFolderTree(imageUrls: string[]) {
  if (!imageUrls.length) return;

  const imageFolders = imageUrls.map((url) => getCloudinaryFolderFromUrl(url)).filter(Boolean) as string[];
  const rootFolders = [
    ...new Set(imageFolders.map((folder) => getArticleRootFolder(folder)).filter(Boolean)),
  ] as string[];

  await Promise.allSettled(rootFolders.map((folder) => deleteResourcesByPrefix(folder)));

  const folders = [...new Set(imageFolders.flatMap((folder) => getFolderCleanupChain(folder)))].sort(
    (a, b) => b.length - a.length
  );

  await Promise.allSettled(folders.map((folder) => deleteFolderIfEmpty(folder)));
}

// ─── Service ──────────────────────────────────────────────
export class AdminArticleService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Danh sách bài viết (admin – bao gồm DRAFT / ARCHIVED)
   */
  async listArticles(page: number, perPage: number, filters: ArticleListFilters = {}) {
    const skip = (page - 1) * perPage;
    const q = filters.q?.trim();

    const where: Prisma.ArticleWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(q
        ? {
            OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        skip,
        take: perPage,
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, displayName: true } },
        },
      }),
      this.prisma.article.count({ where }),
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
        thumbnail: input.thumbnail?.trim() || null,
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

    const existingContentImageUrls = extractImageUrlsFromHtml(existing.content);

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail?.trim() || null }),
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

    const nextContentImageUrls =
      input.content !== undefined ? extractImageUrlsFromHtml(article.content) : existingContentImageUrls;
    const removedContentImageUrls = existingContentImageUrls.filter((url) => !nextContentImageUrls.includes(url));
    const removedThumbnailUrl =
      input.thumbnail !== undefined && existing.thumbnail && existing.thumbnail !== article.thumbnail
        ? [existing.thumbnail]
        : [];

    const removedImageUrls = [...new Set([...removedThumbnailUrl, ...removedContentImageUrls])];

    if (removedImageUrls.length) {
      await cleanupRemovedArticleImages(removedImageUrls);
    }

    return article;
  }

  /**
   * Xóa bài viết: lần đầu archive, lần hai xóa vĩnh viễn
   */
  async deleteArticle(id: number) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Article not found", "NOT_FOUND") };
    }

    if (existing.status === "ARCHIVED") {
      const contentImageUrls = extractImageUrlsFromHtml(existing.content);
      const imageUrls = [...new Set([existing.thumbnail, ...contentImageUrls].filter(Boolean))] as string[];

      await this.prisma.article.delete({ where: { id } });

      await cleanupArticleFolderTree(imageUrls);

      return { id, deleted: true };
    }

    await this.prisma.article.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return { id, archived: true };
  }
}
