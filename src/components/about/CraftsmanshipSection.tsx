import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import { SafeImage } from "@/components/ui/SafeImage";
import { sofaImages } from "./images";

export default function CraftsmanshipSection() {
  return (
    <section className="py-10 rounded-2xl bg-[var(--color-bg-muted)]">
      <Container className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="px-5">
          <SafeImage
            src={sofaImages.craftsmanship}
            alt="Handcrafted quality"
            width={1920}
            height={1280}
            className="rounded-xl shadow-lg object-cover h-[280px] sm:h-[340px] lg:h-[420px] w-full"
          />
        </div>

        <div className="px-5 space-y-6">
          <Heading level={2}>Thủ công tỉ mỉ trong từng chi tiết</Heading>

          <Text muted>
            Từng mũi chỉ, từng lớp đệm đều được kiểm tra cẩn thận để đảm bảo sofa luôn giữ được form dáng và độ êm ái
            trong nhiều năm sử dụng.
          </Text>

          <Text>
            Đội ngũ nghệ nhân nhiều năm kinh nghiệm thực hiện quy trình chế tác hoàn toàn thủ công, giúp mỗi sản phẩm
            đều có độ hoàn thiện cao và mang dấu ấn riêng.
          </Text>

          <Text>
            Chúng tôi sử dụng vật liệu được tuyển chọn kỹ càng: gỗ tự nhiên đã qua xử lý độ ẩm, mút đàn hồi đạt chuẩn
            Châu Âu và vải bọc thân thiện với môi trường.
          </Text>

          <ul className="list-disc ml-5 space-y-2 text-[var(--color-text-muted)]">
            <li>Kiểm định chất lượng 5 bước trước khi xuất xưởng</li>
            <li>Đường may kép chống bung, chống xù</li>
            <li>Khung gỗ hardwood chống mối mọt</li>
            <li>Bảo hành lên đến 3 năm cho khung và đệm</li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
