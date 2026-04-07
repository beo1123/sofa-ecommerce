"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import {
  buildAdminArticlePayload,
  getApiErrorMessage,
  mapAdminArticleToFormDefaults,
  type AdminArticleCategory,
  type AdminArticleDetail,
} from "@/lib/articles/adminArticleUtils";
import type { ArticleFormData } from "@/components/admin/articles/ArticleForm";

type ArticleSubmitData = ArticleFormData & {
  thumbnail?: string;
};

export function useAdminArticleEdit(articleId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const articleQuery = useQuery({
    queryKey: ["admin-articles", "detail", articleId],
    enabled: Boolean(articleId),
    queryFn: async (): Promise<AdminArticleDetail | null> => {
      const res = await axiosClient.get(`/admin/articles/${articleId}`);
      if (!res.data?.success) return null;
      return res.data.data as AdminArticleDetail;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-articles", "categories"],
    queryFn: async (): Promise<AdminArticleCategory[]> => {
      const res = await axiosClient.get("/article-categories");
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ArticleSubmitData) => {
      const payload = buildAdminArticlePayload(data);
      await axiosClient.put(`/admin/articles/${articleId}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      router.push("/admin/articles");
    },
  });

  const formDefaults = useMemo(() => {
    if (!articleQuery.data) return undefined;
    return mapAdminArticleToFormDefaults(articleQuery.data);
  }, [articleQuery.data]);

  return {
    article: articleQuery.data,
    categories: categoriesQuery.data ?? [],
    formDefaults,
    loading: articleQuery.isLoading || categoriesQuery.isLoading,
    error:
      (articleQuery.error && getApiErrorMessage(articleQuery.error, "Không thể tải bài viết")) ||
      (categoriesQuery.error && getApiErrorMessage(categoriesQuery.error, "Không thể tải danh mục bài viết")) ||
      (updateMutation.error && getApiErrorMessage(updateMutation.error, "Cập nhật bài viết thất bại")) ||
      null,
    submit: updateMutation.mutateAsync,
    isSubmitting: updateMutation.isPending,
  };
}
