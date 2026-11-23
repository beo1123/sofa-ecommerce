"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { IconEdit, IconExternalLink, IconLoader2, IconSearch, IconTrash } from "@tabler/icons-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDateVi } from "@/lib/format";
import { deleteArticleAction, updateArticleStatusAction } from "@/app/(admin)/admin/articles/actions";
import type { ArticleStatus } from "@/lib/prisma";
import type { SerializedArticleCategory, SerializedArticleListItem } from "@/components/admin/articles/types";

interface ArticleTableProps {
  initialArticles: SerializedArticleListItem[];
  categories: SerializedArticleCategory[];
}

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "", label: "Tất cả" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "DRAFT", label: "Bản nháp" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

export default function ArticleTable({ initialArticles, categories }: ArticleTableProps) {
  const [articles, setArticles] = useState<SerializedArticleListItem[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [{ label: "Tất cả danh mục", value: "" }, ...categories.map((c) => ({ label: c.name, value: String(c.id) }))],
    [categories]
  );

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (categoryId && String(a.categoryId ?? "") !== categoryId) return false;
      if (!q) return true;
      const haystack = [a.title, a.slug, a.categoryName ?? "", a.linkedProductTitle ?? "", a.linkedProductCode ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [articles, search, categoryId, statusFilter]);

  const handleCycleStatus = async (article: SerializedArticleListItem) => {
    const order: ArticleStatus[] = ["PUBLISHED", "DRAFT", "ARCHIVED"];
    const nextStatus = order[(order.indexOf(article.status) + 1) % order.length];

    setErrorMsg(null);
    setBusyId(article.id);
    const prev = article;

    setArticles((list) => list.map((item) => (item.id === article.id ? { ...item, status: nextStatus } : item)));

    const res = await updateArticleStatusAction(article.id, nextStatus);
    setBusyId(null);

    if (!res.ok || !res.data) {
      setArticles((list) => list.map((item) => (item.id === article.id ? prev : item)));
      setErrorMsg(res.error ?? "Không thể cập nhật trạng thái");
      return;
    }

    const updated = res.data;
    setArticles((list) =>
      list.map((item) =>
        item.id === article.id
          ? {
              ...item,
              status: updated.status,
              publishedAt: updated.publishedAt,
            }
          : item
      )
    );
  };

  const handleDelete = async (article: SerializedArticleListItem) => {
    if (!window.confirm(`Xóa bài viết "${article.title}"?`)) return;

    setErrorMsg(null);
    setBusyId(article.id);
    const res = await deleteArticleAction(article.id);
    setBusyId(null);

    if (!res.ok) {
      setErrorMsg(res.error ?? "Không thể xóa bài viết");
      return;
    }

    setArticles((list) => list.filter((item) => item.id !== article.id));
  };

  return (
    <div className="space-y-4">
      {/* Status pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value;
          const count = tab.value === "" ? articles.length : articles.filter((a) => a.status === tab.value).length;
          return (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                active
                  ? "border-brand-400 bg-brand-400 text-white"
                  : "border-brand-100 bg-bg-page text-text-muted hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-400"
              )}>
              <span>{tab.label}</span>
              <span className="opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-[12px] border border-brand-100 bg-bg-muted p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tiêu đề bài viết, slug, sản phẩm..."
              inputSize="sm"
              fullWidth
              leftIcon={<IconSearch size={16} stroke={1.75} />}
            />
          </div>
          <div className="w-full sm:w-52">
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              selectSize="sm"
              fullWidth
              options={categoryOptions}
            />
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Hiển thị <span className="font-semibold text-brand-400">{filteredArticles.length}</span> / {articles.length}{" "}
          bài đăng
        </p>
      </div>

      {errorMsg && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Table */}
      <div className="rounded-[12px] border border-brand-100 bg-bg-page">
        {filteredArticles.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-brand-400">Chưa có bài đăng nào phù hợp</p>
            <p className="mt-1 text-xs text-text-muted">
              Tạo bài viết mới về kinh nghiệm chọn sofa, chất liệu hoặc công trình bàn giao.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-bg-muted text-xs font-medium text-text-muted">
                  <th className="px-4 py-3">Tiêu đề bài đăng</th>
                  <th className="px-3 py-3">Danh mục</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Ngày xuất bản</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100/60">
                {filteredArticles.map((article) => {
                  const isBusy = busyId === article.id;

                  return (
                    <tr key={article.id} className="transition-colors hover:bg-brand-50/40">
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-[8px] border border-brand-100 bg-brand-50">
                            {article.coverImageUrl ? (
                              <img
                                src={article.coverImageUrl}
                                alt={article.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-brand-200">
                                Cover
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/articles/${article.id}`}
                              className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
                              {article.title}
                            </Link>
                            <p className="mt-0.5 truncate text-xs text-text-muted">/bai-viet/{article.slug}</p>
                            {article.linkedProductTitle && (
                              <div className="mt-1">
                                <Badge variant="brand">
                                  SP:{" "}
                                  {[article.linkedProductCode, article.linkedProductTitle].filter(Boolean).join(" — ")}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-top text-xs whitespace-nowrap text-text-default">
                        {article.categoryName ?? <span className="text-text-muted">Chưa phân loại</span>}
                      </td>

                      <td className="px-3 py-3.5 align-top">
                        <StatusBadge
                          domain="article"
                          status={article.status}
                          interactive
                          onClick={() => handleCycleStatus(article)}
                          rightIcon={
                            isBusy ? <IconLoader2 size={12} stroke={1.75} className="animate-spin" /> : undefined
                          }
                        />
                      </td>

                      <td className="px-3 py-3.5 align-top text-xs whitespace-nowrap text-text-muted">
                        {formatDateVi(article.publishedAt)}
                      </td>

                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/articles/${article.id}`}
                            title="Chỉnh sửa bài đăng"
                            aria-label={`Chỉnh sửa ${article.title}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-300 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-400">
                            <IconEdit size={16} stroke={1.75} />
                          </Link>
                          <Link
                            href={`/bai-viet/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Xem trước bài đăng"
                            aria-label={`Xem trước ${article.title}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-300 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-400">
                            <IconExternalLink size={16} stroke={1.75} />
                          </Link>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(article)}
                            title="Xóa bài đăng"
                            aria-label={`Xóa ${article.title}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-40 cursor-pointer">
                            <IconTrash size={16} stroke={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
