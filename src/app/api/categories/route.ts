import { serializeData } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { normalizeError, parsePagination } from "@/server/utils/api";
import { CategoryService } from "@/services/category.service";
import { NextResponse } from "next/server";

const categoryService = new CategoryService(prisma);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { page, perPage, skip } = parsePagination(url.searchParams);
    const result = await categoryService.getAll(page, perPage, skip);
    return NextResponse.json(serializeData(result));
  } catch (err: any) {
    const normalized = normalizeError(err);
    return NextResponse.json(normalized.payload, { status: normalized.status });
  }
}
