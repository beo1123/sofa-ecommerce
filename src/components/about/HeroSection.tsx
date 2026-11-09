import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { sofaImages } from "./images";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="p-4 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          <span className="inline-flex items-center rounded-full bg-[var(--color-bg-page)] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]">
            Về Sofa Phạm Gia
          </span>
          <Heading
            level={1}
            className="text-2xl sm:text-3xl lg:text-4xl text-[var(--color-text-default)] leading-tight">
            Sofa chuẩn phong cách – Nâng tầm không gian sống
          </Heading>

          <Text className="text-sm sm:text-base lg:text-lg text-[var(--color-text-muted)] leading-relaxed">
            Chúng tôi thiết kế sofa với triết lý tối giản, tinh tế và bền bỉ. Mỗi sản phẩm đều được hoàn thiện thủ công
            từ chất liệu cao cấp, mang lại sự êm ái và vẻ đẹp lâu dài cho ngôi nhà của bạn.
          </Text>

          {/* Sub Content */}
          <div className="space-y-3 rounded-2xl bg-[var(--color-bg-page)] p-4 sm:p-5 ring-1 ring-[var(--color-brand-50)]">
            <Text className="font-semibold text-[var(--color-text-default)]">Cam kết từ xưởng chế tác</Text>

            <ul className="space-y-2 text-sm sm:text-base text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2 w-2 bg-[var(--color-brand-400)] rounded-full shrink-0" />
                Chất liệu cao cấp – độ bền vượt trội theo thời gian.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2 w-2 bg-[var(--color-brand-400)] rounded-full shrink-0" />
                Thiết kế tối giản, phù hợp nhiều phong cách nội thất.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-2 h-2 w-2 bg-[var(--color-brand-400)] rounded-full shrink-0" />
                Sản xuất thủ công, hoàn thiện tỉ mỉ từng chi tiết.
              </li>
            </ul>
          </div>

          <div>
            <Link href="/san-pham" className="block w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto justify-center rounded-full bg-[var(--color-brand-400)] px-7 py-3.5 text-[var(--color-bg-page)] hover:bg-[var(--color-brand-300)]">
                Khám phá bộ sưu tập
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="lg:col-span-6">
          <SafeImage
            src={sofaImages.hero}
            alt="Luxury modern sofa"
            width={1920}
            height={1280}
            className="rounded-2xl sm:rounded-3xl ring-1 ring-[var(--color-brand-100)] shadow-lg object-cover w-full h-[240px] sm:h-[360px] lg:h-[460px]"
          />
        </div>
      </div>
    </section>
  );
}
