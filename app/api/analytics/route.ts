import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, recordVisit } from "@/lib/analytics";

export async function GET() {
  try {
    const summary = getAnalyticsSummary();
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener analíticas." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const body = await request.json().catch(() => ({}));

    // Detect device
    let device: "Mobile" | "Desktop" | "Tablet" = "Desktop";
    if (/iPad|Tablet/i.test(userAgent)) {
      device = "Tablet";
    } else if (/Mobile|Android|iPhone/i.test(userAgent)) {
      device = "Mobile";
    }

    // Detect browser
    let browser = "Navegador";
    if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) browser = "Chrome";
    else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = "Safari";
    else if (/Firefox/i.test(userAgent)) browser = "Firefox";
    else if (/Edg/i.test(userAgent)) browser = "Edge";

    const event = recordVisit({
      path: body.path || "/",
      device,
      browser,
      referrer: request.headers.get("referer") || undefined,
    });

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al registrar analítica." },
      { status: 500 }
    );
  }
}
