import { writeFile, mkdir } from "fs/promises";
import path from "path";


// =========================================================
// POST — SUBIR FOTO DE PROFESOR
// =========================================================

export async function POST(request) {

  try {

    const formData =
      await request.formData();


    const archivo =
      formData.get("foto");


    // -----------------------------------------------------
    // COMPROBAR ARCHIVO
    // -----------------------------------------------------

    if (
      !archivo ||
      typeof archivo === "string"
    ) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "No se ha seleccionado ninguna fotografía.",
        },
        {
          status: 400,
        }
      );

    }


    // -----------------------------------------------------
    // COMPROBAR TIPO DE ARCHIVO
    // -----------------------------------------------------

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];


    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El archivo debe ser una imagen JPG, PNG, WEBP o GIF.",
        },
        {
          status: 400,
        }
      );

    }


    // -----------------------------------------------------
    // COMPROBAR TAMAÑO
    // -----------------------------------------------------

    const tamañoMaximo =
      10 * 1024 * 1024;


    if (
      archivo.size >
      tamañoMaximo
    ) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "La fotografía no puede superar los 10 MB.",
        },
        {
          status: 400,
        }
      );

    }


    // -----------------------------------------------------
    // CREAR CARPETA
    // -----------------------------------------------------

    const carpeta =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "profesores"
      );


    await mkdir(
      carpeta,
      {
        recursive: true,
      }
    );


    // -----------------------------------------------------
    // EXTENSIÓN
    // -----------------------------------------------------

    const extension =
      path
        .extname(
          archivo.name
        )
        .toLowerCase();


    const extensionesPermitidas = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
    ];


    if (
      !extensionesPermitidas.includes(
        extension
      )
    ) {

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
    // NOMBRE ÚNICO
    // -----------------------------------------------------

    const nombreSeguro =
      archivo.name
        .replace(
          extension,
          ""
        )
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        )
        .toLowerCase()
        .slice(0, 50);


    const nombreArchivo =
      `${nombreSeguro || "profesor"}-${Date.now()}${extension}`;


    // -----------------------------------------------------
    // GUARDAR ARCHIVO
    // -----------------------------------------------------

    const rutaCompleta =
      path.join(
        carpeta,
        nombreArchivo
      );


    const bytes =
      await archivo.arrayBuffer();


    const buffer =
      Buffer.from(bytes);


    await writeFile(
      rutaCompleta,
      buffer
    );


    // -----------------------------------------------------
    // RUTA PÚBLICA
    // -----------------------------------------------------

    const rutaPublica =
      `/uploads/profesores/${nombreArchivo}`;


    return Response.json({

      correcto: true,

      mensaje:
        "Fotografía subida correctamente.",

      ruta:
        rutaPublica,

      foto:
        rutaPublica,

    });


  } catch (error) {

    console.error(
      "ERROR SUBIENDO FOTO DE PROFESOR:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error subiendo la fotografía.",

        error:
          error.message,

        codigo:
          error.code || null,

      },
      {
        status: 500,
      }
    );

  }

}
