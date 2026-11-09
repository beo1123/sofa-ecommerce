import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function CTASection() {
  const phone = process.env.NEXT_PUBLIC_PHONE_URL || "0932 111 620";

  return (
    <section className="py-8 sm:py-14 px-4 sm:px-8 text-center rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] ring-1 ring-[var(--color-brand-50)]">
      <div className="max-w-2xl mx-auto">
        <Heading level={2} className="text-xl sm:text-2xl lg:text-3xl text-[var(--color-text-default)]">
          Sẵn sàng nâng cấp phòng khách của bạn?
        </Heading>

        <Text muted className="mt-2.5 sm:mt-3 mb-6 sm:mb-8 max-w-2xl mx-auto font-medium text-sm sm:text-base">
          Gọi ngay để được tư vấn trực tiếp về mẫu mã, chất liệu và cách bố trí phù hợp không gian của bạn.
        </Text>

        <a
          href={`tel:${phone}`}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-[var(--color-brand-400)] px-6 py-3.5 sm:px-8 sm:py-4 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-wide text-[var(--color-bg-page)] hover:bg-[var(--color-brand-300)] hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm">
          {phone}
        </a>

        <p className="mt-4 sm:mt-5 text-xs sm:text-sm font-medium text-[var(--color-text-muted)]">
          Hỗ trợ nhanh mỗi ngày mọi khung giờ
        </p>
      </div>
    </section>
  );
}
