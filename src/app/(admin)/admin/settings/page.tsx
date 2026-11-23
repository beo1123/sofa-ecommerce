import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminAuditLogService } from "@/services/admin/auditLog.service";
import SettingsAuditClient from "@/components/admin/settings/SettingsAuditClient";

export const dynamic = "force-dynamic";

const auditLogService = new AdminAuditLogService(prisma);

export default async function AdminSettingsPage() {
  const { logs, actors, entities, overview } = await auditLogService.getSettingsAuditView(300);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-400">Cài đặt & Nhật ký</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Thông tin xưởng Sofa Phạm Gia và nhật ký kiểm tra thao tác quản trị (AuditLog).
        </p>
      </div>

      <SettingsAuditClient initialLogs={logs} actors={actors} entities={entities} overview={overview} />
    </div>
  );
}
