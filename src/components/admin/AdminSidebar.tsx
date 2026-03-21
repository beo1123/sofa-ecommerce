"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FileText, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/articles", label: "Bài viết", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`flex flex-col bg-[var(--color-brand-400)] text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        {!collapsed && <span className="text-lg font-bold tracking-wide">Sofa Admin</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              title={collapsed ? item.label : undefined}>
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/dang-nhap" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          title={collapsed ? "Đăng xuất" : undefined}>
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
