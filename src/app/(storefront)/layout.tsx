import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header />
      <Container className="flex-1">
        <main>{children}</main>
      </Container>
      <Footer />
    </div>
  );
}
