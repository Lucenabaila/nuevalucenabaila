import { writeFile, mkdir } from "fs/promises";
import path from "path";

// =========================================================
// CONFIGURACIÓN
// =========================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =========================================================
// POST — SUBIR CARTEL DE ACTIVIDAD
// =========================================================

export async function POST(request) {
  try {
    console.log("========================================");
    console.log("INICIO SUBIDA CARTEL ACTIVIDAD");
    console.log("========================================");

    // -----------------------------------------------------
    // RECIBIR FORMULARIO
    // -----------------------------------------------------

    const formData = await request.formData();

    const archivo = formData.get("imagen");

    console.log("Archivo recibido:", archivo?.name);
    console.log("Tipo:", archivo?.type);
    console.log("Tamaño:", archivo?.size);

    // -----------------------------------------------------
    // COMPROBAR ARCHIVO
    // -----------------------------------------------------

    if (!archivo || typeof archivo === "string") {
      return Response.json(
        {
          correcto: false,
          mensaje: "No se ha seleccionado ningún cartel.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------------
    // COMPROBAR TIPO
    // -----------------------------------------------------

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      return Response.json(
        {
          correcto: false,
          mensaje:
            "El archivo debe ser una imagen JPG, PNG o WEBP.",
          tipoRecibido: archivo.type || "desconocido",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------------
    // COMPROBAR TAMAÑO
    // -----------------------------------------------------

    const tamañoMaximo = 15 * 1024 * 1024;

    if (archivo.size > tamañoMaximo) {
      return Response.json(
        {
          correcto: false,
          mensaje:
            "El cartel no puede superar los 15 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------------
    // CARPETA DE DESTINO
    // -----------------------------------------------------

    const carpeta = path.join(
      process.cwd(),
      "public",
      "uploads",
      "actividades"
    );

    console.log("Carpeta destino:", carpeta);

    await mkdir(carpeta, {
      recursive: true,
    });

    // -----------------------------------------------------
    // EXTENSIÓN
    // -----------------------------------------------------

    let extension = path
      .extname(archivo.name || "")
      .toLowerCase();

    // Si por algún motivo no viene extensión,
    // la obtenemos a partir del tipo MIME.

    if (!extension) {
      if (archivo.type === "image/jpeg") {
        extension = ".jpg";
      } else if (archivo.type === "image/png") {
        extension = ".png";
      } else if (archivo.type === "image/webp") {
        extension = ".webp";
      }
    }

    const extensionesPermitidas = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ];

    if (!extensionesPermitidas.includes(extension)) {
      return Response.json(
        {
          correcto: false,
          mensaje:
            "La extensión del archivo no es válida.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------------------
    // CREAR NOMBRE SEGURO
    // -----------------------------------------------------

    let nombreOriginal = path.basename(
      archivo.name || "actividad"
    );

    nombreOriginal = nombreOriginal
      .replace(/\.[^/.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 50);

    if (!nombreOriginal) {
      nombreOriginal = "actividad";
    }

    // -----------------------------------------------------
    // NOMBRE ÚNICO
    // -----------------------------------------------------

    const nombreArchivo =
      `${nombreOriginal}-${Date.now()}${extension}`;

    // -----------------------------------------------------
    // RUTA COMPLETA
    // -----------------------------------------------------

    const rutaCompleta = path.join(
      carpeta,
      nombreArchivo
    );

    console.log("Archivo final:", nombreArchivo);
    console.log("Ruta completa:", rutaCompleta);

    // -----------------------------------------------------
    // CONVERTIR ARCHIVO
    // -----------------------------------------------------

    const bytes = await archivo.arrayBuffer();

    const buffer = Buffer.from(bytes);

    console.log(
      "Bytes preparados:",
      buffer.length
    );

    // -----------------------------------------------------
    // GUARDAR ARCHIVO
    // -----------------------------------------------------

    await writeFile(
      rutaCompleta,
      buffer
    );

    console.log(
      "ARCHIVO GUARDADO CORRECTAMENTE"
    );

    // -----------------------------------------------------
    // RUTA PÚBLICA
    // -----------------------------------------------------

    const rutaPublica =
      `/uploads/actividades/${nombreArchivo}`;

    console.log(
      "Ruta pública:",
      rutaPublica
    );

    // -----------------------------------------------------
    // RESPUESTA
    // -----------------------------------------------------

    return Response.json({
      correcto: true,
      mensaje:
        "Cartel subido correctamente.",
      ruta: rutaPublica,
      imagen: rutaPublica,
    });

  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "ERROR SUBIENDO CARTEL DE ACTIVIDAD"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error interno al subir el cartel.",
        error:
          error?.message || "Error desconocido",
        codigo:
          error?.code || null,
      },
      {
        status: 500,
      }
    );
  }
}
