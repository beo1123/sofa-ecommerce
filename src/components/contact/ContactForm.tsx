// FILE: src/app/contact/components/ContactForm.tsx
"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import Text from "@/components/ui/Text";
import ContactReasonSelect from "./ContactReasonSelect";

const formSchema = z.object({
  name: z.string().min(1, "Họ tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(7, "Số điện thoại không hợp lệ"),
  reason: z.enum(["general", "order", "warranty", "refund", "custom"]),
  message: z.string().min(10, "Vui lòng nhập chi tiết hơn"),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: FormData) => {
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cảm ơn bạn!</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>Chúng tôi đã nhận được thông tin và sẽ liên hệ trong 24 giờ.</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Gửi yêu cầu</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <Input label="Họ và tên" {...register("name")} error={errors.name?.message} />
        <Input label="Email" {...register("email")} error={errors.email?.message} />
        <Input label="Số điện thoại" {...register("phone")} error={errors.phone?.message} />

        <Controller
          control={control}
          name="reason"
          render={({ field }) => (
            <ContactReasonSelect name={field.name} value={field.value} onChange={field.onChange} />
          )}
        />

        {errors.reason && <Text className="text-red-500">{errors.reason.message}</Text>}

        <label className="block">
          <span className="text-sm font-medium">Nội dung</span>
          <textarea
            {...register("message")}
            rows={6}
            className="mt-1 block w-full rounded-md border p-2 bg-white"
            placeholder="Mô tả yêu cầu của bạn"
          />
          {errors.message && <Text className="text-red-500">{errors.message.message}</Text>}
        </label>

        <Button type="submit" loading={isSubmitting} fullWidth>
          Gửi liên hệ
        </Button>
      </form>

      <CardFooter>
        <Text muted>Hoặc gọi ngay: {process.env.NEXT_PUBLIC_PHONE_URL}</Text>
      </CardFooter>
    </Card>
  );
}
