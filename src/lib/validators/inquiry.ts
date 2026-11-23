import { z } from "zod";
import { INQUIRY_SOURCES, INQUIRY_STATUSES } from "@/lib/workshop-types";

export const createInquirySchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên (tối thiểu 2 ký tự)").max(120),
  phone: z
    .string()
    .trim()
    .min(8, "Số điện thoại tối thiểu 8 số")
    .max(20)
    .regex(/^[0-9+\s().-]+$/, "Số điện thoại không hợp lệ"),
  district: z.string().trim().max(100).nullable().optional(),
  city: z.string().trim().max(100).default("TP.HCM"),
  roomType: z.string().trim().max(100).nullable().optional(),
  budgetMin: z.number().int().min(0).max(5_000_000_000).nullable().optional(),
  budgetMax: z.number().int().min(0).max(5_000_000_000).nullable().optional(),
  note: z.string().trim().max(2000).nullable().optional(),
  source: z.enum(INQUIRY_SOURCES).default("web"),
  assignedTo: z.string().trim().max(120).nullable().optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;

export const updateInquiryStatusSchema = z.object({
  inquiryId: z.number().int().positive(),
  status: z.enum(INQUIRY_STATUSES),
});

export const updateInquiryAssignedSchema = z.object({
  inquiryId: z.number().int().positive(),
  assignedTo: z.string().trim().max(120).nullable(),
});

export const updateInquiryNoteSchema = z.object({
  inquiryId: z.number().int().positive(),
  note: z.string().trim().max(2000).nullable(),
});

export const inquiryAdminFormSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập tên khách"),
  phone: z
    .string()
    .trim()
    .min(8, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\s().-]+$/, "Số điện thoại không hợp lệ"),
  district: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  roomType: z.string().trim().max(100).optional(),
  budgetMin: z.string().trim().optional(),
  budgetMax: z.string().trim().optional(),
  source: z.enum(INQUIRY_SOURCES),
  assignedTo: z.string().trim().max(120).optional(),
  note: z.string().trim().max(2000).optional(),
});

export type InquiryAdminFormValues = z.infer<typeof inquiryAdminFormSchema>;
