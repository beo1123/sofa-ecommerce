"use client";

import React from "react";

type Props = {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
};

/**
 * Simple Rich Text Editor placeholder.
 * For full functionality, install tiptap dependencies:
 * pnpm --filter @repo/admin add @tiptap/core @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-underline @tiptap/extension-text-align
 */
export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  return (
    <div className="space-y-2">
      <textarea
        className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:border-transparent resize-y"
        placeholder={placeholder ?? "Nhập nội dung..."}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
      />
      <p className="text-xs text-[var(--color-text-muted)]">
        Hỗ trợ HTML cơ bản. Để có trình soạn thảo đầy đủ, cần cài đặt thêm tiptap.
      </p>
    </div>
  );
}
