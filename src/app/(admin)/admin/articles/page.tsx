"use client";

import React from "react";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import ArticleTable from "@/components/admin/articles/ArticleTable";
import { Plus } from "lucide-react";
import { useAdminArticles } from "@/hooks/articles/useAdminArticles";

export default function AdminArticlesPage() {
  const { articles, meta, loading, error, deleting, totalPages, goToPreviousPage, goToNextPage, handleDelete } =
    useAdminArticles();

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
