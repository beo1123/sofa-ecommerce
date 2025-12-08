import Link from "next/link";
import Button from "../ui/Button";
import Grid, { GridItem } from "../ui/Grid";
import { SafeImage } from "../ui/SafeImage";

const BANNER_URL =
  "https://iffiqyzsfyvlpebvzurn.supabase.co/storage/v1/object/sign/images/Home/photo-1583847268964-b28dc8f51f92.avif?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZjI4MDk1My1iM2EzLTRkNmItOGJlNC05NjIwZWY5NzIzOWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvSG9tZS9waG90by0xNTgzODQ3MjY4OTY0LWIyOGRjOGY1MWY5Mi5hdmlmIiwiaWF0IjoxNzY1MjAwNzYzLCJleHAiOjE3OTY3MzY3NjN9.D2JmnHPmkzRCcCa8EBaGlO_G3Mkd8mXvQna2Yrq1y88";

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
