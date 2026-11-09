import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Badge from "@/components/ui/Badge";

export default function BlogHeader() {
  return (
    <section className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] py-8 sm:py-12 lg:py-16 px-4 sm:px-8 ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)]">
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
        <Badge
          variant="default"
          className="px-3.5 py-1 text-xs font-semibold uppercase tracking-widest rounded-full mx-auto">
          Cẩm nang & Cảm hứng Nội thất
        </Badge>
        <Heading
          level={1}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-text-default)]">
          Khám Phá Kiến Thức Nội Thất & Mẹo Mua Sắm
        </Heading>
        <Text muted className="text-sm sm:text-base lg:text-lg leading-relaxed mx-auto max-w-2xl">
          Chia sẻ xu hướng thiết kế mới nhất, kinh nghiệm chọn sofa và góc nhìn từ đội ngũ chế tác — giúp bạn tối ưu
          không gian sống.
        </Text>
      </div>
    </section>
  );
}
