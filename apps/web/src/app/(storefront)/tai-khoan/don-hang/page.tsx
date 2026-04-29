import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import OrdersList from "@/components/account/OrdersList";
import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/dang-nhap");
  }

  return (
    <main className="min-h-screen bg-bg-muted py-10">
      <Container className="max-w-4xl space-y-10">
        <Heading level={1} className="text-center text-brand-500">
          🧾 Đơn hàng của tôi
        </Heading>
        <OrdersList />
      </Container>
    </main>
  );
}
