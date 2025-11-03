"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import Card, { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

const signupSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    passwordConfirm: z.string().min(6, "Nhập lại mật khẩu"),
    displayName: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Mật khẩu không khớp",
    path: ["passwordConfirm"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    const res = await signup({
      email: data.email,
      password: data.password,
      displayName: data.displayName || "",
    });
    if (res.success) router.push("/dang-nhap");
  };

  return (
    <div className="max-w-4xl mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" {...register("email")} placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <Input type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nhập lại mật khẩu</label>
              <Input type="password" {...register("passwordConfirm")} placeholder="••••••••" />
              {errors.passwordConfirm && <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tên hiển thị (tuỳ chọn)</label>
              <Input {...register("displayName")} placeholder="Nguyễn Văn A" />
            </div>

            {error && <Alert variant="error" title="Lỗi" description={error} />}

            <Button type="submit" loading={loading} className="w-full">
              Đăng ký
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <a href="/dang-nhap" className="text-blue-600 hover:underline">
            Đăng nhập
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
