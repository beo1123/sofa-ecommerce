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
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        {/* Category */}
        {article.category ? (
          <Link href={`/bai-viet?category=${article.category.slug}`} className="text-brand-600 hover:underline">
            {article.category.name}
          </Link>
        ) : (
          <Text muted>Không có danh mục</Text>
        )}

        <span>•</span>

        {/* Published date */}
        <Text muted>{article.publishedAt ? formatVNDate(article.publishedAt) : "—"}</Text>

        {/* Author */}
        {article.author && (
          <>
            <span>•</span>
            <Text muted>By {article.author.displayName}</Text>
          </>
        )}
      </div>
    </header>
  );
}
