import { z } from "zod";

export const returnStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "RECEIVED"]);

export const refundStatusSchema = z.enum(["PENDING", "COMPLETED", "FAILED"]);

export const updateReturnStatusSchema = z.object({
  returnRequestId: z.number().int().positive(),
  status: returnStatusSchema,
});

export const upsertRefundSchema = z.object({
  returnRequestId: z.number().int().positive(),
  orderId: z.number().int().positive(),
  amount: z.number().positive("Số tiền hoàn phải lớn hơn 0").max(10_000_000_000),
  method: z.string().trim().min(1, "Chọn phương thức hoàn tiền").max(100),
  status: refundStatusSchema,
  providerRef: z.string().trim().max(160).nullable().optional(),
});

export type UpsertRefundInput = z.infer<typeof upsertRefundSchema>;

export const refundFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Nhập số tiền hoàn")
    .refine((v) => Number(v) > 0 && Number.isFinite(Number(v)), {
      message: "Số tiền hoàn phải lớn hơn 0",
    }),
  method: z.string().trim().min(1, "Chọn phương thức hoàn tiền").max(100),
  status: refundStatusSchema,
  providerRef: z.string().trim().max(160).optional(),
});

export type RefundFormValues = z.infer<typeof refundFormSchema>;
