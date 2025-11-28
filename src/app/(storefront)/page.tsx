import React from "react";
import { Hero } from "@/components/Home/Hero";
import BestSellers from "@/components/Home/BestSellers";
import BrowseByCategories from "@/components/Home/BrowseByCategories";
import Featured from "@/components/Home/Featured";
import { BrandMessage } from "@/components/Home/BrandMessage";

export const metadata = {
  title: "Trang Chủ – Home",
  description: "Chào mừng bạn đến với Sofa Phạm Gia",
};

export const revalidate = 3600;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ================= HERO ================= */}
      <section id="hero" className="p-xl mt-5 rounded-lg bg-brand-50">
        <Hero />
      </section>

      {/* ================= BESTSELLERS ================= */}
      <section id="bestsellers" className="p-xl bg-page">
        <BestSellers />
      </section>

      {/* ================= BROWSE BY categories ================= */}
      <section id="browse-by-categories" className="p-xl rounded-lg bg-brand-100">
        <BrowseByCategories />
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
  );
}
