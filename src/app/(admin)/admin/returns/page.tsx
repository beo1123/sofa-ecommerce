import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminReturnService } from "@/services/admin/return.service";
import ReturnsClient from "@/components/admin/returns/ReturnsClient";

export const dynamic = "force-dynamic";

const returnService = new AdminReturnService(prisma);

export default async function AdminReturnsPage() {
  const { returns, refunds } = await returnService.listReturnsAndRefunds();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-400">Bảo hành & Đổi trả</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Tiếp nhận yêu cầu bảo hành, đổi trả, kiểm tra hình ảnh minh chứng và xử lý hoàn tiền.
        </p>
      </div>

      <ReturnsClient initialReturns={returns} initialRefunds={refunds} />
    </div>
  );
}
