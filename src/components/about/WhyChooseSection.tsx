import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Brush, Layers, Hammer } from "lucide-react";

const reasons = [
  {
    icon: <Brush size={28} className="text-[var(--color-brand-400)]" />,
    title: "Thiết kế tối giản & tinh tế",
    desc: "Được tạo nên bởi các nhà thiết kế chuyên nghiệp, đảm bảo sự hài hòa và phù hợp với nhiều phong cách nội thất hiện đại.",
  },
  {
    icon: <Layers size={28} className="text-[var(--color-brand-400)]" />,
    title: "Vật liệu cao cấp",
    desc: "Sử dụng gỗ tự nhiên tuyển chọn, vải dệt nhập khẩu bền đẹp và an toàn, mang lại cảm giác sang trọng lâu dài.",
  },
  {
    icon: <Hammer size={28} className="text-[var(--color-brand-400)]" />,
    title: "Hoàn thiện thủ công",
    desc: "Những nghệ nhân lành nghề trực tiếp hoàn thiện từng chi tiết, đảm bảo độ chính xác và chất lượng tuyệt hảo.",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-2 sm:py-6">
      <div className="text-center mb-8 sm:mb-10">
        <Heading
          level={2}
          className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-text-default)]">
          Vì sao khách hàng chọn chúng tôi?
        </Heading>
        <Text muted className="mt-2 mx-auto max-w-2xl">
          Kết hợp giữa thẩm mỹ, độ bền và sự tỉ mỉ trong từng quy trình sản xuất.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {reasons.map((item) => (
          <Card
            key={item.title}
            variant="default"
            padding="lg"
            className="rounded-2xl sm:rounded-3xl border-[var(--color-brand-50)] bg-[var(--color-bg-page)] shadow-[0_8px_30px_-12px_color-mix(in_srgb,var(--color-brand-400)_10%,transparent)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-brand-200)]">
            <CardHeader className="flex flex-col items-start gap-3">
              <div className="p-3.5 bg-[var(--color-bg-muted)] rounded-2xl ring-1 ring-[var(--color-brand-50)]">
                {item.icon}
              </div>
              <CardTitle className="text-lg sm:text-xl">{item.title}</CardTitle>
            </CardHeader>

            <CardContent>
              <Text muted className="leading-relaxed">
                {item.desc}
              </Text>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
