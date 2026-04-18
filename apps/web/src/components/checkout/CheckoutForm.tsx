"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAppSelector } from "@/store/hook";
import { selectCartSubtotal } from "@/store/selector/cartSelectors";

import Card, { CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";
import Text from "@/components/ui/Text";
import RecipientForm from "./RecipientForm";
import AddressForm from "./AddressForm";
import ShippingOptions from "./ShippingOptions";
import OrderSummary from "./OrderSummary";
import { useCreateOrder } from "@/hooks/orders/useCreateOrder";

const phoneRegex = /^(\+?\d{7,15})$/;

const newAddressSchema = z.object({
  line1: z.string().min(3, "Địa chỉ bắt buộc"),
  city: z.string().min(2, "Thành phố bắt buộc"),
  province: z.string().optional(),
  country: z.string().min(2, "Quốc gia bắt buộc"),
});

const CheckoutSchema = z.object({
  recipientName: z.string().min(2, "Tên người nhận bắt buộc"),
  phone: z.string().regex(phoneRegex, "Số điện thoại không hợp lệ"),
  email: z
    .union([
      z.string().trim().length(0), // cho phép rỗng
      z.email({ message: "Email không hợp lệ" }),
    ])
    .optional(),
  addressId: z.string().optional().nullable(),
  useNewAddress: z.boolean().optional(),
  newAddress: newAddressSchema.optional(),
  shippingOption: z.enum(["standard", "express"]),
  notes: z.string().max(500).optional(),
});

export type CheckoutFormData = z.infer<typeof CheckoutSchema>;

export default function CheckoutForm() {
  const subtotal = useAppSelector(selectCartSubtotal);
  const addresses = useAppSelector((s) => s.user?.addresses || []);
  const cartItems = useAppSelector((s) => s.cart.items);
  const user = useAppSelector((s) => s.user);

  const { createOrder, loading, error } = useCreateOrder();

  const [successModal, setSuccessModal] = useState<{ orderNumber: number | string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutSchema),
    mode: "onTouched",
    defaultValues: {
      shippingOption: "standard",
      useNewAddress: !addresses.length,
      recipientName: user?.displayName || "",
      email: user?.email || "",
    },
  });

  const shippingOption = watch("shippingOption");
  const shippingCost = shippingOption === "express" ? 50000 : 0;

  useEffect(() => {
    if (addresses.length && !watch("addressId")) {
      setValue("addressId", String(addresses[0].id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses, setValue]);

  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      reset({
        recipientName: user.displayName || "",
        email: user.email || "",
        addressId: defaultAddr ? String(defaultAddr.id) : undefined,
        useNewAddress: !defaultAddr,
        shippingOption: "standard",
      });
    }
  }, [user, reset]);
  const onSubmit = async (data: CheckoutFormData) => {
    // ✅ Nếu giỏ hàng trống thì chuyển hướng
    if (!cartItems || cartItems.length === 0) {
      window.location.href = "/san-pham"; // hoặc "/products"
      return;
    }

    // ✅ Nếu có sản phẩm thì tiếp tục tạo order
    const res = await createOrder(data);
    if (res.success && res.orderNumber) {
      setSuccessModal({ orderNumber: res.orderNumber });
    }
  };

  return (
    <>
      <Card variant="elevated" className="max-w-3xl mx-auto bg-white">
        <CardHeader>
          <CardTitle>Thông tin giao hàng</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <RecipientForm register={register} errors={errors} />
          <AddressForm addresses={addresses} register={register} errors={errors} watch={watch} />
          <ShippingOptions register={register} watch={watch} setValue={setValue} />
          <OrderSummary subtotal={subtotal} shippingCost={shippingCost} />

          {error && <Alert variant="error" title="Lỗi" description={error} />}

          <CardFooter>
            <Button type="submit" fullWidth loading={loading} variant="primary">
              Đặt hàng
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* ✅ Modal hiển thị khi order thành công */}
      {successModal && (
        <Modal isOpen={true} onClose={() => setSuccessModal(null)} title="🎉 Đặt hàng thành công" size="md">
          <Text className="mb-2">Cảm ơn bạn đã đặt hàng!</Text>
          <Text>
            Mã đơn hàng của bạn là: <strong>#{successModal.orderNumber}</strong>
          </Text>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSuccessModal(null)}>
              Đóng
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSuccessModal(null);
                window.location.href = "/orders";
              }}>
              Xem đơn hàng
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
