import pool from "../../lib/db";


// =========================================================
// GET — OBTENER TODOS LOS HORARIOS
// =========================================================

export async function GET() {
  try {
    const [horarios] = await pool.query(`
      SELECT
        h.id,
        h.actividad_id,
        h.dia,
        h.hora_inicio,
        h.hora_fin,
        h.nivel,
        h.profesor_id,
        h.activa,
        h.orden,

        a.nombre AS actividad_nombre,

        p.nombre AS profesor_nombre

      FROM horarios h

      INNER JOIN actividades a
        ON h.actividad_id = a.id

      LEFT JOIN profesores p
        ON h.profesor_id = p.id

      ORDER BY
        h.orden ASC,
        FIELD(
          LOWER(h.dia),
          'lunes',
          'martes',
          'miércoles',
          'jueves',
          'viernes',
          'sábado',
          'domingo'
        ),
        h.hora_inicio ASC
    `);

    return Response.json({
      correcto: true,
      horarios,
    });

  } catch (error) {

    console.error(
      "Error obteniendo horarios:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje: "Error obteniendo horarios",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}


// =========================================================
// POST — CREAR HORARIO
// =========================================================

export async function POST(request) {

  try {

    const body = await request.json();

    const actividadId = Number(
      body.actividad_id ?? body.actividadId
    );

    const dia = body.dia?.trim();

    const horaInicio =
      body.hora_inicio ??
      body.horaInicio;

    const horaFin =
      body.hora_fin ??
      body.horaFin;

    const nivel =
      body.nivel?.trim() || null;

    const profesorIdRaw =
      body.profesor_id ??
      body.profesorId;

    const profesorId =
      profesorIdRaw === null ||
      profesorIdRaw === undefined ||
      profesorIdRaw === ""
        ? null
        : Number(profesorIdRaw);

    const orden =
      Number(body.orden) || 0;


    // -----------------------------------------------------
    // VALIDACIONES
    // -----------------------------------------------------

    if (!actividadId) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "Debes seleccionar una actividad.",
        },
        {
          status: 400,
        }
      );
    }


    if (!dia) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "Debes seleccionar un día.",
        },
        {
          status: 400,
        }
      );
    }


    if (!horaInicio) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "Debes indicar la hora de inicio.",
        },
        {
          status: 400,
        }
      );
    }


    if (!horaFin) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "Debes indicar la hora de finalización.",
        },
        {
          status: 400,
        }
      );
    }


    // -----------------------------------------------------
    // COMPROBAR ACTIVIDAD
    // -----------------------------------------------------

    const [actividad] = await pool.query(
      `
      SELECT id
      FROM actividades
      WHERE id = ?
      LIMIT 1
      `,
      [actividadId]
    );


    if (actividad.length === 0) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "La actividad seleccionada no existe.",
        },
        {
          status: 400,
        }
      );
    }


    // -----------------------------------------------------
    // COMPROBAR PROFESOR
    // -----------------------------------------------------

    if (profesorId !== null) {

      const [profesor] =
        await pool.query(
          `
          SELECT id
          FROM profesores
          WHERE id = ?
          LIMIT 1
          `,
          [profesorId]
        );


      if (profesor.length === 0) {

        return Response.json(
          {
            correcto: false,
            mensaje:
              "El profesor seleccionado no existe.",
          },
          {
            status: 400,
          }
        );
      }
    }


    // -----------------------------------------------------
    // INSERTAR
    // -----------------------------------------------------

    const [resultado] =
      await pool.query(
        `
        INSERT INTO horarios
          (
            actividad_id,
            dia,
            hora_inicio,
            hora_fin,
            nivel,
            profesor_id,
            activa,
            orden
          )

        VALUES
          (?, ?, ?, ?, ?, ?, TRUE, ?)
        `,
        [
          actividadId,
          dia,
          horaInicio,
          horaFin,
          nivel,
          profesorId,
          orden,
        ]
      );


    return Response.json(
      {
        correcto: true,
        mensaje:
          "Horario creado correctamente.",
        id: resultado.insertId,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(
      "Error creando horario:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error creando horario.",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}


// =========================================================
// PUT — MODIFICAR HORARIO
// =========================================================

export async function PUT(request) {

  try {

    const body = await request.json();

    const id = Number(body.id);

    if (!id) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El ID del horario es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }


    const actividadId = Number(
      body.actividad_id ?? body.actividadId
    );

    const dia = body.dia?.trim();

    const horaInicio =
      body.hora_inicio ??
      body.horaInicio;

    const horaFin =
      body.hora_fin ??
      body.horaFin;

    const nivel =
      body.nivel?.trim() || null;

    const profesorIdRaw =
      body.profesor_id ??
      body.profesorId;

    const profesorId =
      profesorIdRaw === null ||
      profesorIdRaw === undefined ||
      profesorIdRaw === ""
        ? null
        : Number(profesorIdRaw);

    const activa =
      body.activa === false ||
      body.activa === 0
        ? false
        : true;

    const orden =
      Number(body.orden) || 0;


    if (!actividadId) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "Debes seleccionar una actividad.",
        },
        {
          status: 400,
        }
      );
    }


    if (!dia) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "Debes seleccionar un día.",
        },
        {
          status: 400,
        }
      );
    }


    if (!horaInicio || !horaFin) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "Debes indicar las horas.",
        },
        {
          status: 400,
        }
      );
    }


    const [resultado] =
      await pool.query(
        `
        UPDATE horarios

        SET
          actividad_id = ?,
          dia = ?,
          hora_inicio = ?,
          hora_fin = ?,
          nivel = ?,
          profesor_id = ?,
          activa = ?,
          orden = ?

        WHERE id = ?
        `,
        [
          actividadId,
          dia,
          horaInicio,
          horaFin,
          nivel,
          profesorId,
          activa,
          orden,
          id,
        ]
      );


    if (resultado.affectedRows === 0) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "No se encontró el horario.",
        },
        {
          status: 404,
        }
      );
    }


    return Response.json({
      correcto: true,
      mensaje:
        "Horario actualizado correctamente.",
    });


  } catch (error) {

    console.error(
      "Error actualizando horario:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error actualizando horario.",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}


// =========================================================
// DELETE — ELIMINAR HORARIO
// =========================================================

export async function DELETE(request) {

  try {

    const body = await request.json();

    const id = Number(body.id);

    if (!id) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El ID del horario es obligatorio.",
        },
        {
          status: 400,
        }
      );
    }


    const [resultado] =
      await pool.query(
        `
        DELETE FROM horarios
        WHERE id = ?
        `,
        [id]
      );


    if (resultado.affectedRows === 0) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "No se encontró el horario.",
        },
        {
          status: 404,
        }
      );
    }


    return Response.json({
      correcto: true,
      mensaje:
        "Horario eliminado correctamente.",
    });


  } catch (error) {

    console.error(
      "Error eliminando horario:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error eliminando horario.",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
