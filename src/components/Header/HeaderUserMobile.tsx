"use client";

import React from "react";
import Link from "next/link";
import { User, LogOut, ShoppingBag } from "lucide-react";
import { useUserSync } from "@/hooks/auth/useUserSync";
import { useAuth } from "@/hooks/auth/useAuth";

import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import Divider from "@/components/ui/Divider";
import Spinner from "@/components/ui/Spinner";

type Props = {
  onClose?: () => void;
};

export default function HeaderUserMobile({ onClose }: Props) {
  const { user, status } = useUserSync();
  const { logout } = useAuth();

  if (status === "loading") {
    return (
      <Card variant="bordered" className="p-4 bg-[var(--color-bg-muted)]">
        <div className="flex items-center justify-center py-4">
          <Spinner size={28} />
          <Text muted className="ml-2">
            Đang tải thông tin người dùng...
          </Text>
        </div>
      </Card>
    );
  }

  // ===================== GUEST =====================
  if (!user) {
    return (
      <Card variant="elevated" className="p-4  bg-[var(--color-bg-muted)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} className="text-[var(--color-brand-400)]" />
            Xin chào, Khách 👋
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text muted size="sm">
            Hãy đăng nhập để xem tài khoản và đơn hàng của bạn.
          </Text>

          <div className="flex gap-3 mt-4">
            <Link href="/dang-nhap" onClick={onClose}>
              <Button>Đăng nhập</Button>
            </Link>
            <Link href="/dang-ky" onClick={onClose}>
              <Button variant="outline">Đăng ký</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===================== LOGGED-IN =====================
  return (
    <Card variant="elevated" className="p-4 bg-[var(--color-bg-muted)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} className="text-[var(--color-brand-400)]" />
          {user.displayName || user.email}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Text muted size="sm" className="mb-3">
          Chào mừng bạn quay lại 💫
        </Text>

        <div className="flex flex-col gap-2">
          <Link href="/account" onClick={onClose}>
            <Button variant="secondary" size="sm" leftIcon={<User size={14} />}>
              Hồ sơ
            </Button>
          </Link>

          <Link href="/tai-khoan/don-hang" onClick={onClose}>
            <Button variant="secondary" size="sm" leftIcon={<ShoppingBag size={14} />}>
              Đơn hàng
            </Button>
          </Link>
        </div>

        <Divider className="my-4" />

        <Button
          variant="outline"
          size="sm"
          leftIcon={<LogOut size={14} />}
          onClick={async () => {
            await logout();
            onClose?.();
          }}>
          Đăng xuất
        </Button>
      </CardContent>

      <CardFooter />
    </Card>
  );
}
