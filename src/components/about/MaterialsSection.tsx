import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import { SafeImage } from "@/components/ui/SafeImage";
import { sofaImages } from "./images";

export default function MaterialsSection() {
  return (
    <section className="p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-[var(--color-bg-page)] ring-1 ring-[var(--color-brand-50)] shadow-[0_8px_30px_-12px_color-mix(in_srgb,var(--color-brand-400)_8%,transparent)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
        <div className="space-y-4 sm:space-y-5">
          <Heading level={2} className="text-xl sm:text-2xl lg:text-3xl">
            Chất liệu được tuyển chọn
          </Heading>

          <Text muted>
            Vải dệt bền màu, da cao cấp dễ vệ sinh, cùng khung gỗ sồi tự nhiên chống cong vênh — tất cả tạo nên sự bền
            bỉ vượt trội.
          </Text>

          <Text>
            Mỗi chất liệu đều được lựa chọn theo tiêu chuẩn khắt khe về độ bền, khả năng chống xước và thân thiện với
            môi trường, đảm bảo sofa của bạn giữ được vẻ đẹp lâu dài.
          </Text>

          <Text>
            Sự kết hợp giữa công nghệ xử lý hiện đại và vật liệu tự nhiên giúp sản phẩm đạt độ hoàn thiện cao, phù hợp
            với cả không gian sang trọng lẫn phong cách tối giản.
          </Text>

          <ul className="list-disc ml-5 space-y-2 text-sm sm:text-base text-[var(--color-text-muted)]">
            <li>Vải woven chống phai màu, chống bám bụi</li>
            <li>Da microfiber mềm, thoáng khí, dễ lau sạch</li>
            <li>Khung gỗ sồi kiln-dried hạn chế cong vênh</li>
            <li>Mút đàn hồi cao không xẹp lún sau thời gian dài</li>
          </ul>
        </div>

        <div>
          <SafeImage
            src={sofaImages.materials}
            width={1920}
            height={1280}
            alt="Premium materials"
            className="rounded-2xl shadow-lg object-cover h-[240px] sm:h-[340px] lg:h-[420px] w-full"
          />
        </div>
      </div>
    </section>
  );
}
