import { NextResponse } from "next/server";
import { prisma, type Prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok, parsePagination, parseStringParam } from "@/server/utils/api";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const { page, perPage, skip, take } = parsePagination(searchParams, 30);
    const search = parseStringParam(searchParams.get("search"));

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { displayName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
          addresses: true,
          orders: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              orderNumber: true,
              total: true,
              workshopStatus: true,
              createdAt: true,
            },
          },
          reviews: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              rating: true,
              approved: true,
              productId: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(ok(users, { page, perPage, total }));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
