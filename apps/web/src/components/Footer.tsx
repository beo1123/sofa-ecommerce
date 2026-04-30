// components/Footer.tsx
import React from "react";
import Container from "@/components/ui/Container";
import Link from "next/link";
import { sdk } from "@repo/sdk";

export default async function Footer() {
  const categories = await sdk.categories.getAll();

  return (
    <footer className="bg-bg-muted text-text-muted mt-12 border-t border-brand-50">
      <Container>
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-5">
          <div className="order-1 lg:order-none">
            <h4 className="text-text-default font-semibold mb-3">Nội Thất</h4>
            <p className="text-sm leading-6">
              Mang đến sản phẩm nội thất chất lượng với thiết kế tinh tế, hiện đại giúp không gian sống của bạn trở nên
              ấm cúng và tiện nghi hơn.
            </p>
          </div>

          <div className="order-2 sm:order-none">
            <h4 className="text-text-default font-semibold mb-3">Kết nối với chúng tôi</h4>
            <div className="flex flex-col gap-2 text-sm">
              {["Facebook", "Instagram", "YouTube", "TikTok"].map((label) => (
                <Link
                  key={label}
                  href="#"
                  target="_blank"
                  rel="noopener"
                  className="hover:text-brand-300 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="order-3">
            <h4 className="text-text-default font-semibold mb-3">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/san-pham?category=${cat.slug}&page=1`}
                    className="hover:text-brand-300 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-4">
            <h4 className="text-text-default font-semibold mb-3">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["Chính sách vận chuyển", "/shipping-policy"],
                ["Đổi trả & Bảo hành", "/return-policy"],
                ["Hướng dẫn mua hàng", "/how-to-buy"],
                ["Câu hỏi thường gặp", "/faq"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-300 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="py-6 text-center text-xs sm:text-sm text-text-muted border-t border-brand-50">
          © {new Date().getFullYear()} Nội Thất — Bảo lưu mọi quyền.
          <br />
          Thiết kế & phát triển bởi <span className="text-brand-300 font-medium">Sofa Ecommerce Team</span>.
        </div>
      </Container>
    </footer>
  );
}
