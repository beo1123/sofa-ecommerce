import Alert from "@/components/ui/Alert";

type PromotionItem = {
  title: string;
  description: string;
};

const PROMOTIONS: PromotionItem[] = [
  {
    title: "Giao hàng toàn quốc miễn phí",
    description: "Miễn phí vận chuyển cho đơn hàng từ 2.000.000 VND.",
  },
  {
    title: "Bảo hành khung sofa",
    description: "Bảo hành lên đến 24 tháng theo chính sách của cửa hàng.",
  },
  {
    title: "Hỗ trợ đổi trả",
    description: "Hỗ trợ đổi trả trong 7 ngày nếu lỗi do nhà sản xuất.",
  },
];

export default function ProductPromotions() {
  return (
    <section className="mb-6 rounded-xl border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] p-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-[var(--color-brand-400)]">Ưu đãi dành cho bạn</h3>
      </div>

      <ul className="mt-3 space-y-3">
        {PROMOTIONS.map((item) => (
          <li key={item.title}>
            <Alert
              title={item.title}
              description={item.description}
              className="bg-[var(--color-brand-50)] text-[var(--color-text-default)] border-[var(--color-brand-100)]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
