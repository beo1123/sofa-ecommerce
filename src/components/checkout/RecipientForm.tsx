"use client";
import React from "react";
import Input from "@/components/ui/Input";
import Heading from "@/components/ui/Heading";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CheckoutFormData } from "./CheckoutForm";

type Props = {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
};

export default function RecipientForm({ register, errors }: Props) {
  return (
    <>
      <Heading level={4}>Người nhận</Heading>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Họ tên" {...register("recipientName")} error={errors.recipientName?.message} required />
        <Input label="Số điện thoại" {...register("phone")} error={errors.phone?.message} required />
        <Input
          label="Email (tùy chọn)"
          {...register("email")}
          error={errors.email?.message}
          className="md:col-span-2"
        />
      </div>
    </>
  );
}
