import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const cuerpo = await request.json();

    const usuario = String(cuerpo.usuario || "");
    const password = String(cuerpo.password || "");

    const usuarioCorrecto =
      usuario === process.env.ADMIN_USER;

    const passwordCorrecta =
      password === process.env.ADMIN_PASSWORD;

    if (!usuarioCorrecto || !passwordCorrecta) {
      return NextResponse.json(
        {
          correcto: false,
          mensaje: "Usuario o contraseña incorrectos.",
        },
        { status: 401 }
      );
    }

    const respuesta = NextResponse.json({
      correcto: true,
    });

    respuesta.cookies.set(
      "admin_session",
      "authenticated",
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return respuesta;

  } catch (error) {
    console.error(
      "Error en login de administrador:",
      error
    );

    return NextResponse.json(
      {
        correcto: false,
        mensaje: "No se pudo iniciar sesión.",
      },
      { status: 500 }
    );
  }
}
