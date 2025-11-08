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
  // 2️⃣ PRODUCT DATA (24 sản phẩm)
  // =====================================================
  const colorCodes = ["#000000", "#808080", "#C0C0C0", "#8B4513", "#A0522D", "#FFFFFF"];
  const materials = ["leather", "fabric"];

  const sampleImages = [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    "https://images.unsplash.com/photo-1616627987555-1c3a2d9f7c1a",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1598300056483-8e0c0b2e3c6c",
    "https://images.unsplash.com/photo-1602526216437-31c1b49c2c3e",
    "https://images.unsplash.com/photo-1598300056791-0e2a7f0c85f4",
  ];
  const products = [];

  for (const [slug, category] of Object.entries(createdCategories)) {
    for (let i = 1; i <= 4; i++) {
      const title = `${categories.find((c) => c.slug === slug)?.name} mẫu ${i}`;
      const productSlug = `${slug}-mau-${i}`;
      const shortDescription = `Mẫu ${i} của ${slug}, thiết kế hiện đại và sang trọng.`;
      const description = `Sản phẩm ${title} được thiết kế với phong cách châu Âu, chất liệu cao cấp, phù hợp nhiều không gian.`;

      products.push({
        title,
        slug: productSlug,
        shortDescription,
        description,
        categoryId: category.id,
      });
    }
  }

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        status: "PUBLISHED",
        category: { connect: { id: p.categoryId } },
      },
    });

    // =====================================================
    // 3️⃣ PRODUCT VARIANTS
    // =====================================================
    const numVariants = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numVariants; i++) {
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

      // =====================================================
      // 4️⃣ INVENTORY
      // =====================================================
      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          sku: `SKU-${product.id}-${i + 1}`,
          quantity: 20 + Math.floor(Math.random() * 30),
          reserved: Math.floor(Math.random() * 5),
        },
      });

      // =====================================================
      // 5️⃣ IMAGES
      // =====================================================
      for (let j = 0; j < 2; j++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: `${sampleImages[j]}?rand=${Math.random()}`,
            alt: `${p.title} - ảnh ${j + 1}`,
            isPrimary: j === 0,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${products.length} products successfully!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
