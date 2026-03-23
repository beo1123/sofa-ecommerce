import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary – free tier (25 credits/tháng ≈ 25 GB storage hoặc bandwidth).
 * Hỗ trợ auto-format (avif/webp), CDN toàn cầu, resize on-the-fly.
 *
 * Env cần thiết:
 *   CLOUDINARY_URL (khuyến nghị, lấy trực tiếp từ Cloudinary Dashboard)
 *   hoặc
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

function parseCloudinaryUrl(urlValue: string) {
  try {
    const url = new URL(urlValue);
    const cloudName = url.hostname;
    const apiKey = decodeURIComponent(url.username);
    const apiSecret = decodeURIComponent(url.password);

    if (!cloudName || !apiKey || !apiSecret) {
      return null;
    }

    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}

function resolveCloudinaryConfig() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl) {
    const parsed = parseCloudinaryUrl(cloudinaryUrl);
    if (!parsed) {
      throw new Error("Invalid CLOUDINARY_URL format. Expected: cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>");
    }
    return parsed;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary env vars. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET"
    );
  }

  return { cloudName, apiKey, apiSecret };
}

const cloudinaryConfig = resolveCloudinaryConfig();

cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
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

function sanitizeFolderPath(input: string) {
  const cleaned = input
    .split("/")
    .map((segment) =>
      segment
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9\s-_]/g, "")
        .replace(/\s+/g, "-")
        .trim()
        .trim()
    )
    .filter(Boolean)
    .join("/");

  return cleaned || "sofa";
}

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
  const safeFolder = sanitizeFolderPath(folder);

  const result = await cloudinary.uploader.upload(base64, {
    folder: safeFolder,
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

function stripExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}

/**
 * Tách public_id từ URL Cloudinary để có thể xóa ảnh theo URL đang lưu DB.
 */
export function getCloudinaryPublicIdFromUrl(urlValue: string) {
  try {
    const url = new URL(urlValue);
    if (url.hostname !== "res.cloudinary.com") return null;

    const parts = url.pathname.split("/").filter(Boolean);
    // /<cloud_name>/<resource_type>/upload/v<version>/<folder>/<filename>
    if (parts.length < 5) return null;

    const cloudName = parts[0];
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    if (cloudName !== cloudinaryConfig.cloudName) return null;

    const publicParts = parts.slice(uploadIndex + 1);
    if (!publicParts.length) return null;

    const first = publicParts[0];
    const hasVersionPrefix = /^v\d+$/.test(first);
    const withoutVersion = hasVersionPrefix ? publicParts.slice(1) : publicParts;
    if (!withoutVersion.length) return null;

    const last = withoutVersion[withoutVersion.length - 1];
    withoutVersion[withoutVersion.length - 1] = stripExtension(last);

    return withoutVersion.join("/");
  } catch {
    return null;
  }
}

/**
 * Xóa ảnh Cloudinary bằng URL đã lưu trong DB.
 */
export async function deleteImageByUrl(urlValue: string) {
  const publicId = getCloudinaryPublicIdFromUrl(urlValue);
  if (!publicId) return { skipped: true };
  return deleteImage(publicId);
}

/**
 * Lấy folder từ public_id của ảnh Cloudinary URL.
 * Ví dụ: products/sofa-x => từ products/sofa-x/file-1
 */
export function getCloudinaryFolderFromUrl(urlValue: string) {
  const publicId = getCloudinaryPublicIdFromUrl(urlValue);
  if (!publicId) return null;

  const lastSlash = publicId.lastIndexOf("/");
  if (lastSlash <= 0) return null;

  return publicId.slice(0, lastSlash);
}

/**
 * Xóa folder Cloudinary nếu đang rỗng.
 * Nếu folder không rỗng/không tồn tại thì bỏ qua để không chặn luồng chính.
 */
export async function deleteFolderIfEmpty(folder: string) {
  try {
    return await cloudinary.api.delete_folder(folder);
  } catch (err: any) {
    const message = String(err?.message ?? "").toLowerCase();
    if (message.includes("not empty") || message.includes("not found")) {
      return { skipped: true };
    }
    throw err;
  }
}
