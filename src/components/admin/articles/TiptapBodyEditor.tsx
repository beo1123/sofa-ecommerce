"use client";

import React, { useRef, useState } from "react";
import clsx from "clsx";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconBlockquote,
  IconLink,
  IconLinkOff,
  IconPhotoPlus,
  IconClearFormatting,
  IconCode,
  IconEye,
  IconLoader2,
} from "@tabler/icons-react";
import { createTiptapRenderExtensions } from "@/lib/tiptap-extensions";

interface TiptapBodyEditorProps {
  initialBodyJson?: Record<string, unknown> | null;
  initialHtml?: string;
  folder?: string;
  placeholder?: string;
  onChange: (payload: { bodyJson: Record<string, unknown>; html: string }) => void;
}

export default function TiptapBodyEditor({
  initialBodyJson = null,
  initialHtml = "",
  folder = "articles",
  placeholder = "Viết nội dung bài viết tư vấn sofa, kinh nghiệm chọn chất liệu, bảo quản...",
  onChange,
}: TiptapBodyEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(initialHtml || "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [...createTiptapRenderExtensions(), Placeholder.configure({ placeholder })],
    content:
      initialBodyJson && typeof initialBodyJson === "object" && (initialBodyJson as { type?: unknown }).type === "doc"
        ? (initialBodyJson as JSONContent)
        : initialHtml || "",
    editorProps: {
      attributes: {
        class:
          "tiptap-editor-content px-4 py-3 text-sm focus:outline-none [&_h1]:mb-3 [&_h1]:mt-2 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:leading-snug [&_h1]:text-brand-400 [&_h2]:text-brand-400 [&_h3]:text-brand-400 [&_strong]:font-semibold [&_li>p]:my-0.5 [&_blockquote]:my-3 [&_blockquote]:rounded-r-[8px] [&_blockquote]:border-l-4 [&_blockquote]:border-brand-300 [&_blockquote]:bg-bg-muted [&_blockquote]:px-3.5 [&_blockquote]:py-2 [&_blockquote]:italic [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-[10px] [&_img]:border [&_img]:border-brand-100",
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      setSourceHtml(html);
      onChange({
        bodyJson: current.getJSON() as Record<string, unknown>,
        html,
      });
    },
  });

  const handleToggleSourceMode = () => {
    if (!editor) return;
    if (!sourceMode) {
      setSourceHtml(editor.getHTML());
      setSourceMode(true);
      return;
    }

    editor.commands.setContent(sourceHtml || "", { emitUpdate: false });
    onChange({
      bodyJson: editor.getJSON() as Record<string, unknown>,
      html: editor.getHTML(),
    });
    setSourceMode(false);
  };

  const handleSourceHtmlChange = (nextHtml: string) => {
    setSourceHtml(nextHtml);
    if (!editor) return;
    editor.commands.setContent(nextHtml || "", { emitUpdate: false });
    onChange({
      bodyJson: editor.getJSON() as Record<string, unknown>,
      html: nextHtml,
    });
  };

  const handleToggleLink = () => {
    if (!editor) return;
    const previousUrl = (editor.getAttributes("link").href as string) || "";
    const url = window.prompt("Nhập đường dẫn URL (để trống để gỡ link)", previousUrl || "https://");
    if (url === null) return;

    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const { from, to } = editor.state.selection;
    if (from === to) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${trimmed}" target="_blank" rel="noopener noreferrer">${trimmed}</a>`)
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploadError(null);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json?.data?.url) {
        throw new Error(json?.error?.message ?? "Upload ảnh thất bại");
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: json.data.url as string,
          alt: file.name.replace(/\.[^/.]+$/, ""),
        })
        .run();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload ảnh thất bại");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const toolbarBtnClass = (active: boolean) =>
    clsx(
      "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-[8px] border px-2 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50",
      active
        ? "border-brand-400 bg-brand-400 text-white"
        : "border-brand-100 bg-bg-page text-brand-400 hover:border-brand-200 hover:bg-brand-50"
    );

  if (!editor) {
    return (
      <div className="rounded-[12px] border border-brand-100 bg-bg-muted px-4 py-10 text-center text-xs text-text-muted">
        Đang khởi tạo trình soạn thảo Tiptap...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-brand-100 bg-bg-page focus-within:border-brand-300 focus-within:ring-[3px] focus-within:ring-brand-50">
      {/* Toolbar: H1 / H2 / H3 / Bold / Italic / Underline / Bullet / Ordered / Blockquote / Link / Image / Clear / HTML */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-brand-100 bg-bg-muted px-3 py-2">
        <button
          type="button"
          title="Tiêu đề H1"
          aria-label="Tiêu đề H1"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={clsx(
            toolbarBtnClass(!sourceMode && editor.isActive("heading", { level: 1 })),
            sourceMode && "opacity-50"
          )}>
          <IconH1 size={16} stroke={1.75} />
        </button>

        <button
          type="button"
          title="Tiêu đề H2"
          aria-label="Tiêu đề H2"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={clsx(
            toolbarBtnClass(!sourceMode && editor.isActive("heading", { level: 2 })),
            sourceMode && "opacity-50"
          )}>
          <IconH2 size={16} stroke={1.75} />
        </button>

        <button
          type="button"
          title="Tiêu đề H3"
          aria-label="Tiêu đề H3"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={clsx(
            toolbarBtnClass(!sourceMode && editor.isActive("heading", { level: 3 })),
            sourceMode && "opacity-50"
          )}>
          <IconH3 size={16} stroke={1.75} />
        </button>

        <span className="mx-0.5 h-5 w-px bg-brand-100" aria-hidden="true" />

        <button
          type="button"
          title="In đậm"
          aria-label="In đậm"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={clsx(toolbarBtnClass(!sourceMode && editor.isActive("bold")), sourceMode && "opacity-50")}>
          <IconBold size={16} stroke={1.75} />
        </button>

        <button
          type="button"
          title="In nghiêng"
          aria-label="In nghiêng"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={clsx(toolbarBtnClass(!sourceMode && editor.isActive("italic")), sourceMode && "opacity-50")}>
          <IconItalic size={16} stroke={1.75} />
        </button>

        <button
          type="button"
          title="Gạch chân"
          aria-label="Gạch chân"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={clsx(toolbarBtnClass(!sourceMode && editor.isActive("underline")), sourceMode && "opacity-50")}>
          <IconUnderline size={16} stroke={1.75} />
        </button>

        <span className="mx-0.5 h-5 w-px bg-brand-100" aria-hidden="true" />

        <button
          type="button"
          title="Danh sách chấm tròn"
          aria-label="Danh sách chấm tròn"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={clsx(toolbarBtnClass(!sourceMode && editor.isActive("bulletList")), sourceMode && "opacity-50")}>
          <IconList size={16} stroke={1.75} />
        </button>

        <button
          type="button"
          title="Danh sách đánh số"
          aria-label="Danh sách đánh số"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={clsx(toolbarBtnClass(!sourceMode && editor.isActive("orderedList")), sourceMode && "opacity-50")}>
          <IconListNumbers size={16} stroke={1.75} />
        </button>

        <button
          type="button"
          title="Trích dẫn"
          aria-label="Trích dẫn"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={clsx(toolbarBtnClass(!sourceMode && editor.isActive("blockquote")), sourceMode && "opacity-50")}>
          <IconBlockquote size={16} stroke={1.75} />
        </button>

        <span className="mx-0.5 h-5 w-px bg-brand-100" aria-hidden="true" />

        <button
          type="button"
          title="Chèn / sửa liên kết"
          aria-label="Chèn liên kết"
          disabled={sourceMode}
          onClick={handleToggleLink}
          className={clsx(toolbarBtnClass(!sourceMode && editor.isActive("link")), sourceMode && "opacity-50")}>
          <IconLink size={16} stroke={1.75} />
        </button>

        {!sourceMode && editor.isActive("link") && (
          <button
            type="button"
            title="Gỡ liên kết"
            aria-label="Gỡ liên kết"
            onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
            className={toolbarBtnClass(false)}>
            <IconLinkOff size={16} stroke={1.75} />
          </button>
        )}

        <button
          type="button"
          title="Tải ảnh chèn vào bài"
          aria-label="Chèn ảnh"
          disabled={uploadingImage || sourceMode}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(toolbarBtnClass(false), sourceMode && "opacity-50")}>
          {uploadingImage ? (
            <IconLoader2 size={16} stroke={1.75} className="animate-spin" />
          ) : (
            <IconPhotoPlus size={16} stroke={1.75} />
          )}
          <span className="hidden sm:inline">Ảnh</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleImageUpload}
          className="hidden"
        />

        <span className="mx-0.5 h-5 w-px bg-brand-100" aria-hidden="true" />

        <button
          type="button"
          title="Xóa định dạng"
          aria-label="Xóa định dạng"
          disabled={sourceMode}
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className={clsx(toolbarBtnClass(false), sourceMode && "opacity-50")}>
          <IconClearFormatting size={16} stroke={1.75} />
        </button>

        <button
          type="button"
          title={sourceMode ? "Chuyển về chế độ xem trực quan" : "Chỉnh sửa mã HTML trực tiếp"}
          aria-label={sourceMode ? "Chế độ trực quan" : "Chế độ mã HTML"}
          onClick={handleToggleSourceMode}
          className={clsx("ml-auto", toolbarBtnClass(sourceMode))}>
          {sourceMode ? <IconEye size={16} stroke={1.75} /> : <IconCode size={16} stroke={1.75} />}
          <span>{sourceMode ? "Trực quan" : "HTML"}</span>
        </button>
      </div>

      {uploadError && (
        <div className="border-b border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">{uploadError}</div>
      )}

      {/* Tiptap content container or raw HTML source editor */}
      {sourceMode ? (
        <textarea
          rows={12}
          value={sourceHtml}
          onChange={(e) => handleSourceHtmlChange(e.target.value)}
          placeholder="<h1>Tiêu đề...</h1><p>Nội dung mô tả...</p>"
          className="block w-full bg-bg-page px-4 py-3 font-mono text-xs leading-relaxed text-text-default focus:outline-none"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
