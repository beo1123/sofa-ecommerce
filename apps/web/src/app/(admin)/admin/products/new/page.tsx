"use client";

import React from "react";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import ProductForm from "@/components/admin/products/ProductForm";
import { useAdminProductCreate } from "@/hooks/products/useAdminProductCreate";

export default function NewProductPage() {
  const { categories, loading, error, submit } = useAdminProductCreate();

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
      <ProductForm categories={categories} onSubmit={submit} submitLabel="Tạo sản phẩm" />
    </div>
  );
}
