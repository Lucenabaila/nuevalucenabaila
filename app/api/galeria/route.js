import pool from "../../lib/db";


// =========================================================
// GET — OBTENER GALERÍAS
// =========================================================

export async function GET() {
  try {
    const [galerias] = await pool.query(`
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
    `);

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
        mensaje: "Error obteniendo galerías",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}


// =========================================================
// GET — OBTENER IMÁGENES DE UNA GALERÍA
// =========================================================

async function obtenerImagenes(galeriaId) {

  const [imagenes] =
    await pool.query(
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

  return imagenes;
}


// =========================================================
// POST — CREAR GALERÍA
// =========================================================

export async function POST(request) {

  try {

    const body =
      await request.json();

    const titulo =
      body.titulo?.trim();

    const descripcion =
      body.descripcion?.trim() || null;

    const imagen =
      body.imagen?.trim() || null;

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

    const [resultado] =
      await pool.query(
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
      "Error creando galería:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error creando galería.",
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
      body.descripcion?.trim() || null;

    const imagen =
      body.imagen?.trim() || null;

    const activa =
      body.activa === false
        ? false
        : true;

    const orden =
      Number(body.orden) || 0;


    // -----------------------------------------------------
    // VALIDACIONES
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // ACTUALIZAR GALERÍA
    // -----------------------------------------------------

    const [resultado] =
      await pool.query(
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
// DELETE — ELIMINAR GALERÍA
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
            "El ID de la galería es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }


    // -----------------------------------------------------
    // ELIMINAR GALERÍA
    // -----------------------------------------------------
    // Las imágenes relacionadas se eliminan
    // automáticamente gracias a ON DELETE CASCADE.

    const [resultado] =
      await pool.query(
        `
        DELETE FROM galeria
        WHERE id = ?
        `,
        [id]
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
