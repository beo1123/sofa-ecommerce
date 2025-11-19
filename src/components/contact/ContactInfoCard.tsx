import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import Text from "@/components/ui/Text";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Button from "../ui/Button";
export default function ContactInfoCard() {
  return (
    <div className="space-y-4">
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Hotline hỗ trợ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Phone />
            <div>
              <Text className="text-lg font-semibold">0932 111 620</Text>
              <Text muted>7:00 — 21:00 (T2 — CN)</Text>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>
            <a href="tel:0932111620">Gọi ngay</a>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email hỗ trợ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Mail />
            <div>
              <Text className="font-medium">support@sofasofaphamgia.vn</Text>
              <Text muted>Trả lời trong vòng 24 giờ</Text>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Xưởng Sản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <MapPin />
            <div>
              <Text className="font-medium">C12/17, Ấp 36 Bình Chánh, TPHCM</Text>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thời gian làm việc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Clock />
            <div>
              <Text>Thứ 2 - Thứ 7: 8:00 - 21:00</Text>
              <Text muted>Chủ nhật: 9:00 - 18:00</Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
