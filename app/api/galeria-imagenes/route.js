import pool from "../../lib/db";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";


// =========================================================
// CONFIGURACIÓN
// =========================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const TIPOS_PERMITIDOS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

async function asegurarCarpeta() {

  const carpeta = path.join(
    process.cwd(),
    "public",
    "uploads",
    "galeria"
  );

  await fs.mkdir(carpeta, {
    recursive: true,
  });

  return carpeta;
}


function generarNombreArchivo(
  nombreOriginal,
  tipo
) {

  const extensionOriginal =
    path.extname(
      nombreOriginal || ""
    ).toLowerCase();

  const extensionPermitida =
    TIPOS_PERMITIDOS[tipo] ||
    extensionOriginal ||
    ".jpg";

  const nombre =
    `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}${extensionPermitida}`;

  return nombre;
}


function rutaFisicaDesdeUrl(url) {

  if (!url) {
    return null;
  }

  if (
    !url.startsWith(
      "/uploads/galeria/"
    )
  ) {
    return null;
  }

  return path.join(
    process.cwd(),
    "public",
    url
  );
}


// =========================================================
// GET — OBTENER FOTOGRAFÍAS DE UNA GALERÍA
// =========================================================

export async function GET(request) {

  try {

    const { searchParams } =
      new URL(request.url);

    const galeriaId =
      Number(
        searchParams.get(
          "galeriaId"
        )
      );


    if (!galeriaId) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El ID de la galería es obligatorio.",
        },
        {
          status: 400,
        }
      );

    }


    const [
      imagenes
    ] = await pool.query(
      `
      SELECT
        id,
        galeria_id,
        imagen,
        titulo,
        orden,
        created_at
      FROM galeria_imagenes
      WHERE galeria_id = ?
      ORDER BY
        orden ASC,
        created_at ASC,
        id ASC
      `,
      [galeriaId]
    );


    return Response.json({

      correcto: true,

      imagenes,

    });


  } catch (error) {

    console.error(
      "Error obteniendo fotografías:",
      error
    );


    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error obteniendo fotografías.",
        error:
          error.message,
      },
      {
        status: 500,
      }
    );

  }

}


// =========================================================
// POST — SUBIR UNA O VARIAS FOTOGRAFÍAS
// =========================================================

export async function POST(request) {

  try {

    const formData =
      await request.formData();


    const galeriaId =
      Number(
        formData.get(
          "galeriaId"
        )
      );


    if (!galeriaId) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El ID de la galería es obligatorio.",
        },
        {
          status: 400,
        }
      );

    }


    // -----------------------------------------------------
    // COMPROBAR QUE LA GALERÍA EXISTE
    // -----------------------------------------------------

    const [
      galerias
    ] = await pool.query(
      `
      SELECT
        id
      FROM galeria
      WHERE id = ?
      LIMIT 1
      `,
      [galeriaId]
    );


    if (
      galerias.length === 0
    ) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "La galería no existe.",
        },
        {
          status: 404,
        }
      );

    }


    // -----------------------------------------------------
    // OBTENER ARCHIVOS
    // -----------------------------------------------------

    const archivos =
      formData.getAll(
        "archivos"
      );


    // También aceptamos "archivo"
    // por si posteriormente subimos
    // una única fotografía.

    if (
      archivos.length === 0
    ) {

      const archivoUnico =
        formData.get(
          "archivo"
        );

      if (
        archivoUnico &&
        typeof archivoUnico !==
          "string"
      ) {

        archivos.push(
          archivoUnico
        );

      }

    }


    if (
      archivos.length === 0
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
    // CARPETA DE DESTINO
    // -----------------------------------------------------

    const carpeta =
      await asegurarCarpeta();


    // -----------------------------------------------------
    // OBTENER ORDEN INICIAL
    // -----------------------------------------------------

    const [
      ultimoOrden
    ] = await pool.query(
      `
      SELECT
        COALESCE(
          MAX(orden),
          0
        ) AS ultimo
      FROM galeria_imagenes
      WHERE galeria_id = ?
      `,
      [galeriaId]
    );


    let siguienteOrden =
      Number(
        ultimoOrden[0]?.ultimo
      ) + 1;


    const subidas = [];
    const errores = [];


    // -----------------------------------------------------
    // PROCESAR FOTOGRAFÍAS
    // -----------------------------------------------------

    for (
      const archivo of archivos
    ) {

      if (
        !archivo ||
        typeof archivo ===
          "string"
      ) {

        continue;

      }


      // ---------------------------------------------------
      // COMPROBAR TIPO
      // ---------------------------------------------------

      if (
        !TIPOS_PERMITIDOS[
          archivo.type
        ]
      ) {

        errores.push({

          nombre:
            archivo.name,

          mensaje:
            "Formato no permitido. Utiliza JPG, PNG, WEBP o GIF.",

        });

        continue;

      }


      // ---------------------------------------------------
      // COMPROBAR TAMAÑO
      // ---------------------------------------------------

      if (
        archivo.size >
        MAX_FILE_SIZE
      ) {

        errores.push({

          nombre:
            archivo.name,

          mensaje:
            "La fotografía supera el máximo de 10 MB.",

        });

        continue;

      }


      try {

        // -------------------------------------------------
        // GENERAR NOMBRE
        // -------------------------------------------------

        const nombreArchivo =
          generarNombreArchivo(
            archivo.name,
            archivo.type
          );


        const rutaFisica =
          path.join(
            carpeta,
            nombreArchivo
          );


        // -------------------------------------------------
        // GUARDAR ARCHIVO
        // -------------------------------------------------

        const bytes =
          await archivo.arrayBuffer();


        const buffer =
          Buffer.from(
            bytes
          );


        await fs.writeFile(
          rutaFisica,
          buffer
        );


        // -------------------------------------------------
        // URL PÚBLICA
        // -------------------------------------------------

        const urlImagen =
          `/uploads/galeria/${nombreArchivo}`;


        // -------------------------------------------------
        // GUARDAR EN BASE DE DATOS
        // -------------------------------------------------

        const [
          resultado
        ] = await pool.query(
          `
          INSERT INTO galeria_imagenes
            (
              galeria_id,
              imagen,
              titulo,
              orden
            )
          VALUES
            (?, ?, ?, ?)
          `,
          [
            galeriaId,
            urlImagen,
            archivo.name ||
              null,
            siguienteOrden,
          ]
        );


        subidas.push({

          id:
            resultado.insertId,

          galeria_id:
            galeriaId,

          imagen:
            urlImagen,

          titulo:
            archivo.name ||
            "",

          orden:
            siguienteOrden,

        });


        siguienteOrden++;


      } catch (error) {

        console.error(
          "Error procesando fotografía:",
          error
        );


        errores.push({

          nombre:
            archivo.name,

          mensaje:
            error.message,

        });

      }

    }


    // -----------------------------------------------------
    // UTILIZAR LA PRIMERA FOTO COMO PORTADA
    // SI LA GALERÍA TODAVÍA NO TIENE
    // -----------------------------------------------------

    if (
      subidas.length > 0
    ) {

      await pool.query(
        `
        UPDATE galeria
        SET
          imagen = ?
        WHERE
          id = ?
          AND (
            imagen IS NULL
            OR imagen = ''
          )
        `,
        [
          subidas[0].imagen,
          galeriaId,
        ]
      );

    }


    // -----------------------------------------------------
    // RESPUESTA
    // -----------------------------------------------------

    return Response.json({

      correcto:
        subidas.length > 0,

      mensaje:
        subidas.length > 0
          ? `${subidas.length} fotografía${
              subidas.length === 1
                ? ""
                : "s"
            } subida${
              subidas.length === 1
                ? ""
                : "s"
            } correctamente.`
          : "No se pudo subir ninguna fotografía.",

      imagenes:
        subidas,

      errores,

    });


  } catch (error) {

    console.error(
      "Error subiendo fotografías:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error subiendo fotografías.",

        error:
          error.message,
      },
      {
        status: 500,
      }
    );

  }

}


