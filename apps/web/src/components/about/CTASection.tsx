import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function CTASection() {
  return (
    <section className="py-20 text-center mt-10 rounded-2xl bg-[var(--color-bg-muted)]">
      <Container>
        <Heading level={2}>Sẵn sàng nâng cấp phòng khách của bạn?</Heading>

        <Text muted className="mt-3 mb-8 mx-auto">
          Gọi ngay để được tư vấn trực tiếp về mẫu mã, chất liệu và cách bố trí phù hợp không gian của bạn.
        </Text>

        <a
          href={`tel:${process.env.NEXT_PUBLIC_PHONE_URL}`}
          className="
            inline-block 
            text-3xl sm:text-4xl font-extrabold tracking-wide 
            text-[var(--color-primary)] 
            hover:scale-105 active:scale-95
            transition-transform duration-300
          ">
          {process.env.NEXT_PUBLIC_PHONE_URL}
        </a>

        <p className="mt-5 text-sm text-[var(--color-text-muted)]">Hỗ trợ nhanh mỗi ngày mọi khung giờ</p>
      </Container>
    </section>
  );
}
