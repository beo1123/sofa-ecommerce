import type { ReactNode } from "react";
import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import ReduxProvider from "@/providers/ReduxProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

export const metadata: Metadata = {
  title: "Admin – Sofa Ecommerce",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex bg-[var(--color-bg-muted)] text-slate-900">
        <ReduxProvider>
          <ReactQueryProvider>
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
              <AdminHeader />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
