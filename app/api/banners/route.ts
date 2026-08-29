import { NextRequest, NextResponse } from "next/server";
import {
  getAllBanners,
  getBannerById,
  addBanner,
  updateBanner,
  deleteBanner,
  PromoBanner,
} from "@/lib/banner-store";
import { deleteDishImageFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    let banners = getAllBanners();
    if (activeOnly) {
      banners = banners.filter((b) => b.active);
    }

    return NextResponse.json(
      {
        success: true,
        data: banners,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener banners promocionales." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, price, image, badge, link, active, imageSize, imageScale, imageFit, blendMode, layoutMode } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, error: "Título e imagen son obligatorios." },
        { status: 400 }
      );
    }

    const created = addBanner({
      title: String(title).trim(),
      subtitle: String(subtitle || "").trim(),
      price: price ? String(price).trim() : "",
      image: String(image).trim(),
      badge: String(badge || "Promoción").trim(),
      link: String(link || "#menu").trim(),
      active: active !== undefined ? Boolean(active) : true,
      imageSize: imageSize || "normal",
      imageScale: imageScale ? Number(imageScale) : 1.0,
      imageFit: imageFit || "contain",
      blendMode: blendMode || "multiply",
      layoutMode: layoutMode || "split",
    });

    return NextResponse.json({
      success: true,
      message: "Banner promocional creado exitosamente.",
      data: created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al crear banner promocional." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, subtitle, price, image, badge, link, active, imageSize, imageScale, imageFit, blendMode, layoutMode } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Se requiere el ID del banner." },
        { status: 400 }
      );
    }

    const updates: Partial<PromoBanner> = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (subtitle !== undefined) updates.subtitle = String(subtitle).trim();
    if (price !== undefined) updates.price = String(price).trim();
    if (image !== undefined) updates.image = String(image).trim();
    if (badge !== undefined) updates.badge = String(badge).trim();
    if (link !== undefined) updates.link = String(link).trim();
    if (active !== undefined) updates.active = Boolean(active);
    if (imageSize !== undefined) updates.imageSize = imageSize;
    if (imageScale !== undefined) updates.imageScale = Number(imageScale);
    if (imageFit !== undefined) updates.imageFit = imageFit;
    if (blendMode !== undefined) updates.blendMode = blendMode;
    if (layoutMode !== undefined) updates.layoutMode = layoutMode;

    const updated = updateBanner(String(id), updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Banner no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Banner promocional actualizado correctamente.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar banner promocional." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Se requiere el ID del banner." },
        { status: 400 }
      );
    }

    const banner = getBannerById(String(id));
    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Banner no encontrado." },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if applicable
    if (banner.image && banner.image.includes("cloudinary.com")) {
      deleteDishImageFromCloudinary(banner.image).catch(() => {});
    }

    const deleted = deleteBanner(String(id));
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Error al eliminar banner." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Banner promocional eliminado correctamente.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar banner promocional." },
      { status: 500 }
    );
  }
}
