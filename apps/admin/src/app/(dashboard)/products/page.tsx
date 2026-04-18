"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Button, Spinner, Input, Dropdown, Pagination } from "@/components/ui";
import ProductTable from "@/components/admin/products/ProductTable";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const perPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products", page, perPage, search, status],
    queryFn: async () => {
      const res = await adminApi.products.list({
        page,
        perPage,
        q: search || undefined,
        status: status || undefined,
      });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setDeleting(null);
    },
    onError: () => {
      setDeleting(null);
    },
  });

  const handleDelete = (product: { id: number }) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      setDeleting(product.id);
      deleteMutation.mutate(product.id);
    }
  };

  const products = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, perPage: 10, total: 0 };
  const totalPages = Math.ceil(meta.total / meta.perPage);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-default)]">Quản lý sản phẩm</h1>
        <Link href="/products/new">
          <Button leftIcon={<Plus size={18} />}>Thêm sản phẩm</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
        <Dropdown
          value={status}
          onChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
          options={[
            { value: "", label: "Tất cả trạng thái" },
            { value: "PUBLISHED", label: "Đã đăng" },
            { value: "DRAFT", label: "Nháp" },
            { value: "ARCHIVED", label: "Đã lưu trữ" },
          ]}
          placeholder="Trạng thái"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <p>Không thể tải danh sách sản phẩm</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-[var(--color-brand-50)] overflow-hidden">
            <ProductTable products={products} onDelete={handleDelete} deleting={deleting} />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
