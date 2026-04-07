"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "@/server/axiosClient";
import { getApiErrorMessage } from "@/lib/articles/adminArticleUtils";

interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export function useArticleThumbnail(initialThumbnail?: string | null) {
  const [thumbnail, setThumbnail] = useState(initialThumbnail ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setThumbnail(initialThumbnail ?? "");
  }, [initialThumbnail]);

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

  const deleteMutation = useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      await axiosClient.delete("/admin/upload", {
        data: { url },
      });
    },
  });

  const uploadThumbnail = async (file: File, folder: string) => {
    setError(null);
    const previousThumbnail = thumbnail;

    try {
      const uploaded = await uploadMutation.mutateAsync({ file, folder });
      setThumbnail(uploaded.url);

      if (previousThumbnail && previousThumbnail !== uploaded.url) {
        try {
          await deleteMutation.mutateAsync({ url: previousThumbnail });
        } catch (err) {
          setError(getApiErrorMessage(err, "Đã thay ảnh mới nhưng không thể xóa ảnh cũ trên Cloudinary"));
        }
      }
    } catch (err) {
      const message = getApiErrorMessage(err, "Upload ảnh thất bại");
      setError(message);
      throw err;
    }
  };

  const removeThumbnail = async () => {
    if (!thumbnail) return;

    setError(null);
    const currentThumbnail = thumbnail;

    try {
      await deleteMutation.mutateAsync({ url: currentThumbnail });
      setThumbnail("");
    } catch (err) {
      const message = getApiErrorMessage(err, "Xóa ảnh thất bại");
      setError(message);
      throw err;
    }
  };

  return {
    thumbnail,
    uploadError: error,
    uploadThumbnail,
    removeThumbnail,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
