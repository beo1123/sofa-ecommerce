"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Button, Spinner, Input, Dropdown, Pagination, Badge } from "@/components/ui";

const STATUS_BADGE: Record<string, "default" | "success" | "warning" | "danger"> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "danger",
};

export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const perPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "articles", page, perPage, search, status],
    queryFn: async () => {
      const res = await adminApi.articles.list({
        page,
        perPage,
        q: search || undefined,
        status: status || undefined,
      });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.articles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      setDeleting(null);
    },
    onError: () => {
      setDeleting(null);
    },
  });

  const handleDelete = (article: { id: number; title: string; status: string }) => {
    const action = article.status === "ARCHIVED" ? "xóa vĩnh viễn" : "lưu trữ";
    if (confirm(`Bạn có chắc muốn ${action} bài viết "${article.title}"?`)) {
      setDeleting(article.id);
      deleteMutation.mutate(article.id);
    }
  };

  const articles = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, perPage: 10, total: 0 };
  const totalPages = Math.ceil(meta.total / meta.perPage);

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-default)]">Quản lý bài viết</h1>
        <Link href="/articles/new">
          <Button leftIcon={<Plus size={18} />}>Thêm bài viết</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Input
          placeholder="Tìm kiếm bài viết..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
        <Dropdown
          value={status}
          onChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
          options={[
            { value: "", label: "Tất cả trạng thái" },
            { value: "PUBLISHED", label: "Đã đăng" },
            { value: "DRAFT", label: "Nháp" },
            { value: "ARCHIVED", label: "Đã lưu trữ" },
          ]}
          placeholder="Trạng thái"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <p>Không thể tải danh sách bài viết</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p>Chưa có bài viết nào.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-[var(--color-brand-50)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-[var(--color-text-muted)] uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Ảnh</th>
                    <th className="px-4 py-3">Tiêu đề</th>
                    <th className="px-4 py-3">Danh mục</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày đăng</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map((article: any) => (
                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        {article.thumbnail ? (
                          <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-16 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/articles/${article.id}`}
                          className="font-medium text-[var(--color-text-default)] hover:text-[var(--color-brand-300)] transition-colors"
                        >
                          {article.title}
                        </Link>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">/{article.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">
                        {article.category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[article.status] ?? "default"}>
                          {article.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">
                        {formatDate(article.publishedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/articles/${article.id}`}>
                            <Button size="xs" variant="ghost" leftIcon={<Pencil size={14} />}>
                              Sửa
                            </Button>
                          </Link>
                          <Button
                            size="xs"
                            variant="danger"
                            leftIcon={<Trash2 size={14} />}
                            loading={deleting === article.id}
                            onClick={() => handleDelete(article)}
                          >
                            {article.status === "ARCHIVED" ? "Xóa" : "Lưu trữ"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
