import Link from "next/link";
import Button from "../ui/Button";
import Grid, { GridItem } from "../ui/Grid";
import { SafeImage } from "../ui/SafeImage";

const BANNER_URL =
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687";

export function Hero() {
  return (
    <Grid cols={1} responsive={{ md: 2 }} gap="lg">
      <GridItem className="flex flex-col justify-center gap-md">
        <h1 className="text-4xl font-bold">Nội thất sang trọng cho ngôi nhà hiện đại</h1>
        <p className="text-text-muted">
          Khám phá những thiết kế nội thất tinh tế được chế tác từ vật liệu cao cấp và tay nghề thủ công.
        </p>
        <Link href="/san-pham">
          <Button className="px-lg py-md w-[30%]">Mua Ngay</Button>
        </Link>
      </GridItem>
      <GridItem className="relative rounded-md h-96 overflow-hidden">
        <SafeImage src={BANNER_URL} alt="Banner" fill className="object-cover object-center" priority />
      </GridItem>
    </Grid>
  );
}
