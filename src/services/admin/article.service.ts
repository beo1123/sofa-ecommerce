import { ArticleStatus, PrismaClient } from "@prisma/client";
import { fail } from "@/server/utils/api";
import { deleteImageByUrl, deleteFolderIfEmpty, getCloudinaryFolderFromUrl } from "@/lib/upload";

// ─── Types ────────────────────────────────────────────────
export interface ArticleImageInput {
  id?: number;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

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
  images?: ArticleImageInput[];
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
          images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] },
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
        images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] },
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

    const images = input.images ?? [];
    const primaryImage = images.find((img) => img.isPrimary) ?? images[0];
    const thumbnail = input.thumbnail ?? primaryImage?.url;

    const article = await this.prisma.article.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        thumbnail,
        status: input.status ?? "DRAFT",
        categoryId: input.categoryId,
        authorId: input.authorId,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : input.status === "PUBLISHED" ? new Date() : null,
        images: {
          create: images.map((img, i) => ({
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary ?? i === 0,
          })),
        },
      },
      include: {
        category: true,
        author: { select: { id: true, displayName: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] },
      },
    });

    return article;
  }

  /**
   * Cập nhật bài viết
   */
  async updateArticle(id: number, input: UpdateArticleInput) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
      include: { images: true },
    });
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

    // ── Image diff ────────────────────────────────────────
    const newImages = input.images ?? [];
    const newImageIds = new Set(newImages.filter((img) => img.id).map((img) => img.id!));

    // Images removed from the new list → delete from Cloudinary
    const removedImages = existing.images.filter((img) => !newImageIds.has(img.id));
    await Promise.allSettled(removedImages.map((img) => deleteImageByUrl(img.url)));

    // Determine thumbnail
    const primaryImage = newImages.find((img) => img.isPrimary) ?? newImages[0];
    const thumbnail = input.thumbnail !== undefined ? input.thumbnail : (primaryImage?.url ?? existing.thumbnail);

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.content !== undefined && { content: input.content }),
        thumbnail,
        ...(input.status !== undefined && { status: input.status }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.authorId !== undefined && { authorId: input.authorId }),
        ...(publishedAt !== undefined && { publishedAt }),
        images: {
          // Delete removed images from DB
          ...(removedImages.length > 0 && {
            deleteMany: { id: { in: removedImages.map((img) => img.id) } },
          }),
          // Update existing images (each with potentially different data)
          update: newImages
            .filter((img) => img.id)
            .map((img) => ({
              where: { id: img.id! },
              data: { alt: img.alt, isPrimary: img.isPrimary ?? false },
            })),
          // Add new images (no id); isPrimary falls back to first item when no existing images remain
          create: newImages
            .filter((img) => !img.id)
            .map((img, i) => {
              const hasExistingImages = newImages.some((x) => x.id);
              return {
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary ?? (!hasExistingImages && i === 0),
              };
            }),
        },
      },
      include: {
        category: true,
        author: { select: { id: true, displayName: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] },
      },
    });

    return article;
  }

  /**
   * Xóa ảnh đơn lẻ khỏi bài viết (DB + Cloudinary) – dùng cho nút X trong edit
   */
  async deleteArticleImage(articleId: number, imageId: number) {
    const image = await this.prisma.articleImage.findFirst({
      where: { id: imageId, articleId },
    });
    if (!image) {
      throw { status: 404, body: fail("Image not found", "NOT_FOUND") };
    }

    await deleteImageByUrl(image.url);
    await this.prisma.articleImage.delete({ where: { id: imageId } });

    return { id: imageId, deleted: true };
  }

  /**
   * Xóa bài viết: xóa toàn bộ ảnh trên Cloudinary → lưu trữ (archive)
   */
  async deleteArticle(id: number) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) {
      throw { status: 404, body: fail("Article not found", "NOT_FOUND") };
    }

    // Delete all images from Cloudinary
    await Promise.allSettled(existing.images.map((img) => deleteImageByUrl(img.url)));

    // Delete thumbnail if it differs from image set
    if (existing.thumbnail) {
      const imageUrls = new Set(existing.images.map((img) => img.url));
      if (!imageUrls.has(existing.thumbnail)) {
        await deleteImageByUrl(existing.thumbnail).catch(() => {});
      }
    }

    // Try to clean up the article folder (if empty after image removal)
    const sampleUrl = existing.images[0]?.url ?? existing.thumbnail;
    if (sampleUrl) {
      const folder = getCloudinaryFolderFromUrl(sampleUrl);
      if (folder) {
        await deleteFolderIfEmpty(folder).catch(() => {});
      }
    }

    // Remove image records and soft-delete the article
    await this.prisma.$transaction([
      this.prisma.articleImage.deleteMany({ where: { articleId: id } }),
      this.prisma.article.update({ where: { id }, data: { status: "ARCHIVED" } }),
    ]);

    return { id, archived: true };
  }
}
