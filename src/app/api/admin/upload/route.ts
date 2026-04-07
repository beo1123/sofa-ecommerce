import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { normalizeError, ok, fail } from "@/server/utils/api";
import {
  deleteFolderIfEmpty,
  deleteImage,
  deleteImageByUrl,
  getCloudinaryFolderFromUrl,
  uploadImage,
} from "@/lib/upload";

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

/**
 * DELETE /api/admin/upload – Xóa ảnh khỏi Cloudinary theo URL hoặc publicId
 *
 * Body JSON:
 *   - url?: string
 *   - publicId?: string
 */
export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const publicId = typeof body?.publicId === "string" ? body.publicId.trim() : "";

    if (!url && !publicId) {
      throw { status: 400, body: fail("Missing url or publicId", "MISSING_ASSET_REFERENCE") };
    }

    if (url) {
      await deleteImageByUrl(url);
      const folder = getCloudinaryFolderFromUrl(url);
      if (folder) {
        await deleteFolderIfEmpty(folder).catch(() => ({ skipped: true }));
      }

      return NextResponse.json(ok({ deleted: true, url }));
    }

    await deleteImage(publicId);

    const lastSlashIndex = publicId.lastIndexOf("/");
    if (lastSlashIndex > 0) {
      await deleteFolderIfEmpty(publicId.slice(0, lastSlashIndex)).catch(() => ({ skipped: true }));
    }

    return NextResponse.json(ok({ deleted: true, publicId }));
  } catch (err) {
    const { status, payload } = normalizeError(err);
    return NextResponse.json(payload, { status });
  }
}
