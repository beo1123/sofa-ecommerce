"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import { useDebounce } from "@/hooks/common/useDebounce";
import {
  getApiErrorMessage,
  type AdminArticleCategory,
  type AdminArticleListItem,
  type AdminMeta,
} from "@/lib/articles/adminArticleUtils";

const PER_PAGE = 20;

const adminArticlesKeys = {
  all: ["admin-articles"] as const,
  list: (params: { page: number; q: string; status: string; categoryFilter: string }) =>
    [...adminArticlesKeys.all, "list", params] as const,
  categories: () => [...adminArticlesKeys.all, "categories"] as const,
};

interface ListResponse {
  data: AdminArticleListItem[];
  meta: AdminMeta;
}

export function useAdminArticles() {
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
    queryKey: adminArticlesKeys.categories(),
    queryFn: async (): Promise<AdminArticleCategory[]> => {
      const res = await axiosClient.get("/article-categories", { params: { page: 1, perPage: 100 } });
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const listQuery = useQuery({
    queryKey: adminArticlesKeys.list({
      page,
      q: debouncedSearch,
      status: statusFilter,
      categoryFilter,
    }),
    queryFn: async (): Promise<ListResponse> => {
      const res = await axiosClient.get("/admin/articles", {
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
    mutationFn: async (articleId: number) => {
      await axiosClient.delete(`/admin/articles/${articleId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminArticlesKeys.all });
    },
  });

  const handleDelete = async (article: AdminArticleListItem) => {
    setDeleteError(null);
    const isArchived = article.status === "ARCHIVED";
    const confirmed = globalThis.confirm(
      isArchived
        ? "Bài viết đang ở trạng thái lưu trữ. Bạn có chắc muốn XÓA VĨNH VIỄN bài viết này?"
        : "Bạn có chắc muốn lưu trữ bài viết này?"
    );
    if (!confirmed) return;

    setDeleting(article.id);
    try {
      await deleteMutation.mutateAsync(article.id);
    } catch (err: any) {
      setDeleteError(getApiErrorMessage(err, "Xử lý xóa bài viết thất bại"));
    } finally {
      setDeleting(null);
    }
  };

  const articles = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta ?? { page: 1, perPage: PER_PAGE, total: 0 };
  const categories = categoriesQuery.data ?? [];
  const loading = listQuery.isLoading || categoriesQuery.isLoading;
  const error = useMemo(() => {
    if (deleteError) return deleteError;
    if (listQuery.error) return getApiErrorMessage(listQuery.error, "Không thể tải danh sách bài viết");
    if (categoriesQuery.error) return getApiErrorMessage(categoriesQuery.error, "Không thể tải danh mục bài viết");
    if (deleteMutation.error) return getApiErrorMessage(deleteMutation.error, "Xử lý xóa bài viết thất bại");
    return null;
  }, [categoriesQuery.error, deleteError, deleteMutation.error, listQuery.error]);

  const totalPages = useMemo(() => Math.ceil(meta.total / meta.perPage), [meta.perPage, meta.total]);

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

  const goToPreviousPage = () => {
    if (page <= 1) return;
    setPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (page >= totalPages) return;
    setPage((prev) => prev + 1);
  };

  return {
    articles,
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
