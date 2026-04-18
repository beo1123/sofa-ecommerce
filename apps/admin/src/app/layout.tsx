import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata = {
  title: "Admin Dashboard | Sofa E-commerce",
  description: "Administration dashboard for Sofa E-commerce platform",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
