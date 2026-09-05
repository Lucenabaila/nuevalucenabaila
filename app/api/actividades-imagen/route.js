import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.resolve(
  process.cwd(),
  "../../../uploads/actividades"
);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          correcto: false,
          error: "No se ha recibido ningún archivo.",
        },
        { status: 400 }
      );
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        {
          correcto: false,
          error: "Formato de imagen no permitido.",
        },
        { status: 400 }
      );
    }

    const MAX_SIZE = 15 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          correcto: false,
          error: "La imagen no puede superar los 15 MB.",
        },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const extension =
      file.type === "image/jpeg"
        ? ".jpg"
        : file.type === "image/png"
        ? ".png"
        : ".webp";

    const nombreSeguro = `actividad-${Date.now()}${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const rutaCompleta = path.join(
      UPLOAD_DIR,
      nombreSeguro
    );

    await writeFile(rutaCompleta, buffer);

    const url = `/uploads/actividades/${nombreSeguro}`;

    return NextResponse.json({
      correcto: true,
      url,
      imagen: url,
    });
  } catch (error) {
    console.error("Error subiendo imagen de actividad:", error);

    return NextResponse.json(
      {
        correcto: false,
        error: "No se pudo guardar la imagen.",
      },
      { status: 500 }
    );
  }
}