// =========================================================
// PUT — MODIFICAR FOTOGRAFÍA
// =========================================================

export async function PUT(request) {

  try {

    const body =
      await request.json();


    const id =
      Number(body.id);


    const titulo =
      body.titulo?.trim() ||
      null;


    const orden =
      Number(body.orden) || 0;


    if (!id) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El ID de la fotografía es obligatorio.",
        },
        {
          status: 400,
        }
      );

    }


    const [
      resultado
    ] = await pool.query(
      `
      UPDATE galeria_imagenes
      SET
        titulo = ?,
        orden = ?
      WHERE id = ?
      `,
      [
        titulo,
        orden,
        id,
      ]
    );


    if (
      resultado.affectedRows === 0
    ) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "No se encontró la fotografía.",
        },
        {
          status: 404,
        }
      );

    }


    return Response.json({

      correcto: true,

      mensaje:
        "Fotografía actualizada correctamente.",

    });


  } catch (error) {

    console.error(
      "Error actualizando fotografía:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error actualizando fotografía.",

        error:
          error.message,
      },
      {
        status: 500,
      }
    );

  }

}


// =========================================================
// DELETE — ELIMINAR FOTOGRAFÍA
// =========================================================

export async function DELETE(request) {

  try {

    const body =
      await request.json();


    const id =
      Number(body.id);


    if (!id) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El ID de la fotografía es obligatorio.",
        },
        {
          status: 400,
        }
      );

    }


    // -----------------------------------------------------
    // OBTENER FOTOGRAFÍA
    // -----------------------------------------------------

    const [
      imagenes
    ] = await pool.query(
      `
      SELECT
        id,
        galeria_id,
        imagen
      FROM galeria_imagenes
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );


    if (
      imagenes.length === 0
    ) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "No se encontró la fotografía.",
        },
        {
          status: 404,
        }
      );

    }


    const fotografia =
      imagenes[0];


    // -----------------------------------------------------
    // BORRAR ARCHIVO FÍSICO
    // -----------------------------------------------------

    const rutaFisica =
      rutaFisicaDesdeUrl(
        fotografia.imagen
      );


    if (rutaFisica) {

      try {

        await fs.unlink(
          rutaFisica
        );

      } catch (error) {

        if (
          error.code !==
          "ENOENT"
        ) {

          console.error(
            "Error eliminando archivo:",
            error
          );

        }

      }

    }


    // -----------------------------------------------------
    // BORRAR DE BASE DE DATOS
    // -----------------------------------------------------

    await pool.query(
      `
      DELETE FROM galeria_imagenes
      WHERE id = ?
      `,
      [id]
    );


    return Response.json({

      correcto: true,

      mensaje:
        "Fotografía eliminada correctamente.",

    });


  } catch (error) {

    console.error(
      "Error eliminando fotografía:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error eliminando fotografía.",

        error:
          error.message,
      },
      {
        status: 500,
      }
    );

  }

}
