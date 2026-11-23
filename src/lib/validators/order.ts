import { z } from "zod";
import { SHIPMENT_STATUSES, WORKSHOP_STATUSES } from "@/lib/workshop-types";

export const updateWorkshopStatusSchema = z.object({
  orderId: z.number().int().positive(),
  workshopStatus: z.enum(WORKSHOP_STATUSES),
  note: z.string().trim().max(500).optional(),
});

export type UpdateWorkshopStatusInput = z.infer<typeof updateWorkshopStatusSchema>;

export const updateOrderInternalNoteSchema = z.object({
  orderId: z.number().int().positive(),
  internalNote: z.string().max(4000),
});

export type UpdateOrderInternalNoteInput = z.infer<typeof updateOrderInternalNoteSchema>;

export const updateOrderWorkshopSpecsSchema = z.object({
  orderId: z.number().int().positive(),
  isCustomSize: z.boolean(),
  customWidthCm: z.number().int().min(40).max(1000).nullable().optional(),
  customDepthCm: z.number().int().min(40).max(1000).nullable().optional(),
  customHeightCm: z.number().int().min(30).max(400).nullable().optional(),
  materialChoice: z.string().trim().max(150).nullable().optional(),
  colorChoice: z.string().trim().max(150).nullable().optional(),
  deliverDate: z.string().nullable().optional(),
});

export type UpdateOrderWorkshopSpecsInput = z.infer<typeof updateOrderWorkshopSpecsSchema>;

export const upsertShipmentSchema = z.object({
  orderId: z.number().int().positive(),
  scheduledDate: z.string().nullable().optional(),
  driverName: z.string().trim().max(120).nullable().optional(),
  needsCrane: z.boolean().default(false),
  buildingFloor: z.number().int().min(0).max(120).nullable().optional(),
  hasElevator: z.boolean().default(true),
  specialNote: z.string().trim().max(1000).nullable().optional(),
  status: z.enum(SHIPMENT_STATUSES).default("scheduled"),
});

export type UpsertShipmentInput = z.infer<typeof upsertShipmentSchema>;

export const shipmentFormSchema = z.object({
  scheduledDate: z.string().optional(),
  driverName: z.string().trim().max(120).optional(),
  needsCrane: z.boolean(),
  buildingFloor: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 120), {
      message: "Số tầng không hợp lệ (0–120)",
    }),
  hasElevator: z.boolean(),
  specialNote: z.string().trim().max(1000).optional(),
  status: z.enum(SHIPMENT_STATUSES),
});

export type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

export const addDepositLogSchema = z.object({
  orderId: z.number().int().positive(),
  amount: z.number().positive("Số tiền cọc phải lớn hơn 0").max(10_000_000_000),
  method: z.string().trim().max(80).nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
  recordedBy: z.string().trim().max(120).nullable().optional(),
});

export type AddDepositLogInput = z.infer<typeof addDepositLogSchema>;

export const depositFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số tiền cọc")
    .refine((v) => Number(v) > 0 && Number.isFinite(Number(v)), {
      message: "Số tiền cọc phải lớn hơn 0",
    }),
  method: z.string().trim().max(80).optional(),
  note: z.string().trim().max(500).optional(),
});

export type DepositFormValues = z.infer<typeof depositFormSchema>;
