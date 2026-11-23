import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminCustomerService } from "@/services/admin/customer.service";
import CustomersClient from "@/components/admin/customers/CustomersClient";

export const dynamic = "force-dynamic";

const customerService = new AdminCustomerService(prisma);

export default async function AdminCustomersPage() {
  const customers = await customerService.listSerializedCustomers();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-400">Quản lý khách hàng</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Tra cứu hồ sơ khách hàng, sổ địa chỉ, lịch sử đặt đóng sofa và đánh giá đã gửi.
        </p>
      </div>

      <CustomersClient initialCustomers={customers} />
    </div>
  );
}
