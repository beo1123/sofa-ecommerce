import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminCouponService } from "@/services/admin/coupon.service";
import { fail, normalizeError, ok } from "@/server/utils/api";
import { saveCouponSchema } from "@/lib/validators/coupon";

const couponService = new AdminCouponService(prisma);

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const couponId = Number(id);
    if (!Number.isInteger(couponId) || couponId <= 0) {
      return NextResponse.json(fail("Invalid coupon id", "INVALID_ID"), {
        status: 400,
      });
    }

    const body = await req.json();

    if (typeof body?.active === "boolean" && Object.keys(body).length === 1) {
      const updated = await couponService.toggleActive(couponId, body.active, session.user.id);
      revalidatePath("/admin/coupons");
      return NextResponse.json(ok(updated));
    }

    const parsed = saveCouponSchema.safeParse({
      ...body,
      id: couponId,
      code: typeof body?.code === "string" ? body.code.trim().toUpperCase() : "",
    });
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid coupon payload", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const updated = await couponService.saveCoupon(parsed.data, session.user.id);
    revalidatePath("/admin/coupons");

    return NextResponse.json(ok(updated));
  } catch (err: any) {
    if (typeof err?.message === "string" && err.message.startsWith("DUPLICATE_COUPON:")) {
      return NextResponse.json(fail("Coupon code already exists", "DUPLICATE_COUPON"), { status: 409 });
    }
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const couponId = Number(id);
    if (!Number.isInteger(couponId) || couponId <= 0) {
      return NextResponse.json(fail("Invalid coupon id", "INVALID_ID"), {
        status: 400,
      });
    }

    await couponService.deleteCoupon(couponId, session.user.id);
    revalidatePath("/admin/coupons");

    return NextResponse.json(ok({ deleted: true, id: couponId }));
  } catch (err: any) {
    if (err?.message === "COUPON_NOT_FOUND") {
      return NextResponse.json(fail("Coupon not found", "NOT_FOUND"), {
        status: 404,
      });
    }
    if (typeof err?.message === "string" && err.message.startsWith("COUPON_IN_USE:")) {
      return NextResponse.json(fail("Coupon has linked orders; deactivate instead of deleting", "COUPON_IN_USE"), {
        status: 409,
      });
    }
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
