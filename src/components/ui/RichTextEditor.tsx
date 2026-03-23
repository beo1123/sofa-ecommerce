"use client";

import React, { useEffect } from "react";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung chi tiết...",
  minHeight = 220,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "tiptap-editor-content focus:outline-none px-3 py-3",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const nextHtml = value || "";
    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL", previousUrl || "https://");

    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const trimmedUrl = url.trim();
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: trimmedUrl }).run();
      return;
    }

    editor
      .chain()
      .focus()
      .insertContent(`<a href="${trimmedUrl}" target="_blank" rel="noopener noreferrer">${trimmedUrl}</a>`)
      .run();
  };

  if (!editor) {
    return (
      <div className="rounded-md border border-[var(--color-brand-100)] bg-white p-3 text-sm text-[var(--color-text-muted)]">
        Đang tải trình soạn thảo...
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--color-brand-100)] bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-brand-100)] px-2 py-2 bg-[var(--color-brand-50)]/40">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          P
        </button>
        <button
          type="button"
          onClick={setLink}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          Left
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          Center
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          Right
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors">
          Clear
        </button>
      </div>

      <div className="relative">
        {!value?.replace(/<[^>]+>/g, "").trim() && (
          <span className="absolute top-3 left-3 text-sm text-[var(--color-text-muted)] pointer-events-none">
            {placeholder}
          </span>
        )}
        <EditorContent editor={editor} style={{ minHeight }} />
      </div>
    </div>
  );
}
