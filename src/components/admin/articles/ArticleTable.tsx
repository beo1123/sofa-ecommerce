"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Pencil, Trash2 } from "lucide-react";

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

interface ArticleTableProps {
  articles: Article[];
  onDelete: (id: number) => void;
  deleting?: number | null;
}

const STATUS_BADGE: Record<string, "default" | "success" | "warning" | "danger"> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Đã đăng",
  DRAFT: "Nháp",
  ARCHIVED: "Đã lưu trữ",
};

export default function ArticleTable({ articles, onDelete, deleting }: ArticleTableProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--color-text-muted)]">
        <p>Chưa có bài viết nào.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-[var(--color-text-muted)] uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Ảnh</th>
            <th className="px-4 py-3">Tiêu đề</th>
            <th className="px-4 py-3">Danh mục</th>
            <th className="px-4 py-3">Tác giả</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ngày đăng</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
              {/* Thumbnail */}
              <td className="px-4 py-3">
                {article.thumbnail ? (
                  <img src={article.thumbnail} alt={article.title} className="w-12 h-12 object-cover rounded" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                    N/A
                  </div>
                )}
              </td>

              {/* Title */}
              <td className="px-4 py-3">
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="font-medium text-[var(--color-text-default)] hover:text-[var(--color-brand-300)] transition-colors">
                  {article.title}
                </Link>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">/{article.slug}</p>
              </td>

              {/* Category */}
              <td className="px-4 py-3 text-[var(--color-text-muted)]">{article.category?.name ?? "—"}</td>

              {/* Author */}
              <td className="px-4 py-3 text-[var(--color-text-muted)]">{article.author?.displayName ?? "—"}</td>

              {/* Status */}
              <td className="px-4 py-3">
                <Badge variant={STATUS_BADGE[article.status] ?? "default"}>
                  {STATUS_LABEL[article.status] ?? article.status}
                </Badge>
              </td>

              {/* Published date */}
              <td className="px-4 py-3 text-[var(--color-text-muted)]">
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("vi-VN") : "—"}
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/articles/${article.id}`}>
                    <Button size="xs" variant="ghost" leftIcon={<Pencil size={14} />}>
                      Sửa
                    </Button>
                  </Link>
                  <Button
                    size="xs"
                    variant="danger"
                    leftIcon={<Trash2 size={14} />}
                    loading={deleting === article.id}
                    onClick={() => onDelete(article.id)}>
                    Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
