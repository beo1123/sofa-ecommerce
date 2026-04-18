// src/lib/prisma.ts
// Prisma singleton for the root Next.js web app.
//
// MONOREPO NOTE: The canonical Prisma client is now in packages/db (@repo/db).
// Once you install workspace dependencies with pnpm, you can replace this file
// with a simple re-export:
//
//   export { prisma } from "@repo/db";
//
// Until then, this standalone singleton keeps the existing app working.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

