import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminShipmentService } from "@/services/admin/shipment.service";
import ShipmentsClient from "@/components/admin/shipments/ShipmentsClient";

export const dynamic = "force-dynamic";

const shipmentService = new AdminShipmentService(prisma);

export default async function AdminShipmentsPage() {
  const { shipments, unscheduledOrders } = await shipmentService.listShipmentsAndUnscheduled();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-400">Điều phối vận chuyển</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Quản lý lịch giao sofa theo bảng hoặc lịch tuần, theo dõi thang máy, số tầng và điều phối xe cẩu.
        </p>
      </div>

      <ShipmentsClient initialShipments={shipments} unscheduledOrders={unscheduledOrders} />
    </div>
  );
}
