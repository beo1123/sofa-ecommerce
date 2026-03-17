"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosClient
      .get("/article-categories")
      .then((res) => setCategories(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      await axiosClient.post("/admin/articles", data);
      router.push("/admin/articles");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Tạo bài viết thất bại");
    }
  };

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
      <ArticleForm categories={categories} onSubmit={handleSubmit} submitLabel="Tạo bài viết" />
    </div>
  );
}
