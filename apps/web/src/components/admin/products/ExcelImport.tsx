"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Upload, FileSpreadsheet } from "lucide-react";
import axiosClient from "@/server/axiosClient";

interface ImportResult {
  total: number;
  created: number;
  skipped: number;
  details: { slug: string; status: string; reason?: string }[];
}

export default function ExcelImport() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosClient.post("/admin/products/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setResult(res.data.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Import thất bại");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)]/30 transition-colors">
        <FileSpreadsheet size={24} className="text-green-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Import từ Excel (.xlsx)</p>
          <p className="text-xs text-[var(--color-text-muted)]">Cột bắt buộc: title, slug, variantName, sku, price</p>
        </div>
        <Button size="sm" variant="outline" leftIcon={<Upload size={14} />} loading={uploading} type="button">
          Chọn file
        </Button>
        <input type="file" accept=".xlsx,.xls" onChange={handleImport} disabled={uploading} className="hidden" />
      </label>

      {/* Result */}
      {result && (
        <Alert
          variant="success"
          title={`Import hoàn tất: ${result.created} tạo mới, ${result.skipped} bỏ qua`}
          description={result.details
            .filter((d) => d.status === "skipped")
            .map((d) => `${d.slug}: ${d.reason}`)
            .join("; ")}
        />
      )}

      {error && <Alert variant="error" title="Lỗi import" description={error} />}
    </div>
  );
}
