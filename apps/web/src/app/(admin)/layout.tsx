import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin – Sofa Ecommerce",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    redirect("/dang-nhap?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-muted)] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
