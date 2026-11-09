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
    <div className="min-h-screen py-4 sm:py-8 lg:py-10 space-y-8 sm:space-y-12 lg:space-y-16">
      <HeroSection />
      <WhyChooseSection />
      <CraftsmanshipSection />
      <MaterialsSection />
      <GallerySection />
      <CTASection />
    </div>
  );
}
