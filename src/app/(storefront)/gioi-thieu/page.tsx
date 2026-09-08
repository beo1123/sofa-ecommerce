import CraftsmanshipSection from "@/components/about/CraftsmanshipSection";
import CTASection from "@/components/about/CTASection";
import GallerySection from "@/components/about/GallerySection";
import HeroSection from "@/components/about/HeroSection";
import MaterialsSection from "@/components/about/MaterialsSection";
import WhyChooseSection from "@/components/about/WhyChooseSection";
import { generatePageMetadata } from "@/seo/generators/generateMetadata";

export const metadata = generatePageMetadata({
  title: "Giới thiệu",
  description:
    "Tìm hiểu về Sofa Phạm Gia, định hướng thương hiệu, chất lượng sản phẩm và giá trị nội thất cao cấp mà chúng tôi theo đuổi.",
  slug: "/gioi-thieu",
  type: "website",
  keywords: ["giới thiệu Sofa Phạm Gia", "nhà sản xuất sofa", "xưởng sofa TP.HCM"],
});

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-10">
        <HeroSection />
        <WhyChooseSection />
        <CraftsmanshipSection />
        <MaterialsSection />
        <GallerySection />
        <CTASection />
      </section>
    </main>
  );
}
