import { NextRequest, NextResponse } from "next/server";
import { uploadDishImage, removeDishBackground } from "@/lib/cloudinary";

// Allowed MIME types for dish photos
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
]);

// Maximum file size: 10 MB in bytes
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const removeBg = formData.get("removeBg") === "true";

    // 1. Validation: File presence
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No se proporcionó ningún archivo. Por favor adjunta un archivo bajo el campo 'file'.",
        },
        { status: 400 }
      );
    }

    // 2. Validation: MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Tipo de archivo no permitido: '${file.type}'. Formatos válidos: JPG, PNG, WebP, HEIC.`,
        },
        { status: 400 }
      );
    }

    // 3. Validation: File size limit (10 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          error: `El archivo es demasiado grande (${sizeMb} MB). El límite máximo permitido es de 10 MB.`,
        },
        { status: 400 }
      );
    }

    // 4. Convert File into Buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer);

    // 4.5 Optional AI Background Removal
    if (removeBg) {
      const bgRemoved = await removeDishBackground(buffer, file.name);
      buffer = Buffer.from(bgRemoved);
    }

    // 5. Upload to Cloudinary with automatic optimization
    const uploadResult = await uploadDishImage(buffer, file.name);

    return NextResponse.json(
      {
        success: true,
        message: "Imagen subida y optimizada exitosamente en Cloudinary.",
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        data: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Upload API Error]:", error);

    const isConfigurationError =
      error?.message?.includes("Credenciales de Cloudinary no configuradas") ||
      error?.message?.includes("Must supply api_key");

    return NextResponse.json(
      {
        success: false,
        error: isConfigurationError
          ? "Error de configuración: Faltan credenciales de Cloudinary en el servidor."
          : error?.message || "Error interno al procesar la subida de imagen.",
      },
      { status: isConfigurationError ? 500 : 500 }
    );
  }
}
