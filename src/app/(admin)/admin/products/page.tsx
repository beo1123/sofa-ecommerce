import React from "react";
import Link from "next/link";
import { IconPlus, IconCategory } from "@tabler/icons-react";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import { resolveWorkshopCode } from "@/lib/slug";
import { parseMaterialOptions } from "@/lib/workshop-types";
import ProductTable from "@/components/admin/products/ProductTable";
import type { SerializedCategoryOption, SerializedProductListItem } from "@/components/admin/products/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        images: {
          orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
          take: 1,
          select: { url: true },
        },
        variants: {
          select: { price: true },
        },
        reviews: {
          select: { approved: true },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const serializedProducts: SerializedProductListItem[] = products.map((p) => {
    const prices = p.variants.map((v) => toNumber(v.price)).filter((n) => n >= 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const pendingReviewCount = p.reviews.filter((r) => !r.approved).length;

    return {
      id: p.id,
      workshopCode: resolveWorkshopCode(p.workshopCode, p.title),
      title: p.title,
      slug: p.slug,
      status: p.status,
      categoryId: p.categoryId,
      categoryName: p.category?.name ?? null,
      primaryImageUrl: p.images[0]?.url ?? null,
      minPrice,
      variantCount: p.variants.length,
      reviewCount: p.reviews.length,
      pendingReviewCount,
      materialOptions: parseMaterialOptions(p.materialOptions),
      allowCustomSize: p.allowCustomSize,
      updatedAt: p.updatedAt.toISOString(),
    };
  });

  const serializedCategories: SerializedCategoryOption[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-brand-400">Quản lý sản phẩm</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Danh mục mẫu sofa xưởng, chất liệu, biến thể giá và kiểm duyệt đánh giá khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/categories"
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-brand-300 bg-bg-page px-3.5 text-sm font-medium text-brand-400 transition-colors hover:bg-brand-50">
            <IconCategory size={16} stroke={1.75} aria-hidden="true" />
            <span>Danh mục</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-brand-400 px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-300">
            <IconPlus size={16} stroke={1.75} aria-hidden="true" />
            <span>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      <ProductTable initialProducts={serializedProducts} categories={serializedCategories} />
    </div>
  );
}
