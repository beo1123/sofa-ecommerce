import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { extractWorkshopCodeFromTitle } from "../src/lib/slug";
import { parseLegacyDimensionToCm } from "../src/lib/dimensions";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      workshopCode: true,
      defaultWidthCm: true,
      defaultDepthCm: true,
      metadata: true,
    },
  });

  let updatedCodeCount = 0;
  let updatedDimensionCount = 0;

  for (const product of products) {
    const patch: {
      workshopCode?: string;
      defaultWidthCm?: number;
      defaultDepthCm?: number;
    } = {};

    if (!product.workshopCode || !product.workshopCode.trim()) {
      const extracted = extractWorkshopCodeFromTitle(product.title);
      if (extracted) {
        patch.workshopCode = extracted;
        updatedCodeCount += 1;
      }
    }

    const meta =
      product.metadata && typeof product.metadata === "object" && !Array.isArray(product.metadata)
        ? (product.metadata as Record<string, unknown>)
        : null;

    if (meta) {
      if (product.defaultWidthCm === null) {
        const w = parseLegacyDimensionToCm(meta.width);
        if (w !== null) {
          patch.defaultWidthCm = w;
          updatedDimensionCount += 1;
        }
      }
      if (product.defaultDepthCm === null) {
        const d = parseLegacyDimensionToCm(meta.depth ?? meta.height);
        if (d !== null) {
          patch.defaultDepthCm = d;
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: patch,
      });
    }
  }

  console.log(
    `Backfill complete: scanned ${products.length} products, filled workshopCode on ${updatedCodeCount} products, synced legacy dimensions on ${updatedDimensionCount} products.`
  );
}

main()
  .catch((err) => {
    console.error("Backfill error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
