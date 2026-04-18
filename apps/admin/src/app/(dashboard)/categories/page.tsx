"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Button, Spinner, Input, Modal } from "@/components/ui";

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", image: "" });
  const perPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories", page, perPage, search],
    queryFn: async () => {
      const res = await adminApi.categories.list({
        page,
        perPage,
        q: search || undefined,
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => adminApi.categories.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      adminApi.categories.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", slug: "", image: "" });
    setEditingCategory(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      image: category.image ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const categories = data?.data ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-default)]">Danh mục sản phẩm</h1>
        <Button leftIcon={<Plus size={18} />} onClick={openCreateModal}>
          Thêm danh mục
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p>Chưa có danh mục nào.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[var(--color-brand-50)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-[var(--color-text-muted)] uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Số sản phẩm</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category: Category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{category.slug}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {category._count?.products ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="xs"
                          variant="ghost"
                          leftIcon={<Pencil size={14} />}
                          onClick={() => openEditModal(category)}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          leftIcon={<Trash2 size={14} />}
                          onClick={() => handleDelete(category)}
                          loading={deleteMutation.isPending}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên danh mục"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            required
          />
          <Input
            label="Ảnh (URL)"
            value={formData.image}
            onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)} type="button">
              Hủy
            </Button>
            <Button type="submit" loading={isSaving}>
              {editingCategory ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
