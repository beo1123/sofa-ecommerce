/**
 * Seed script: Tạo role Admin + tài khoản admin mặc định.
 *
 * Chạy: npx tsx prisma/seed-admin.ts
 *
 * Biến môi trường tùy chọn:
 *   ADMIN_EMAIL    (mặc định: admin@sofa.vn)
 *   ADMIN_PASSWORD (mặc định: Admin@123)
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Tạo role Admin
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin" },
  });
  console.log(`✅ Role "${adminRole.name}" (id=${adminRole.id})`);

  // 2. Đảm bảo role Khách hàng tồn tại
  await prisma.role.upsert({
    where: { name: "Khách hàng" },
    update: {},
    create: { name: "Khách hàng" },
  });

  // 3. Tạo tài khoản admin
  const email = process.env.ADMIN_EMAIL ?? "admin@sofa.vn";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@123";
  const hashed = await hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      username: "admin",
      password: hashed,
      displayName: "Administrator",
    },
  });
  console.log(`✅ Admin user "${user.email}" (id=${user.id})`);

  // 4. Gán role Admin cho user
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    update: {},
    create: { userId: user.id, roleId: adminRole.id },
  });
  console.log(`✅ Assigned role "Admin" → "${user.email}"`);

  console.log("\n🎉 Admin seeding complete!");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   ⚠️  Hãy đổi mật khẩu sau khi đăng nhập lần đầu!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
