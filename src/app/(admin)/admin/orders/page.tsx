import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminOrderService } from "@/services/admin/order.service";
import { isWorkshopStatus } from "@/lib/workshop-types";
import OrdersTableClient from "@/components/admin/orders/OrdersTableClient";

export const dynamic = "force-dynamic";

const orderService = new AdminOrderService(prisma);

interface AdminOrdersPageProps {
  searchParams: Promise<{
    workshopStatus?: string;
    orderId?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const [params, serializedOrders] = await Promise.all([searchParams, orderService.listSerializedOrders()]);

  const initialWorkshopStatus =
    params.workshopStatus && isWorkshopStatus(params.workshopStatus) ? params.workshopStatus : "";
  const parsedOrderId = params.orderId && /^\d+$/.test(params.orderId) ? Number(params.orderId) : null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-400">Quản lý đơn hàng</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Nhấn trực tiếp vào trạng thái xưởng để chuyển bước quy trình, hoặc nhấn vào dòng đơn để mở ngăn kéo chi tiết.
        </p>
      </div>

      <OrdersTableClient
        initialOrders={serializedOrders}
        initialWorkshopStatus={initialWorkshopStatus}
        initialOrderId={parsedOrderId}
      />
    </div>
  );
}
