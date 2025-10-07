// components/Footer.tsx
import React from "react";
import Container from "@/components/ui/Container";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] mt-12">
      <Container>
        {/* Grid cột */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Giới thiệu */}
          <div>
            <h4 className="text-[var(--color-text-default)] font-semibold mb-3">Nội Thất</h4>
            <p className="text-sm leading-6">
              Chúng tôi mang đến những sản phẩm nội thất chất lượng, thiết kế tinh tế và hiện đại, giúp không gian sống
              của bạn trở nên ấm cúng và tiện nghi hơn.
            </p>
          </div>

          {/* Danh mục sản phẩm */}
          <div>
            <h4 className="text-[var(--color-text-default)] font-semibold mb-3">Danh mục sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop/sofas" className="hover:text-[var(--color-brand-300)]">
                  Sofa
                </Link>
              </li>
              <li>
                <Link href="/shop/chairs" className="hover:text-[var(--color-brand-300)]">
                  Ghế
                </Link>
              </li>
              <li>
                <Link href="/shop/tables" className="hover:text-[var(--color-brand-300)]">
                  Bàn
                </Link>
              </li>
              <li>
                <Link href="/shop/beds" className="hover:text-[var(--color-brand-300)]">
                  Giường
                </Link>
              </li>
              <li>
                <Link href="/shop/cabinets" className="hover:text-[var(--color-brand-300)]">
                  Tủ
                </Link>
              </li>
              <li>
                <Link href="/shop/lights" className="hover:text-[var(--color-brand-300)]">
                  Đèn
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ khách hàng */}
          <div>
            <h4 className="text-[var(--color-text-default)] font-semibold mb-3">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping-policy" className="hover:text-[var(--color-brand-300)]">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-[var(--color-brand-300)]">
                  Đổi trả & Bảo hành
                </Link>
              </li>
              <li>
                <Link href="/how-to-buy" className="hover:text-[var(--color-brand-300)]">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[var(--color-brand-300)]">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Công ty */}
          <div>
            <h4 className="text-[var(--color-text-default)] font-semibold mb-3">Công ty</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-[var(--color-brand-300)]">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[var(--color-brand-300)]">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-brand-300)]">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Kết nối */}
          <div>
            <h4 className="text-[var(--color-text-default)] font-semibold mb-3">Kết nối với chúng tôi</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" target="_blank" rel="noopener" className="hover:text-[var(--color-brand-300)]">
                Facebook
              </a>
              <a href="#" target="_blank" rel="noopener" className="hover:text-[var(--color-brand-300)]">
                Instagram
              </a>
              <a href="#" target="_blank" rel="noopener" className="hover:text-[var(--color-brand-300)]">
                YouTube
              </a>
              <a href="#" target="_blank" rel="noopener" className="hover:text-[var(--color-brand-300)]">
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="border-t border-[var(--color-brand-50)] py-6 text-center text-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Nội Thất — Bảo lưu mọi quyền.
          <br />
          Thiết kế & phát triển bởi{" "}
          <span className="text-[var(--color-brand-300)] font-medium">Sofa Ecommerce Team</span>.
        </div>
      </Container>
    </footer>
  );
}
