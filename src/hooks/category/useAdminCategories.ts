"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import { useDebounce } from "@/hooks/common/useDebounce";

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  updatedAt: string;
  _count?: { products: number };
}

interface Meta {
  page: number;
  perPage: number;
  total: number;
}

interface FormState {
  name: string;
  slug: string;
  image: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  image: "",
};

const PER_PAGE = 20;

const adminCategoriesKeys = {
  all: ["admin-categories"] as const,
  list: (params: { page: number; q: string }) => [...adminCategoriesKeys.all, "list", params] as const,
};

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getApiErrorMessage(err: any, fallback: string) {
  return err?.response?.data?.error?.message ?? fallback;
}

export function useAdminCategories() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  const listQuery = useQuery({
    queryKey: adminCategoriesKeys.list({ page, q: debouncedSearch }),
    queryFn: async (): Promise<{ data: ProductCategory[]; meta: Meta }> => {
      const res = await axiosClient.get("/admin/categories", {
        params: {
          page,
          perPage: PER_PAGE,
          ...(debouncedSearch ? { q: debouncedSearch } : {}),
        },
      });

      return {
        data: res.data?.data ?? [],
        meta: res.data?.meta ?? { page: 1, perPage: PER_PAGE, total: 0 },
      };
    },
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; slug: string; image: string | null }) => {
      await axiosClient.post("/admin/categories", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminCategoriesKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: { name: string; slug: string; image: string | null };
    }) => {
      await axiosClient.put(`/admin/categories/${id}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminCategoriesKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      await axiosClient.delete(`/admin/categories/${categoryId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminCategoriesKeys.all });
    },
  });

  const categories = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta ?? { page: 1, perPage: PER_PAGE, total: 0 };
  const totalPages = useMemo(() => Math.ceil(meta.total / meta.perPage), [meta.perPage, meta.total]);

  const loading = listQuery.isLoading;
  const saving = createMutation.isPending || updateMutation.isPending;

  const error = useMemo(() => {
    if (deleteError) return deleteError;
    if (listQuery.error) return getApiErrorMessage(listQuery.error, "Không thể tải danh mục sản phẩm");
    if (createMutation.error) return getApiErrorMessage(createMutation.error, "Lưu danh mục thất bại");
    if (updateMutation.error) return getApiErrorMessage(updateMutation.error, "Lưu danh mục thất bại");
    if (deleteMutation.error) return getApiErrorMessage(deleteMutation.error, "Xóa danh mục thất bại");
    return null;
  }, [createMutation.error, deleteError, deleteMutation.error, listQuery.error, updateMutation.error]);

  const categoryUploadFolder = useMemo(() => {
    const slug = toSlug(form.slug || form.name || "uncategorized");
    return `categories/${slug}`;
  }, [form.name, form.slug]);

  const setSearchInputAndReset = (value: string) => {
    setSearchInput(value);
    if (page !== 1) setPage(1);
  };

  const goToPreviousPage = () => {
    if (page <= 1) return;
    setPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (page >= totalPages) return;
    setPage((prev) => prev + 1);
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setOpenModal(true);
  };

  const openEditModal = (category: ProductCategory) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      image: category.image ?? "",
    });
    setSlugManuallyEdited(true);
    setOpenModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpenModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugManuallyEdited(false);
  };

  const setName = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : toSlug(name),
    }));
  };

  const setSlug = (slugInput: string) => {
    const nextSlug = toSlug(slugInput);
    setSlugManuallyEdited(nextSlug.length > 0);
    setForm((prev) => ({ ...prev, slug: nextSlug }));
  };

  const setImageFromUploader = (images: { url: string }[]) => {
    setForm((prev) => ({
      ...prev,
      image: images[images.length - 1]?.url ?? "",
    }));
  };

  const submitForm = async () => {
    const payload = {
      name: form.name.trim(),
      slug: (form.slug.trim() || toSlug(form.name)).trim(),
      image: form.image.trim() || null,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }

    closeModal();
  };

  const deleteCategory = async (category: ProductCategory) => {
    const confirmed = globalThis.confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`);
    if (!confirmed) return;

    setDeleteError(null);
    setDeleting(category.id);
    try {
      await deleteMutation.mutateAsync(category.id);
    } catch (err: any) {
      setDeleteError(getApiErrorMessage(err, "Xóa danh mục thất bại"));
    } finally {
      setDeleting(null);
    }
  };

  return {
    categories,
    meta,
    loading,
    error,
    deleting,
    searchInput,
    totalPages,
    openModal,
    editing,
    form,
    saving,
    categoryUploadFolder,
    setSearchInput: setSearchInputAndReset,
    goToPreviousPage,
    goToNextPage,
    openCreateModal,
    openEditModal,
    closeModal,
    setName,
    setSlug,
    setImageFromUploader,
    submitForm,
    deleteCategory,
  };
}
