"use client";

import React from "react";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import ArticleForm from "@/components/admin/articles/ArticleForm";
import { useAdminArticleCreate } from "@/hooks/articles/useAdminArticleCreate";

export default function NewArticlePage() {
  const { categories, loading, error, submit } = useAdminArticleCreate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size={30} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Heading level={2}>Thêm bài viết mới</Heading>
      {error && <Alert variant="error" title="Lỗi" description={error} />}
      <ArticleForm categories={categories} onSubmit={submit} submitLabel="Tạo bài viết" />
    </div>
  );
}
