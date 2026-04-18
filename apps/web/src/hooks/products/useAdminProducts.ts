"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import { useDebounce } from "@/hooks/common/useDebounce";
import {
  type AdminCategory,
  type AdminMeta,
  type AdminProductListItem,
  getApiErrorMessage,
} from "@/lib/products/adminProductUtils";

const PER_PAGE = 20;

const adminProductsKeys = {
  all: ["admin-products"] as const,
  list: (params: { page: number; q: string; status: string; categoryFilter: string }) =>
    [...adminProductsKeys.all, "list", params] as const,
  categories: () => [...adminProductsKeys.all, "categories"] as const,
};

interface ListResponse {
  data: AdminProductListItem[];
  meta: AdminMeta;
}

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const categoryId = categoryFilter !== "ALL" ? Number(categoryFilter) : undefined;

  const categoriesQuery = useQuery({
    queryKey: adminProductsKeys.categories(),
    queryFn: async (): Promise<AdminCategory[]> => {
      const res = await axiosClient.get("/categories", { params: { page: 1, perPage: 100 } });
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const listQuery = useQuery({
    queryKey: adminProductsKeys.list({
      page,
      q: debouncedSearch,
      status: statusFilter,
      categoryFilter,
    }),
    queryFn: async (): Promise<ListResponse> => {
      const res = await axiosClient.get("/admin/products", {
        params: {
          page,
          perPage: PER_PAGE,
          ...(debouncedSearch ? { q: debouncedSearch } : {}),
          ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
          ...(categoryId ? { categoryId } : {}),
        },
      });

      return {
        data: res.data?.data ?? [],
        meta: res.data?.meta ?? { page: 1, perPage: PER_PAGE, total: 0 },
      };
    },
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await axiosClient.delete(`/admin/products/${productId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.all });
    },
  });

  const handleDelete = async (product: AdminProductListItem) => {
    setDeleteError(null);
    const isArchived = product.status === "ARCHIVED";
    const confirmed = globalThis.confirm(
      isArchived
        ? "Sản phẩm đang ở trạng thái lưu trữ. Bạn có chắc muốn XÓA VĨNH VIỄN sản phẩm này?"
        : "Bạn có chắc muốn lưu trữ (archive) sản phẩm này?"
    );
    if (!confirmed) return;

    setDeleting(product.id);
    try {
      await deleteMutation.mutateAsync(product.id);
    } catch (err: any) {
      setDeleteError(getApiErrorMessage(err, "Xóa sản phẩm thất bại"));
    } finally {
      setDeleting(null);
    }
  };

  const products = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta ?? { page: 1, perPage: PER_PAGE, total: 0 };
  const categories = categoriesQuery.data ?? [];
  const loading = listQuery.isLoading || categoriesQuery.isLoading;
  const error = useMemo(() => {
    if (deleteError) return deleteError;
    if (listQuery.error) return getApiErrorMessage(listQuery.error, "Không thể tải danh sách sản phẩm");
    if (categoriesQuery.error) return getApiErrorMessage(categoriesQuery.error, "Không thể tải danh mục");
    if (deleteMutation.error) return getApiErrorMessage(deleteMutation.error, "Xóa sản phẩm thất bại");
    return null;
  }, [categoriesQuery.error, deleteError, deleteMutation.error, listQuery.error]);

  const totalPages = useMemo(() => Math.ceil(meta.total / meta.perPage), [meta.perPage, meta.total]);

  const goToPreviousPage = () => {
    if (page <= 1) return;
    setPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (page >= totalPages) return;
    setPage((prev) => prev + 1);
  };

  const resetToFirstPage = () => setPage(1);

  const setSearchInputAndReset = (value: string) => {
    setSearchInput(value);
    if (page !== 1) resetToFirstPage();
  };

  const setStatusFilterAndReset = (value: string) => {
    setStatusFilter(value);
    if (page !== 1) resetToFirstPage();
  };

  const setCategoryFilterAndReset = (value: string) => {
    setCategoryFilter(value);
    if (page !== 1) resetToFirstPage();
  };

  return {
    products,
    meta,
    loading,
    error,
    deleting,
    categories,
    searchInput,
    statusFilter,
    categoryFilter,
    totalPages,
    setSearchInput: setSearchInputAndReset,
    setStatusFilter: setStatusFilterAndReset,
    setCategoryFilter: setCategoryFilterAndReset,
    handleDelete,
    goToPreviousPage,
    goToNextPage,
  };
}
