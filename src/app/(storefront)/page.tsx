import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Hero } from "@/components/Home/Hero";
import BestSellers from "@/components/Home/BestSellers";
import BrowseByCategories from "@/components/Home/BrowseByCategories";
import Featured from "@/components/Home/Featured";
import { BrandMessage } from "@/components/Home/BrandMessage";
import StoreHighlights from "@/components/common/StoreHighlights";
import { buildHomeBreadcrumbSchema, buildHomePageSchema } from "@/seo/schema";
import { generateHomeMetadata } from "@/seo/generators/generateMetadata";

export const metadata: Metadata = generateHomeMetadata();

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
      <div className="min-h-screen flex flex-col gap-6 sm:gap-10 lg:gap-14 py-4 sm:py-8 lg:py-10">
        {/* ================= HERO ================= */}
        <section
          id="hero"
          className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] p-4 sm:p-8 lg:p-12 ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_12%,transparent)]">
          <Hero />
        </section>

        {/* ================= BROWSE BY CATEGORIES ================= */}
        <section
          id="browse-by-categories"
          className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)]/60 p-4 sm:p-8 lg:p-10 ring-1 ring-[var(--color-brand-50)]">
          <BrowseByCategories />
        </section>

        {/* ================= STORE HIGHLIGHTS ================= */}
        <section id="store-highlights" className="py-1 sm:py-2">
          <StoreHighlights />
        </section>

        {/* ================= BESTSELLERS ================= */}
        <section id="bestsellers" className="py-1 sm:py-2">
          <BestSellers />
        </section>

        {/* ================= FEATURED ================= */}
        <section id="Featured" className="py-1 sm:py-2">
          <Featured />
        </section>

        {/* ================= BRAND MESSAGE ================= */}
        <section
          id="brand-message"
          className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] p-4 sm:p-8 lg:p-12 ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)]">
          <BrandMessage />
        </section>
      </div>
    </>
  );
}
