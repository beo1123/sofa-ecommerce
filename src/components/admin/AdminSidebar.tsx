"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconArmchair,
  IconArticle,
  IconMessageDots,
  IconShieldCheck,
  IconTruckDelivery,
  IconUsers,
  IconDiscount,
  IconSettings,
  IconExternalLink,
  IconLogout,
} from "@tabler/icons-react";
import Drawer from "@/components/ui/Drawer";
import { SafeImage } from "@/components/ui/SafeImage";
import { headerLogoSrc } from "@/lib/branding";
import { useAdminUIStore } from "@/store/useAdminUIStore";
import { ADMIN_NAV_ITEMS, isAdminNavItemActive, type AdminNavIconKey } from "@/components/admin/admin-nav";

const ICON_MAP: Record<AdminNavIconKey, React.ComponentType<{ size?: number; stroke?: number; className?: string }>> = {
  dashboard: IconLayoutDashboard,
  orders: IconShoppingBag,
  products: IconArmchair,
  articles: IconArticle,
  inquiries: IconMessageDots,
  returns: IconShieldCheck,
  shipments: IconTruckDelivery,
  customers: IconUsers,
  coupons: IconDiscount,
  settings: IconSettings,
};

interface AdminSidebarProps {
  pendingInquiriesCount?: number;
}

function SidebarContent({
  pathname,
  pendingInquiriesCount = 0,
  onNavigate,
}: {
  pathname: string;
  pendingInquiriesCount?: number;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-bg-muted">
      {/* Brand header — 56px aligned with topbar */}
      <div className="flex h-[56px] shrink-0 items-center border-b border-brand-100 px-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5 rounded-[8px] focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
          <SafeImage
            src={headerLogoSrc}
            alt="Logo Sofa Phạm Gia"
            width={36}
            height={44}
            className="h-9 w-auto max-w-[80px] shrink-0 object-contain"
            priority
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold tracking-tight text-brand-400">Sofa Phạm Gia</span>
            <span className="truncate text-[11px] font-medium text-brand-200">Quản trị xưởng</span>
          </span>
        </Link>
      </div>

      {/* Navigation sections */}
      <nav aria-label="Điều hướng quản trị" className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.iconKey];
            const active = isAdminNavItemActive(item, pathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "flex items-center justify-between gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150 border-r-2 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-brand-50",
                    active
                      ? "bg-brand-50 text-brand-400 border-brand-400"
                      : "border-transparent text-text-default hover:bg-brand-50/60 hover:text-brand-400"
                  )}>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon
                      size={18}
                      stroke={1.75}
                      className={clsx("shrink-0", active ? "text-brand-400" : "text-brand-300")}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.showPendingBadge && pendingInquiriesCount > 0 && (
                    <span className="inline-flex min-w-[20px] items-center justify-center rounded-[20px] bg-brand-400 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                      {pendingInquiriesCount > 99 ? "99+" : pendingInquiriesCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-brand-100 p-2 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-brand-50/60 hover:text-brand-400 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50">
          <IconExternalLink size={18} stroke={1.75} className="shrink-0" />
          <span className="truncate">Xem cửa hàng</span>
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/dang-nhap" })}
          className="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-brand-50/60 hover:text-red-600 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50 cursor-pointer">
          <IconLogout size={18} stroke={1.75} className="shrink-0" />
          <span className="truncate">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ pendingInquiriesCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const mobileSidebarOpen = useAdminUIStore((state) => state.mobileSidebarOpen);
  const closeMobileSidebar = useAdminUIStore((state) => state.closeMobileSidebar);

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  return (
    <>
      {/* Desktop fixed 220px sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] shrink-0 border-r border-brand-100 bg-bg-muted lg:block">
        <SidebarContent pathname={pathname} pendingInquiriesCount={pendingInquiriesCount} />
      </aside>

      {/* Mobile slide-in sidebar */}
      <Drawer
        open={mobileSidebarOpen}
        onClose={closeMobileSidebar}
        side="left"
        widthClassName="w-[260px]"
        showCloseButton={false}
        bodyClassName="p-0">
        <SidebarContent
          pathname={pathname}
          pendingInquiriesCount={pendingInquiriesCount}
          onNavigate={closeMobileSidebar}
        />
      </Drawer>
    </>
  );
}
