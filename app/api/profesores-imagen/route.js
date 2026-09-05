import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.resolve(
  process.cwd(),
  "../../../uploads/profesores"
);

export async function POST(request) {
  try {
    const formData = await request.formData();

    // El administrador envía la fotografía con el nombre "foto"
    const file =
      formData.get("foto") ||
      formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          correcto: false,
          mensaje: "No se ha recibido ningún archivo.",
        },
        { status: 400 }
      );
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        {
          correcto: false,
          mensaje:
            "La fotografía debe ser JPG, PNG, WEBP o GIF.",
        },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          correcto: false,
          mensaje:
            "La fotografía no puede superar los 10 MB.",
        },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, {
      recursive: true,
    });

    const extension =
      file.type === "image/jpeg"
        ? ".jpg"
        : file.type === "image/png"
        ? ".png"
        : file.type === "image/webp"
        ? ".webp"
        : ".gif";

    const nombreSeguro =
      `profesor-${Date.now()}${extension}`;

    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );

    const rutaCompleta =
      path.join(
        UPLOAD_DIR,
        nombreSeguro
      );

    await writeFile(
      rutaCompleta,
      buffer
    );

    const url =
      `/uploads/profesores/${nombreSeguro}`;

    return NextResponse.json({
      correcto: true,
      ruta: url,
      url: url,
      foto: url,
    });

  } catch (error) {

    console.error(
      "Error subiendo imagen de profesor:",
      error
    );

    return NextResponse.json(
      {
        correcto: false,
        mensaje:
          "No se pudo guardar la imagen.",
        error:
          error?.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}
