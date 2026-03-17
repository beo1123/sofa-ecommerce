import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import { readExcel } from "./readExcel.js";
import { getDirname } from "./path.js";

const prisma = new PrismaClient();

type Row = {
  productId: number;
  name: string;
  skuPrefix?: string;
  price: number;
  compareAtPrice?: number;
  attributes?: string; // JSON string
};

export async function seedProductVariants() {
  const __dirname = getDirname(import.meta.url);
  const file = path.join(__dirname, "../data/product_varitants.xlsx");
  const rows = readExcel<Row>(file);

  for (const row of rows) {
    console.log("rows productVariant", row);

    await prisma.productVariant.create({
      data: {
        productId: row.productId,
        name: row.name,
        skuPrefix: row.skuPrefix,
        price: new Prisma.Decimal(row.price),
        compareAtPrice: row.compareAtPrice ? new Prisma.Decimal(row.compareAtPrice) : null,
        attributes: row.attributes ? JSON.parse(row.attributes) : null,
      },
    });
  }
}
