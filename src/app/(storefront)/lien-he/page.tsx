import ContactForm from "@/components/contact/ContactForm";
import ContactInfoCard from "@/components/contact/ContactInfoCard";
import ContactMap from "@/components/contact/ContactMap";
import Divider from "@/components/ui/Divider";
import Grid from "@/components/ui/Grid";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import { generatePageMetadata } from "@/seo/generators/generateMetadata";

export const metadata = generatePageMetadata({
  title: "Liên hệ",
  description:
    "Liên hệ Sofa Phạm Gia để được tư vấn sofa, nội thất cao cấp, giao hàng, lắp đặt và bảo hành nhanh chóng.",
  slug: "/lien-he",
  type: "website",
  keywords: ["liên hệ sofa", "tư vấn sofa", "đặt sofa theo yêu cầu", "Sofa Phạm Gia"],
});

export default function ContactPage() {
  return (
    <div className="py-4 sm:py-8 lg:py-12 space-y-6 sm:space-y-10 text-[var(--color-text-default)]">
      <div className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] p-5 sm:p-8 lg:p-10 text-center ring-1 ring-[var(--color-brand-50)] space-y-2.5 sm:space-y-3">
        <span className="inline-flex items-center rounded-full bg-[var(--color-bg-page)] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]">
          Hỗ trợ & Tư vấn 24/7
        </span>
        <Heading level={1} className="text-2xl sm:text-3xl lg:text-4xl">
          Liên hệ Sofa Phạm Gia
        </Heading>
        <Text muted className="max-w-2xl mx-auto text-sm sm:text-base">
          Đội ngũ của Sofa Phạm Gia luôn sẵn sàng hỗ trợ bạn về tư vấn thiết kế riêng, mẫu chất liệu, giao hàng, lắp đặt
          và bảo hành.
        </Text>
      </div>

      <Grid cols={1} responsive={{ lg: 2 }} gap="lg">
        <div className="flex flex-col gap-5 sm:gap-6 min-h-full">
          <ContactInfoCard />
          <div className="flex-1 min-h-[260px]">
            <ContactMap address="C12/17, Ấp 3, Bình Chánh, TPHCM" />
          </div>
        </div>
        <div>
          <ContactForm />
        </div>
      </Grid>

      <Divider />
    </div>
  );
}
