import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Hero } from "@/components/Home/Hero";
import BestSellers from "@/components/Home/BestSellers";
import BrowseByCategories from "@/components/Home/BrowseByCategories";
import Featured from "@/components/Home/Featured";
import { BrandMessage } from "@/components/Home/BrandMessage";
import StoreHighlights from "@/components/common/StoreHighlights";
import { headerLogoSrc } from "@/lib/branding";
import { BASE_URL, buildHomeBreadcrumbSchema, buildHomePageSchema, SITE_NAME } from "@/seo/schema";

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Sofa Phạm Gia mang đến sofa và nội thất cao cấp với thiết kế tinh tế, chất liệu bền đẹp, giao hàng toàn quốc và hỗ trợ tận tâm.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: SITE_NAME,
    description:
      "Sofa Phạm Gia mang đến sofa và nội thất cao cấp với thiết kế tinh tế, chất liệu bền đẹp và dịch vụ giao hàng toàn quốc.",
    url: BASE_URL,
    type: "website",
    images: [
      {
        url: headerLogoSrc,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
};

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Script id="home-webpage-jsonld" type="application/ld+json">
        {JSON.stringify(buildHomePageSchema())}
      </Script>
      <Script id="home-breadcrumb-jsonld" type="application/ld+json">
        {JSON.stringify(buildHomeBreadcrumbSchema())}
      </Script>
      <div className="min-h-screen flex flex-col">
        {/* ================= HERO ================= */}
        <section id="hero" className="p-xl mt-5 rounded-lg bg-brand-50">
          <Hero />
        </section>
        {/* ================= BROWSE BY categories ================= */}
        <section id="browse-by-categories" className="p-xl mt-xl rounded-lg bg-brand-100">
          <BrowseByCategories />
        </section>
        {/* ================= store highlights ================= */}
        <section id="store-highlights" className="p-xl mt-5 rounded-lg bg-[var(--color-bg-page)]">
          <StoreHighlights />
        </section>

        {/* ================= BESTSELLERS ================= */}
        <section id="bestsellers" className="p-xl bg-page">
          <BestSellers />
        </section>

        {/* ================= Featured ================= */}
        <section id="Featured" className="p-xl bg-page">
          <Featured />
        </section>

        {/* ================= PROMO / OFFERS ================= */}
        {/* <section id="promos" className="p-xl rounded-lg mt-5 bg-brand-200">
          <h2 className="text-2xl font-semibold mb-lg text-white">Ưu đãi đặc biệt</h2>
          <Grid cols={1} responsive={{ sm: 2, lg: 3 }} gap="md">
            {["Giảm 30% Sofa", "Khuyến mãi đèn chiếu sáng tuần này", "Sale nội thất ngoài trời"].map((offer) => (
              <GridItem
                key={offer}
                className="bg-brand-300 text-white rounded-md p-xl text-center font-medium hover:bg-brand-400 transition">
                {offer}
              </GridItem>
            ))}
          </Grid>
        </section> */}

        {/* ================= BRAND MESSAGE ================= */}
        <section id="brand-message" className="p-xl rounded-lg mt-5 bg-[var(--color-bg-muted)]">
          <BrandMessage />
        </section>
      </div>
    </>
  );
}
