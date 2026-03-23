"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import Input from "@/components/ui/Input";
import Dropdown from "@/components/ui/Dropdown";
import ProductTable from "@/components/admin/products/ProductTable";
import ExcelImport from "@/components/admin/products/ExcelImport";
import { Plus, Search } from "lucide-react";
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

interface Category {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, perPage: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    const timer = globalThis.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => globalThis.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get("/categories", { params: { page: 1, perPage: 100 } });
        if (mounted && res.data?.success) {
          setCategories(res.data.data ?? []);
        }
      } catch {
        // Ignore category list error; product listing still works.
      }
    };

    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const categoryId = categoryFilter !== "ALL" ? Number(categoryFilter) : undefined;

        const res = await axiosClient.get("/admin/products", {
          params: {
            page,
            perPage: 20,
            ...(debouncedSearch ? { q: debouncedSearch } : {}),
            ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
            ...(categoryId ? { categoryId } : {}),
          },
        });
        if (res.data?.success) {
          setProducts(res.data.data);
          setMeta(res.data.meta);
        }
      } catch (err: any) {
        setError(err?.response?.data?.error?.message ?? "Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    },
    [categoryFilter, debouncedSearch, statusFilter]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleDelete = async (product: Product) => {
    const isArchived = product.status === "ARCHIVED";
    const confirmed = confirm(
      isArchived
        ? "Sản phẩm đang ở trạng thái lưu trữ. Bạn có chắc muốn XÓA VĨNH VIỄN sản phẩm này?"
        : "Bạn có chắc muốn lưu trữ (archive) sản phẩm này?"
    );
    if (!confirmed) return;

    setDeleting(product.id);
    try {
      await axiosClient.delete(`/admin/products/${product.id}`);
      await fetchProducts(meta.page);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Xóa sản phẩm thất bại");
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
        <div className="p-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Tìm theo tên hoặc slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search size={16} />}
            fullWidth
          />
          <Dropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: "Tất cả danh mục", value: "ALL" },
              ...categories.map((cat) => ({ label: cat.name, value: String(cat.id) })),
            ]}
            fullWidth
          />
          <Dropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Tất cả trạng thái", value: "ALL" },
              { label: "Nháp", value: "DRAFT" },
              { label: "Đã đăng", value: "PUBLISHED" },
              { label: "Đã lưu trữ", value: "ARCHIVED" },
            ]}
            fullWidth
          />
        </div>

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
