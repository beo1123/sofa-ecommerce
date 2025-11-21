import CraftsmanshipSection from "@/components/about/CraftsmanshipSection";
import CTASection from "@/components/about/CTASection";
import GallerySection from "@/components/about/GallerySection";
import HeroSection from "@/components/about/HeroSection";
import MaterialsSection from "@/components/about/MaterialsSection";
import WhyChooseSection from "@/components/about/WhyChooseSection";

export const metadata = {
  title: "Giới Thiệu – About",
  description: "Giới thiệu về Sofa Phạm Gia",
};

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
