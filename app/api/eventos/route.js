import pool from "../../lib/db";


// =========================================================
// GET — OBTENER EVENTOS
// =========================================================

export async function GET() {
  try {
    const [eventos] = await pool.query(`
      SELECT
        id,
        titulo,
        descripcion,
        fecha,
        hora,
        lugar,
        imagen,
        activa,
        created_at
      FROM eventos
      ORDER BY
        fecha ASC,
        hora ASC,
        created_at ASC,
        titulo ASC
    `);

    return Response.json({
      correcto: true,
      eventos,
    });

  } catch (error) {

    console.error(
      "Error obteniendo eventos:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error obteniendo eventos",
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
// POST — CREAR EVENTO
// =========================================================

export async function POST(request) {

  try {

    const body =
      await request.json();

    const titulo =
      body.titulo?.trim();

    const descripcion =
      body.descripcion?.trim() || null;

    const fecha =
      body.fecha || null;

    const hora =
      body.hora || null;

    const lugar =
      body.lugar?.trim() || null;

    const imagen =
      body.imagen?.trim() || null;


    // -----------------------------------------------------
    // VALIDACIONES
    // -----------------------------------------------------

    if (!titulo) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El título del evento es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }


    if (!fecha) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "La fecha del evento es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }


    // -----------------------------------------------------
    // CREAR EVENTO
    // -----------------------------------------------------

    const [resultado] =
      await pool.query(
        `
        INSERT INTO eventos
          (
            titulo,
            descripcion,
            fecha,
            hora,
            lugar,
            imagen,
            activa
          )
        VALUES
          (?, ?, ?, ?, ?, ?, TRUE)
        `,
        [
          titulo,
          descripcion,
          fecha,
          hora,
          lugar,
          imagen,
        ]
      );


    return Response.json(
      {
        correcto: true,
        mensaje:
          "Evento creado correctamente.",
        id:
          resultado.insertId,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(
      "Error creando evento:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error creando evento.",
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
// PUT — MODIFICAR EVENTO
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

    const fecha =
      body.fecha || null;

    const hora =
      body.hora || null;

    const lugar =
      body.lugar?.trim() || null;

    const imagen =
      body.imagen?.trim() || null;

    const activa =
      body.activa === false
        ? false
        : true;


    // -----------------------------------------------------
    // VALIDACIONES
    // -----------------------------------------------------

    if (!id) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El ID del evento es obligatorio.",
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
            "El título del evento es obligatorio.",
        },
        {
          status: 400
        }
      );
    }


    if (!fecha) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "La fecha del evento es obligatoria.",
        },
        {
          status: 400,
        }
      );
    }


    // -----------------------------------------------------
    // ACTUALIZAR
    // -----------------------------------------------------

    const [resultado] =
      await pool.query(
        `
        UPDATE eventos

        SET
          titulo = ?,
          descripcion = ?,
          fecha = ?,
          hora = ?,
          lugar = ?,
          imagen = ?,
          activa = ?

        WHERE id = ?
        `,
        [
          titulo,
          descripcion,
          fecha,
          hora,
          lugar,
          imagen,
          activa,
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
            "No se encontró el evento.",
        },
        {
          status: 404,
        }
      );
    }


    return Response.json({
      correcto: true,
      mensaje:
        "Evento actualizado correctamente.",
    });


  } catch (error) {

    console.error(
      "Error actualizando evento:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error actualizando evento.",
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
// DELETE — ELIMINAR EVENTO
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
            "El ID del evento es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }


    const [resultado] =
      await pool.query(
        `
        DELETE FROM eventos
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
            "No se encontró el evento.",
        },
        {
          status: 404,
        }
      );
    }


    return Response.json({
      correcto: true,
      mensaje:
        "Evento eliminado correctamente.",
    });


  } catch (error) {

    console.error(
      "Error eliminando evento:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error eliminando evento.",
        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}
