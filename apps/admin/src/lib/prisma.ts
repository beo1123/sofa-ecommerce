// apps/admin/src/lib/prisma.ts
// Re-export the shared Prisma singleton from @repo/db
// This keeps admin app's internal code using a local import path
// while the actual client lives in packages/db.

export { prisma } from "@repo/db";
export type { PrismaClient } from "@repo/db";
