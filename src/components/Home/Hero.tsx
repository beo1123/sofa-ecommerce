import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Button from "../ui/Button";
import { SafeImage } from "../ui/SafeImage";

const BANNER_URL =
  "https://res.cloudinary.com/dujhkokxp/image/upload/v1780828202/photo-1583847268964-b28dc8f51f92_yhftyj.avif";

export function Hero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
      {/* Left Editorial Column (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-center gap-4 sm:gap-5">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-bg-page)] px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]">
          <Sparkles size={13} className="shrink-0" />
          <span className="truncate">Sofa Phạm Gia • Thiết kế & Chế tác</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-text-default)] leading-[1.18]">
          Nội thất sang trọng cho không gian sống hiện đại
        </h1>

        <p className="max-w-2xl text-sm sm:text-lg font-medium leading-relaxed text-[var(--color-text-muted)]">
          Khám phá những thiết kế sofa tinh tế được chế tác từ vật liệu tuyển chọn và tay nghề thủ công tỉ mỉ, tùy chỉnh
          theo đúng kích thước ngôi nhà bạn.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
          <Link href="/san-pham" className="w-full sm:w-auto">
            <Button
              size="lg"
              fullWidth
              rightIcon={<ArrowUpRight size={18} />}
              className="rounded-full bg-[var(--color-brand-400)] px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-[var(--color-bg-page)] hover:bg-[var(--color-brand-300)] shadow-sm">
              Khám phá Bộ sưu tập
            </Button>
          </Link>
          <Link href="/lien-he" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              className="rounded-full border-[var(--color-brand-200)] bg-[var(--color-bg-page)] px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)]">
              Đặt thiết kế riêng
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Visual Bento Card (5 cols) */}
      <div className="lg:col-span-5 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[var(--color-brand-50)] ring-1 ring-[var(--color-brand-100)] shadow-[0_16px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_22%,transparent)]">
        <SafeImage
          src={BANNER_URL}
          alt="Không gian phòng khách sang trọng với Sofa Phạm Gia"
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover object-center transition-transform duration-700 hover:scale-105"
          priority
        />
      </div>
    </div>
  );
}
