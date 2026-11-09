import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError } from "@/server/utils/api";

export async function GET() {
  try {
    await requireAdmin();

    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
    return NextResponse.json({
      ok: true,
      connected: true,
      serverTime: result[0]?.now ?? new Date(),
    });
  } catch (error: any) {
    const { status, payload } = normalizeError(error);
    return NextResponse.json(payload, { status });
  }
}
