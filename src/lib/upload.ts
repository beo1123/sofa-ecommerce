import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary – free tier (25 credits/tháng ≈ 25 GB storage hoặc bandwidth).
 * Hỗ trợ auto-format (avif/webp), CDN toàn cầu, resize on-the-fly.
 *
 * Env cần thiết:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Upload một file (Buffer hoặc base64 data-URI) lên Cloudinary.
 * @param file - File object từ FormData hoặc Buffer
 * @param folder - Thư mục trên Cloudinary (vd: "products", "articles")
 */
export async function uploadImage(file: File, folder = "sofa"): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw {
      status: 400,
      body: {
        success: false,
        error: {
          message: `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
          code: "INVALID_FILE_TYPE",
        },
      },
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    throw {
      status: 400,
      body: {
        success: false,
        error: { message: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`, code: "FILE_TOO_LARGE" },
      },
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Xóa ảnh trên Cloudinary theo public_id.
 */
export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
