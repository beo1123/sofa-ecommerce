"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { useAuth } from "@/hooks/auth/useAuth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

// ✅ Schema
const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const res = await login(data.email, data.password);
    if (res.success) router.push("/");
  };

  return (
    <div className="max-w-4xl mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
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

            {error && <Alert variant="error" title="Lỗi" description={error} />}

            <Button type="submit" loading={loading} className="w-full">
              Đăng nhập
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <a href="/dang-ky" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
