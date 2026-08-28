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

async function asegurarCarpetaGaleria() {

  const carpeta =
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "galeria"
    );

  await fs.mkdir(
    carpeta,
    {
      recursive: true,
    }
  );

  return carpeta;
}


function nombreArchivoSeguro(nombreOriginal) {

  const extension =
    path.extname(
      nombreOriginal || ""
    ).toLowerCase();

  const permitidas =
    Object.values(
      TIPOS_PERMITIDOS
    );

  const extensionFinal =
    permitidas.includes(extension)
      ? extension
      : ".jpg";

  const nombre =
    `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}${extensionFinal}`;

  return nombre;
}


function obtenerRutaFisicaDesdeUrl(url) {

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
// GET — OBTENER GALERÍAS
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


    // -------------------------------------------------------
    // SI SE SOLICITA UNA GALERÍA CONCRETA,
    // DEVOLVEMOS SUS FOTOGRAFÍAS
    // -------------------------------------------------------

    if (galeriaId) {

      const [
        galerias
      ] = await pool.query(
        `
        SELECT
          id,
          titulo,
          descripcion,
          imagen,
          activa,
          orden,
          created_at
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
              "No se encontró la galería.",
          },
          {
            status: 404,
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

        galeria:
          galerias[0],

        imagenes,

      });

    }


    // -------------------------------------------------------
    // OBTENER TODAS LAS GALERÍAS
    // -------------------------------------------------------

    const [
      galerias
    ] = await pool.query(
      `
      SELECT
        id,
        titulo,
        descripcion,
        imagen,
        activa,
        orden,
        created_at
      FROM galeria
      ORDER BY
        orden ASC,
        created_at DESC,
        titulo ASC
      `
    );


    return Response.json({

      correcto: true,

      galerias,

    });


  } catch (error) {

    console.error(
      "Error obteniendo galerías:",
      error
    );


    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error obteniendo galerías.",
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
// POST
//
// PUEDE HACER DOS COSAS:
//
// 1. Crear una galería enviando JSON
//
// 2. Subir una fotografía enviando FormData
// =========================================================

export async function POST(request) {

  try {

    const contentType =
      request.headers.get(
        "content-type"
      ) || "";


    // =====================================================
    // SUBIDA DE FOTOGRAFÍA
    // =====================================================

    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {

      const formData =
        await request.formData();


      const galeriaId =
        Number(
          formData.get(
            "galeriaId"
          )
        );


      const archivo =
        formData.get(
          "archivo"
        );


      // ---------------------------------------------------
      // VALIDAR GALERÍA
      // ---------------------------------------------------

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


      // ---------------------------------------------------
      // COMPROBAR GALERÍA
      // ---------------------------------------------------

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


      // ---------------------------------------------------
      // VALIDAR ARCHIVO
      // ---------------------------------------------------

      if (
        !archivo ||
        typeof archivo === "string"
      ) {

        return Response.json(
          {
            correcto: false,
            mensaje:
              "No se ha recibido ninguna fotografía.",
          },
          {
            status: 400,
          }
        );

      }


      if (
        !TIPOS_PERMITIDOS[
          archivo.type
        ]
      ) {

        return Response.json(
          {
            correcto: false,
            mensaje:
              "Formato no permitido. Utiliza JPG, PNG, WEBP o GIF.",
          },
          {
            status: 400,
          }
        );

      }


      if (
        archivo.size >
        MAX_FILE_SIZE
      ) {

        return Response.json(
          {
            correcto: false,
            mensaje:
              "La fotografía supera el máximo de 10 MB.",
          },
          {
            status: 400,
          }
        );

      }


      // ---------------------------------------------------
      // CREAR CARPETA
      // ---------------------------------------------------

      const carpeta =
        await asegurarCarpetaGaleria();


      // ---------------------------------------------------
      // CREAR NOMBRE ÚNICO
      // ---------------------------------------------------

      const nombreArchivo =
        nombreArchivoSeguro(
          archivo.name
        );


      const rutaFisica =
        path.join(
          carpeta,
          nombreArchivo
        );


      // ---------------------------------------------------
      // GUARDAR ARCHIVO
      // ---------------------------------------------------

      const bytes =
        await archivo.arrayBuffer();


      const buffer =
        Buffer.from(bytes);


      await fs.writeFile(
        rutaFisica,
        buffer
      );


      // ---------------------------------------------------
      // OBTENER SIGUIENTE ORDEN
      // ---------------------------------------------------

      const [
        ultimoOrden
      ] = await pool.query(
        `
        SELECT
          COALESCE(
            MAX(orden),
            0
          ) + 1 AS siguiente
        FROM galeria_imagenes
        WHERE galeria_id = ?
        `,
        [galeriaId]
      );


      const siguienteOrden =
        Number(
          ultimoOrden[0]?.siguiente
        ) || 1;


      // ---------------------------------------------------
      // URL PÚBLICA
      // ---------------------------------------------------

      const urlImagen =
        `/uploads/galeria/${nombreArchivo}`;


      // ---------------------------------------------------
      // GUARDAR EN BASE DE DATOS
      // ---------------------------------------------------

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
          archivo.name || null,
          siguienteOrden,
        ]
      );


      // ---------------------------------------------------
      // SI LA GALERÍA NO TIENE PORTADA,
      // UTILIZAMOS ESTA FOTO COMO PORTADA
      // ---------------------------------------------------

      await pool.query(
        `
        UPDATE galeria
        SET imagen = ?
        WHERE id = ?
          AND (
            imagen IS NULL
            OR imagen = ''
          )
        `,
        [
          urlImagen,
          galeriaId,
        ]
      );


      return Response.json(
        {
          correcto: true,

          mensaje:
            "Fotografía subida correctamente.",

          id:
            resultado.insertId,

          imagen:
            urlImagen,

          titulo:
            archivo.name || "",

          orden:
            siguienteOrden,
        },
        {
          status: 201,
        }
      );

    }


    // =====================================================
    // CREAR GALERÍA
    // =====================================================

    const body =
      await request.json();


    const titulo =
      body.titulo?.trim();


    const descripcion =
      body.descripcion?.trim() ||
      null;


    const imagen =
  body.imagen?.trim() || "";


    const orden =
      Number(body.orden) || 0;


    // -----------------------------------------------------
    // VALIDACIÓN
    // -----------------------------------------------------

    if (!titulo) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El título de la galería es obligatorio.",
        },
        {
          status: 400,
        }
      );

    }


    // -----------------------------------------------------
    // CREAR GALERÍA
    // -----------------------------------------------------

    const [
      resultado
    ] = await pool.query(
      `
      INSERT INTO galeria
        (
          titulo,
          descripcion,
          imagen,
          activa,
          orden
        )
      VALUES
        (?, ?, ?, TRUE, ?)
      `,
      [
        titulo,
        descripcion,
        imagen,
        orden,
      ]
    );


    return Response.json(
      {
        correcto: true,

        mensaje:
          "Galería creada correctamente.",

        id:
          resultado.insertId,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(
      "Error en POST de galería:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error guardando la galería.",

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
// PUT — MODIFICAR GALERÍA
// =========================================================

export async function PUT(request) {

  try {

    const body =
      await request.json();


    const id =
      Number(body.id);


    const titulo =
      body.titulo?.trim();


    const descripcion =
      body.descripcion?.trim() ||
      null;


    const imagen =
  body.imagen?.trim() || "";


    const activa =
      body.activa === false
        ? false
        : true;


    const orden =
      Number(body.orden) || 0;


    if (!id) {

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


    if (!titulo) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El título de la galería es obligatorio.",
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
      UPDATE galeria
      SET
        titulo = ?,
        descripcion = ?,
        imagen = ?,
        activa = ?,
        orden = ?
      WHERE id = ?
      `,
      [
        titulo,
        descripcion,
        imagen,
        activa,
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
            "No se encontró la galería.",
        },
        {
          status: 404,
        }
      );

    }


    return Response.json({

      correcto: true,

      mensaje:
        "Galería actualizada correctamente.",

    });


  } catch (error) {

    console.error(
      "Error actualizando galería:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error actualizando galería.",

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
// DELETE
//
// Puede eliminar:
// - una fotografía
// - una galería completa
// =========================================================

export async function DELETE(request) {

  try {

    const body =
      await request.json();


    const imagenId =
      Number(
        body.imagenId
      );


    const galeriaId =
      Number(
        body.id
      );


    // =====================================================
    // ELIMINAR UNA FOTOGRAFÍA
    // =====================================================

    if (imagenId) {

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
        [imagenId]
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


      // ---------------------------------------------------
      // BORRAR ARCHIVO FÍSICO
      // ---------------------------------------------------

      const rutaFisica =
        obtenerRutaFisicaDesdeUrl(
          fotografia.imagen
        );


      if (rutaFisica) {

        try {

          await fs.unlink(
            rutaFisica
          );

        } catch (error) {

          // Si el archivo ya no existe,
          // continuamos igualmente.
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


      // ---------------------------------------------------
      // BORRAR REGISTRO
      // ---------------------------------------------------

      await pool.query(
        `
        DELETE FROM galeria_imagenes
        WHERE id = ?
        `,
        [imagenId]
      );


      return Response.json({

        correcto: true,

        mensaje:
          "Fotografía eliminada correctamente.",

      });

    }


    // =====================================================
    // ELIMINAR GALERÍA
    // =====================================================

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
    // OBTENER FOTOGRAFÍAS ANTES DE ELIMINAR
    // -----------------------------------------------------

    const [
      imagenes
    ] = await pool.query(
      `
      SELECT
        imagen
      FROM galeria_imagenes
      WHERE galeria_id = ?
      `,
      [galeriaId]
    );


    // -----------------------------------------------------
    // ELIMINAR ARCHIVOS FÍSICOS
    // -----------------------------------------------------

    for (
      const imagen
      of imagenes
    ) {

      const rutaFisica =
        obtenerRutaFisicaDesdeUrl(
          imagen.imagen
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
              "Error eliminando fotografía:",
              error
            );

          }

        }

      }

    }


    // -----------------------------------------------------
    // ELIMINAR GALERÍA
    // -----------------------------------------------------
    // galeria_imagenes se elimina también
    // gracias al ON DELETE CASCADE.

    const [
      resultado
    ] = await pool.query(
      `
      DELETE FROM galeria
      WHERE id = ?
      `,
      [galeriaId]
    );


    if (
      resultado.affectedRows === 0
    ) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "No se encontró la galería.",
        },
        {
          status: 404,
        }
      );

    }


    return Response.json({

      correcto: true,

      mensaje:
        "Galería eliminada correctamente.",

    });


  } catch (error) {

    console.error(
      "Error eliminando galería:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error eliminando galería.",

        error:
          error.message,
      },
      {
        status: 500,
      }
    );

  }

}
