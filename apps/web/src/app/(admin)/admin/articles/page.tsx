"use client";

import React from "react";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import Input from "@/components/ui/Input";
import Dropdown from "@/components/ui/Dropdown";
import ArticleTable from "@/components/admin/articles/ArticleTable";
import { Plus, Search } from "lucide-react";
import { useAdminArticles } from "@/hooks/articles/useAdminArticles";

export default function AdminArticlesPage() {
  const {
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
    setSearchInput,
    setStatusFilter,
    setCategoryFilter,
    handleDelete,
    goToPreviousPage,
    goToNextPage,
  } = useAdminArticles();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level={2}>Quản lý bài viết</Heading>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{meta.total} bài viết</p>
        </div>
        <Link href="/admin/articles/new">
          <Button leftIcon={<Plus size={16} />}>Thêm bài viết</Button>
        </Link>
      </div>

      {/* Content */}
      {error && <Alert variant="error" title="Lỗi" description={error} />}

      <Card variant="elevated" padding="none">
        <div className="p-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Tìm theo tiêu đề hoặc slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search size={16} />}
            fullWidth
          />
          <Dropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: "Tất cả danh mục", value: "ALL" },
              ...categories.map((category) => ({ label: category.name, value: String(category.id) })),
            ]}
            fullWidth
          />
          <Dropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Tất cả trạng thái", value: "ALL" },
              { label: "Nháp", value: "DRAFT" },
              { label: "Đã đăng", value: "PUBLISHED" },
              { label: "Đã lưu trữ", value: "ARCHIVED" },
            ]}
            fullWidth
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size={30} />
          </div>
        ) : (
          <ArticleTable articles={articles} onDelete={handleDelete} deleting={deleting} />
        )}
      </Card>

      {/* Pagination */}
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
    </div>
  );
}
