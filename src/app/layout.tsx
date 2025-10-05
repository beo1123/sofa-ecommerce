// app/layout.tsx
import "./globals.css"; // adjust path if you keep global css elsewhere
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Header from "@components/Header";
import Footer from "@components/Footer";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Sofa Ecommerce",
  description: "Sofa Ecommerce — demo shop",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-white text-slate-900">
        {/* Header is a client component (handles mobile toggle) */}
        <Header cartCount={3} />

        {/* Page container */}
        <Container className="flex-1">
          <main>{children}</main>
        </Container>

        <Footer />
      </body>
    </html>
  );
}
