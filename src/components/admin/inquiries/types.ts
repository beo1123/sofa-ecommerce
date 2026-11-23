import type { InquirySource, InquiryStatus } from "@/lib/workshop-types";

export interface SerializedInquiry {
  id: number;
  name: string;
  phone: string;
  district: string | null;
  city: string;
  roomType: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  note: string | null;
  source: InquirySource;
  assignedTo: string | null;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}
