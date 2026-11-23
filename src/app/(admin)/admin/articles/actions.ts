"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma, type ArticleStatus } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { recordAuditLog } from "@/lib/audit";
import { slugifyVi } from "@/lib/slug";
import {
  createArticleCategorySchema,
  saveArticleSchema,
  updateArticleStatusSchema,
  type SaveArticleInput,
} from "@/lib/validators/article";
import type { SerializedArticleCategory } from "@/components/admin/articles/types";

export interface ArticleActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

function parseOptionalDate(value: string | null | undefined): Date | null {
  if (!value || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function saveArticleAction(
  input: SaveArticleInput
): Promise<ArticleActionResult<{ id: number; slug: string; publishedAt: string | null }>> {
  try {
    const session = await requireAdmin();
    const parsed = saveArticleSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Dữ liệu bài viết không hợp lệ",
      };
    }

    const data = parsed.data;

    // Ensure unique slug
    const slugOwner = await prisma.article.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (slugOwner && slugOwner.id !== data.id) {
      return {
        ok: false,
        error: `Slug "${data.slug}" đã tồn tại ở bài viết khác`,
      };
    }

    const parsedPublishedAt = parseOptionalDate(data.publishedAt);
    const authorId = session.user?.id && /^\d+$/.test(String(session.user.id)) ? Number(session.user.id) : null;

    let finalPublishedAt: Date | null = parsedPublishedAt;
    if (data.status === "PUBLISHED" && !finalPublishedAt) {
      if (data.id) {
        const existing = await prisma.article.findUnique({
          where: { id: data.id },
          select: { publishedAt: true },
        });
        finalPublishedAt = existing?.publishedAt ?? new Date();
      } else {
        finalPublishedAt = new Date();
      }
    }

    const bodyJsonValue = data.bodyJson ? (data.bodyJson as Prisma.InputJsonValue) : Prisma.DbNull;

    const coverUrl = data.coverImageUrl || null;

    const saved = data.id
      ? await prisma.article.update({
          where: { id: data.id },
          data: {
            title: data.title,
            slug: data.slug,
            categoryId: data.categoryId ?? null,
            coverImageUrl: coverUrl,
            thumbnail: coverUrl,
            excerpt: data.excerpt || null,
            content: data.content,
            bodyJson: bodyJsonValue,
            linkedProductId: data.linkedProductId ?? null,
            status: data.status,
            publishedAt: finalPublishedAt,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
          },
          select: { id: true, slug: true, publishedAt: true },
        })
      : await prisma.article.create({
          data: {
            title: data.title,
            slug: data.slug,
            categoryId: data.categoryId ?? null,
            coverImageUrl: coverUrl,
            thumbnail: coverUrl,
            excerpt: data.excerpt || null,
            content: data.content,
            bodyJson: bodyJsonValue,
            linkedProductId: data.linkedProductId ?? null,
            status: data.status,
            publishedAt: finalPublishedAt,
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
            authorId,
          },
          select: { id: true, slug: true, publishedAt: true },
        });

    await recordAuditLog({
      actorId: session.user.id,
      action: data.id ? "ARTICLE_UPDATED" : "ARTICLE_CREATED",
      entity: "Article",
      entityId: saved.id,
      changes: {
        title: data.title,
        slug: saved.slug,
        status: data.status,
        linkedProductId: data.linkedProductId ?? null,
      },
    });

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${saved.id}`);
    revalidatePath("/bai-viet");
    revalidatePath(`/bai-viet/${saved.slug}`);

    return {
      ok: true,
      data: {
        id: saved.id,
        slug: saved.slug,
        publishedAt: saved.publishedAt ? saved.publishedAt.toISOString() : null,
      },
    };
  } catch (err) {
    console.error("[saveArticleAction]", err);
    return { ok: false, error: "Không thể lưu bài viết. Vui lòng thử lại." };
  }
}

export async function createArticleCategoryInlineAction(
  name: string
): Promise<ArticleActionResult<SerializedArticleCategory>> {
  try {
    const session = await requireAdmin();
    const parsed = createArticleCategorySchema.safeParse({ name });
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Tên danh mục không hợp lệ",
      };
    }

    const baseSlug = slugifyVi(parsed.data.name) || "danh-muc";
    let candidateSlug = baseSlug;
    let suffix = 2;

    while (
      await prisma.articleCategory.findUnique({
        where: { slug: candidateSlug },
        select: { id: true },
      })
    ) {
      candidateSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const created = await prisma.articleCategory.create({
      data: {
        name: parsed.data.name,
        slug: candidateSlug,
      },
      select: { id: true, name: true, slug: true },
    });

    await recordAuditLog({
      actorId: session.user.id,
      action: "ARTICLE_CATEGORY_CREATED",
      entity: "ArticleCategory",
      entityId: created.id,
      changes: { name: created.name, slug: created.slug },
    });

    revalidatePath("/admin/articles");
    revalidatePath("/admin/article-categories");

    return { ok: true, data: created };
  } catch (err) {
    console.error("[createArticleCategoryInlineAction]", err);
    return { ok: false, error: "Không thể tạo danh mục bài viết" };
  }
}

export async function updateArticleStatusAction(
  articleId: number,
  status: ArticleStatus
): Promise<
  ArticleActionResult<{
    articleId: number;
    status: ArticleStatus;
    publishedAt: string | null;
  }>
> {
  try {
    const session = await requireAdmin();
    const parsed = updateArticleStatusSchema.safeParse({ articleId, status });
    if (!parsed.success) {
      return { ok: false, error: "Trạng thái bài viết không hợp lệ" };
    }

    const existing = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, slug: true, publishedAt: true },
    });

    if (!existing) {
      return { ok: false, error: "Không tìm thấy bài viết" };
    }

    const nextPublishedAt = status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt;

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status,
        publishedAt: nextPublishedAt,
      },
      select: { id: true, slug: true, status: true, publishedAt: true },
    });

    await recordAuditLog({
      actorId: session.user.id,
      action: "ARTICLE_STATUS_UPDATED",
      entity: "Article",
      entityId: updated.id,
      changes: { status: updated.status },
    });

    revalidatePath("/admin/articles");
    revalidatePath("/bai-viet");
    revalidatePath(`/bai-viet/${updated.slug}`);

    return {
      ok: true,
      data: {
        articleId: updated.id,
        status: updated.status,
        publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
      },
    };
  } catch (err) {
    console.error("[updateArticleStatusAction]", err);
    return { ok: false, error: "Không thể đổi trạng thái bài viết" };
  }
}

export async function deleteArticleAction(articleId: number): Promise<ArticleActionResult<{ deleted: boolean }>> {
  try {
    const session = await requireAdmin();
    const existing = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, slug: true },
    });

    if (!existing) {
      return { ok: false, error: "Không tìm thấy bài viết" };
    }

    await prisma.article.delete({ where: { id: articleId } });

    await recordAuditLog({
      actorId: session.user.id,
      action: "ARTICLE_DELETED",
      entity: "Article",
      entityId: existing.id,
      changes: { title: existing.title, slug: existing.slug },
    });

    revalidatePath("/admin/articles");
    revalidatePath("/bai-viet");

    return { ok: true, data: { deleted: true } };
  } catch (err) {
    console.error("[deleteArticleAction]", err);
    return { ok: false, error: "Không thể xóa bài viết" };
  }
}
