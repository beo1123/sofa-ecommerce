"use client";

import React from "react";
import Grid, { GridItem } from "@/components/ui/Grid";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ================= HERO ================= */}
      <section id="hero" className="p-xl mt-5 rounded-lg bg-brand-50">
        <Grid cols={1} responsive={{ md: 2 }} gap="lg">
          <GridItem className="flex flex-col justify-center gap-md">
            <h1 className="text-4xl font-bold">Nội thất sang trọng cho ngôi nhà hiện đại</h1>
            <p className="text-text-muted">
              Khám phá những thiết kế nội thất tinh tế được chế tác từ vật liệu cao cấp và tay nghề thủ công.
            </p>

            <Button className="px-lg py-md w-[30%]">Mua Ngay</Button>
          </GridItem>
          <GridItem className="bg-bg-muted rounded-md h-96 flex items-center justify-center">
            Hình ảnh / Banner
          </GridItem>
        </Grid>
      </section>

      {/* ================= BESTSELLERS ================= */}
      <section id="bestsellers" className="p-xl  bg-bg-page">
        <h2 className="text-2xl font-semibold mb-lg">Sản phẩm bán chạy trong tuần</h2>
        <Grid cols={1} responsive={{ sm: 2, md: 3, lg: 4 }} gap="lg">
          {Array.from({ length: 8 }).map((_, i) => (
            <GridItem key={i} className="bg-bg-muted rounded-md h-64 flex items-center justify-center">
              Sản phẩm {i + 1}
            </GridItem>
          ))}
        </Grid>
      </section>

      {/* ================= BROWSE BY ROOMS ================= */}
      <section id="browse-by-rooms" className="p-xl rounded-lg bg-brand-100">
        <h2 className="text-2xl font-semibold mb-lg">Khám phá theo không gian</h2>
        <Grid cols={2} responsive={{ sm: 3, lg: 6 }} gap="md">
          {["Phòng khách", "Phòng ngủ", "Phòng ăn", "Văn phòng", "Ngoài trời", "Chiếu sáng"].map((room) => (
            <GridItem key={room} className="bg-white shadow rounded-md p-lg text-center hover:shadow-lg transition">
              {room}
            </GridItem>
          ))}
        </Grid>
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

      {/* ================= NEWSLETTER ================= */}
      <section id="newsletter" className="p-xl rounded-lg mt-5 bg-brand-50">
        <h2 className="text-2xl font-semibold mb-md text-center">Đăng ký nhận bản tin</h2>
        <p className="text-center text-text-muted mb-lg">
          Nhận cập nhật hàng tuần, ưu đãi độc quyền và mẹo thiết kế nội thất.
        </p>
        <Grid cols={1} responsive={{ md: 2 }} gap="sm" className="max-w-2xl mx-auto">
          <GridItem>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="w-full border border-brand-100 rounded-md p-md"
            />
          </GridItem>
          <GridItem>
            <button className="w-full bg-brand-400 text-white p-md rounded-md hover:bg-brand-300 transition">
              Đăng ký
            </button>
          </GridItem>
        </Grid>
      </section>
    </div>
  );
}
