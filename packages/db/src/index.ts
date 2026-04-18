// =========================================================
// packages/db/src/index.ts
// Shared Prisma singleton — works in Next.js AND Node servers
// Import: import { prisma } from "@repo/db"
// =========================================================

import { PrismaClient } from "@prisma/client";

// Prevent multiple PrismaClient instances in development (Next.js HMR)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Re-export all Prisma generated types so consumers don't need
// to import directly from @prisma/client
export * from "@prisma/client";
