import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { verifyAdminCredentials, updateAdminPassword } from "@/lib/admin-store";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    const verification = verifyAdminToken(token);
    if (!verification.valid || !verification.username) {
      return NextResponse.json(
        { success: false, error: "No autorizado. Inicia sesión como administrador." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Debes ingresar tu contraseña actual y la nueva contraseña." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Verify current password first
    const isCurrentValid = await verifyAdminCredentials(verification.username, currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: "La contraseña actual no es correcta." },
        { status: 400 }
      );
    }

    // Update password
    await updateAdminPassword(newPassword);

    return NextResponse.json({
      success: true,
      message: "¡Contraseña actualizada exitosamente!",
    });
  } catch (error: any) {
    console.error("Error en PUT /api/auth/password:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al actualizar la contraseña." },
      { status: 500 }
    );
  }
}
