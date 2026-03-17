import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok, fail } from "@/server/utils/api";
import { uploadImage } from "@/lib/upload";

/**
 * POST /api/admin/upload – Upload ảnh lên Cloudinary CDN
 *
 * Body: FormData
 *   - file: File (image/jpeg, image/png, image/webp, image/avif – max 10 MB)
 *   - folder?: string (thư mục trên Cloudinary, mặc định "sofa")
 *
 * Response:
 *   { success: true, data: { url, publicId, width, height, format, bytes } }
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "sofa";

    if (!file || !(file instanceof File)) {
      throw { status: 400, body: fail("Missing file", "MISSING_FILE") };
    }

    const result = await uploadImage(file, folder);
    return NextResponse.json(ok(result), { status: 201 });
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
