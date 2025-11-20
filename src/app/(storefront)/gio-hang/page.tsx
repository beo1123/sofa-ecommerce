"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartShipping,
  selectCartTotal,
  selectCartItemCount,
} from "@/store/selector/cartSelectors";
import { updateQuantity, removeItem } from "@/store/slice/cartSlice";
import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { ImageIcon } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

type CouponForm = {
  code: string;
};

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectCartShipping);
  const total = useAppSelector(selectCartTotal);
  const count = useAppSelector(selectCartItemCount);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<CouponForm>({ defaultValues: { code: "" } });

  // Demo applyCoupon - trong thực tế gọi API để validate / áp dụng
  const onApplyCoupon = async (data: CouponForm) => {
    // fake async validation for UX demo
    if (!data.code || data.code.trim().length === 0) {
      setError("code", { type: "manual", message: "Vui lòng nhập mã giảm giá" });
      return;
    }

    // Demo logic: mã "GIAM10" => 10% giảm trên subtotal
    if (data.code.trim().toUpperCase() === "GIAM10") {
      // trong app thật bạn dispatch action để áp coupon lên cart hoặc lưu vào state order
      // ở đây ta chỉ hiển thị alert demo
      alert(`Mã '${data.code}' hợp lệ — demo: giảm 10% (không thay đổi state trong demo này).`);
      reset();
    } else {
      setError("code", { type: "manual", message: "Mã không hợp lệ hoặc đã hết hạn." });
    }
  };

  const handleDecrease = (it: (typeof items)[number]) => {
    dispatch(
      updateQuantity({
        productId: it.productId,
        variantId: it.variantId ?? null,
        sku: it.sku ?? null,
        price: it.price,
        quantity: Math.max(it.quantity - 1, 1),
      })
    );
  };

  const handleIncrease = (it: (typeof items)[number]) => {
    dispatch(
      updateQuantity({
        productId: it.productId,
        variantId: it.variantId ?? null,
        sku: it.sku ?? null,
        price: it.price,
        quantity: it.quantity + 1,
      })
    );
  };

  const handleRemove = (it: (typeof items)[number]) => {
    dispatch(
      removeItem({
        productId: it.productId,
        variantId: it.variantId ?? null,
        sku: it.sku ?? null,
        price: it.price,
      })
    );
  };

  return (
    <main className="min-h-screen py-12 bg-[var(--color-bg-muted)] text-[var(--color-text-default)]">
      <Container className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Heading level={1} className="ml-3 text-[var(--color-brand-400)]">
            Giỏ hàng
          </Heading>
          <Badge className="mr-3" variant="default">
            {count} sản phẩm
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="p-8 bg-white rounded shadow text-center">
                <div className="mx-auto mb-4 w-24 h-24 flex items-center justify-center rounded-full bg-[var(--color-bg-page)]">
                  <ImageIcon className="w-8 h-8 text-[var(--color-text-muted)]" />
                </div>
                <Heading level={3}>Giỏ hàng trống</Heading>
                <Text muted className="mb-4">
                  Hãy thêm sản phẩm để tiến hành thanh toán.
                </Text>
                <Link href="/san-pham">
                  <Button>Tiếp tục mua sắm</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded shadow divide-y">
                {items.map((it) => (
                  <div key={`${it.productId}-${it.variantId ?? ""}-${it.sku ?? ""}`} className="p-4 flex gap-4">
                    <div className="w-[96px] h-[96px] flex-shrink-0 rounded overflow-hidden bg-[var(--color-bg-muted)] flex items-center justify-center">
                      {it.image ? (
                        // next/image requires domains or remote patterns; for local/demo it's ok
                        <SafeImage src={it.image} alt={it.name} width={96} height={96} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-[var(--color-text-muted)]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Text className="font-medium line-clamp-2">{it.name}</Text>
                        {it.sku && (
                          <Text muted className="text-xs mt-1">
                            SKU: {it.sku}
                          </Text>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleDecrease(it)}
                            aria-label={`Giảm số lượng ${it.name}`}>
                            −
                          </Button>
                          <Text className="min-w-[36px] text-center">{it.quantity}</Text>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleIncrease(it)}
                            aria-label={`Tăng số lượng ${it.name}`}>
                            +
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            className="ml-2 text-red-500"
                            onClick={() => handleRemove(it)}>
                            Xóa
                          </Button>
                        </div>

                        <div className="text-right">
                          <Text className="text-sm line-through text-[var(--color-text-muted)]">
                            nếu có compareAtPrice, có thể hiển thị
                          </Text>
                          <Text className="font-semibold">{(it.price * it.quantity).toLocaleString("vi-VN")}₫</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: summary & coupon */}
          <aside className="space-y-4">
            <div className="bg-white rounded shadow p-4">
              <Heading level={3} className="mb-4">
                Tạm tính
              </Heading>

              <div className="flex justify-between mb-2">
                <Text muted>Hàng ({count} sản phẩm)</Text>
                <Text>{subtotal.toLocaleString("vi-VN")}₫</Text>
              </div>

              <div className="flex justify-between mb-2">
                <Text muted>Phí vận chuyển</Text>
                <Text>{shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString("vi-VN")}₫`}</Text>
              </div>

              <Divider />

              <div className="flex justify-between items-center mb-4">
                <Text className="font-semibold">Tổng</Text>
                <Text className="text-lg font-bold">{total.toLocaleString("vi-VN")}₫</Text>
              </div>

              <div className="space-y-2">
                <Link href="/thanh-toan">
                  <Button fullWidth variant="primary" className="mb-2">
                    Tiến hành thanh toán
                  </Button>
                </Link>
                <Link href="/san-pham">
                  <Button fullWidth variant="outline">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded shadow p-4">
              <Heading level={4} className="mb-2">
                Mã giảm giá
              </Heading>
              <form onSubmit={handleSubmit(onApplyCoupon)} className="space-y-3">
                <Input
                  placeholder="Nhập mã khuyến mãi"
                  {...register("code", { required: "Vui lòng nhập mã" })}
                  error={(errors.code as any)?.message}
                />
                <Button type="submit" fullWidth loading={isSubmitting}>
                  Áp dụng
                </Button>
              </form>
              <Text muted className="text-xs mt-3">
                (Demo) Dùng mã <strong>GIAM10</strong> để thử: áp 10% (không thay đổi state trong demo).
              </Text>
            </div>

            <div className="bg-white rounded shadow p-4">
              <Heading level={5} className="mb-2">
                Thông tin
              </Heading>
              <Text muted className="text-sm">
                Thanh toán an toàn — hỗ trợ VNPAY & COD. Kiểm tra kỹ thông tin trước khi đặt hàng.
              </Text>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
