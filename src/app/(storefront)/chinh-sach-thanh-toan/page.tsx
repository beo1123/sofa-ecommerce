import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Chính sách thanh toán",
  description: "Sofa Phạm Gia hỗ trợ đa dạng hình thức thanh toán an toàn, minh bạch và tiện lợi cho khách hàng.",
  keywords: ["chính sách thanh toán", "thanh toán sofa", "thanh toán chuyển khoản", "COD", "Sofa Phạm Gia"],
  alternates: {
    canonical: "/chinh-sach-thanh-toan",
  },
  openGraph: {
    title: "Chính sách thanh toán | Sofa Phạm Gia",
    description:
      "Thông tin chi tiết về hình thức thanh toán, chính sách đặt cọc và xác nhận thanh toán tại Sofa Phạm Gia.",
    type: "article",
    locale: "vi_VN",
    url: "https://sofaphamgia.com/chinh-sach-thanh-toan",
  },
};

const paymentMethods = [
  "Thanh toán trực tiếp (COD): Thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận sản phẩm.",
  "Thanh toán chuyển khoản ngân hàng: Quý khách chuyển khoản trước hoặc đặt cọc trước khi sản xuất/giao hàng.",
  "Thanh toán qua cổng trực tuyến: Internet Banking, ví điện tử (Momo, ZaloPay, VNPAY), thẻ tín dụng/ghi nợ (Visa, MasterCard, JCB...).",
];

const paymentPolicies = [
  "Đơn hàng dưới 20 triệu: Cọc trước 30% giá trị đơn hàng và thanh toán 70% còn lại khi nhận hàng.",
  "Đơn hàng từ 20 triệu trở lên: Đặt cọc 30% - 50% khi ký hợp đồng; thanh toán 50% - 70% còn lại khi nhận hàng hoặc trước khi giao hàng (tùy thỏa thuận).",
  "Đối với hàng đặt theo yêu cầu (custom): Phải đặt cọc tối thiểu 50% trước khi nhập liệu sản xuất.",
];

const confirmationNotes = [
  "Sau khi thanh toán, Quý khách vui lòng gửi biên lai chuyển khoản (ảnh chụp màn hình) qua Zalo/Hotline để nhân viên xác nhận.",
  "Đơn hàng chỉ được chuyển sang trạng thái hoàn thành và tiến hành sản xuất/giao hàng sau khi xác nhận thanh toán thành công.",
];

const importantNotes = [
  "Tất cả các khoản thanh toán đều được ghi rõ trong hợp đồng hoặc phiếu xác nhận đơn hàng.",
  "Sofa Phạm Gia không chịu trách nhiệm nếu Quý khách chuyển khoản sai thông tin tài khoản.",
  "Chúng tôi cam kết bảo mật tuyệt đối thông tin thanh toán của Quý khách.",
];

export default function PaymentPolicyPage() {
  return (
    <main className="min-h-screen py-12 bg-[var(--color-bg-muted)] text-[var(--color-text-default)]">
      <Container className="space-y-8 px-5">
        <div className="max-w-3xl space-y-3">
          <Heading level={1}>Chính sách thanh toán</Heading>
          <Text muted>
            Sofa Phạm Gia hỗ trợ đa dạng các hình thức thanh toán tiện lợi, an toàn và minh bạch để Quý khách dễ dàng
            lựa chọn.
          </Text>
        </div>

        <section className="space-y-3">
          <Heading level={3}>1. Các hình thức thanh toán</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {paymentMethods.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>2. Chính sách thanh toán</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {paymentPolicies.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>3. Xác nhận thanh toán</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {confirmationNotes.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>4. Lưu ý quan trọng</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {importantNotes.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <Text className="font-medium">Hotline hỗ trợ thanh toán & tư vấn: 0932 111 620 (Mr. Giang)</Text>
      </Container>
    </main>
  );
}
