"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, ChevronDown, LogOut, Box, Heart, ShoppingCart } from "lucide-react";
import { useUserSync } from "@/hooks/auth/useUserSync";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import Text from "@/components/ui/Text";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { useAppSelector } from "@/store/hook";
import { selectCartItemCount } from "@/store/selector/cartSelectors";
import { useAuth } from "@/hooks/auth/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function HeaderUser() {
  const { user, status } = useUserSync();
  const { logout } = useAuth();
  const cartCount = useAppSelector(selectCartItemCount);

  const [open, setOpen] = useState(false); // dropdown desktop
  const [openMobile, setOpenMobile] = useState(false); // modal mobile
  const ref = useRef<HTMLDivElement | null>(null);

  // click outside -> close dropdown
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // Loading skeleton
  if (status === "loading") {
    return (
      <>
        {/* Desktop loading (xl+) */}
        <div className="hidden xl:flex items-center gap-3 pr-4 border-r border-[var(--color-brand-50)]">
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center">
            <Spinner />
          </div>
          <div className="w-40">
            <div className="h-4 bg-[var(--color-bg-muted)] rounded animate-pulse" />
          </div>
        </div>

        {/* Mobile loading: small spinner button */}
        <div className="flex xl:hidden items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center">
            <Spinner size={18} />
          </div>
        </div>
      </>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <>
        {/* Desktop */}
        <div className="hidden xl:flex items-center gap-3 pr-4 border-r border-[var(--color-brand-50)]">
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-5 h-5 text-[var(--color-brand-400)]" />
          </div>
          <div className="text-sm min-w-0">
            <p className="font-medium text-[var(--color-text-default)] truncate">Xin chào, Khách</p>
            <div className="text-xs whitespace-nowrap">
              <Link
                href="/dang-nhap"
                className="text-[var(--color-brand-300)] hover:text-[var(--color-brand-400)] mr-2">
                Đăng nhập
              </Link>
              <Link href="/dang-ky" className="text-[var(--color-brand-300)] hover:text-[var(--color-brand-400)]">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex xl:hidden items-center gap-3">
          <Button variant="ghost" onClick={() => setOpenMobile(true)} aria-label="Tài khoản" className="p-2">
            <UserIcon className="w-5 h-5" />
          </Button>

          <Modal isOpen={openMobile} onClose={() => setOpenMobile(false)} title="Tài khoản">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-[var(--color-brand-400)]" />
                </div>
                <div>
                  <Text className="font-medium">Xin chào, Khách</Text>
                  <Text muted className="text-sm">
                    Đăng nhập để quản lý đơn hàng & yêu thích
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link href="/dang-nhap" className="block">
                  <Button onClick={() => setOpenMobile(false)} fullWidth>
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/dang-ky" className="block">
                  <Button onClick={() => setOpenMobile(false)} variant="outline" fullWidth>
                    Đăng ký
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        </div>
      </>
    );
  }

  // Logged in view (desktop + mobile)
  return (
    <>
      {/* Desktop */}
      <div
        ref={ref}
        className="hidden xl:flex items-center gap-3 pr-4 border-r border-[var(--color-brand-50)] relative">
        <Button
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 focus:outline-none"
          aria-haspopup="true"
          aria-expanded={open}>
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-5 h-5 text-[var(--color-brand-400)]" />
          </div>
          <div className="text-sm min-w-0 text-left">
            <p className="font-medium text-[var(--color-text-default)] truncate">{user.displayName || user.email}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {user.roles && user.roles.length > 0 ? user.roles : "Khách hàng"}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] ml-2" />
        </Button>

        {/* Dropdown (Card) */}
        {open && (
          <AnimatePresence>
            <motion.div
              key="user-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "circInOut" }}
              className="absolute right-0 top-full mt-3 w-64 z-50">
              <Card variant="elevated" className="shadow-lg rounded-md overflow-hidden">
                <CardContent className="p-2">
                  <div className="space-y-1">
                    <Link href="/account" className="block">
                      <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-2">
                        <UserIcon className="w-4 h-4" /> <span className="text-sm">Hồ sơ</span>
                      </Button>
                    </Link>

                    <Link href="/account/orders" className="block">
                      <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-2">
                        <Box className="w-4 h-4" /> <span className="text-sm">Đơn hàng</span>
                        <span className="ml-auto text-xs text-[var(--color-text-muted)]">{/* optional */}</span>
                      </Button>
                    </Link>

                    <Link href="/wishlist" className="block">
                      <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-2">
                        <Heart className="w-4 h-4" /> <span className="text-sm">Yêu thích</span>
                      </Button>
                    </Link>

                    <Link href="/gio-hang" className="block">
                      <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-2">
                        <ShoppingCart className="w-4 h-4" /> <span className="text-sm">Giỏ hàng</span>
                        <span className="ml-auto text-xs text-[var(--color-text-muted)]">{cartCount ?? 0}</span>
                      </Button>
                    </Link>
                  </div>

                  <div className="border-t border-[var(--color-brand-50)] mt-2 pt-2">
                    <Button
                      variant="danger"
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm"
                      onClick={async () => {
                        await logout();
                      }}>
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Mobile */}
      <div className="flex xl:hidden items-center gap-3">
        <Button variant="ghost" onClick={() => setOpenMobile(true)} aria-label="Tài khoản">
          <UserIcon className="w-5 h-5" />
        </Button>

        <Modal isOpen={openMobile} onClose={() => setOpenMobile(false)} title="Tài khoản">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-[var(--color-brand-400)]" />
              </div>
              <div>
                <Text className="font-medium">{user.displayName || user.email}</Text>
                <Text muted className="text-sm">
                  {user.roles && user.roles.length > 0 ? user.roles : "Khách hàng"}
                </Text>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/account" className="block">
                <Button onClick={() => setOpenMobile(false)} fullWidth>
                  Hồ sơ
                </Button>
              </Link>
              <Link href="/account/orders" className="block">
                <Button onClick={() => setOpenMobile(false)} variant="outline" fullWidth>
                  Đơn hàng
                </Button>
              </Link>
              <Link href="/wishlist" className="block">
                <Button onClick={() => setOpenMobile(false)} variant="ghost" fullWidth>
                  Yêu thích
                </Button>
              </Link>
              <Link href="/gio-hang" className="block">
                <Button onClick={() => setOpenMobile(false)} variant="ghost" fullWidth>
                  Giỏ hàng ({cartCount ?? 0})
                </Button>
              </Link>
            </div>

            <div className="pt-2">
              <Button
                variant="danger"
                fullWidth
                onClick={async () => {
                  await logout();
                }}>
                <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
