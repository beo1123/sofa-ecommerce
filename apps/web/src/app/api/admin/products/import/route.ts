import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok, fail } from "@/server/utils/api";
import { AdminProductService } from "@/services/admin/product.service";

const service = new AdminProductService(prisma);

/**
 * POST /api/admin/products/import – Import sản phẩm từ file Excel (.xlsx)
 *
 * Body: FormData với field "file" là file .xlsx
 *
 * Cấu trúc Excel (mỗi row = 1 variant):
 *   Required: title | slug | variantName | sku | price
 *   Optional: shortDescription | description | status | category |
 *             imageUrl | compareAtPrice | quantity | color | material
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw { status: 400, body: fail("Missing file", "MISSING_FILE") };
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      throw {
        status: 400,
        body: fail("Invalid file type. Only .xlsx and .xls are allowed", "INVALID_FILE_TYPE"),
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await service.importFromExcel(buffer);

    return NextResponse.json(ok(result), { status: 201 });
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
