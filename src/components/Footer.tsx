// components/Footer.tsx
import React from "react";
import Container from "@/components/ui/Container";
import Link from "next/link";
import { CategoryService } from "@/services/category.service";
import { prisma } from "@/lib/prisma";

const categoryService = new CategoryService(prisma);

export default async function Footer() {
  // Fetch categories
  const { data: categories } = await categoryService.getAll(1, 100, 0);
  const socialLinks = [
    ["Facebook", process.env.NEXT_PUBLIC_FACEBOOK_URL],
    ["Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL],
    ["TikTok", process.env.NEXT_PUBLIC_TIKTOK_URL],
  ].filter(([, href]) => Boolean(href));

  return (
    <footer className="bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] mt-12 border-t border-[var(--color-brand-50)]">
      <Container>
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-5">
          {/* 1. Giới thiệu */}
          <div className="order-1 lg:order-none">
            <h4 className="text-[var(--color-text-default)] font-semibold mb-3">Sofa Phạm Gia</h4>
            <p className="text-sm leading-6">
              Sofa Phạm Gia chuyên thiết kế và cung cấp sofa cao cấp, bền đẹp, chuẩn thẩm mỹ cho không gian sống hiện
              đại. Chúng tôi cam kết chất lượng, giá minh bạch và dịch vụ tận tâm từ tư vấn đến hậu mãi.
            </p>
          </div>

          {/* 2. Kết nối */}
          <div className="order-2 sm:order-none">
            <h4 className="text-[var(--color-text-default)] font-semibold mb-3">Kết nối với chúng tôi</h4>
            <div className="flex flex-col gap-2 text-sm">
              {socialLinks.map(([label, href]) => (
                <Link
                  key={label}
                  href={href as string}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-[var(--color-brand-300)] transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. Sản phẩm - **Dynamic categories** */}
          <div className="order-3">
            <h4 className="text-[var(--color-text-default)] font-semibold mb-3">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              {categories.map((cat: any) => (
                <li key={cat.slug}>
                  <Link
                    href={`/san-pham?category=${cat.slug}&page=1`}
                    className="hover:text-[var(--color-brand-300)] transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Hỗ trợ */}
          <div className="order-4">
            <h4 className="text-[var(--color-text-default)] font-semibold mb-3">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["Chính sách thanh toán", "/chinh-sach-thanh-toan"],
                ["Chính sách vận chuyển", "/chinh-sach-van-chuyen"],
                ["Chính sách bảo hành", "/chinh-sach-bao-hanh"],
                ["Chính sách đổi trả", "/chinh-sach-doi-tra"],
                ["Liên hệ hỗ trợ", "/lien-he"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[var(--color-brand-300)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="py-6 text-center text-xs sm:text-sm text-[var(--color-text-muted)] border-t border-[var(--color-brand-50)]">
          © {new Date().getFullYear()} Nội Thất — Bảo lưu mọi quyền.
          <br />
          Thiết kế & phát triển bởi{" "}
          <span className="text-[var(--color-brand-300)] font-medium">Sofa Ecommerce Team</span>.
        </div>
      </Container>
    </footer>
  );
}
