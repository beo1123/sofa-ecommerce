"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import {
  buildAdminProductPayload,
  getApiErrorMessage,
  mapAdminProductToFormDefaults,
  type AdminCategory,
  type AdminProductDetail,
} from "@/lib/products/adminProductUtils";
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

export function useAdminProductEdit(productId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: ["admin-products", "detail", productId],
    enabled: Boolean(productId),
    queryFn: async (): Promise<AdminProductDetail | null> => {
      const res = await axiosClient.get(`/admin/products/${productId}`);
      if (!res.data?.success) return null;
      return res.data.data as AdminProductDetail;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-products", "categories"],
    queryFn: async (): Promise<AdminCategory[]> => {
      const res = await axiosClient.get("/categories");
      return res.data?.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductSubmitData) => {
      const payload = buildAdminProductPayload(data, true);
      await axiosClient.put(`/admin/products/${productId}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      router.push("/admin/products");
    },
  });

  const formDefaults = useMemo(() => {
    if (!productQuery.data) return undefined;
    return mapAdminProductToFormDefaults(productQuery.data);
  }, [productQuery.data]);

  return {
    product: productQuery.data,
    categories: categoriesQuery.data ?? [],
    formDefaults,
    loading: productQuery.isLoading || categoriesQuery.isLoading,
    error:
      (productQuery.error && getApiErrorMessage(productQuery.error, "Không thể tải sản phẩm")) ||
      (categoriesQuery.error && getApiErrorMessage(categoriesQuery.error, "Không thể tải danh mục")) ||
      (updateMutation.error && getApiErrorMessage(updateMutation.error, "Cập nhật sản phẩm thất bại")) ||
      null,
    submit: updateMutation.mutateAsync,
    isSubmitting: updateMutation.isPending,
  };
}
