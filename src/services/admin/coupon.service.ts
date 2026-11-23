import { Prisma, type PrismaClient } from "@prisma/client";
import { toNumber } from "@/lib/format";
import { recordAuditLog } from "@/lib/audit";
import type { SaveCouponInput } from "@/lib/validators/coupon";
import type { SerializedCoupon } from "@/components/admin/coupons/types";

function parseOptionalDate(value: string | null | undefined): Date | null {
  if (!value || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export class AdminCouponService {
  constructor(private readonly db: PrismaClient) {}

  async listCoupons(): Promise<SerializedCoupon[]> {
    const coupons = await this.db.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { Order: true } } },
    });

    return coupons.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type,
      amount: c.amount !== null ? toNumber(c.amount) : null,
      percent: c.percent,
      description: c.description,
      startsAt: c.startsAt ? c.startsAt.toISOString() : null,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      usageLimit: c.usageLimit,
      usagePerUser: c.usagePerUser,
      timesUsed: c.timesUsed,
      active: c.active,
      metadata:
        c.metadata && typeof c.metadata === "object" && !Array.isArray(c.metadata)
          ? (c.metadata as Record<string, unknown>)
          : null,
      orderCount: c._count.Order,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async saveCoupon(input: SaveCouponInput, actorId?: string | number | null): Promise<SerializedCoupon> {
    const duplicate = await this.db.coupon.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (duplicate && duplicate.id !== input.id) {
      throw new Error(`DUPLICATE_COUPON:${input.code}`);
    }

    const payload = {
      code: input.code,
      type: input.type,
      amount: input.type === "FIXED" ? (input.amount ?? null) : null,
      percent: input.type === "PERCENT" ? (input.percent ?? null) : null,
      description: input.description || null,
      startsAt: parseOptionalDate(input.startsAt),
      expiresAt: parseOptionalDate(input.expiresAt),
      usageLimit: input.usageLimit ?? null,
      usagePerUser: input.usagePerUser ?? null,
      active: input.active,
      metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : Prisma.DbNull,
    };

    const saved = input.id
      ? await this.db.coupon.update({
          where: { id: input.id },
          data: payload,
          include: { _count: { select: { Order: true } } },
        })
      : await this.db.coupon.create({
          data: payload,
          include: { _count: { select: { Order: true } } },
        });

    await recordAuditLog({
      actorId,
      action: input.id ? "COUPON_UPDATED" : "COUPON_CREATED",
      entity: "Coupon",
      entityId: saved.id,
      changes: { code: saved.code, type: saved.type, active: saved.active },
    });

    return {
      id: saved.id,
      code: saved.code,
      type: saved.type,
      amount: saved.amount !== null ? toNumber(saved.amount) : null,
      percent: saved.percent,
      description: saved.description,
      startsAt: saved.startsAt ? saved.startsAt.toISOString() : null,
      expiresAt: saved.expiresAt ? saved.expiresAt.toISOString() : null,
      usageLimit: saved.usageLimit,
      usagePerUser: saved.usagePerUser,
      timesUsed: saved.timesUsed,
      active: saved.active,
      metadata:
        saved.metadata && typeof saved.metadata === "object" && !Array.isArray(saved.metadata)
          ? (saved.metadata as Record<string, unknown>)
          : null,
      orderCount: saved._count.Order,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  async toggleActive(couponId: number, active: boolean, actorId?: string | number | null) {
    const updated = await this.db.coupon.update({
      where: { id: couponId },
      data: { active },
      select: { id: true, code: true, active: true },
    });

    await recordAuditLog({
      actorId,
      action: "COUPON_TOGGLED",
      entity: "Coupon",
      entityId: updated.id,
      changes: { code: updated.code, active: updated.active },
    });

    return { couponId: updated.id, active: updated.active };
  }

  async deleteCoupon(couponId: number, actorId?: string | number | null) {
    const coupon = await this.db.coupon.findUnique({
      where: { id: couponId },
      select: { id: true, code: true, _count: { select: { Order: true } } },
    });

    if (!coupon) {
      throw new Error("COUPON_NOT_FOUND");
    }
    if (coupon._count.Order > 0) {
      throw new Error(`COUPON_IN_USE:${coupon.code}:${coupon._count.Order}`);
    }

    await this.db.coupon.delete({ where: { id: couponId } });

    await recordAuditLog({
      actorId,
      action: "COUPON_DELETED",
      entity: "Coupon",
      entityId: coupon.id,
      changes: { code: coupon.code },
    });

    return { deleted: true };
  }
}
