import { NextResponse } from "next/server";
import { prisma, type Prisma, type ReturnStatus } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok, parsePagination, parseStringParam } from "@/server/utils/api";

const RETURN_STATUSES: readonly ReturnStatus[] = ["PENDING", "APPROVED", "REJECTED", "RECEIVED"];

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const { page, perPage, skip, take } = parsePagination(searchParams, 20);
    const statusParam = parseStringParam(searchParams.get("status"));

    const where: Prisma.ReturnRequestWhereInput =
      statusParam && (RETURN_STATUSES as readonly string[]).includes(statusParam)
        ? { status: statusParam as ReturnStatus }
        : {};

    const [items, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        skip,
        take,
        orderBy: { requestedAt: "desc" },
        include: {
          order: { select: { id: true, orderNumber: true, recipientName: true, phone: true } },
          orderItem: { select: { id: true, name: true, quantity: true, total: true } },
          refund: true,
        },
      }),
      prisma.returnRequest.count({ where }),
    ]);

    return NextResponse.json(ok(items, { page, perPage, total }));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
