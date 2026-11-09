import { ProductService } from "@/services/products.service";

function createMockPrisma() {
  return {
    $transaction: jest.fn(),
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    productVariant: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    orderItem: {
      groupBy: jest.fn(),
    },
    review: {
      groupBy: jest.fn(),
    },
  } as any;
}

describe("ProductService", () => {
  it("TC-01 & TC-03: filters products by category slug, material, color, and price range consistently", async () => {
    const prisma = createMockPrisma();
    prisma.$transaction.mockImplementation(async (queries: Promise<any>[]) => Promise.all(queries));
    prisma.product.count.mockResolvedValue(1);
    prisma.productVariant.groupBy.mockResolvedValue([{ productId: 10, _min: { price: 15000000 } }]);
    prisma.product.findMany.mockResolvedValue([
      {
        id: 10,
        slug: "sofa-goc-da-bo",
        title: "Sofa Góc Da Bò",
        shortDescription: "Sofa góc cao cấp",
        category: { id: 2, name: "Sofa Góc", slug: "sofa-goc", image: null },
        variants: [
          {
            id: 101,
            price: 15000000,
            compareAtPrice: 18000000,
            attributes: { material: "Da bò", color: "Kem" },
            skuPrefix: "SG",
            inventory: [{ sku: "SG-01" }],
          },
        ],
        images: [{ url: "/sofa.jpg", alt: "Sofa Góc Da Bò" }],
      },
    ]);

    const service = new ProductService(prisma);
    const result = await service.listProducts({
      page: 1,
      perPage: 12,
      category: " sofa-goc ",
      material: " Da bò ",
      color: " Kem ",
      priceMin: 10000000,
      priceMax: 20000000,
    });

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        status: "PUBLISHED",
        category: { slug: "sofa-goc" },
        variants: {
          some: {
            AND: [
              { price: { gte: 10000000, lte: 20000000 } },
              { attributes: { path: ["color"], equals: "Kem" } },
              { attributes: { path: ["material"], equals: "Da bò" } },
            ],
          },
        },
      },
    });

    expect(result.meta).toEqual({ page: 1, perPage: 12, total: 1 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].priceMin).toBe(15000000);
    expect(result.items[0].category?.slug).toBe("sofa-goc");
  });

  it("TC-02 & TC-04: handles empty/invalid category slug and sanitizes invalid page/perPage", async () => {
    const prisma = createMockPrisma();
    prisma.$transaction.mockImplementation(async (queries: Promise<any>[]) => Promise.all(queries));
    prisma.product.count.mockResolvedValue(0);
    prisma.productVariant.groupBy.mockResolvedValue([]);

    const service = new ProductService(prisma);
    const result = await service.listProducts({
      page: -5,
      perPage: Number.NaN,
      category: "danh-muc-khong-ton-tai",
    });

    expect(result).toEqual({
      items: [],
      meta: { page: 1, perPage: 12, total: 0 },
    });
    expect(prisma.product.findMany).not.toHaveBeenCalled();
  });

  it("TC-05: getFilters deduplicates materials and colors case-insensitively and trims whitespace", async () => {
    const prisma = createMockPrisma();
    prisma.productVariant.findMany.mockResolvedValue([
      { attributes: { material: " Da bò ", color: " Kem " }, price: 12000000 },
      { attributes: { material: "da bò", color: "kem" }, price: 18000000 },
      { attributes: { material: "Vải nỉ", color: "Xám" }, price: 9000000 },
    ]);

    const service = new ProductService(prisma);
    const filters = await service.getFilters();

    expect(filters).toEqual({
      materials: ["Da bò", "Vải nỉ"],
      colors: ["Kem", "Xám"],
      priceMin: 9000000,
      priceMax: 18000000,
    });
  });

  it("TC-06: getRelatedProducts queries by relational categoryId instead of metadata", async () => {
    const prisma = createMockPrisma();
    prisma.product.findUnique.mockResolvedValue({ categoryId: 5 });
    prisma.product.findMany.mockResolvedValue([]);

    const service = new ProductService(prisma);
    await service.getRelatedProducts("sofa-bang-hien-dai");

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: { not: "sofa-bang-hien-dai" },
          status: "PUBLISHED",
          categoryId: 5,
        },
      })
    );
  });

  it("TC-07: getBestSellingProducts returns null priceMin/priceMax when product has no variants", async () => {
    const prisma = createMockPrisma();
    prisma.orderItem.groupBy.mockResolvedValue([{ productId: 1, _sum: { quantity: 3 } }]);
    prisma.product.findMany.mockResolvedValue([
      {
        id: 1,
        slug: "sofa-khong-variant",
        title: "Sofa Không Variant",
        shortDescription: null,
        variants: [],
        images: [],
      },
    ]);

    const service = new ProductService(prisma);
    const items = await service.getBestSellingProducts(1);

    expect(items[0].priceMin).toBeNull();
    expect(items[0].priceMax).toBeNull();
  });
});
