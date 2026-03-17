"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import ArticleTable from "@/components/admin/articles/ArticleTable";
import { Plus } from "lucide-react";
import axiosClient from "@/server/axiosClient";

interface Article {
  id: number;
  title: string;
  slug: string;
  status: string;
  thumbnail?: string | null;
  category?: { id: number; name: string; slug: string } | null;
  author?: { id: number; displayName?: string | null } | null;
  publishedAt?: string | null;
  updatedAt: string;
}

interface Meta {
  page: number;
  perPage: number;
  total: number;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, perPage: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchArticles = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get("/admin/articles", { params: { page, perPage: 20 } });
      if (res.data?.success) {
        setArticles(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn lưu trữ (archive) bài viết này?")) return;
    setDeleting(id);
    try {
      await axiosClient.delete(`/admin/articles/${id}`);
      await fetchArticles(meta.page);
    } catch {
      // Error handled silently
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(meta.total / meta.perPage);

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
          <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => fetchArticles(meta.page - 1)}>
            Trước
          </Button>
          <span className="text-sm text-[var(--color-text-muted)]">
            Trang {meta.page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= totalPages}
            onClick={() => fetchArticles(meta.page + 1)}>
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
