/* eslint-disable no-unused-vars */
import { PrismaClient } from "../generated/prisma_client/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // =====================================================
  // 1️⃣ CATEGORY DATA (Danh mục tiếng Việt)
  // =====================================================
  const categories = [
    { name: "Sofa da", slug: "sofa-da" },
    { name: "Sofa vải nỉ", slug: "sofa-vai-ni" },
    { name: "Sofa góc", slug: "sofa-goc" },
  ];

  // 👇 đổi id từ string → number
  const createdCategories: Record<string, { id: number }> = {};

  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
      },
    });
    createdCategories[c.slug] = { id: category.id };
  }

  console.log("✅ Categories seeded:", Object.keys(createdCategories));

  // =====================================================
  // 2️⃣ PRODUCT DATA (mỗi product thuộc 1 category)
  // =====================================================
  const products = [
    {
      title: "Sofa da cao cấp Italia",
      slug: "sofa-da-cao-cap",
      shortDescription: "Sofa da thật nhập khẩu từ Ý, sang trọng và bền đẹp.",
      description: "Chất liệu da bò 100%, khung gỗ tự nhiên, mang lại cảm giác êm ái và đẳng cấp cho phòng khách.",
      categorySlug: "sofa-da",
    },
    {
      title: "Sofa vải nỉ hiện đại",
      slug: "sofa-vai-ni-hien-dai",
      shortDescription: "Thiết kế trẻ trung, màu sắc đa dạng, phù hợp mọi không gian.",
      description:
        "Sử dụng vải nỉ cao cấp, dễ vệ sinh, có thể tháo rời bọc ghế. Kiểu dáng hiện đại, phù hợp căn hộ chung cư.",
      categorySlug: "sofa-vai-ni",
    },
    {
      title: "Sofa góc L-shape thông minh",
      slug: "sofa-goc-l-shape",
      shortDescription: "Tối ưu không gian với thiết kế góc chữ L tiện lợi.",
      description: "Sofa góc bọc vải nhung mịn, khung gỗ sồi chắc chắn, có hộc chứa đồ tiện lợi.",
      categorySlug: "sofa-goc",
    },
  ];

  for (const p of products) {
    const category = createdCategories[p.categorySlug];
    if (!category) {
      console.warn(`⚠️ Category not found for ${p.title}`);
      continue;
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        category: { connect: { id: category.id } },
        updatedAt: new Date(),
      },
      create: {
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        category: { connect: { id: category.id } },
      },
    });
  }

  console.log("✅ Products seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
