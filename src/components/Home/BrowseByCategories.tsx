import Heading from "@/components/ui/Heading";
import Link from "next/link";
import { CategoryService } from "@/services/category.service";
import { prisma } from "@/lib/prisma";
import { SafeImage } from "@/components/ui/SafeImage";

const categoryService = new CategoryService(prisma);

export default async function BrowseByCategories() {
  const { data: categories } = await categoryService.getAll(1, 100, 0);

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)] mb-2">
            Danh mục sản phẩm
          </span>
          <Heading level={2} className="text-[var(--color-text-default)]">
            Khám phá theo Danh Mục
          </Heading>
        </div>
        <Link
          href="/san-pham"
          className="text-xs sm:text-sm font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors">
          Xem tất cả danh mục →
        </Link>
      </div>

      {/* mobile: 2 cột | md: 4 cột */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/san-pham?category=${encodeURIComponent(cat.slug)}`}
            className="group relative aspect-[4/3] sm:aspect-[5/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-[var(--color-brand-50)] ring-1 ring-[var(--color-brand-100)] hover:ring-[var(--color-brand-300)] shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--color-brand-400)_16%,transparent)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-end">
            {cat.image ? (
              <SafeImage
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <span className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)]" />
            )}

            {/* Lớp phủ tương phản ấm giúp ảnh nền sáng vẫn nổi bật rõ tên danh mục */}
            <span className="absolute inset-0 bg-gradient-to-t from-[var(--color-text-default)]/80 via-[var(--color-text-default)]/20 to-transparent group-hover:from-[var(--color-brand-400)]/85 transition-colors duration-300" />

            <div className="relative z-10 p-3 sm:p-5 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm sm:text-base lg:text-lg font-bold text-[var(--color-bg-page)] leading-snug truncate drop-shadow-xs">
                  {cat.name}
                </p>
                <p className="text-[11px] sm:text-xs font-medium text-[var(--color-brand-50)] mt-0.5 whitespace-nowrap">
                  Khám phá →
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
