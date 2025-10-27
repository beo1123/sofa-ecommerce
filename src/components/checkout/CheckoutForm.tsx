"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Card, { CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useAppSelector } from "@/store/hook";
import { selectCartSubtotal } from "@/store/selector/cartSelectors";
import RecipientForm from "./RecipientForm";
import AddressForm from "./AddressForm";
import ShippingOptions from "./ShippingOptions";
import OrderSummary from "./OrderSummary";

const phoneRegex = /^(\+?\d{7,15})$/;

const newAddressSchema = z.object({
  fullName: z.string().min(2, "Tên người nhận bắt buộc"),
  line1: z.string().min(3, "Địa chỉ bắt buộc"),
  city: z.string().min(2, "Thành phố bắt buộc"),
  province: z.string().optional(),
  country: z.string().min(2, "Quốc gia bắt buộc"),
  phone: z.string().regex(phoneRegex, "Số điện thoại không hợp lệ"),
});

const CheckoutSchema = z.object({
  recipientName: z.string().min(2, "Tên người nhận bắt buộc"),
  phone: z.string().regex(phoneRegex, "Số điện thoại không hợp lệ"),
  email: z.email({ message: "Email không hợp lệ" }).optional(),
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
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutSchema),
    mode: "onTouched",
    defaultValues: {
      shippingOption: "standard",
      useNewAddress: !addresses.length,
    },
  });

  const shippingOption = watch("shippingOption");
  const shippingCost = shippingOption === "express" ? 50000 : 0;

  useEffect(() => {
    if (addresses.length && !watch("addressId")) {
      setValue("addressId", String(addresses[0].id));
    }
  }, [addresses, setValue, watch]);

  const onSubmit = async (data: CheckoutFormData) => {
    setServerError(null);
    try {
      const payload = {
        recipient: {
          name: data.recipientName,
          phone: data.phone,
          email: data.email,
        },
        address: data.useNewAddress ? data.newAddress : { id: data.addressId },
        shippingOption: data.shippingOption,
        notes: data.notes,
      };

      const res = await axios.post("/api/checkout", payload);
      alert(`✅ Order created!\nOrder ID: ${res.data?.orderId || "demo"}`);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Có lỗi xảy ra, thử lại sau.");
    }
  };

  return (
    <Card variant="elevated" className="max-w-3xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>Thông tin giao hàng</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
        <RecipientForm register={register} errors={errors} />
        <AddressForm addresses={addresses} register={register} errors={errors} watch={watch} />
        {/* ✅ Truyền setValue để fix lỗi thiếu prop */}
        <ShippingOptions register={register} watch={watch} setValue={setValue} />
        <OrderSummary subtotal={subtotal} shippingCost={shippingCost} />

        {serverError && <Alert variant="error" title="Lỗi" description={serverError} />}

        <CardFooter>
          <Button type="submit" fullWidth loading={isSubmitting} variant="primary" className="mt-2">
            Đặt hàng
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
