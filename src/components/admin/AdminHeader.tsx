"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { IconMenu2, IconExternalLink, IconUser } from "@tabler/icons-react";
import { useAdminUIStore } from "@/store/useAdminUIStore";
import { getActiveAdminNavItem } from "@/components/admin/admin-nav";

interface AdminHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
}

export default function AdminHeader({ userName, userEmail, userRole }: AdminHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const toggleMobileSidebar = useAdminUIStore((state) => state.toggleMobileSidebar);

  const activeItem = getActiveAdminNavItem(pathname);
  const displayName = userName ?? session?.user?.name ?? userEmail ?? session?.user?.email ?? "Admin";
  const displayRole = userRole ?? session?.user?.roles ?? "Admin";

  return (
    <header className="sticky top-0 z-20 flex h-[56px] shrink-0 items-center justify-between gap-4 border-b border-brand-100 bg-bg-page px-4 lg:px-6">
      {/* Left: Mobile menu toggle + Active module heading */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Mở menu quản trị"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-brand-100 bg-bg-page text-brand-400 transition-colors hover:border-brand-200 hover:bg-brand-50/60 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50 lg:hidden cursor-pointer">
          <IconMenu2 size={18} stroke={1.75} aria-hidden="true" />
        </button>

        <div className="flex min-w-0 items-baseline gap-2.5">
          <h1 className="truncate text-base font-semibold text-brand-400">{activeItem.label}</h1>
          <span className="hidden text-brand-100 md:inline" aria-hidden="true">
            /
          </span>
          <p className="hidden truncate text-xs text-text-muted md:block">{activeItem.description}</p>
        </div>
      </div>

      {/* Right: Storefront shortcut + Signed-in admin */}
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden h-8 items-center gap-1.5 rounded-[8px] border border-brand-100 bg-bg-page px-3 text-xs font-medium text-brand-300 transition-colors hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-400 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-50 sm:inline-flex">
          <IconExternalLink size={15} stroke={1.75} aria-hidden="true" />
          <span>sofaphamgia.com</span>
        </Link>

        <div className="flex items-center gap-2.5 pl-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-brand-400">
            <IconUser size={16} stroke={1.75} aria-hidden="true" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="max-w-[160px] truncate text-sm font-medium leading-tight text-text-default">{displayName}</p>
            <p className="text-[11px] leading-tight text-text-muted">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
