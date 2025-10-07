import { PrismaClient } from "../generated/prisma_client/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ===== 1. Roles =====
  const [adminRole, customerRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN" },
    }),
    prisma.role.upsert({
      where: { name: "CUSTOMER" },
      update: {},
      create: { name: "CUSTOMER" },
    }),
  ]);

  // ===== 2. Users =====
  const adminPassword = bcrypt.hashSync("admin123", 10);
  const buyerPassword = bcrypt.hashSync("buyer123", 10);

  const [admin, buyer] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@sofa.local" },
      update: {},
      create: {
        email: "admin@sofa.local",
        username: "admin",
        displayName: "Admin Sofa",
        password: adminPassword,
        userRoles: { create: [{ role: { connect: { id: adminRole.id } } }] },
      },
    }),
    prisma.user.upsert({
      where: { email: "buyer@sofa.local" },
      update: {},
      create: {
        email: "buyer@sofa.local",
        username: "buyer",
        displayName: "Buyer Sofa",
        password: buyerPassword,
        userRoles: { create: [{ role: { connect: { id: customerRole.id } } }] },
      },
    }),
  ]);

  console.log("✅ Users and roles created");

  // ===== 3. Sample Products =====
  const products = [
    {
      title: "Sofa Da Cao Cấp",
      slug: "sofa-da-cao-cap",
      shortDescription: "Sofa da thật sang trọng, khung gỗ sồi tự nhiên.",
      description: "Thiết kế cao cấp, chất liệu da thật, phù hợp không gian phòng khách hiện đại.",
      images: ["https://picsum.photos/seed/sofa1a/800/600", "https://picsum.photos/seed/sofa1b/800/600"],
    },
    {
      title: "Sofa Vải Nỉ Hiện Đại",
      slug: "sofa-vai-ni-hien-dai",
      shortDescription: "Sofa vải nỉ mềm mại, đa dạng màu sắc.",
      description: "Vải nỉ cao cấp, dễ vệ sinh, khung gỗ chắc chắn, thiết kế tối giản hiện đại.",
      images: ["https://picsum.photos/seed/sofa2a/800/600", "https://picsum.photos/seed/sofa2b/800/600"],
    },
    {
      title: "Sofa Góc L Shape",
      slug: "sofa-goc-l-shape",
      shortDescription: "Sofa góc lớn, phù hợp cho phòng khách rộng.",
      description: "Sofa chữ L giúp tối ưu không gian, có thể đảo chiều linh hoạt, chất liệu cao cấp.",
      images: ["https://picsum.photos/seed/sofa3a/800/600", "https://picsum.photos/seed/sofa3b/800/600"],
    },
  ];

  const materials = [
    { material: "leather", priceBase: 20000000 },
    { material: "fabric", priceBase: 12000000 },
  ];
  const colors = ["gray", "beige", "brown"];
  const sizes = ["M", "L"];

  // ===== 4. Create Products + Variants + Inventory + Images =====
  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        title: product.title,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
      },
    });

    // Images
    for (let i = 0; i < product.images.length; i++) {
      await prisma.productImage.create({
        data: {
          url: product.images[i],
          alt: `${product.title} image ${i + 1}`,
          isPrimary: i === 0,
          product: { connect: { id: created.id } },
        },
      });
    }

    // Variants
    for (const m of materials) {
      for (const c of colors) {
        for (const s of sizes) {
          const price = (m.priceBase + (s === "L" ? 2000000 : 0)).toFixed(2);
          const sku = `${created.slug}-${m.material}-${c}-${s}`.toUpperCase();

          await prisma.productVariant.create({
            data: {
              product: { connect: { id: created.id } },
              name: `${s.toUpperCase()} / ${m.material} / ${c}`,
              price,
              attributes: { color: c, material: m.material, size: s },
              inventory: {
                create: {
                  sku,
                  quantity: 10,
                  reserved: 0,
                },
              },
            },
          });
        }
      }
    }
  }

  console.log("✅ Products, images, variants, inventory created");
  console.log("🌱 Database seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
