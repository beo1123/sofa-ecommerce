import { PrismaClient } from "@prisma/client";
import path from "path";
import { readExcel } from "./readExcel.js";
import { getDirname } from "./path.js";

const prisma = new PrismaClient();

type Row = {
  url: string;
  alt?: string;
  isPrimary: boolean;
  productId: number;
};

export async function seedProductImages() {
  const __dirname = getDirname(import.meta.url);
  const file = path.join(__dirname, "../data/product_images.xlsx");
  const rows = readExcel<Row>(file);

  for (const row of rows) {
    console.log("rows productImage", row);

    await prisma.productImage.create({
      data: {
        url: row.url,
        alt: row.alt,
        isPrimary: Boolean(row.isPrimary),
        productId: row.productId,
      },
    });
  }
}
