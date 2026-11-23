import React from "react";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/products/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return <ProductForm categories={categories} />;
}
