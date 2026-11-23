import type { CouponType } from "@/lib/prisma";

export interface SerializedCoupon {
  id: number;
  code: string;
  type: CouponType;
  amount: number | null;
  percent: number | null;
  description: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usagePerUser: number | null;
  timesUsed: number;
  active: boolean;
  metadata: Record<string, unknown> | null;
  orderCount: number;
  createdAt: string;
}
