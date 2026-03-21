"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import ProductForm from "@/components/admin/products/ProductForm";
import axiosClient from "@/server/axiosClient";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosClient
      .get("/categories")
      .then((res) => setCategories(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription || undefined,
        description: data.description || undefined,
        status: data.status || "DRAFT",
        categoryId: data.categoryId || undefined,
        images: data.images,
        variants: data.variants.map((v: any) => ({
          name: v.name,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          attributes: {
            ...(v.color ? { color: v.color } : {}),
            ...(v.material ? { material: v.material } : {}),
          },
          inventory: v.sku ? { sku: v.sku, quantity: Number(v.quantity ?? 0) } : undefined,
        })),
      };

      await axiosClient.post("/admin/products", payload);
      router.push("/admin/products");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Tạo sản phẩm thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size={30} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Heading level={2}>Thêm sản phẩm mới</Heading>
      {error && <Alert variant="error" title="Lỗi" description={error} />}
      <ProductForm categories={categories} onSubmit={handleSubmit} submitLabel="Tạo sản phẩm" />
    </div>
  );
}
