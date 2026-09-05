import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    funciona: true,
    mensaje: "La ruta /uploads está funcionando"
  });
}
