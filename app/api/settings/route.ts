import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settings-store";
import { deleteImageFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({ success: true, data: settings }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener configuración." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { logoUrl, logoPublicId, heroImageUrl, heroImagePublicId } = body;

    const currentSettings = getSettings();
    const updateData: any = {};

    // 1. Logo update
    if (logoUrl !== undefined && logoUrl.trim() !== "") {
      updateData.logoUrl = String(logoUrl).trim();
      if (logoPublicId !== undefined) {
        if (
          currentSettings.logoPublicId &&
          logoPublicId.trim() !== "" &&
          currentSettings.logoPublicId !== logoPublicId
        ) {
          try {
            console.log(`Eliminando logo antiguo de Cloudinary: ${currentSettings.logoPublicId}`);
            await deleteImageFromCloudinary(currentSettings.logoPublicId);
          } catch (err) {
            console.error("Error al eliminar el logo antiguo de Cloudinary:", err);
          }
        }
        updateData.logoPublicId = String(logoPublicId).trim();
      }
    }

    // 2. Hero image update
    if (heroImageUrl !== undefined && heroImageUrl.trim() !== "") {
      updateData.heroImageUrl = String(heroImageUrl).trim();
      if (heroImagePublicId !== undefined) {
        if (
          currentSettings.heroImagePublicId &&
          heroImagePublicId.trim() !== "" &&
          currentSettings.heroImagePublicId !== heroImagePublicId
        ) {
          try {
            console.log(`Eliminando imagen hero antigua de Cloudinary: ${currentSettings.heroImagePublicId}`);
            await deleteImageFromCloudinary(currentSettings.heroImagePublicId);
          } catch (err) {
            console.error("Error al eliminar imagen hero antigua de Cloudinary:", err);
          }
        }
        updateData.heroImagePublicId = String(heroImagePublicId).trim();
      }
    }

    if (body.heroTitle !== undefined) updateData.heroTitle = String(body.heroTitle).trim();
    if (body.heroSubtitle !== undefined) updateData.heroSubtitle = String(body.heroSubtitle).trim();
    if (body.heroDescription !== undefined) updateData.heroDescription = String(body.heroDescription).trim();
    if (body.heroImageScale !== undefined) updateData.heroImageScale = Number(body.heroImageScale);
    if (body.heroImageFit !== undefined) updateData.heroImageFit = String(body.heroImageFit).trim();

    const updated = updateSettings(updateData);

    return NextResponse.json(
      {
        success: true,
        message: "Configuración del sitio actualizada exitosamente.",
        data: updated,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar la configuración." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
