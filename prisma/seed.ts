/* eslint-disable no-unused-vars */

import prisma from "@lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // =====================================================
  // 1️⃣ CATEGORY DATA (6 loại sofa)
  // =====================================================
  const categories = [
    { name: "Sofa da", slug: "sofa-da" },
    { name: "Sofa vải nỉ", slug: "sofa-vai-ni" },
    { name: "Sofa góc", slug: "sofa-goc" },
    { name: "Sofa đơn", slug: "sofa-don" },
    { name: "Sofa giường", slug: "sofa-giuong" },
    { name: "Sofa thư giãn", slug: "sofa-thu-gian" },
  ];

  const createdCategories: Record<string, { id: number }> = {};
  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug },
    });
    createdCategories[c.slug] = { id: category.id };
  }

  console.log("✅ Categories:", Object.keys(createdCategories));

  // =====================================================
  // 2️⃣ PRODUCT DATA (24 products) — EACH PRODUCT USES sampleImages
  // =====================================================

  const colorCodes = ["#000000", "#808080", "#C0C0C0", "#8B4513", "#A0522D", "#FFFFFF"];
  const materials = ["leather", "fabric"];

  const sampleImages = [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=1109&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1757969687837-03c847fffa06?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1759722668224-43e1dae9049e?q=80&w=754&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1757969704688-334b705ed486?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  const products: any[] = [];

  // tạo 24 product
  for (const [slug, category] of Object.entries(createdCategories)) {
    for (let i = 1; i <= 4; i++) {
      const title = `${categories.find((c) => c.slug === slug)?.name} mẫu ${i}`;

      products.push({
        title,
        slug: `${slug}-mau-${i}`,
        shortDescription: `Mẫu ${i} của ${slug}, thiết kế hiện đại và sang trọng.`,
        description: `Sản phẩm ${title} được thiết kế với phong cách châu Âu, chất liệu cao cấp.`,
        categoryId: category.id,
      });
    }
  }

  for (const p of products) {
    // CREATE PRODUCT
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        status: "PUBLISHED",
        categoryId: p.categoryId,
      },
    });

    // =====================================================
    // 3️⃣ PRODUCT VARIANTS — WITHOUT IMAGES
    // =====================================================
    const variantCount = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < variantCount; i++) {
      const color = colorCodes[Math.floor(Math.random() * colorCodes.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const price = 9000000 + Math.floor(Math.random() * 10000000);

      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: `${p.title} (${material})`,
          price,
          compareAtPrice: price + 1000000,
          attributes: { color, material },
        },
      });

      // INVENTORY
      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          sku: `SKU-${variant.id}`,
          quantity: 10 + Math.floor(Math.random() * 30),
          reserved: Math.floor(Math.random() * 5),
        },
      });
    }

    // =====================================================
    // 4️⃣ IMAGES — ONLY 1 SET FOR PRODUCT (NOT FOR EACH VARIANT)
    // =====================================================

    const shuffled = [...sampleImages].sort(() => Math.random() - 0.5);
    const imagesToUse = [...shuffled.slice(0, 3)];

    for (let i = 0; i < imagesToUse.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: String(imagesToUse[i]), // ép chắc chắn là string
          alt: `${p.title} - Image ${i + 1}`,
          isPrimary: i === 0,
        },
      });
    }
  }

  console.log(`🎉 Seeded ${products.length} products with images successfully!`);

  // =====================================================
  // 6️⃣ BLOG CATEGORIES
  // =====================================================

  const blogCategories = [
    { name: "Kiến thức thảm trải sàn", slug: "kien-thuc-tham" },
    { name: "Mẹo vệ sinh & bảo quản", slug: "meo-ve-sinh" },
    { name: "Phong cách & Trang trí", slug: "phong-cach-trang-tri" },
  ];

  const createdBlogCategories: Record<string, { id: number }> = {};

  for (const bc of blogCategories) {
    const category = await prisma.articleCategory.upsert({
      where: { slug: bc.slug },
      update: {},
      create: { name: bc.name, slug: bc.slug },
    });
    createdBlogCategories[bc.slug] = { id: category.id };
  }

  console.log("✅ Blog categories:", Object.keys(createdBlogCategories));

  // =====================================================
  // 7️⃣ ARTICLES (similar to BLANC)
  // =====================================================

  const blogArticles = [
    {
      title: "Thảm trượt nước – Giải pháp hoàn hảo cho nhà có trẻ nhỏ",
      slug: "tham-truot-nuoc-giai-phap-cho-nha-co-tre",
      excerpt:
        "Thảm trượt nước giúp chống trơn trượt, bảo vệ trẻ nhỏ và thú cưng. Giải pháp đáng cân nhắc cho mọi gia đình.",
      thumbnail: "https://images.unsplash.com/photo-1598300056483-8e0c0b2e3c6c",
      content: `
      <h2>Thảm trượt nước là gì?</h2>
      <p>Đây là loại thảm được thiết kế để giảm tối đa độ trơn trượt...</p>
      <p>Phù hợp cho nhà có trẻ nhỏ và thú cưng...</p>
    `,
      categorySlug: "kien-thuc-tham",
    },
    {
      title: "5 mẹo vệ sinh sofa da tại nhà hiệu quả",
      slug: "5-meo-ve-sinh-sofa-da",
      excerpt: "Chỉ với vài bước đơn giản, bạn có thể vệ sinh sofa da nhanh chóng, giữ được độ bóng đẹp lâu dài.",
      thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      content: `
      <h2>Cách làm sạch sofa da đúng chuẩn</h2>
      <p>Nên vệ sinh sofa da định kỳ để đảm bảo độ bền...</p>
    `,
      categorySlug: "meo-ve-sinh",
    },
    {
      title: "Cách chọn sofa phù hợp với phong cách Scandinavian",
      slug: "chon-sofa-phong-cach-scandinavian",
      excerpt: "Phong cách Scandinavian nổi bật với sự tối giản, tự nhiên và tinh tế. Sofa đi kèm cũng cần chọn đúng.",
      thumbnail: "https://images.unsplash.com/photo-1602526216437-31c1b49c2c3e",
      content: `
      <h2>Đặc trưng Scandinavian</h2>
      <p>Màu sắc chủ đạo là trắng, xám, gỗ tự nhiên...</p>
    `,
      categorySlug: "phong-cach-trang-tri",
    },
  ];

  for (const article of blogArticles) {
    const categoryId = createdBlogCategories[article.categorySlug]?.id;

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        thumbnail: article.thumbnail,
        content: article.content,
        status: "PUBLISHED",
        publishedAt: new Date(),
        categoryId,
        // authorId optional (null)
      },
    });
  }

  console.log(`✅ Seeded ${blogArticles.length} articles successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
