"use client";

import React from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Card, { CardHeader, CardTitle, CardFooter, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import Heading from "@/components/ui/Heading";
import Badge from "@/components/ui/Badge";
import { useOrders } from "@/hooks/orders/userOrders";
import { PackageSearch } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";
import { getOrderStatusLabel, getOrderStatusVariant } from "@/lib/order/orderUtils";

export default function OrdersList() {
  const { orders, loading, error, refetch } = useOrders();

  if (loading) {
    return (
      <Container className="py-16 flex flex-col items-center justify-center text-center">
        <Spinner size={42} />
        <Text muted className="mt-4">
          Đang tải danh sách đơn hàng...
        </Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-12">
        <Alert
          variant="error"
          title="Không thể tải đơn hàng"
          description="Đã xảy ra lỗi khi lấy dữ liệu. Vui lòng thử lại sau."
        />
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={refetch}>
            Thử lại
          </Button>
        </div>
      </Container>
    );
  }

  if (!orders.length) {
    return (
      <Container className="py-16 text-center">
        <Card variant="bordered" className="max-w-lg mx-auto p-10">
          <PackageSearch size={64} className="mx-auto mb-4 text-[var(--color-brand-400)]" />
          <Text muted>Hiện tại bạn chưa có đơn hàng nào.</Text>
          <CardFooter className="mt-6 flex justify-center">
            <Link href="/san-pham">
              <Button variant="primary">🛍️ Mua sắm ngay</Button>
            </Link>
          </CardFooter>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Heading level={2} className="mb-8">
        📦 Danh sách đơn hàng ({orders.length})
      </Heading>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} variant="elevated" hoverable className="transition-all duration-200">
            <CardHeader className="flex flex-wrap justify-between gap-3 items-start">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800">Mã đơn: #{order.orderNumber}</CardTitle>
                <Text muted>Ngày tạo: {new Date(order.createdAt).toLocaleString()}</Text>
                {order.recipientName && <Text muted>Người nhận: {order.recipientName}</Text>}
                {order.paymentMethod && <Text muted>Thanh toán: {order.paymentMethod}</Text>}
              </div>

              <div className="text-right">
                <Text className="font-semibold text-[var(--color-brand-600)] text-lg">
                  {formatCurrency(order.total)}
                </Text>
                <Badge variant={getOrderStatusVariant(order.status)} className="mt-1 capitalize">
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <Text muted className="text-sm mt-3">
                Cảm ơn bạn đã mua hàng tại <strong>SofaStore</strong>! Đơn hàng của bạn sẽ được xử lý sớm nhất.
              </Text>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Link href={`/tai-khoan/don-hang/${order.id}`}>
                <Button variant="ghost" size="sm">
                  Xem chi tiết
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Container>
  );
}
