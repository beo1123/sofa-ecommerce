"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([axiosClient.get(`/admin/products/${productId}`), axiosClient.get("/categories")])
      .then(([productRes, catRes]) => {
        if (productRes.data?.success) setProduct(productRes.data.data);
        setCategories(catRes.data?.data ?? []);
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message ?? "Không thể tải sản phẩm");
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription || undefined,
        description: data.description || undefined,
        status: data.status || "DRAFT",
        categoryId: typeof data.categoryId === "number" && data.categoryId > 0 ? data.categoryId : undefined,
        images: data.images,
        variants: data.variants.map((v: any) => ({
          id: v.id,
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

      await axiosClient.put(`/admin/products/${productId}`, payload);
      router.push("/admin/products");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Cập nhật sản phẩm thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size={30} />
      </div>
    );
  }

  if (!product) {
    return <Alert variant="error" title="Không tìm thấy sản phẩm" />;
  }

  // Map product data to form format
  const formDefaults = {
    title: product.title,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    status: product.status,
    categoryId: product.category?.id,
    images:
      product.images?.map((img: any) => ({
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
      })) ?? [],
    variants:
      product.variants?.map((v: any) => ({
        id: v.id,
        name: v.name,
        sku: v.inventory?.[0]?.sku ?? "",
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        quantity: v.inventory?.[0]?.quantity ?? 0,
        color: (v.attributes as any)?.color ?? "",
        material: (v.attributes as any)?.material ?? "",
      })) ?? [],
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Heading level={2}>Chỉnh sửa: {product.title}</Heading>
      {error && <Alert variant="error" title="Lỗi" description={error} />}
      <ProductForm
        defaultValues={formDefaults}
        categories={categories}
        onSubmit={handleSubmit}
        submitLabel="Cập nhật"
      />
    </div>
  );
}
