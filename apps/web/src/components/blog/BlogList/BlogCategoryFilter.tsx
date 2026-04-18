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
  const base = "px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap text-center";

  const active = "bg-[var(--color-brand-400)] border-[var(--color-brand-400)] text-white shadow-sm";

  const inactive = "bg-white text-gray-700 border-gray-300 hover:bg-gray-100";

  return (
    <div className="grid gap-3 mb-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <Link href="/bai-viet" className={`${base} ${!selected ? active : inactive}`}>
        Tất cả
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/bai-viet?category=${cat.slug}`}
          className={`${base} ${selected === cat.slug ? active : inactive} truncate max-w-[250px]`}>
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
