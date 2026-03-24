"use client";

import React from "react";
import Heading from "@/components/ui/Heading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import ImageUploader from "@/components/admin/products/ImageUploader";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useAdminCategories } from "@/hooks/category/useAdminCategories";

export default function AdminCategoriesPage() {
  const {
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
    setSearchInput,
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
  } = useAdminCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={2}>Danh mục sản phẩm</Heading>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{meta.total} danh mục</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>
          Thêm danh mục
        </Button>
      </div>

      {error && <Alert variant="error" title="Lỗi" description={error} />}

      <Card variant="elevated" padding="none">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Tìm theo tên hoặc slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search size={16} />}
            fullWidth
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size={30} />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            <p>Chưa có danh mục nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-[var(--color-text-muted)] uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Ảnh</th>
                  <th className="px-4 py-3">Số sản phẩm</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">/{category.slug}</td>
                    <td className="px-4 py-3">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{category._count?.products ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="xs"
                          variant="ghost"
                          leftIcon={<Pencil size={14} />}
                          onClick={() => openEditModal(category)}>
                          Sửa
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          leftIcon={<Trash2 size={14} />}
                          loading={deleting === category.id}
                          onClick={() => deleteCategory(category)}>
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={goToPreviousPage}>
            Trước
          </Button>
          <span className="text-sm text-[var(--color-text-muted)]">
            Trang {meta.page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={meta.page >= totalPages} onClick={goToNextPage}>
            Sau
          </Button>
        </div>
      )}

      <Modal
        isOpen={openModal}
        onClose={closeModal}
        title={editing ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        size="sm">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submitForm();
          }}>
          <Input
            label="Tên danh mục"
            placeholder="Ví dụ: Sofa Da"
            value={form.name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <Input
            label="Slug"
            placeholder="sofa-da"
            value={form.slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            fullWidth
          />
          <ImageUploader
            images={form.image ? [{ url: form.image, alt: form.name || "Category image", isPrimary: true }] : []}
            folder={categoryUploadFolder}
            multiple={false}
            onChange={setImageFromUploader}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeModal} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
