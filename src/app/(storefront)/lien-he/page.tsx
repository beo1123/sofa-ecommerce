import ContactForm from "@/components/contact/ContactForm";
import ContactInfoCard from "@/components/contact/ContactInfoCard";
import ContactMap from "@/components/contact/ContactMap";
import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Grid from "@/components/ui/Grid";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export const metadata = {
  title: "Liên Hệ – Contact",
  description: "Liên hệ Sofa Phạm Gia để biết thêm thông tin chi tiết",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen py-12 bg-[var(--color-bg-muted)] text-[var(--color-text-default)]">
      <Container className="space-y-8 ">
        <div className="text-center max-w-2xl mx-auto">
          <Heading level={1}>Liên hệ Sofa Phạm Gia</Heading>
          <Text muted>
            Đội ngũ của Sofa Phạm Gia luôn sẵn sàng hỗ trợ bạn về tư vấn sản phẩm, giao hàng, lắp đặt và bảo hành.
          </Text>
        </div>

        <Grid cols={1} responsive={{ md: 2 }} gap="lg">
          <div className="flex flex-col gap-6 min-h-full px-5">
            <ContactInfoCard />
            <div className="flex-1">
              <ContactMap address="C12/17, Ấp 3, Bình Chánh, TPHCM" />
            </div>
          </div>
          <div className="px-5">
            <ContactForm />
          </div>
        </Grid>

        <Divider />
      </Container>
    </main>
  );
}
