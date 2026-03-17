"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Heading from "@/components/ui/Heading";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import ArticleForm from "@/components/admin/articles/ArticleForm";
import axiosClient from "@/server/axiosClient";

interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<any>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([axiosClient.get(`/admin/articles/${articleId}`), axiosClient.get("/article-categories")])
      .then(([articleRes, catRes]) => {
        if (articleRes.data?.success) setArticle(articleRes.data.data);
        setCategories(catRes.data?.data ?? []);
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message ?? "Không thể tải bài viết");
      })
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      await axiosClient.put(`/admin/articles/${articleId}`, data);
      router.push("/admin/articles");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Cập nhật bài viết thất bại");
    }
  };

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

  const formDefaults = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    status: article.status,
    categoryId: article.category?.id,
    thumbnail: article.thumbnail,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Heading level={2}>Chỉnh sửa: {article.title}</Heading>
      {error && <Alert variant="error" title="Lỗi" description={error} />}
      <ArticleForm
        defaultValues={formDefaults}
        categories={categories}
        onSubmit={handleSubmit}
        submitLabel="Cập nhật"
      />
    </div>
  );
}
