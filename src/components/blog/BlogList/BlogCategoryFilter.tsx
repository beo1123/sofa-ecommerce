"use client";

import { BlogArticleCategory } from "@/types/blog/blog";
import Link from "next/link";

export default function BlogCategoryFilter({
  categories,
  selected,
}: {
  categories: BlogArticleCategory[];
  selected?: string;
}) {
  const base =
    "px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap text-center shrink-0";

  const active =
    "bg-[var(--color-brand-400)] text-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-400)] shadow-sm";

  const inactive =
    "bg-[var(--color-bg-page)] text-[var(--color-text-default)] ring-1 ring-[var(--color-brand-100)] hover:bg-[var(--color-bg-muted)] hover:ring-[var(--color-brand-300)]";

  return (
    <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-6 sm:mb-8">
      <Link href="/bai-viet" className={`${base} ${!selected ? active : inactive}`}>
        Tất cả bài viết
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/bai-viet?category=${cat.slug}`}
          className={`${base} ${selected === cat.slug ? active : inactive} truncate max-w-[260px]`}>
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
