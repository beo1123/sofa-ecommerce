import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Quản trị – Sofa Phạm Gia",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch {
    redirect("/dang-nhap?callbackUrl=/admin");
  }

  const pendingInquiriesCount = await prisma.inquiry.count({
    where: { status: "new" },
  });

  return (
    <div className="min-h-screen bg-bg-page text-text-default">
      <AdminSidebar pendingInquiriesCount={pendingInquiriesCount} />

      <div className="flex min-h-screen flex-col lg:pl-[220px]">
        <AdminHeader userName={session.user?.name} userEmail={session.user?.email} userRole={session.user?.roles} />

        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
