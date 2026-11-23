import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminInquiryService } from "@/services/admin/inquiry.service";
import { isInquiryStatus } from "@/lib/workshop-types";
import InquiriesClient from "@/components/admin/inquiries/InquiriesClient";

export const dynamic = "force-dynamic";

const inquiryService = new AdminInquiryService(prisma);

interface AdminInquiriesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminInquiriesPage({ searchParams }: AdminInquiriesPageProps) {
  const [params, { inquiries, staffNames }] = await Promise.all([
    searchParams,
    inquiryService.listInquiriesWithStaff(),
  ]);

  const initialStatusFilter = params.status && isInquiryStatus(params.status) ? params.status : "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-400">Tư vấn & Leads</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Quản lý khách hàng gửi yêu cầu tư vấn từ website, Zalo, Facebook, TikTok và showroom.
        </p>
      </div>

      <InquiriesClient initialInquiries={inquiries} staffNames={staffNames} initialStatusFilter={initialStatusFilter} />
    </div>
  );
}
