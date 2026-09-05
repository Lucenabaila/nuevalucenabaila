import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { path: filePath } = await params;

    if (!filePath || filePath.length < 2) {
      return new NextResponse("Archivo no especificado", {
        status: 400,
      });
    }

    const tipo = filePath[0];

    if (tipo !== "profesores" && tipo !== "actividades") {
      return new NextResponse("Ruta no permitida", {
        status: 404,
      });
    }

    const nombreArchivo = filePath.slice(1).join("/");

    if (
      !nombreArchivo ||
      nombreArchivo.includes("..") ||
      nombreArchivo.includes("\\")
    ) {
      return new NextResponse("Ruta no válida", {
        status: 400,
      });
    }

    const rutaBase = path.resolve(
      process.cwd(),
      "../../uploads",
      tipo
    );

    const rutaArchivo = path.resolve(
      rutaBase,
      nombreArchivo
    );

    if (
      rutaArchivo !== rutaBase &&
      !rutaArchivo.startsWith(rutaBase + path.sep)
    ) {
      return new NextResponse("Ruta no permitida", {
        status: 403,
      });
    }

    const archivo = await readFile(rutaArchivo);

    const extension = path
      .extname(rutaArchivo)
      .toLowerCase();

    const tipos = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
    };

    const contentType =
      tipos[extension] || "application/octet-stream";

    return new NextResponse(archivo, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error sirviendo imagen:", error);

    return new NextResponse("Imagen no encontrada", {
      status: 404,
    });
  }
}
