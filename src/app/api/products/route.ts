import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma_client";
import { ok, normalizeError, parsePagination } from "@/server/utils/api";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const { skip, take, page, perPage } = parsePagination(params);

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          images: true,
          variants: { include: { inventory: true } },
        },
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json(ok(items, { page, perPage, total, totalPages: Math.ceil(total / perPage) }));
  } catch (err) {
    const e = normalizeError(err);
    return NextResponse.json(e.payload, { status: e.status });
  }
}
