"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminCouponService } from "@/services/admin/coupon.service";
import { saveCouponSchema, type SaveCouponInput } from "@/lib/validators/coupon";
import type { SerializedCoupon } from "@/components/admin/coupons/types";

export interface CouponActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

const couponService = new AdminCouponService(prisma);

export async function saveCouponAction(input: SaveCouponInput): Promise<CouponActionResult<SerializedCoupon>> {
  try {
    const session = await requireAdmin();
    const parsed = saveCouponSchema.safeParse({
      ...input,
      code: input.code.trim().toUpperCase(),
    });
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Dữ liệu mã khuyến mãi không hợp lệ",
      };
    }

    const data = await couponService.saveCoupon(parsed.data, session.user.id);
    revalidatePath("/admin/coupons");

    return { ok: true, data };
  } catch (err: any) {
    if (typeof err?.message === "string" && err.message.startsWith("DUPLICATE_COUPON:")) {
      const code = err.message.split(":")[1];
      return { ok: false, error: `Mã "${code}" đã tồn tại` };
    }
    console.error("[saveCouponAction]", err);
    return { ok: false, error: "Không thể lưu mã khuyến mãi" };
  }
}

export async function toggleCouponActiveAction(
  couponId: number,
  active: boolean
): Promise<CouponActionResult<{ couponId: number; active: boolean }>> {
  try {
    const session = await requireAdmin();
    const data = await couponService.toggleActive(couponId, active, session.user.id);
    revalidatePath("/admin/coupons");

    return { ok: true, data };
  } catch (err) {
    console.error("[toggleCouponActiveAction]", err);
    return { ok: false, error: "Không thể đổi trạng thái mã khuyến mãi" };
  }
}

export async function deleteCouponAction(couponId: number): Promise<CouponActionResult<{ deleted: boolean }>> {
  try {
    const session = await requireAdmin();
    const data = await couponService.deleteCoupon(couponId, session.user.id);
    revalidatePath("/admin/coupons");

    return { ok: true, data };
  } catch (err: any) {
    if (typeof err?.message === "string" && err.message.startsWith("COUPON_IN_USE:")) {
      const [, code, count] = err.message.split(":");
      return {
        ok: false,
        error: `Mã "${code}" đã áp dụng trên ${count} đơn hàng. Vui lòng tắt kích hoạt thay vì xóa.`,
      };
    }
    if (err?.message === "COUPON_NOT_FOUND") {
      return { ok: false, error: "Không tìm thấy mã khuyến mãi" };
    }
    console.error("[deleteCouponAction]", err);
    return { ok: false, error: "Không thể xóa mã khuyến mãi" };
  }
}
