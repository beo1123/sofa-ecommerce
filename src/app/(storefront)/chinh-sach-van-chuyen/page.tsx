import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Chính sách vận chuyển",
  description:
    "Thông tin về phạm vi giao hàng, thời gian vận chuyển, chi phí và quy trình nhận hàng tại Sofa Phạm Gia.",
  keywords: ["chính sách vận chuyển", "giao hàng sofa", "phí vận chuyển", "Sofa Phạm Gia"],
  alternates: {
    canonical: "/chinh-sach-van-chuyen",
  },
  openGraph: {
    title: "Chính sách vận chuyển | Sofa Phạm Gia",
    description: "Phạm vi giao hàng, thời gian dự kiến, chi phí vận chuyển và lưu ý khi nhận hàng tại Sofa Phạm Gia.",
    type: "article",
    locale: "vi_VN",
    url: "https://sofaphamgia.com/chinh-sach-van-chuyen",
  },
};

const shippingRules = [
  "Sofa Phạm Gia hỗ trợ giao hàng nội thành TP.HCM và các tỉnh thành trên toàn quốc.",
  "Đối với khu vực nội thành, đơn hàng có thể được hỗ trợ giao nhanh tùy theo lịch và tồn kho.",
  "Đối với khu vực ngoại thành hoặc tỉnh xa, thời gian giao hàng sẽ được thông báo khi xác nhận đơn.",
];

const timelines = [
  "Sản phẩm có sẵn: giao trong 1 - 3 ngày làm việc (nội thành) hoặc 3 - 7 ngày làm việc (ngoại tỉnh).",
  "Sản phẩm đặt theo yêu cầu (custom): thời gian sản xuất và giao hàng theo thỏa thuận trong hợp đồng/đơn hàng.",
  "Thời gian thực tế có thể thay đổi do thời tiết, giao thông, lễ Tết hoặc yếu tố khách quan khác.",
];

const deliveryNotes = [
  "Nhân viên giao hàng sẽ liên hệ trước khi giao để xác nhận thời gian nhận hàng.",
  "Quý khách vui lòng kiểm tra số lượng, mẫu mã và tình trạng sản phẩm ngay khi nhận hàng.",
  "Nếu phát hiện lỗi, thiếu phụ kiện hoặc hư hỏng do vận chuyển, vui lòng phản hồi ngay để được hỗ trợ kịp thời.",
];

const shippingFees = [
  "Phí vận chuyển được tính theo khu vực, kích thước sản phẩm và điều kiện giao nhận thực tế.",
  "Một số chương trình ưu đãi có thể hỗ trợ miễn/giảm phí vận chuyển theo thời điểm.",
  "Phí phát sinh (nếu có) như cẩu hàng, vận chuyển lên tầng cao, lắp đặt đặc biệt sẽ được thông báo trước.",
];

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen py-12 bg-[var(--color-bg-muted)] text-[var(--color-text-default)]">
      <Container className="space-y-8 px-5">
        <div className="max-w-3xl space-y-3">
          <Heading level={1}>Chính sách vận chuyển Sofa Phạm Gia</Heading>
          <Text muted>
            Chúng tôi cam kết giao hàng đúng hẹn, đúng sản phẩm và hỗ trợ khách hàng xuyên suốt quá trình vận chuyển.
          </Text>
        </div>

        <section className="space-y-3">
          <Heading level={3}>1. Phạm vi giao hàng</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {shippingRules.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>2. Thời gian vận chuyển dự kiến</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {timelines.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>3. Chi phí vận chuyển</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {shippingFees.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>4. Lưu ý khi nhận hàng</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {deliveryNotes.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <Text className="font-medium">Hotline hỗ trợ vận chuyển: 0932 111 620 (Mr. Giang)</Text>
      </Container>
    </main>
  );
}
