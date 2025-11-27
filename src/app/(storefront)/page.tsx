import React from "react";
import Grid, { GridItem } from "@/components/ui/Grid";
import { Hero } from "@/components/Home/Hero";
import BestSellers from "@/components/Home/BestSellers";
import BrowseByCategories from "@/components/Home/BrowseByCategories";

export const metadata = {
  title: "Trang Chủ – Home",
  description: "Chào mừng bạn đến với Sofa Phạm Gia",
};

export const revalidate = 0;

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

      {/* ================= BROWSE BY ROOMS ================= */}
      <section id="browse-by-rooms" className="p-xl rounded-lg bg-brand-100">
        <BrowseByCategories />
      </section>

      {/* ================= TOP SELLING FURNITURE ================= */}
      <section id="top-selling" className="p-xl rounded-lg mt-5 bg-bg-muted">
        <h2 className="text-2xl font-semibold mb-lg">Nội thất bán chạy nhất</h2>
        <Grid cols={1} responsive={{ sm: 2, md: 3, lg: 4 }} gap="lg">
          {Array.from({ length: 8 }).map((_, i) => (
            <GridItem key={i} className="bg-white rounded-md h-64 flex items-center justify-center shadow">
              Sản phẩm nổi bật {i + 1}
            </GridItem>
          ))}
        </Grid>
      </section>

      {/* ================= PROMO / OFFERS ================= */}
      <section id="promos" className="p-xl rounded-lg mt-5 bg-brand-200">
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
      </section>

      {/* ================= BRAND MESSAGE ================= */}
      <section id="brand-message" className="p-xl rounded-lg mt-5 bg-bg-page">
        <Grid cols={1} responsive={{ md: 2 }} gap="lg">
          <GridItem className="bg-brand-50 h-80 rounded-md flex items-center justify-center">
            Hình ảnh thương hiệu
          </GridItem>
          <GridItem className="flex flex-col justify-center gap-md">
            <h3 className="text-2xl font-semibold">Nội thất sang trọng bắt đầu từ chất liệu cao cấp nhất</h3>
            <p className="text-text-muted">
              Triết lý của chúng tôi là kết hợp thiết kế tinh tế và vật liệu bền vững để tạo ra sản phẩm nội thất trường
              tồn qua nhiều thế hệ.
            </p>
            <button className="px-lg py-md bg-brand-400 text-white rounded-md w-fit hover:bg-brand-300 transition">
              Tìm hiểu thêm
            </button>
          </GridItem>
        </Grid>
      </section>
    </div>
  );
}
