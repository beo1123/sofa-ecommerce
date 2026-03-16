import Card from "@/components/ui/Card";
import { BadgeCheck, Headset, PencilRuler, Truck } from "lucide-react";

type StoreHighlightsProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

const HIGHLIGHTS = [
  {
    title: "Sản phẩm chất lượng",
    description: "Chọn lọc kỹ chất liệu, hoàn thiện chắc tay và bền đẹp cho sử dụng lâu dài.",
    icon: BadgeCheck,
  },
  {
    title: "Sofa thiết kế riêng",
    description: "Nhận tinh chỉnh kích thước, màu sắc và chất liệu để hợp đúng không gian của bạn.",
    icon: PencilRuler,
  },
  {
    title: "Giao hàng nhanh",
    description: "Hỗ trợ giao nhanh, lắp đặt gọn gàng và kiểm tra sản phẩm trước khi bàn giao.",
    icon: Truck,
  },
  {
    title: "Tư vấn 24/7",
    description: "Hỗ trợ chọn mẫu, chất liệu và phối màu bất cứ khi nào bạn cần.",
    icon: Headset,
  },
] as const;

export default function StoreHighlights({
  title = "Vì sao khách hàng chọn Sofa Phạm Gia",
  subtitle = "Bốn cam kết cốt lõi để bạn yên tâm từ lúc chọn mẫu đến khi hoàn thiện không gian.",
  className = "",
}: StoreHighlightsProps) {
  return (
    <section className={className}>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-[var(--color-brand-400)] sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-3xl text-sm text-[var(--color-text-muted)] sm:text-base">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              variant="default"
              padding="lg"
              hoverable
              className="h-full rounded-2xl border-[var(--color-brand-100)] bg-white shadow-sm">
              <div className="flex h-full flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-50)] text-[var(--color-brand-400)]">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[var(--color-text-default)]">{item.title}</h3>
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">{item.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
