"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import { extractImageUrlsFromHtml, getApiErrorMessage } from "@/lib/articles/adminArticleUtils";

interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export function useArticleContentImageUpload() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await axiosClient.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data?.data as UploadResponse;
    },
  });

  const uploadImage = async (file: File, folder: string) => {
    const uploaded = await uploadMutation.mutateAsync({ file, folder });
    setUploadedUrls((current) => (current.includes(uploaded.url) ? current : [...current, uploaded.url]));
    return uploaded.url;
  };

  const deleteMutation = useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      await axiosClient.delete("/admin/upload", {
        data: { url },
      });
    },
  });

  const removeImage = async (url: string) => {
    await deleteMutation.mutateAsync({ url });
    setUploadedUrls((current) => current.filter((item) => item !== url));
  };

  const cleanupUnusedImages = async (currentContent: string, initialContent?: string) => {
    const currentUrls = new Set(extractImageUrlsFromHtml(currentContent));
    const initialUrls = extractImageUrlsFromHtml(initialContent);
    const candidateUrls = [...new Set([...initialUrls, ...uploadedUrls])];
    const removedUrls = candidateUrls.filter((url) => !currentUrls.has(url));

    if (!removedUrls.length) return;

    await Promise.allSettled(
      removedUrls.map(async (url) => {
        await deleteMutation.mutateAsync({ url });
      })
    );

    setUploadedUrls((current) => current.filter((url) => currentUrls.has(url)));
  };

  const error = useMemo(() => {
    return (
      (uploadMutation.error && getApiErrorMessage(uploadMutation.error, "Tải ảnh nội dung thất bại")) ||
      (deleteMutation.error && getApiErrorMessage(deleteMutation.error, "Xóa ảnh nội dung thất bại")) ||
      null
    );
  }, [deleteMutation.error, uploadMutation.error]);

  return {
    uploadImage,
    removeImage,
    cleanupUnusedImages,
    error,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
