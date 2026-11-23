import { NextResponse } from "next/server";
import { prisma, type Prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok, parsePagination, parseStringParam } from "@/server/utils/api";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const { page, perPage, skip, take } = parsePagination(searchParams, 50);
    const entity = parseStringParam(searchParams.get("entity"));
    const actorIdRaw = parseStringParam(searchParams.get("actorId"));
    const fromParam = parseStringParam(searchParams.get("from"));
    const toParam = parseStringParam(searchParams.get("to"));

    const createdAtFilter: Prisma.DateTimeFilter = {};
    if (fromParam) createdAtFilter.gte = new Date(fromParam);
    if (toParam) createdAtFilter.lte = new Date(toParam);

    const where: Prisma.AuditLogWhereInput = {
      ...(entity ? { entity } : {}),
      ...(actorIdRaw && /^\d+$/.test(actorIdRaw) ? { actorId: Number(actorIdRaw) } : {}),
      ...(fromParam || toParam ? { createdAt: createdAtFilter } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, email: true, displayName: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json(ok(items, { page, perPage, total }));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
