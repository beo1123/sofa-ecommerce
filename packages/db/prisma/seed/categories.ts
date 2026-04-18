import { PrismaClient } from "@prisma/client";
import path from "path";
import { readExcel } from "./readExcel.js";
import { getDirname } from "./path.js";

const prisma = new PrismaClient();

type Row = {
  name: string;
  slug: string;
  image?: string;
};

export async function seedCategories() {
  const __dirname = getDirname(import.meta.url);
  const file = path.join(__dirname, "../data/categories.xlsx");

  const rows = await readExcel<Row>(file);

  for (const row of rows) {
    console.log("rows category", row);

    await prisma.category.create({
      data: {
        name: row.name,
        slug: row.slug,
        image: row.image || null,
      },
    });
  }
}
