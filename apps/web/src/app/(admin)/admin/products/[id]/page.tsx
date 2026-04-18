"use client";

import React from "react";
import { useParams } from "next/navigation";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import ProductForm from "@/components/admin/products/ProductForm";
import { useAdminProductEdit } from "@/hooks/products/useAdminProductEdit";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const { product, categories, formDefaults, loading, error, submit } = useAdminProductEdit(productId);

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

  return (
    <div className="space-y-6 max-w-4xl">
      <Heading level={2}>Chỉnh sửa: {product.title}</Heading>
      {error && <Alert variant="error" title="Lỗi" description={error} />}
      <ProductForm defaultValues={formDefaults} categories={categories} onSubmit={submit} submitLabel="Cập nhật" />
    </div>
  );
}
