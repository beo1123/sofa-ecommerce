import React from "react";
import { IconBrandWhatsapp, IconClock, IconMapPin, IconPhone, IconShieldCheck } from "@tabler/icons-react";
import ContactMap from "@/components/contact/ContactMap";
import ConsultationForm from "@/components/store/ConsultationForm";
import { generatePageMetadata } from "@/seo/generators/generateMetadata";

export const metadata = generatePageMetadata({
  title: "Liên hệ & Tư vấn đóng Sofa tại xưởng",
  description:
    "Liên hệ Xưởng Sofa Phạm Gia TP.HCM (0932 111 620) để được tư vấn kích thước, chất liệu da/vải, báo giá trực tiếp tại xưởng và lịch giao lắp.",
  slug: "/lien-he",
  type: "website",
  keywords: ["liên hệ sofa phạm gia", "xưởng đóng sofa tphcm", "tư vấn sofa theo yêu cầu", "Sofa Phạm Gia"],
});

interface ContactPageProps {
  searchParams: Promise<{ note?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const initialNote = typeof params.note === "string" ? params.note : "";

  return (
    <div className="py-6 sm:py-10 space-y-8">
      {/* Hero Banner */}
      <section className="rounded-[12px] border border-brand-100 bg-bg-muted px-6 py-8 sm:px-10 sm:py-10 text-center space-y-3">
        <span className="inline-flex items-center rounded-[20px] bg-brand-50 px-3 py-1 text-xs font-medium text-brand-300">
          Xưởng sản xuất trực tiếp · TP. Hồ Chí Minh
        </span>
        <h1 className="text-2xl font-bold text-brand-400 sm:text-3xl">Tư vấn & Báo giá Sofa Phạm Gia</h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-text-muted">
          Gửi kích thước phòng khách và chất liệu bạn mong muốn — đội ngũ thợ xưởng và Mr. Giang sẽ tư vấn phương án tối
          ưu chi phí, gửi mẫu da/vải thực tế và báo giá minh bạch.
        </p>
      </section>

      {/* Main 2-column content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left: Workshop Contact Card + Map */}
        <div className="space-y-5 lg:col-span-5">
          <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-brand-400">Thông tin xưởng sản xuất</h2>

            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-brand-100 bg-brand-50 text-brand-400">
                  <IconPhone size={18} stroke={1.75} />
                </span>
                <div>
                  <p className="text-xs text-text-muted">Hotline / Tư vấn kỹ thuật (Mr. Giang)</p>
                  <a href="tel:0932111620" className="font-bold text-brand-400 hover:text-brand-300">
                    0932 111 620
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-brand-100 bg-brand-50 text-brand-400">
                  <IconBrandWhatsapp size={18} stroke={1.75} />
                </span>
                <div>
                  <p className="text-xs text-text-muted">Zalo gửi ảnh phòng & mẫu da</p>
                  <a
                    href="https://zalo.me/0932111620"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-300 hover:text-brand-400 hover:underline">
                    zalo.me/0932111620
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-brand-100 bg-brand-50 text-brand-400">
                  <IconMapPin size={18} stroke={1.75} />
                </span>
                <div>
                  <p className="text-xs text-text-muted">Địa chỉ xưởng</p>
                  <p className="font-medium text-text-default">C12/17, Ấp 3, Bình Chánh, TP. Hồ Chí Minh</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-brand-100 bg-brand-50 text-brand-400">
                  <IconClock size={18} stroke={1.75} />
                </span>
                <div>
                  <p className="text-xs text-text-muted">Giờ mở cửa xưởng</p>
                  <p className="font-medium text-text-default">08:00 – 20:00 (Thứ 2 – Chủ Nhật)</p>
                </div>
              </li>
            </ul>

            <div className="flex items-start gap-2 rounded-[8px] border border-brand-100 bg-bg-muted p-3 text-xs text-text-muted">
              <IconShieldCheck size={16} stroke={1.75} className="mt-0.5 shrink-0 text-brand-300" />
              <span>
                Khách hàng có thể ghé xưởng xem trực tiếp khung gỗ dầu tự nhiên, nệm D40 và thử độ êm trước khi chốt đặt
                cọc.
              </span>
            </div>
          </section>

          <div className="overflow-hidden rounded-[12px] border border-brand-100 min-h-[260px]">
            <ContactMap address="C12/17, Ấp 3, Bình Chánh, TPHCM" />
          </div>
        </div>

        {/* Right: Consultation Form */}
        <section className="rounded-[12px] border border-brand-100 bg-bg-page p-5 sm:p-7 lg:col-span-7">
          <ConsultationForm initialNote={initialNote} />
        </section>
      </div>
    </div>
  );
}
