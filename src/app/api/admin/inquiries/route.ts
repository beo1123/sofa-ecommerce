import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminInquiryService } from "@/services/admin/inquiry.service";
import { fail, normalizeError, ok, parsePagination, parseStringParam } from "@/server/utils/api";
import { createInquirySchema } from "@/lib/validators/inquiry";

const inquiryService = new AdminInquiryService(prisma);

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const { page, perPage, skip, take } = parsePagination(searchParams, 30);

    const { items, total } = await inquiryService.listPaginated({
      skip,
      take,
      status: parseStringParam(searchParams.get("status")),
      source: parseStringParam(searchParams.get("source")),
      search: parseStringParam(searchParams.get("search")),
    });

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
    const parsed = createInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        fail(parsed.error.issues[0]?.message ?? "Invalid inquiry payload", "VALIDATION_ERROR", parsed.error.issues),
        { status: 400 }
      );
    }

    const created = await inquiryService.createInquiry(parsed.data, session.user.id);

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return NextResponse.json(ok(created), { status: 201 });
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
