"use client";
import React from "react";
import Input from "@/components/ui/Input";
import Heading from "@/components/ui/Heading";
import Divider from "@/components/ui/Divider";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { CheckoutFormData } from "./CheckoutForm";

type Props = {
  addresses: any[];
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
};

export default function AddressForm({ addresses, register, errors, watch }: Props) {
  const useNewAddress = watch("useNewAddress");

  return (
    <>
      <Divider />
      <Heading level={4}>Địa chỉ giao hàng</Heading>

      {addresses.length > 0 && (
        <div className="flex items-center gap-3">
          <select {...register("addressId")} className="border rounded-md px-3 py-2 flex-1" disabled={useNewAddress}>
            {addresses.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.fullName} — {a.line1}, {a.city}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("useNewAddress")} />
            Địa chỉ mới
          </label>
        </div>
      )}

      {useNewAddress && (
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Input label="Họ tên" {...register("newAddress.fullName")} error={errors.newAddress?.fullName?.message} />
          <Input label="Số điện thoại" {...register("newAddress.phone")} error={errors.newAddress?.phone?.message} />
          <Input
            label="Địa chỉ"
            {...register("newAddress.line1")}
            error={errors.newAddress?.line1?.message}
            className="md:col-span-2"
          />
          <Input label="Thành phố" {...register("newAddress.city")} error={errors.newAddress?.city?.message} />
          <Input
            label="Tỉnh / Quận"
            {...register("newAddress.province")}
            error={errors.newAddress?.province?.message}
          />
          <Input
            label="Quốc gia"
            defaultValue="Việt Nam"
            {...register("newAddress.country")}
            error={errors.newAddress?.country?.message}
          />
        </div>
      )}
    </>
  );
}
