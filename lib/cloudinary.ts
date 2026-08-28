import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadDishResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Uploads an image buffer to Cloudinary with aggressive optimization
 * for restaurant dishes (< 100 KB target size).
 *
 * Applied transformations:
 * - width: 800, crop: 'limit' (prevents huge smartphone photos while preserving aspect ratio)
 * - quality: 'auto' (intelligent compression without visual degradation)
 * - fetch_format: 'auto' (automatically delivers modern WebP or AVIF formats)
 */
export async function uploadDishImage(
  buffer: Buffer,
  originalFilename: string = "dish"
): Promise<UploadDishResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Credenciales de Cloudinary no configuradas. Por favor define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en tu archivo .env."
    );
  }

  // Remove extension from original filename for clean public_id naming
  const cleanName = originalFilename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 50);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "menu_restaurante",
        public_id: `${Date.now()}_${cleanName}`,
        resource_type: "image",
        transformation: [
          { width: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(
            new Error(error?.message || "Error desconocido al subir imagen a Cloudinary.")
          );
        }

        // Inject automatic optimization parameters into the secure delivery URL:
        // - c_limit,w_800: max 800px width preserving aspect ratio
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Extracts Cloudinary public_id from a full Cloudinary URL.
 */
export function extractCloudinaryPublicId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  if (!urlOrId.includes("cloudinary.com")) {
    return urlOrId.startsWith("menu_restaurante/") ? urlOrId : null;
  }

  try {
    const uploadIndex = urlOrId.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const pathAfterUpload = urlOrId.substring(uploadIndex + 8);
    const parts = pathAfterUpload.split("/");
    const cleanParts = parts.filter(
      (part) => !part.match(/^v\d+$/) && !part.includes(",") && !part.startsWith("w_")
    );

    const fullPathWithExt = cleanParts.join("/");
    const publicId = fullPathWithExt.replace(/\.[^/.]+$/, "");
    return publicId || null;
  } catch (error) {
    console.error("Error extrayendo public_id de Cloudinary:", error);
    return null;
  }
}

/**
 * Deletes an image from Cloudinary using its public_id or Cloudinary URL.
 */
export async function deleteDishImageFromCloudinary(urlOrPublicId: string): Promise<boolean> {
  const publicId = extractCloudinaryPublicId(urlOrPublicId);
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error(`Error al borrar imagen ${publicId} de Cloudinary:`, error);
    return false;
  }
}

export const deleteImageFromCloudinary = deleteDishImageFromCloudinary;

/**
 * Removes background from an image buffer using remove.bg AI API.
 * Returns transparent PNG buffer, or original buffer on failure.
 */
export async function removeDishBackground(
  buffer: Buffer,
  filename: string
): Promise<Buffer> {
  const apiKey = process.env.REMOVE_BG_API_KEY || "anBKmaLhBEU2ZvAUgxcyxsjd";

  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)]);
    formData.append("image_file", blob, filename);
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.errors?.[0]?.title || "Error al remover el fondo");
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Falló remoción de fondo, continuando con imagen comprimida:", error);
    return buffer;
  }
}

export default cloudinary;
