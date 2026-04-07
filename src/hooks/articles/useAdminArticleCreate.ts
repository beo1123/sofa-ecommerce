"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import {
  buildAdminArticlePayload,
  getApiErrorMessage,
  type AdminArticleCategory,
} from "@/lib/articles/adminArticleUtils";
import type { ArticleFormData } from "@/components/admin/articles/ArticleForm";

type ArticleSubmitData = ArticleFormData & {
  thumbnail?: string;
};

export function useAdminArticleCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["admin-articles", "categories"],
    queryFn: async (): Promise<AdminArticleCategory[]> => {
      const res = await axiosClient.get("/article-categories");
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ArticleSubmitData) => {
      const payload = buildAdminArticlePayload(data);
      await axiosClient.post("/admin/articles", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      router.push("/admin/articles");
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    loading: categoriesQuery.isLoading,
    error:
      (categoriesQuery.error && getApiErrorMessage(categoriesQuery.error, "Không thể tải danh mục bài viết")) ||
      (createMutation.error && getApiErrorMessage(createMutation.error, "Tạo bài viết thất bại")) ||
      null,
    submit: createMutation.mutateAsync,
    isSubmitting: createMutation.isPending,
  };
}
