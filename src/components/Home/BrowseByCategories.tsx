import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Link from "next/link";
import { CategoryService } from "@/services/category.service";
import { prisma } from "@/lib/prisma";

const categoryService = new CategoryService(prisma);

export default async function BrowseByCategories() {
  const { data: categories } = await categoryService.getAll(1, 100, 0);

  return (
    <Container>
      <Heading level={2} className="mb-lg text-[var(--color-brand-400)] text-center">
        Khám phá theo Danh Mục
      </Heading>

      {/* mobile: 2 cột | sm: 3 cột | lg: 4 cột */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/san-pham?category=${cat.slug}&page=1`}
            className="group rounded-2xl overflow-hidden shadow-sm ring-1 ring-[var(--color-brand-100)] hover:ring-[var(--color-brand-300)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block">
            {/* aspect-[4/5] giữ tỉ lệ portrait vừa phải, hình hiển thị full không bị crop quá */}
            <div className="relative aspect-[4/5] w-full bg-[var(--color-brand-50)]">
              {/* Hình nền */}
              {cat.image ? (
                <span
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
              ) : (
                <span className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-100)] to-[var(--color-brand-200)]" />
              )}

              {/* Overlay sáng nhẹ — gradient từ trong suốt xuống trắng mờ ở dưới */}
              <span className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent group-hover:from-white/20 transition-colors duration-300" />

              {/* Tên danh mục — căn chính giữa */}
              <span className="absolute inset-0 flex items-end justify-center p-3">
                <span className="bg-white/85 backdrop-blur-sm rounded-xl px-3 py-1.5 text-default font-bold text-sm sm:text-base text-center leading-snug tracking-wide shadow-md group-hover:scale-105 group-hover:bg-white group-hover:text-[var(--color-brand-400)] transition-all duration-300">
                  {cat.name}
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
