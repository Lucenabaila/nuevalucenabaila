import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const cookie = request.cookies.get("admin_session");

    const autenticado =
      cookie?.value === "authenticated";

    return NextResponse.json({
      autenticado,
    });

  } catch (error) {
    console.error(
      "Error comprobando sesión:",
      error
    );

    return NextResponse.json(
      {
        autenticado: false,
      },
      { status: 500 }
    );
  }
}
