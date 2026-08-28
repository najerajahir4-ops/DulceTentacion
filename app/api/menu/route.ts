import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  MENU_CATEGORIES,
  MenuCategory,
} from "@/lib/menu-store";
import { deleteDishImageFromCloudinary } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let products = getAllProducts();
    if (category && category !== "Todo") {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      categories: MENU_CATEGORIES,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener el menú." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, price, description, image, popular, isNew, available, hasOptions, imageSize, imageScale, imageFit } = body;

    if (!name || !category || !price) {
      return NextResponse.json(
        { success: false, error: "Nombre, categoría y precio son obligatorios." },
        { status: 400 }
      );
    }

    if (!MENU_CATEGORIES.includes(category as MenuCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: `Categoría inválida. Debe ser una de: ${MENU_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const created = addProduct({
      name: String(name).trim(),
      category: category as MenuCategory,
      price: String(price).trim().startsWith("$") ? String(price).trim() : `$${String(price).trim()}`,
      description: String(description || "").trim(),
      image: String(image || "/images/new_waffle-bgless.png"),
      popular: Boolean(popular),
      isNew: Boolean(isNew),
      available: available !== undefined ? Boolean(available) : true,
      hasOptions: Boolean(hasOptions),
      imageSize: imageSize || "normal",
      imageScale: imageScale ? Number(imageScale) : 1.0,
      imageFit: imageFit || "contain",
    });

    return NextResponse.json({
      success: true,
      message: "Producto creado con éxito.",
      data: created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al guardar el producto." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Se requiere el ID del producto para actualizar." },
        { status: 400 }
      );
    }

    if (updates.price) {
      const p = String(updates.price).trim();
      updates.price = p.startsWith("$") ? p : `$${p}`;
    }

    const updated = updateProduct(String(id), updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Producto actualizado.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar el producto." },
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
        { success: false, error: "Se requiere el ID del producto." },
        { status: 400 }
      );
    }

    const product = getProductById(String(id));
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado para eliminar." },
        { status: 404 }
      );
    }

    // Automatically delete image from Cloudinary if stored on Cloudinary
    if (product.image && product.image.includes("cloudinary.com")) {
      deleteDishImageFromCloudinary(product.image).catch((err) =>
        console.error("Error al borrar imagen de Cloudinary:", err)
      );
    }

    const deleted = deleteProduct(String(id));
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Error al eliminar el producto." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Producto eliminado correctamente.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar el producto." },
      { status: 500 }
    );
  }
}
