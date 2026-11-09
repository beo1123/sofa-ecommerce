import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SafeImage } from "../ui/SafeImage";
import Button from "../ui/Button";

export function BrandMessage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
      {/* IMAGE */}
      <div className="lg:col-span-6 relative aspect-[16/10] rounded-3xl overflow-hidden bg-[var(--color-brand-50)] ring-1 ring-[var(--color-brand-100)]">
        <SafeImage
          src="https://res.cloudinary.com/dujhkokxp/image/upload/v1780828200/photo-1684165610413-2401399e0e59_z45sm9.avif"
          alt="Hình ảnh thương hiệu Sofa Phạm Gia"
          width={800}
          height={600}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>

      {/* TEXT */}
      <div className="lg:col-span-6 flex flex-col justify-center gap-4">
        <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg-page)] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]">
          Triết lý chế tác
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-default)]">
          Nội thất sang trọng bắt đầu từ chất liệu cao cấp nhất
        </h3>

        <p className="text-base leading-relaxed text-[var(--color-text-muted)]">
          Triết lý của chúng tôi là kết hợp thiết kế tinh tế và vật liệu bền vững để tạo ra sản phẩm nội thất trường tồn
          qua nhiều thế hệ.
        </p>
        <div className="pt-1 sm:pt-2">
          <Link href="/gioi-thieu" className="block w-full sm:w-auto">
            <Button
              size="lg"
              rightIcon={<ArrowUpRight size={18} />}
              className="w-full sm:w-auto justify-center rounded-full bg-[var(--color-brand-400)] px-6 py-3 text-sm sm:text-base font-semibold text-[var(--color-bg-page)] hover:bg-[var(--color-brand-300)]">
              Tìm hiểu câu chuyện Phạm Gia
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
