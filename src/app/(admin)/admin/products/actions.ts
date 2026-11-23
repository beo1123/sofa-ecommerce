"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma, type ProductStatus } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { recordAuditLog } from "@/lib/audit";
import { resolveWorkshopCode } from "@/lib/slug";
import {
  moderateReviewSchema,
  saveProductSchema,
  updateProductStatusSchema,
  type SaveProductInput,
} from "@/lib/validators/product";

export interface ProductActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function saveProductAction(
  input: SaveProductInput
): Promise<ProductActionResult<{ id: number; slug: string }>> {
  try {
    const session = await requireAdmin();
    const parsed = saveProductSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Dữ liệu sản phẩm không hợp lệ",
      };
    }

    const data = parsed.data;

    // Check duplicate slug
    const slugOwner = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (slugOwner && slugOwner.id !== data.id) {
      return {
        ok: false,
        error: `Slug "${data.slug}" đã được sử dụng bởi sản phẩm khác`,
      };
    }

    // Deduplicate colorOptions from materialOptions + explicit colorOptions
    const colorMap = new Map<string, { name: string; hex: string }>();
    for (const c of data.colorOptions) {
      colorMap.set(`${c.name.toLowerCase()}|${c.hex.toLowerCase()}`, c);
    }
    for (const mat of data.materialOptions) {
      for (const c of mat.colors) {
        colorMap.set(`${c.name.toLowerCase()}|${c.hex.toLowerCase()}`, c);
      }
    }
    const mergedColors = Array.from(colorMap.values());

    // Ensure exactly one primary image when images are present
    const normalizedImages = data.images.map((img, idx) => ({
      id: img.id,
      url: img.url,
      alt: img.alt || null,
      isPrimary: Boolean(img.isPrimary),
      orderIndex: idx,
    }));
    if (normalizedImages.length > 0 && !normalizedImages.some((img) => img.isPrimary)) {
      normalizedImages[0].isPrimary = true;
    }

    const metadataJson =
      data.metadata && Object.keys(data.metadata).length > 0 ? (data.metadata as Prisma.InputJsonValue) : undefined;
    const resolvedWorkshopCode = resolveWorkshopCode(data.workshopCode, data.title);

    const saved = await prisma.$transaction(async (tx) => {
      if (!data.id) {
        // CREATE
        const created = await tx.product.create({
          data: {
            workshopCode: resolvedWorkshopCode,
            title: data.title,
            slug: data.slug,
            categoryId: data.categoryId ?? null,
            status: data.status,
            shortDescription: data.shortDescription || null,
            description: data.description || null,
            priceNote: data.priceNote || null,
            defaultWidthCm: data.defaultWidthCm ?? null,
            defaultDepthCm: data.defaultDepthCm ?? null,
            defaultHeightCm: data.defaultHeightCm ?? null,
            allowCustomSize: data.allowCustomSize,
            materialOptions: data.materialOptions as unknown as Prisma.InputJsonValue,
            colorOptions: mergedColors as unknown as Prisma.InputJsonValue,
            metadata: metadataJson,
            images: {
              create: normalizedImages.map((img) => ({
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
              })),
            },
            variants: {
              create: data.variants.map((v) => ({
                name: v.name,
                skuPrefix: v.skuPrefix || null,
                price: v.price,
                compareAtPrice: v.compareAtPrice ?? null,
                attributes: v.attributes ? (v.attributes as Prisma.InputJsonValue) : undefined,
                image: v.image || null,
              })),
            },
          },
          select: { id: true, slug: true },
        });
        return created;
      }

      // UPDATE existing product
      const productId = data.id;
      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          workshopCode: resolvedWorkshopCode,
          title: data.title,
          slug: data.slug,
          categoryId: data.categoryId ?? null,
          status: data.status,
          shortDescription: data.shortDescription || null,
          description: data.description || null,
          priceNote: data.priceNote || null,
          defaultWidthCm: data.defaultWidthCm ?? null,
          defaultDepthCm: data.defaultDepthCm ?? null,
          defaultHeightCm: data.defaultHeightCm ?? null,
          allowCustomSize: data.allowCustomSize,
          materialOptions: data.materialOptions as unknown as Prisma.InputJsonValue,
          colorOptions: mergedColors as unknown as Prisma.InputJsonValue,
          metadata: metadataJson ?? Prisma.DbNull,
        },
        select: { id: true, slug: true },
      });

      // Sync images (preserve order by replacing cleanly)
      await tx.productImage.deleteMany({ where: { productId } });
      if (normalizedImages.length > 0) {
        await tx.productImage.createMany({
          data: normalizedImages.map((img) => ({
            productId,
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
          })),
        });
      }

      // Sync variants safely without breaking existing OrderItem/Inventory references
      const existingVariants = await tx.productVariant.findMany({
        where: { productId },
        select: {
          id: true,
          _count: { select: { OrderItem: true, inventory: true } },
        },
      });

      const incomingIds = new Set(data.variants.map((v) => v.id).filter((id): id is number => Boolean(id)));

      for (const existing of existingVariants) {
        if (!incomingIds.has(existing.id)) {
          if (existing._count.OrderItem === 0 && existing._count.inventory === 0) {
            await tx.productVariant.delete({ where: { id: existing.id } });
          }
        }
      }

      for (const variant of data.variants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              name: variant.name,
              skuPrefix: variant.skuPrefix || null,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice ?? null,
              attributes: variant.attributes ? (variant.attributes as Prisma.InputJsonValue) : undefined,
              image: variant.image || null,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId,
              name: variant.name,
              skuPrefix: variant.skuPrefix || null,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice ?? null,
              attributes: variant.attributes ? (variant.attributes as Prisma.InputJsonValue) : undefined,
              image: variant.image || null,
            },
          });
        }
      }

      return updated;
    });

    await recordAuditLog({
      actorId: session.user.id,
      action: data.id ? "PRODUCT_UPDATED" : "PRODUCT_CREATED",
      entity: "Product",
      entityId: saved.id,
      changes: {
        title: data.title,
        slug: saved.slug,
        workshopCode: data.workshopCode ?? null,
        status: data.status,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${saved.id}`);
    revalidatePath("/san-pham");
    revalidatePath(`/san-pham/${saved.slug}`);

    return { ok: true, data: saved };
  } catch (err) {
    console.error("[saveProductAction]", err);
    return { ok: false, error: "Không thể lưu sản phẩm. Vui lòng thử lại." };
  }
}

export async function updateProductStatusAction(
  productId: number,
  status: ProductStatus
): Promise<ProductActionResult<{ productId: number; status: ProductStatus }>> {
  try {
    const session = await requireAdmin();
    const parsed = updateProductStatusSchema.safeParse({ productId, status });
    if (!parsed.success) {
      return { ok: false, error: "Trạng thái không hợp lệ" };
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status },
      select: { id: true, slug: true, status: true },
    });

    await recordAuditLog({
      actorId: session.user.id,
      action: "PRODUCT_STATUS_UPDATED",
      entity: "Product",
      entityId: updated.id,
      changes: { status: updated.status },
    });

    revalidatePath("/admin/products");
    revalidatePath("/san-pham");
    revalidatePath(`/san-pham/${updated.slug}`);

    return { ok: true, data: { productId: updated.id, status: updated.status } };
  } catch (err) {
    console.error("[updateProductStatusAction]", err);
    return { ok: false, error: "Không thể đổi trạng thái sản phẩm" };
  }
}

export async function deleteProductAction(productId: number): Promise<ProductActionResult<{ deleted: boolean }>> {
  try {
    const session = await requireAdmin();

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: { select: { OrderItem: true } },
      },
    });

    if (!product) {
      return { ok: false, error: "Không tìm thấy sản phẩm" };
    }

    if (product._count.OrderItem > 0) {
      return {
        ok: false,
        error: "Sản phẩm đã phát sinh đơn hàng, không thể xóa vĩnh viễn. Hãy chuyển sang Lưu trữ (ARCHIVED).",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.wishlistItem.deleteMany({ where: { productId } });
      await tx.review.deleteMany({ where: { productId } });
      await tx.productImage.deleteMany({ where: { productId } });
      const variantIds = (
        await tx.productVariant.findMany({
          where: { productId },
          select: { id: true },
        })
      ).map((v) => v.id);
      if (variantIds.length > 0) {
        await tx.inventory.deleteMany({
          where: { variantId: { in: variantIds } },
        });
      }
      await tx.productVariant.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });

    await recordAuditLog({
      actorId: session.user.id,
      action: "PRODUCT_DELETED",
      entity: "Product",
      entityId: product.id,
      changes: { title: product.title, slug: product.slug },
    });

    revalidatePath("/admin/products");
    revalidatePath("/san-pham");

    return { ok: true, data: { deleted: true } };
  } catch (err) {
    console.error("[deleteProductAction]", err);
    return { ok: false, error: "Không thể xóa sản phẩm" };
  }
}

export async function moderateReviewAction(
  reviewId: number,
  approved: boolean
): Promise<ProductActionResult<{ reviewId: number; approved: boolean }>> {
  try {
    const session = await requireAdmin();
    const parsed = moderateReviewSchema.safeParse({ reviewId, approved });
    if (!parsed.success) {
      return { ok: false, error: "Dữ liệu không hợp lệ" };
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { approved },
      select: { id: true, approved: true, productId: true, product: { select: { slug: true } } },
    });

    await recordAuditLog({
      actorId: session.user.id,
      action: approved ? "REVIEW_APPROVED" : "REVIEW_REJECTED",
      entity: "Review",
      entityId: updated.id,
      changes: { productId: updated.productId, approved: updated.approved },
    });

    revalidatePath(`/admin/products/${updated.productId}`);
    revalidatePath("/admin/products");
    revalidatePath(`/san-pham/${updated.product.slug}`);

    return { ok: true, data: { reviewId: updated.id, approved: updated.approved } };
  } catch (err) {
    console.error("[moderateReviewAction]", err);
    return { ok: false, error: "Không thể cập nhật trạng thái đánh giá" };
  }
}

export async function deleteReviewAction(reviewId: number): Promise<ProductActionResult<{ reviewId: number }>> {
  try {
    const session = await requireAdmin();
    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, productId: true, product: { select: { slug: true } } },
    });

    if (!existing) {
      return { ok: false, error: "Không tìm thấy đánh giá" };
    }

    await prisma.review.delete({ where: { id: reviewId } });

    await recordAuditLog({
      actorId: session.user.id,
      action: "REVIEW_DELETED",
      entity: "Review",
      entityId: existing.id,
      changes: { productId: existing.productId },
    });

    revalidatePath(`/admin/products/${existing.productId}`);
    revalidatePath("/admin/products");
    revalidatePath(`/san-pham/${existing.product.slug}`);

    return { ok: true, data: { reviewId } };
  } catch (err) {
    console.error("[deleteReviewAction]", err);
    return { ok: false, error: "Không thể xóa đánh giá" };
  }
}
