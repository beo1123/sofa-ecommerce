"use client";

import React, { useEffect, useRef, useState } from "react";
import { mergeAttributes, Node } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { ImageMinus, ImagePlus, Loader2 } from "lucide-react";

const InlineImage = Node.create({
  name: "inlineImage",
  group: "block",
  inline: false,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      title: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        class: "my-4 h-auto max-w-full rounded-lg border border-gray-200",
      }),
    ];
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  onImageUpload?: (file: File) => Promise<string>;
  imageUploading?: boolean;
  onImageRemove?: (url: string) => Promise<void>;
  imageRemoving?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung chi tiết...",
  minHeight = 220,
  onImageUpload,
  imageUploading = false,
  onImageRemove,
  imageRemoving = false,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      InlineImage,
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

  useEffect(() => {
    if (!editor) return;

    const updateSelectedImage = () => {
      const selection = editor.state.selection;
      if (selection instanceof NodeSelection && selection.node.type.name === "inlineImage") {
        setSelectedImageUrl((selection.node.attrs.src as string) || null);
        return;
      }
      setSelectedImageUrl(null);
    };

    updateSelectedImage();
    editor.on("selectionUpdate", updateSelectedImage);
    editor.on("update", updateSelectedImage);

    return () => {
      editor.off("selectionUpdate", updateSelectedImage);
      editor.off("update", updateSelectedImage);
    };
  }, [editor]);

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

  const handleSelectImage = () => {
    if (!onImageUpload || imageUploading) return;
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor || !onImageUpload) return;

    try {
      const imageUrl = await onImageUpload(file);
      editor
        .chain()
        .focus()
        .insertContent({ type: "inlineImage", attrs: { src: imageUrl, alt: file.name } })
        .run();
      editor.chain().focus().createParagraphNear().run();
    } finally {
      e.target.value = "";
    }
  };

  const handleRemoveSelectedImage = async () => {
    if (!editor || !selectedImageUrl || !onImageRemove) return;

    await onImageRemove(selectedImageUrl);
    editor.chain().focus().deleteSelection().run();
    setSelectedImageUrl(null);
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
        {onImageUpload && (
          <>
            <button
              type="button"
              onClick={handleSelectImage}
              disabled={imageUploading}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors disabled:cursor-not-allowed disabled:opacity-60">
              {imageUploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              Ảnh
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => void handleImageFileChange(e)}
              className="hidden"
            />
          </>
        )}
        {onImageRemove && (
          <button
            type="button"
            onClick={() => void handleRemoveSelectedImage()}
            disabled={!selectedImageUrl || imageRemoving}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[var(--color-brand-100)] rounded bg-white hover:bg-[var(--color-brand-50)] transition-colors disabled:cursor-not-allowed disabled:opacity-60">
            {imageRemoving ? <Loader2 size={14} className="animate-spin" /> : <ImageMinus size={14} />}
            Xóa ảnh
          </button>
        )}
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
