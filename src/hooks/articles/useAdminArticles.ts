"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import { type AdminMeta, type AdminArticleListItem, getApiErrorMessage } from "@/lib/articles/adminArticleUtils";

const PER_PAGE = 20;

const adminArticlesKeys = {
  all: ["admin-articles"] as const,
  list: (params: { page: number }) => [...adminArticlesKeys.all, "list", params] as const,
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

  const listQuery = useQuery({
    queryKey: adminArticlesKeys.list({ page }),
    queryFn: async (): Promise<ListResponse> => {
      const res = await axiosClient.get("/admin/articles", {
        params: { page, perPage: PER_PAGE },
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

  const handleDelete = async (articleId: number) => {
    setDeleteError(null);
    const confirmed = globalThis.confirm("Bạn có chắc muốn lưu trữ (archive) bài viết này?");
    if (!confirmed) return;

    setDeleting(articleId);
    try {
      await deleteMutation.mutateAsync(articleId);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Xóa bài viết thất bại"));
    } finally {
      setDeleting(null);
    }
  };

  const articles = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta ?? { page: 1, perPage: PER_PAGE, total: 0 };
  const loading = listQuery.isLoading;

  const error = useMemo(() => {
    if (deleteError) return deleteError;
    if (listQuery.error) return getApiErrorMessage(listQuery.error, "Không thể tải danh sách bài viết");
    if (deleteMutation.error) return getApiErrorMessage(deleteMutation.error, "Xóa bài viết thất bại");
    return null;
  }, [deleteError, deleteMutation.error, listQuery.error]);

  const totalPages = useMemo(() => Math.ceil(meta.total / meta.perPage), [meta.perPage, meta.total]);

  return {
    articles,
    meta,
    loading,
    error,
    deleting,
    totalPages,
    goToPreviousPage: () => setPage((p) => Math.max(1, p - 1)),
    goToNextPage: () => setPage((p) => Math.min(totalPages, p + 1)),
    handleDelete,
  };
}
