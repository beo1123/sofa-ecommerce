import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { recordAuditLog } from "@/lib/audit";
import { fail, normalizeError, ok, parsePagination } from "@/server/utils/api";
import { saveCouponSchema } from "@/lib/validators/coupon";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const { page, perPage, skip, take } = parsePagination(searchParams, 30);

    const [items, total] = await Promise.all([
      prisma.coupon.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.count(),
    ]);

    return NextResponse.json(ok(items, { page, perPage, total }));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const parsed = saveCouponSchema.safeParse({
      ...body,
      code: typeof body?.code === "string" ? body.code.trim().toUpperCase() : "",
    });
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid coupon payload", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const d = parsed.data;
    const created = await prisma.coupon.create({
      data: {
        code: d.code,
        type: d.type,
        amount: d.type === "FIXED" ? (d.amount ?? null) : null,
        percent: d.type === "PERCENT" ? (d.percent ?? null) : null,
        description: d.description || null,
        startsAt: d.startsAt ? new Date(d.startsAt) : null,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
        usageLimit: d.usageLimit ?? null,
        usagePerUser: d.usagePerUser ?? null,
        active: d.active,
        metadata: d.metadata ? (d.metadata as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });

    await recordAuditLog({
      actorId: session.user.id,
      action: "COUPON_CREATED_API",
      entity: "Coupon",
      entityId: created.id,
      changes: { code: created.code, type: created.type },
    });

    revalidatePath("/admin/coupons");

    return NextResponse.json(ok(created), { status: 201 });
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
