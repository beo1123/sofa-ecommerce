import { NextResponse } from "next/server";
import { prisma, type Prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok, parsePagination, parseStringParam } from "@/server/utils/api";
import { isShipmentStatus } from "@/lib/workshop-types";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const { page, perPage, skip, take } = parsePagination(searchParams, 30);
    const statusParam = parseStringParam(searchParams.get("status"));
    const needsCraneParam = parseStringParam(searchParams.get("needsCrane"));
    const fromParam = parseStringParam(searchParams.get("from"));
    const toParam = parseStringParam(searchParams.get("to"));

    const scheduledDateFilter: Prisma.DateTimeNullableFilter = {};
    if (fromParam) scheduledDateFilter.gte = new Date(fromParam);
    if (toParam) scheduledDateFilter.lte = new Date(toParam);

    const where: Prisma.ShipmentWhereInput = {
      ...(statusParam && isShipmentStatus(statusParam) ? { status: statusParam } : {}),
      ...(needsCraneParam === "true" ? { needsCrane: true } : {}),
      ...(fromParam || toParam ? { scheduledDate: scheduledDateFilter } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take,
        orderBy: [{ scheduledDate: "asc" }, { createdAt: "desc" }],
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              recipientName: true,
              phone: true,
              line1: true,
              city: true,
              province: true,
            },
          },
        },
      }),
      prisma.shipment.count({ where }),
    ]);

    return NextResponse.json(ok(items, { page, perPage, total }));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
