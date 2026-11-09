import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import Text from "@/components/ui/Text";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Button from "../ui/Button";

export default function ContactInfoCard() {
  const phone = process.env.NEXT_PUBLIC_PHONE_URL || "0932 111 620";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
      <Card variant="bordered" className="rounded-2xl sm:rounded-3xl">
        <CardHeader>
          <CardTitle>Hotline hỗ trợ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Phone className="shrink-0 text-[var(--color-brand-400)]" />
            <div className="min-w-0">
              <Text className="text-base sm:text-lg font-semibold">{phone}</Text>
              <Text muted className="text-xs sm:text-sm">
                7:00 — 21:00 (T2 — CN)
              </Text>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full sm:w-auto justify-center rounded-full">
            <a href={`tel:${phone.replace(/\s+/g, "")}`}>Gọi ngay</a>
          </Button>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl sm:rounded-3xl">
        <CardHeader>
          <CardTitle>Email hỗ trợ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Mail className="shrink-0 text-[var(--color-brand-400)]" />
            <div className="min-w-0">
              <Text className="font-medium break-all text-sm sm:text-base">support@sofasofaphamgia.vn</Text>
              <Text muted className="text-xs sm:text-sm">
                Trả lời trong vòng 24 giờ
              </Text>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl sm:rounded-3xl">
        <CardHeader>
          <CardTitle>Xưởng Sản Xuất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <MapPin className="shrink-0 mt-0.5 text-[var(--color-brand-400)]" />
            <div className="min-w-0">
              <Text className="font-medium text-sm sm:text-base">C12/17, Ấp 36 Bình Chánh, TPHCM</Text>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl sm:rounded-3xl">
        <CardHeader>
          <CardTitle>Thời gian làm việc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Clock className="shrink-0 text-[var(--color-brand-400)]" />
            <div className="min-w-0">
              <Text className="text-sm sm:text-base">Thứ 2 - Thứ 7: 8:00 - 21:00</Text>
              <Text muted className="text-xs sm:text-sm">
                Chủ nhật: 9:00 - 18:00
              </Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
