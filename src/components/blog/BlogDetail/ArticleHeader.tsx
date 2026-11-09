// FILE: components/blog/BlogDetail/ArticleHeader.tsx

import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Link from "next/link";
import { formatVNDate } from "@/lib/helpers";
import { SafeImage } from "@/components/ui/SafeImage";
import { blogDetail } from "@/types/blog/blogDetail";

export default function ArticleHeader({ article }: { article: blogDetail }) {
  return (
    <header className="space-y-4">
      {/* Thumbnail */}
      <div className="overflow-hidden rounded-2xl">
        <SafeImage
          src={article.thumbnail ?? "/placeholder.jpg"}
          alt={article.title}
          width={1200}
          height={675}
          className="w-full h-[280px] md:h-[420px] object-cover rounded-2xl"
        />
      </div>

      {/* Title */}
      <Heading level={1} className="leading-tight text-2xl md:text-3xl">
        {article.title}
      </Heading>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)] pb-4 border-b border-[var(--color-brand-50)]">
        {/* Category */}
        {article.category ? (
          <Link
            href={`/bai-viet?category=${article.category.slug}`}
            className="rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-400)] hover:bg-[var(--color-brand-100)] transition-colors">
            {article.category.name}
          </Link>
        ) : (
          <Text muted size="sm">
            Chuyên mục chung
          </Text>
        )}

        <span>•</span>

        {/* Published date */}
        <Text muted size="sm">
          {article.publishedAt ? formatVNDate(article.publishedAt) : "—"}
        </Text>

        {/* Author */}
        {article.author && (
          <>
            <span>•</span>
            <Text muted size="sm">
              Tác giả: {article.author.displayName}
            </Text>
          </>
        )}
      </div>
    </header>
  );
}
