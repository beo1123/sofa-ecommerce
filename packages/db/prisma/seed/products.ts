import { PrismaClient, ProductStatus } from "@prisma/client";
import path from "path";
import { readExcel } from "./readExcel.js";
import { getDirname } from "./path.js";

const prisma = new PrismaClient();

type Row = {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  status: ProductStatus;
  categoryId?: number;
};

export async function seedProducts() {
  const __dirname = getDirname(import.meta.url);
  const file = path.join(__dirname, "../data/products.xlsx");
  const rows = await readExcel<Row>(file);

  for (const row of rows) {
    console.log("rows products", row);
    if (!row.title || !row.slug || !row.status) {
      console.warn("⚠️ Skip invalid product row:", row);
      continue;
    }

    await prisma.product.create({
      data: {
        title: row.title,
        slug: row.slug,
        shortDescription: row.shortDescription,
        description: row.description,
        status: row.status,
        categoryId: row.categoryId ?? null,
      },
    });
  }
}
