import Divider from "@/components/ui/Divider";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import { generatePageMetadata } from "@/seo/generators/generateMetadata";

export const metadata = generatePageMetadata({
  title: "Chính sách đổi trả hàng",
  description: "Chính sách đổi trả rõ ràng, minh bạch của Sofa Phạm Gia để bảo vệ quyền lợi khách hàng.",
  slug: "/chinh-sach-doi-tra",
  type: "article",
  keywords: ["chính sách đổi trả", "đổi trả sofa", "hoàn tiền", "Sofa Phạm Gia", "đổi trả nội thất"],
});

const returnConditions = [
  "Sản phẩm bị lỗi kỹ thuật do nhà sản xuất (hỏng hóc, sai mẫu, sai màu, sai kích thước, thiếu phụ kiện...).",
  "Sản phẩm bị hư hỏng trong quá trình vận chuyển (bể vỡ, trầy xước nặng, móp méo...).",
  "Giao sai sản phẩm so với đơn hàng đã xác nhận.",
];

const productRequirements = [
  "Sản phẩm còn mới nguyên, chưa qua sử dụng, chưa giặt giũ (đối với bọc vải/da).",
  "Đầy đủ tem mác, phiếu bảo hành, phụ kiện kèm theo.",
  "Có hóa đơn mua hàng hoặc biên nhận giao hàng.",
  "Sản phẩm còn trong tình trạng có thể bán lại cho khách hàng khác (không bị bẩn, không mùi lạ, không hư hỏng do người sử dụng).",
];

const noReturnCases = [
  "Quý khách thay đổi ý định, không ưng ý kiểu dáng/màu sắc sau khi đã sử dụng.",
  "Sản phẩm bị hư hỏng do lỗi của người sử dụng (va chạm, thú cưng cắn, để gần nguồn nhiệt, ướt nước...).",
  "Sản phẩm đã qua sử dụng, giặt giũ, cắt may lại hoặc mất tem mác.",
  "Sản phẩm đặt theo yêu cầu riêng (custom-made) hoặc thuộc chương trình khuyến mãi đặc biệt.",
  "Hết thời hạn 07 ngày kể từ ngày nhận hàng.",
];

const processSteps = [
  "Quý khách liên hệ ngay Hotline: 0932 111 620 (Mr. Giang) để báo đổi trả.",
  "Cung cấp thông tin số đơn hàng, ảnh/video minh chứng lỗi hoặc hư hỏng, mô tả rõ vấn đề.",
  "Nhân viên Sofa Phạm Gia sẽ kiểm tra thông tin và phản hồi trong thời gian sớm nhất (tối đa 24 giờ).",
  "Nếu yêu cầu đổi trả được chấp nhận, chúng tôi sẽ sắp xếp lấy hàng cũ và giao sản phẩm mới (hoặc hoàn tiền nếu không có hàng thay thế).",
  "Chi phí vận chuyển đổi trả do Sofa Phạm Gia chịu trách nhiệm nếu lỗi thuộc về chúng tôi.",
];

const refundNotes = [
  "Thời gian hoàn tiền: 05 - 07 ngày làm việc kể từ khi chúng tôi nhận lại sản phẩm và xác nhận đủ điều kiện.",
  "Hình thức hoàn tiền theo phương thức thanh toán ban đầu (tiền mặt, chuyển khoản, thẻ ngân hàng...).",
];

export default function ReturnPolicyPage() {
  return (
    <div className="py-5 sm:py-10 lg:py-12 text-[var(--color-text-default)]">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-muted)] p-5 sm:p-8 lg:p-10 ring-1 ring-[var(--color-brand-50)] mb-6 sm:mb-8 space-y-2.5 sm:space-y-3">
          <span className="inline-flex items-center rounded-full bg-[var(--color-bg-page)] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-50)]">
            Hỗ trợ khách hàng
          </span>
          <Heading level={1} className="text-2xl sm:text-3xl lg:text-4xl">
            Chính sách đổi trả hàng Sofa Phạm Gia
          </Heading>
          <Text muted className="text-sm sm:text-base">
            Sofa Phạm Gia cam kết bảo vệ quyền lợi của Quý khách bằng chính sách đổi trả rõ ràng, hợp lý và minh bạch.
          </Text>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-[var(--color-bg-page)] p-5 sm:p-8 lg:p-10 ring-1 ring-[var(--color-brand-50)] shadow-[0_12px_40px_-16px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)] space-y-6 sm:space-y-8">
          <section className="space-y-3">
            <Heading level={3}>1. Điều kiện đổi trả</Heading>
            <ul className="list-disc pl-5 space-y-2">
              {returnConditions.map((item) => (
                <li key={item}>
                  <Text>{item}</Text>
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          <section className="space-y-3">
            <Heading level={3}>2. Thời gian đổi trả</Heading>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Text>Trong 07 ngày kể từ ngày Quý khách nhận hàng thành công.</Text>
              </li>
              <li>
                <Text>
                  Sau 07 ngày, Sofa Phạm Gia không hỗ trợ đổi trả, chỉ thực hiện bảo hành theo chính sách bảo hành.
                </Text>
              </li>
            </ul>
          </section>

          <Divider />

          <section className="space-y-3">
            <Heading level={3}>3. Điều kiện sản phẩm được đổi trả</Heading>
            <ul className="list-disc pl-5 space-y-2">
              {productRequirements.map((item) => (
                <li key={item}>
                  <Text>{item}</Text>
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          <section className="space-y-3">
            <Heading level={3}>4. Những trường hợp không áp dụng đổi trả</Heading>
            <ul className="list-disc pl-5 space-y-2">
              {noReturnCases.map((item) => (
                <li key={item}>
                  <Text>{item}</Text>
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          <section className="space-y-3">
            <Heading level={3}>5. Quy trình đổi trả hàng</Heading>
            <ol className="list-decimal pl-5 space-y-2">
              {processSteps.map((item) => (
                <li key={item}>
                  <Text>{item}</Text>
                </li>
              ))}
            </ol>
          </section>

          <Divider />

          <section className="space-y-3">
            <Heading level={3}>6. Hoàn tiền</Heading>
            <ul className="list-disc pl-5 space-y-2">
              {refundNotes.map((item) => (
                <li key={item}>
                  <Text>{item}</Text>
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          <Text muted>
            Lưu ý quan trọng: Tất cả các trường hợp đổi trả đều phải được xác nhận chính thức từ Sofa Phạm Gia. Chúng
            tôi không chịu trách nhiệm với các yêu cầu đổi trả không nằm trong chính sách.
          </Text>
          <Text className="font-semibold text-[var(--color-brand-400)]">
            Hotline hỗ trợ đổi trả: 0932 111 620 (Mr. Giang)
          </Text>
        </div>
      </div>
    </div>
  );
}
