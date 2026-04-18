"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import { buildAdminProductPayload, type AdminCategory, getApiErrorMessage } from "@/lib/products/adminProductUtils";
import type { ProductFormData } from "@/components/admin/products/ProductForm";

type ProductSubmitData = ProductFormData & {
  images: { url: string; alt?: string; isPrimary?: boolean }[];
  variants: {
    id?: number;
    name: string;
    sku?: string;
    price: number;
    compareAtPrice?: number;
    quantity?: number;
    color?: string;
    material?: string;
  }[];
};

export function useAdminProductCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["admin-products", "categories"],
    queryFn: async (): Promise<AdminCategory[]> => {
      const res = await axiosClient.get("/categories");
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductSubmitData) => {
      const payload = buildAdminProductPayload(data);
      await axiosClient.post("/admin/products", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      router.push("/admin/products");
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    loading: categoriesQuery.isLoading,
    error:
      (categoriesQuery.error && getApiErrorMessage(categoriesQuery.error, "Không thể tải danh mục")) ||
      (createMutation.error && getApiErrorMessage(createMutation.error, "Tạo sản phẩm thất bại")) ||
      null,
    submit: createMutation.mutateAsync,
    isSubmitting: createMutation.isPending,
  };
}
