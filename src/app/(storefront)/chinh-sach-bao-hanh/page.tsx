import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Divider from "@/components/ui/Divider";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Chính sách bảo hành",
  description: "Thông tin chi tiết về điều kiện, thời gian và quy trình bảo hành sản phẩm Sofa Phạm Gia.",
  keywords: ["chính sách bảo hành", "bảo hành sofa", "bảo hành Sofa Phạm Gia", "khung sofa", "đệm sofa"],
  alternates: {
    canonical: "/chinh-sach-bao-hanh",
  },
  openGraph: {
    title: "Chính sách bảo hành | Sofa Phạm Gia",
    description: "Điều kiện bảo hành, trường hợp miễn phí và quy trình xử lý bảo hành tại Sofa Phạm Gia.",
    type: "article",
    locale: "vi_VN",
    url: "https://sofaphamgia.com/chinh-sach-bao-hanh",
  },
};

const conditions = [
  "Bảo hành chỉ áp dụng cho sản phẩm mới 100%, mua chính hãng tại Sofa Phạm Gia (sofaphamgia.com).",
  "Quý khách cần giữ nguyên hóa đơn mua hàng, tem bảo hành và phiếu bảo hành (nếu có).",
  "Sản phẩm còn nằm trong thời hạn bảo hành tính từ ngày giao hàng thành công.",
  "Lỗi phải do nhà sản xuất (vật liệu, khung, lò xo, đệm, đường may...).",
];

const warrantyPeriods = [
  "Sofa gỗ tự nhiên: 3 - 5 năm (bảo hành khung gỗ, mối mọt, lò xo).",
  "Sofa khung sắt: 3 - 5 năm (bảo hành khung sắt, mối hàn).",
  "Sofa bọc da thật: 2 - 3 năm (bảo hành da, đường may, xẹp lún).",
  "Sofa bọc vải/nỉ: 1 - 2 năm (bảo hành vải, đường may, xẹp đệm).",
  "Đệm ghế & đệm lót: 12 - 24 tháng (bảo hành xẹp lún, đàn hồi).",
  "Chân sofa, tay vịn, phụ kiện: 12 - 36 tháng.",
];

const freeWarranty = [
  "Lỗi kỹ thuật từ nhà sản xuất: khung gãy, lò xo hỏng, da/vải bung chỉ, xẹp lún bất thường...",
  "Mối mọt trên khung gỗ (áp dụng cho dòng sofa gỗ tự nhiên).",
  "Bong tróc da hoặc vải do lỗi keo dán hoặc chất lượng vật liệu.",
];

const noWarranty = [
  "Hỏng do sử dụng sai cách, va đập mạnh, thú cưng cắn, trẻ em phá.",
  "Bị ướt nước, ẩm mốc, cháy nổ hoặc tiếp xúc hóa chất tẩy rửa mạnh.",
  "Tự ý sửa chữa tại các cơ sở bên ngoài.",
  "Phai màu do phơi nắng trực tiếp lâu ngày.",
  "Hao mòn tự nhiên theo thời gian sử dụng.",
  "Sản phẩm đã hết thời hạn bảo hành.",
];

const warrantyProcess = [
  "Quý khách liên hệ Hotline: 0932 111 620 (Mr. Giang) hoặc bộ phận chăm sóc khách hàng.",
  "Cung cấp ảnh/video tình trạng lỗi, số đơn hàng và hóa đơn mua hàng.",
  "Nhân viên kỹ thuật sẽ kiểm tra và tư vấn phương án phù hợp: sửa chữa tại nhà (lỗi nhẹ) hoặc mang về xưởng (lỗi nặng).",
  "Thời gian xử lý: 3 - 14 ngày tùy mức độ lỗi và linh kiện thay thế.",
];

const exchangeInWarranty = [
  "Trong 07 ngày đầu kể từ ngày nhận hàng: được đổi mới nếu do lỗi từ nhà sản xuất (áp dụng cho một số dòng sản phẩm cao cấp).",
  "Sau 07 ngày: chỉ hỗ trợ sửa chữa bảo hành, không đổi mới toàn bộ sản phẩm.",
];

export default function WarrantyPolicyPage() {
  return (
    <main className="min-h-screen py-12 bg-[var(--color-bg-muted)] text-[var(--color-text-default)]">
      <Container className="space-y-8 px-5">
        <div className="max-w-3xl space-y-3">
          <Heading level={1}>Chính sách bảo hành Sofa Phạm Gia</Heading>
          <Text muted>
            Chúng tôi cam kết mang đến sản phẩm chất lượng cao cùng chế độ bảo hành rõ ràng, minh bạch để Quý khách yên
            tâm sử dụng lâu dài.
          </Text>
        </div>

        <section className="space-y-3">
          <Heading level={3}>1. Điều kiện áp dụng bảo hành</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {conditions.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>2. Thời gian bảo hành</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {warrantyPeriods.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
          <Text muted>Thời gian bảo hành chính xác sẽ được ghi rõ trên Phiếu bảo hành kèm theo đơn hàng.</Text>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>3. Những trường hợp được bảo hành miễn phí</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {freeWarranty.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>4. Những trường hợp không áp dụng bảo hành</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {noWarranty.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>5. Quy trình thực hiện bảo hành</Heading>
          <ol className="list-decimal pl-5 space-y-2">
            {warrantyProcess.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ol>
        </section>

        <Divider />

        <section className="space-y-3">
          <Heading level={3}>6. Chính sách đổi trả trong thời gian bảo hành</Heading>
          <ul className="list-disc pl-5 space-y-2">
            {exchangeInWarranty.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        </section>

        <Divider />

        <Text className="font-medium">Hotline hỗ trợ bảo hành: 0932 111 620 (Mr. Giang)</Text>
      </Container>
    </main>
  );
}
