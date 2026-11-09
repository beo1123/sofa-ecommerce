import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import Text from "@/components/ui/Text";
import { formatVNDate } from "@/lib/helpers";
import { BlogArticle } from "@/types/blog/blog";

export default function BlogArticleCard({ item }: { item: BlogArticle }) {
  return (
    <Link
      href={`/bai-viet/${item.slug}`}
      className="group rounded-3xl bg-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-50)] hover:ring-[var(--color-brand-200)] shadow-[0_8px_30px_-12px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)] hover:-translate-y-1 transition-all duration-300 p-4 flex flex-col h-full">
      <div className="overflow-hidden rounded-2xl mb-4 bg-[var(--color-bg-muted)] aspect-[16/10] relative">
        <SafeImage
          src={item.thumbnail}
          alt={item.title}
          width={600}
          height={375}
          className="rounded-2xl object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col flex-1 px-1">
        <h3 className="text-lg font-bold text-[var(--color-text-default)] mb-2 line-clamp-2 group-hover:text-[var(--color-brand-400)] transition-colors">
          {item.title}
        </h3>

        <Text muted className="line-clamp-3 text-sm leading-relaxed mb-4">
          {item.excerpt}
        </Text>

        <div className="mt-auto pt-3 border-t border-[var(--color-brand-50)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span>{formatVNDate(item.publishedAt)}</span>
          <span className="font-semibold text-[var(--color-brand-400)] group-hover:translate-x-0.5 transition-transform">
            Đọc tiếp →
          </span>
        </div>
      </div>
    </Link>
  );
}
