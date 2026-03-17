"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import ProductTable from "@/components/admin/products/ProductTable";
import ExcelImport from "@/components/admin/products/ExcelImport";
import { Plus } from "lucide-react";
import axiosClient from "@/server/axiosClient";

interface Product {
  id: number;
  title: string;
  slug: string;
  status: string;
  category?: { id: number; name: string; slug: string } | null;
  images?: { url: string; alt?: string }[];
  variants?: { id: number; name: string; price: number | string }[];
  updatedAt: string;
}

interface Meta {
  page: number;
  perPage: number;
  total: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, perPage: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get("/admin/products", { params: { page, perPage: 20 } });
      if (res.data?.success) {
        setProducts(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn lưu trữ (archive) sản phẩm này?")) return;
    setDeleting(id);
    try {
      await axiosClient.delete(`/admin/products/${id}`);
      await fetchProducts(meta.page);
    } catch {
      // Error handled silently
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(meta.total / meta.perPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level={2}>Quản lý sản phẩm</Heading>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{meta.total} sản phẩm</p>
        </div>
        <Link href="/admin/products/new">
          <Button leftIcon={<Plus size={16} />}>Thêm sản phẩm</Button>
        </Link>
      </div>

      {/* Excel Import */}
      <ExcelImport />

      {/* Content */}
      {error && <Alert variant="error" title="Lỗi" description={error} />}

      <Card variant="elevated" padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size={30} />
          </div>
        ) : (
          <ProductTable products={products} onDelete={handleDelete} deleting={deleting} />
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => fetchProducts(meta.page - 1)}>
            Trước
          </Button>
          <span className="text-sm text-[var(--color-text-muted)]">
            Trang {meta.page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= totalPages}
            onClick={() => fetchProducts(meta.page + 1)}>
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
