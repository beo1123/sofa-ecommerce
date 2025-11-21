import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Badge from "@/components/ui/Badge";

export default function BlogHeader() {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-50)]/40 to-transparent pointer-events-none" />
      <Container className="text-center max-w-3xl mx-auto relative z-10 space-y-6">
        <Badge variant="warning" className="px-3 py-1 text-sm mx-auto">
          Blog & Tin Tức
        </Badge>
        <Heading
          level={1}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-default)]">
          Khám Phá Kiến Thức Nội Thất & Mẹo Mua Sắm
        </Heading>
        <Text muted className="text-lg md:text-xl leading-relaxed mx-auto max-w-2xl">
          Chia sẻ xu hướng thiết kế mới nhất, kinh nghiệm chọn nội thất, và góc nhìn từ các chuyên gia — giúp bạn tối ưu
          không gian sống.
        </Text>
      </Container>
    </section>
  );
}
