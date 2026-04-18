import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Brush, Layers, Hammer } from "lucide-react";

const reasons = [
  {
    icon: <Brush size={32} className="text-[var(--color-brand-500)]" />,
    title: "Thiết kế tối giản & tinh tế",
    desc: "Được tạo nên bởi các nhà thiết kế chuyên nghiệp, đảm bảo sự hài hòa và phù hợp với nhiều phong cách nội thất hiện đại.",
  },
  {
    icon: <Layers size={32} className="text-[var(--color-brand-500)]" />,
    title: "Vật liệu cao cấp",
    desc: "Sử dụng gỗ tự nhiên tuyển chọn, vải dệt nhập khẩu bền đẹp và an toàn, mang lại cảm giác sang trọng lâu dài.",
  },
  {
    icon: <Hammer size={32} className="text-[var(--color-brand-500)]" />,
    title: "Hoàn thiện thủ công",
    desc: "Những nghệ nhân lành nghề trực tiếp hoàn thiện từng chi tiết, đảm bảo độ chính xác và chất lượng tuyệt hảo.",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-20">
      <Container>
        <div className="text-center mb-12">
          <Heading level={2} className="font-semibold tracking-tight">
            Vì sao khách hàng chọn chúng tôi?
          </Heading>
          <Text muted className="mt-2 mx-auto">
            Kết hợp giữa thẩm mỹ, độ bền và sự tỉ mỉ trong từng quy trình sản xuất.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reasons.map((item) => (
            <Card
              key={item.title}
              variant="bordered"
              className="transition-all duration-1000 ease-out hover:-translate-y-2 hover:shadow-lg">
              <CardHeader className="flex flex-col items-start gap-3">
                <div className="p-3 bg-[var(--color-brand-50)] rounded-xl">{item.icon}</div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>

              <CardContent>
                <Text muted className="leading-relaxed">
                  {item.desc}
                </Text>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
