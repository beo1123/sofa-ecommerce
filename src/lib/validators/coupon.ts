import { z } from "zod";

export const couponTypeSchema = z.enum(["PERCENT", "FIXED", "BOGO"]);

export const saveCouponSchema = z
  .object({
    id: z.number().int().positive().optional(),
    code: z
      .string()
      .trim()
      .min(3, "Mã khuyến mãi tối thiểu 3 ký tự")
      .max(40, "Mã khuyến mãi tối đa 40 ký tự")
      .regex(/^[A-Z0-9_-]+$/, "Mã chỉ gồm chữ in hoa, số, gạch ngang và gạch dưới"),
    type: couponTypeSchema,
    amount: z.number().positive().max(10_000_000_000).nullable().optional(),
    percent: z.number().int().min(1).max(100).nullable().optional(),
    description: z.string().trim().max(500).nullable().optional(),
    startsAt: z.string().nullable().optional(),
    expiresAt: z.string().nullable().optional(),
    usageLimit: z.number().int().min(1).max(1_000_000).nullable().optional(),
    usagePerUser: z.number().int().min(1).max(10_000).nullable().optional(),
    active: z.boolean().default(true),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PERCENT" && (data.percent === null || data.percent === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["percent"],
        message: "Nhập phần trăm giảm (1–100%)",
      });
    }
    if (data.type === "FIXED" && (data.amount === null || data.amount === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Nhập số tiền giảm (VND)",
      });
    }
    if (data.startsAt && data.expiresAt) {
      const start = new Date(data.startsAt).getTime();
      const end = new Date(data.expiresAt).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expiresAt"],
          message: "Ngày hết hạn phải sau ngày bắt đầu",
        });
      }
    }
  });

export type SaveCouponInput = z.infer<typeof saveCouponSchema>;

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Mã tối thiểu 3 ký tự")
      .max(40, "Mã tối đa 40 ký tự")
      .regex(/^[A-Za-z0-9_-]+$/, "Chỉ dùng chữ cái không dấu, số, - hoặc _"),
    type: couponTypeSchema,
    amount: z.string().trim().optional(),
    percent: z.string().trim().optional(),
    description: z.string().trim().max(500).optional(),
    startsAt: z.string().optional(),
    expiresAt: z.string().optional(),
    usageLimit: z.string().trim().optional(),
    usagePerUser: z.string().trim().optional(),
    active: z.boolean(),
    metadataText: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type === "PERCENT") {
      const n = Number(values.percent);
      if (!values.percent || !Number.isInteger(n) || n < 1 || n > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["percent"],
          message: "Nhập phần trăm nguyên từ 1 đến 100",
        });
      }
    }
    if (values.type === "FIXED") {
      const n = Number(values.amount);
      if (!values.amount || !Number.isFinite(n) || n <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Nhập số tiền giảm lớn hơn 0",
        });
      }
    }
    if (values.usageLimit && (!/^\d+$/.test(values.usageLimit) || Number(values.usageLimit) < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["usageLimit"],
        message: "Giới hạn lượt dùng phải là số nguyên ≥ 1",
      });
    }
    if (values.usagePerUser && (!/^\d+$/.test(values.usagePerUser) || Number(values.usagePerUser) < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["usagePerUser"],
        message: "Giới hạn mỗi khách phải là số nguyên ≥ 1",
      });
    }
    if (values.startsAt && values.expiresAt) {
      if (new Date(values.expiresAt).getTime() < new Date(values.startsAt).getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expiresAt"],
          message: "Ngày hết hạn phải sau ngày bắt đầu",
        });
      }
    }
    if (values.metadataText) {
      try {
        const parsed = JSON.parse(values.metadataText);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          throw new Error("INVALID");
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["metadataText"],
          message: "Metadata phải là JSON object hợp lệ",
        });
      }
    }
  });

export type CouponFormValues = z.infer<typeof couponFormSchema>;
