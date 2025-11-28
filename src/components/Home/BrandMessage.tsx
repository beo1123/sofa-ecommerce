import Link from "next/link";
import Grid, { GridItem } from "../ui/Grid";
import { SafeImage } from "../ui/SafeImage";
import Button from "../ui/Button";

export function BrandMessage() {
  return (
    <Grid cols={1} responsive={{ md: 2 }} gap="lg">
      {/* IMAGE */}
      <GridItem className="bg-brand-50 h-80 rounded-md flex items-center justify-center overflow-hidden">
        <SafeImage
          src="https://images.unsplash.com/photo-1684165610413-2401399e0e59?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Hình ảnh thương hiệu"
          width={800}
          height={800}
          className="w-full h-full object-cover rounded-md"
        />
      </GridItem>

      {/* TEXT */}
      <GridItem className="flex flex-col justify-center gap-md">
        <h3 className="text-2xl font-semibold">Nội thất sang trọng bắt đầu từ chất liệu cao cấp nhất</h3>

        <p className="text-text-muted">
          Triết lý của chúng tôi là kết hợp thiết kế tinh tế và vật liệu bền vững để tạo ra sản phẩm nội thất trường tồn
          qua nhiều thế hệ.
        </p>
        <Link href="/gioi-thieu">
          <Button className="px-lg py-md bg-brand-400 text-white rounded-md w-fit hover:bg-brand-300 transition">
            Tìm hiểu thêm
          </Button>
        </Link>
      </GridItem>
    </Grid>
  );
}
