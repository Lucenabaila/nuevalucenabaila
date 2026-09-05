import { writeFile, mkdir } from "fs/promises";
import path from "path";


// =========================================================
// POST — SUBIR CARTEL DE ACTIVIDAD
// =========================================================

export async function POST(request) {

  try {

    const formData =
      await request.formData();


    const archivo =
      formData.get("imagen");


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
            "No se ha seleccionado ningún cartel.",
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
            "El archivo debe ser una imagen JPG, PNG o WEBP.",
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
      15 * 1024 * 1024;


    if (
      archivo.size >
      tamañoMaximo
    ) {

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
    // CREAR CARPETA
    // -----------------------------------------------------

    const carpeta =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "actividades"
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
    // NOMBRE SEGURO
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


    // -----------------------------------------------------
    // NOMBRE ÚNICO
    // -----------------------------------------------------

    const nombreArchivo =
      `${nombreSeguro || "actividad"}-${Date.now()}${extension}`;


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
      `/uploads/actividades/${nombreArchivo}`;


    return Response.json({

      correcto: true,

      mensaje:
        "Cartel subido correctamente.",

      ruta:
        rutaPublica,

      imagen:
        rutaPublica,

    });


  } catch (error) {

    console.error(
      "ERROR SUBIENDO CARTEL DE ACTIVIDAD:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error subiendo el cartel.",

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
