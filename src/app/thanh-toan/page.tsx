"use client";

import React from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Divider from "@/components/ui/Divider";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { useAppSelector } from "@/store/hook";
import { selectCartItems, selectCartSubtotal, selectCartTotal } from "@/store/selector/cartSelectors";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { formatCurrency } from "@/lib/helpers";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

export default function CheckoutPage() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const total = useAppSelector(selectCartTotal);

  return (
    <main className="min-h-screen py-12 bg-[var(--color-bg-muted)] text-[var(--color-text-default)]">
      <Container className="space-y-8">
        {/* TITLE */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Heading level={1} className="text-[var(--color-brand-400)]">
            Thanh toán
          </Heading>
          <Link href="/gio-hang">
            <Button variant="outline">← Quay lại giỏ hàng</Button>
          </Link>
        </div>

        {/* LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Checkout form */}
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>

          {/* RIGHT: Cart summary */}
          <aside className="space-y-4">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Đơn hàng của bạn</CardTitle>
              </CardHeader>
              <div className="p-4 space-y-3 max-h-[400px] overflow-auto">
                {items.length === 0 ? (
                  <Text muted>Giỏ hàng trống.</Text>
                ) : (
                  items.map((it) => (
                    <div
                      key={`${it.productId}-${it.variantId ?? ""}-${it.sku ?? ""}`}
                      className="flex gap-3 items-center border-b pb-3 last:border-none last:pb-0">
                      <div className="w-16 h-16 bg-[var(--color-bg-muted)] flex items-center justify-center rounded overflow-hidden flex-shrink-0">
                        {it.image ? (
                          <Image src={it.image} alt={it.name} width={64} height={64} className="object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-[var(--color-text-muted)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Text className="font-medium text-sm line-clamp-2">{it.name}</Text>
                        {it.sku && (
                          <Text muted className="text-xs">
                            SKU: {it.sku}
                          </Text>
                        )}
                        <Text muted className="text-xs">
                          SL: {it.quantity}
                        </Text>
                      </div>
                      <Text className="text-sm font-semibold">{formatCurrency(it.price * it.quantity)}</Text>
                    </div>
                  ))
                )}
              </div>

              <Divider />

              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <Text muted>Tạm tính</Text>
                  <Text>{formatCurrency(subtotal)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text muted>Phí vận chuyển</Text>
                  <Text muted>Chưa tính</Text>
                </div>
                <Divider />
                <div className="flex justify-between font-semibold text-lg">
                  <Text>Tổng</Text>
                  <Text>{formatCurrency(total)}</Text>
                </div>
              </div>

              <CardFooter className="p-4">
                <Link href="/gio-hang">
                  <Button variant="ghost" fullWidth>
                    Quay lại giỏ hàng
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </Container>
    </main>
  );
}
