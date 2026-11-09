import Alert from "@/components/ui/Alert";

type PromotionItem = {
  title: string;
  description: string;
};

const PROMOTIONS: PromotionItem[] = [
  {
    title: "Giảm thêm 300.000đ cho khách sinh nhật trong tháng 🎂",
    description: "Giảm ngay 300.000đ cho khách hàng có sinh nhật trong tháng này.",
  },
  {
    title: "Tặng voucher 500.000đ cho đơn hàng tiếp theo 🔥",
    description: "Có thể nhận tiền mặt hoặc trừ vào giá sản phẩm sau.",
  },
  {
    title: "Tặng 2 gối ôm 45×45 trị giá 500.000đ 🎁",
    description: "Quà tặng kèm theo khi mua sản phẩm.",
  },
  {
    title: "Miễn phí giao hàng nội thành 🚚",
    description: "Miễn phí giao hàng trong nội thành Thành phố Hồ Chí Minh.",
  },
  {
    title: "Cam kết chất liệu ngoại nhập 100% ✅",
    description: "Liên hệ đặt mua: 0932 111 620 (A. Giang).",
  },
];

export default function ProductPromotions() {
  return (
    <section className="rounded-3xl bg-[var(--color-bg-muted)]/60 p-4 sm:p-5 ring-1 ring-[var(--color-brand-50)]">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-bold text-[var(--color-text-default)]">Đặc quyền & Ưu đãi đi kèm</h3>
      </div>

      <ul className="space-y-2.5">
        {PROMOTIONS.map((item) => (
          <li key={item.title}>
            <Alert
              title={item.title}
              description={item.description}
              className="rounded-2xl bg-[var(--color-bg-page)] text-[var(--color-text-default)] border-[var(--color-brand-50)] p-3.5"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
