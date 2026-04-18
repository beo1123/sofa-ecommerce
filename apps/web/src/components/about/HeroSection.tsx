import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { sofaImages } from "./images";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-5 rounded-2xl  bg-[var(--color-bg-muted)]">
      <Container className="grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT CONTENT */}
        <div className=" px-5 space-y-6">
          <Heading level={1} className="text-[var(--color-brand-400)] leading-tight text-center">
            Sofa chuẩn phong cách – Nâng tầm không gian sống
          </Heading>

          <Text className="text-lg text-[var(--color-text-muted)]">
            Chúng tôi thiết kế sofa với triết lý tối giản, tinh tế và bền bỉ. Mỗi sản phẩm đều được hoàn thiện thủ công
            từ chất liệu cao cấp, mang lại sự êm ái và vẻ đẹp lâu dài cho ngôi nhà của bạn.
          </Text>

          {/* Sub Content */}
          <div className="space-y-3">
            <Text className="font-medium text-[var(--color-text-strong)]">Vì sao khách hàng chọn chúng tôi?</Text>

            <ul className="space-y-2 text-[var(--color-text-muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-2.5 h-2 w-2 bg-[var(--color-brand-400)] rounded-full" />
                Chất liệu cao cấp – độ bền vượt trội theo thời gian.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2.5 h-2 w-2 bg-[var(--color-brand-400)] rounded-full" />
                Thiết kế tối giản, phù hợp nhiều phong cách nội thất.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2.5 h-2 w-2 bg-[var(--color-brand-400)] rounded-full" />
                Sản xuất thủ công, hoàn thiện tỉ mỉ từng chi tiết.
              </li>
            </ul>
          </div>

          <Link href="/san-pham">
            <Button size="lg" className="mt-4">
              Khám phá bộ sưu tập
            </Button>
          </Link>
        </div>

        {/* RIGHT IMAGE */}
        <div className="px-5">
          <SafeImage
            src={sofaImages.hero}
            alt="Luxury modern sofa"
            width={1920}
            height={1280}
            className="
            rounded-2xl shadow-lg object-cover w-full
            h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px]
          "
          />
        </div>
      </Container>
    </section>
  );
}
