"use client";

import React from "react";
import { useParams } from "next/navigation";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import ArticleForm from "@/components/admin/articles/ArticleForm";
import { useAdminArticleEdit } from "@/hooks/articles/useAdminArticleEdit";

export default function EditArticlePage() {
  const params = useParams();
  const articleId = params.id as string;
  const { article, categories, formDefaults, loading, error, submit } = useAdminArticleEdit(articleId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size={30} />
      </div>
    );
  }

  if (!article) {
    return <Alert variant="error" title="Không tìm thấy bài viết" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Heading level={2}>Chỉnh sửa: {article.title}</Heading>
      {error && <Alert variant="error" title="Lỗi" description={error} />}
      <ArticleForm defaultValues={formDefaults} categories={categories} onSubmit={submit} submitLabel="Cập nhật" />
    </div>
  );
}
