import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductService } from "@/services/products.service";
import { normalizeError, ok } from "@/server/utils/api";

export async function GET(req: Request) {
  try {
    const service = new ProductService(prisma);

    const filters = await service.getFilters();

    return NextResponse.json(ok(filters));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
