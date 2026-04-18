"use client";
import React from "react";
import Divider from "@/components/ui/Divider";
import Text from "@/components/ui/Text";
import { formatCurrency } from "@/lib/helpers";

type Props = {
  subtotal: number;
  shippingCost: number;
};

export default function OrderSummary({ subtotal, shippingCost }: Props) {
  const total = subtotal + shippingCost;

  return (
    <div className="space-y-2">
      <Divider />
      <div className="flex justify-between">
        <Text muted>Tạm tính</Text>
        <Text>{formatCurrency(subtotal)}</Text>
      </div>
      <div className="flex justify-between">
        <Text muted>Phí vận chuyển</Text>
        <Text>{shippingCost === 0 ? "Miễn phí" : formatCurrency(shippingCost)}</Text>
      </div>
      <Divider />
      <div className="flex justify-between text-lg font-semibold">
        <Text>Tổng cộng</Text>
        <Text>{formatCurrency(total)}</Text>
      </div>
    </div>
  );
}
