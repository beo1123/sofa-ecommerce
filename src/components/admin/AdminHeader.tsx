"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-[var(--color-text-muted)]">Quản trị hệ thống</div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-[var(--color-brand-100)] flex items-center justify-center">
            <User size={16} className="text-[var(--color-brand-400)]" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-[var(--color-text-default)] leading-tight">
              {session?.user?.name ?? session?.user?.email ?? "Admin"}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">{session?.user?.roles ?? "Admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
