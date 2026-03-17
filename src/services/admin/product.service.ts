import { Prisma, PrismaClient, ProductStatus } from "@prisma/client";
import { fail } from "@/server/utils/api";
import * as XLSX from "xlsx";

// ─── Types ────────────────────────────────────────────────
export interface CreateProductInput {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  status?: ProductStatus;
  categoryId?: number;
  metadata?: Record<string, unknown>;
  images?: { url: string; alt?: string; isPrimary?: boolean }[];
  variants?: {
    name: string;
    skuPrefix?: string;
    price: number;
    compareAtPrice?: number;
    attributes?: Record<string, unknown>;
    image?: string;
    inventory?: { sku: string; quantity?: number; location?: string };
  }[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface ExcelProductRow {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  status?: string;
  category?: string;
  imageUrl?: string;
  variantName?: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  quantity?: number;
  color?: string;
  material?: string;
}

// ─── Service ──────────────────────────────────────────────
export class AdminProductService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Danh sách sản phẩm (admin – bao gồm DRAFT / ARCHIVED)
   */
  async listProducts(page: number, perPage: number) {
    const skip = (page - 1) * perPage;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take: perPage,
        orderBy: { updatedAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          variants: { select: { id: true, name: true, price: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.product.count(),
    ]);

    return { items, meta: { page, perPage, total } };
  }

  /**
   * Lấy chi tiết sản phẩm (admin)
   */
  async getProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { isPrimary: "desc" } },
        variants: { include: { inventory: true } },
        category: true,
      },
    });

    if (!product) {
      throw { status: 404, body: fail("Product not found", "NOT_FOUND") };
    }
    return product;
  }

  /**
   * Tạo sản phẩm mới
   */
  async createProduct(input: CreateProductInput) {
    const existing = await this.prisma.product.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
    }

    const product = await this.prisma.product.create({
      data: {
        title: input.title,
        slug: input.slug,
        shortDescription: input.shortDescription,
        description: input.description,
        status: input.status ?? "DRAFT",
        category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        images: input.images?.length
          ? {
              create: input.images.map((img, i) => ({
                url: img.url,
                alt: img.alt ?? input.title,
                isPrimary: img.isPrimary ?? i === 0,
              })),
            }
          : undefined,
        variants: input.variants?.length
          ? {
              create: input.variants.map((v) => ({
                name: v.name,
                skuPrefix: v.skuPrefix,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                attributes: (v.attributes as Prisma.InputJsonValue) ?? Prisma.JsonNull,
                image: v.image,
                inventory: v.inventory
                  ? {
                      create: {
                        sku: v.inventory.sku,
                        quantity: v.inventory.quantity ?? 0,
                        location: v.inventory.location,
                      },
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        variants: { include: { inventory: true } },
      },
    });

    return product;
  }

  /**
   * Cập nhật sản phẩm
   */
  async updateProduct(id: number, input: UpdateProductInput) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Product not found", "NOT_FOUND") };
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await this.prisma.product.findUnique({ where: { slug: input.slug } });
      if (slugTaken) {
        throw { status: 400, body: fail("Slug already exists", "DUPLICATE_SLUG") };
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.shortDescription !== undefined && { shortDescription: input.shortDescription }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.categoryId !== undefined && {
          category: input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true },
        }),
        ...(input.metadata !== undefined && {
          metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        }),
      },
      include: {
        images: true,
        variants: { include: { inventory: true } },
        category: true,
      },
    });

    // Cập nhật images nếu có
    if (input.images) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      if (input.images.length > 0) {
        await this.prisma.productImage.createMany({
          data: input.images.map((img, i) => ({
            productId: id,
            url: img.url,
            alt: img.alt ?? product.title,
            isPrimary: img.isPrimary ?? i === 0,
          })),
        });
      }
    }

    return this.getProduct(id);
  }

  /**
   * Xóa sản phẩm (soft delete → ARCHIVED)
   */
  async deleteProduct(id: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw { status: 404, body: fail("Product not found", "NOT_FOUND") };
    }

    await this.prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return { id, archived: true };
  }

  /**
   * Import sản phẩm từ file Excel (.xlsx)
   *
   * Cột bắt buộc: title, slug, variantName, sku, price
   * Cột tùy chọn: shortDescription, description, status, category,
   *                imageUrl, compareAtPrice, quantity, color, material
   */
  async importFromExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw { status: 400, body: fail("Excel file has no sheets", "INVALID_EXCEL") };
    }

    const rows = XLSX.utils.sheet_to_json<ExcelProductRow>(workbook.Sheets[sheetName]);
    if (!rows.length) {
      throw { status: 400, body: fail("Excel sheet is empty", "EMPTY_SHEET") };
    }

    // Nhóm các row theo slug (1 slug = 1 product, mỗi row có thể là 1 variant)
    const grouped = new Map<string, ExcelProductRow[]>();
    for (const row of rows) {
      if (!row.title || !row.slug) continue;
      const slug = String(row.slug).trim();
      if (!grouped.has(slug)) grouped.set(slug, []);
      grouped.get(slug)!.push(row);
    }

    const results: { slug: string; status: "created" | "skipped"; reason?: string }[] = [];

    for (const [slug, productRows] of grouped) {
      const existing = await this.prisma.product.findUnique({ where: { slug } });
      if (existing) {
        results.push({ slug, status: "skipped", reason: "slug already exists" });
        continue;
      }

      const first = productRows[0];
      let categoryId: number | undefined;

      if (first.category) {
        const cat = await this.prisma.category.findUnique({
          where: { slug: String(first.category).trim() },
        });
        categoryId = cat?.id;
      }

      const status: ProductStatus =
        first.status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(first.status.toUpperCase())
          ? (first.status.toUpperCase() as ProductStatus)
          : "DRAFT";

      const images: Prisma.ProductImageCreateWithoutProductInput[] = [];
      const seenUrls = new Set<string>();
      for (const row of productRows) {
        if (row.imageUrl && !seenUrls.has(row.imageUrl)) {
          seenUrls.add(row.imageUrl);
          images.push({
            url: row.imageUrl,
            alt: first.title,
            isPrimary: images.length === 0,
          });
        }
      }

      const variants: Prisma.ProductVariantCreateWithoutProductInput[] = productRows
        .filter((r) => r.variantName && r.sku && r.price != null)
        .map((r) => {
          const attrs: Record<string, string> = {};
          if (r.color) attrs.color = r.color;
          if (r.material) attrs.material = r.material;

          return {
            name: String(r.variantName),
            price: Number(r.price),
            compareAtPrice: r.compareAtPrice ? Number(r.compareAtPrice) : undefined,
            attributes: Object.keys(attrs).length > 0 ? attrs : Prisma.JsonNull,
            inventory: r.sku
              ? {
                  create: {
                    sku: String(r.sku),
                    quantity: Number(r.quantity ?? 0),
                  },
                }
              : undefined,
          };
        });

      await this.prisma.product.create({
        data: {
          title: String(first.title),
          slug,
          shortDescription: first.shortDescription ? String(first.shortDescription) : undefined,
          description: first.description ? String(first.description) : undefined,
          status,
          categoryId,
          images: images.length > 0 ? { create: images } : undefined,
          variants: variants.length > 0 ? { create: variants } : undefined,
        },
      });

      results.push({ slug, status: "created" });
    }

    return {
      total: results.length,
      created: results.filter((r) => r.status === "created").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      details: results,
    };
  }
}
