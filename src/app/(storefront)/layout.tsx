import type { ReactNode } from "react";
import { getSharedCategories } from "@/lib/cache/categories";
import StoreNavbar from "@/components/store/StoreNavbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const categories = await getSharedCategories();

  return (
    <div className="min-h-screen flex flex-col bg-bg-page text-text-default">
      <StoreNavbar categories={categories} />
      <Container className="flex-1">
        <main>{children}</main>
      </Container>
      <Footer />
    </div>
  );
}
