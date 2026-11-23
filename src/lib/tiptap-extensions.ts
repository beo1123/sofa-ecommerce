import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";

export function createTiptapRenderExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      },
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
  ];
}

export function renderArticleBodyHtml(bodyJson: unknown, fallbackHtml: string): string {
  if (
    bodyJson &&
    typeof bodyJson === "object" &&
    !Array.isArray(bodyJson) &&
    (bodyJson as { type?: unknown }).type === "doc"
  ) {
    try {
      return generateHTML(bodyJson as JSONContent, createTiptapRenderExtensions());
    } catch {
      return fallbackHtml;
    }
  }
  return fallbackHtml;
}
