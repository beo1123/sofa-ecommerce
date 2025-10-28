"use client";
import React from "react";
import Heading from "@/components/ui/Heading";
import RadioGroup from "@/components/ui/Radio";
import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { CheckoutFormData } from "./CheckoutForm";
import { formatCurrency } from "@/lib/helpers";

type Props = {
  register: UseFormRegister<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
};

export default function ShippingOptions({ register, watch, setValue }: Props) {
  const shippingOption = watch("shippingOption");

  const options = [
    {
      value: "standard" as const,
      label: "Tiêu chuẩn",
      description: "Thời gian giao 3–5 ngày làm việc",
      price: "Miễn phí",
    },
    {
      value: "express" as const,
      label: "Giao nhanh",
      description: "Thời gian giao 1–2 ngày làm việc",
      price: `+${formatCurrency(50000)}`,
    },
  ];

  return (
    <div>
      <Heading level={4} className="mb-3">
        Hình thức giao hàng
      </Heading>
      <RadioGroup
        name="shippingOption"
        options={options}
        value={shippingOption}
        onChange={(val) =>
          setValue("shippingOption", val as "standard" | "express", {
            shouldValidate: true,
          })
        }
      />
    </div>
  );
}
