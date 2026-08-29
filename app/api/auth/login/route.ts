import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminCredentials } from "@/lib/admin-store";
import { signAdminToken, AUTH_COOKIE_NAME, AUTH_MAX_AGE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Por favor proporciona usuario y contraseña." },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas. Verifica tu usuario y contraseña." },
        { status: 401 }
      );
    }

    const token = signAdminToken(username);
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_MAX_AGE,
    });

    return NextResponse.json({
      success: true,
      user: { username, role: "admin" },
      message: "Autenticación exitosa",
    });
  } catch (error: any) {
    console.error("Error en POST /api/auth/login:", error);
    return NextResponse.json(
      { success: false, error: "Error interno en el servidor al autenticar." },
      { status: 500 }
    );
  }
}
