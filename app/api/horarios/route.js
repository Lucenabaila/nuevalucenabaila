import pool from "../../lib/db";

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
        h.activa,
        h.orden,
        a.nombre AS actividad_nombre,
        GROUP_CONCAT(
          DISTINCT hp.profesor_id
          ORDER BY hp.profesor_id
          SEPARATOR ','
        ) AS profesor_ids
      FROM horarios h

      INNER JOIN actividades a
        ON h.actividad_id = a.id

      LEFT JOIN horario_profesor hp
        ON h.id = hp.horario_id

      GROUP BY
        h.id,
        h.actividad_id,
        h.dia,
        h.hora_inicio,
        h.hora_fin,
        h.nivel,
        h.activa,
        h.orden,
        a.nombre

      ORDER BY
        h.orden ASC,
        FIELD(
          h.dia,
          'Lunes',
          'Martes',
          'Miércoles',
          'Jueves',
          'Viernes',
          'Sábado',
          'Domingo'
        ),
        h.hora_inicio ASC
    `);

    const resultado = horarios.map((horario) => ({
      ...horario,
      profesor_ids: horario.profesor_ids
        ? horario.profesor_ids.split(",").map(Number)
        : [],
    }));

    return Response.json({
      correcto: true,
      horarios: resultado,
    });
  } catch (error) {
    console.error("Error obteniendo horarios:", error);

    return Response.json(
      {
        correcto: false,
        mensaje: "Error obteniendo horarios",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const connection = await pool.getConnection();

  try {
    const body = await request.json();

    const actividadId = Number(body.actividadId);
    const dia = body.dia?.trim();
    const horaInicio = body.horaInicio;
    const horaFin = body.horaFin;
    const nivel = body.nivel?.trim() || null;
    const profesorIds = Array.isArray(body.profesorIds)
      ? body.profesorIds.map(Number).filter(Boolean)
      : [];
    const orden = Number(body.orden) || 0;

    if (!actividadId) {
      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje: "La actividad es obligatoria",
        },
        { status: 400 }
      );
    }

    if (!dia) {
      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje: "El día es obligatorio",
        },
        { status: 400 }
      );
    }

    if (!horaInicio || !horaFin) {
      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje: "Las horas de inicio y fin son obligatorias",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const [resultado] = await connection.query(
      `
      INSERT INTO horarios
        (
          actividad_id,
          dia,
          hora_inicio,
          hora_fin,
          nivel,
          orden
        )
      VALUES
        (?, ?, ?, ?, ?, ?)
      `,
      [
        actividadId,
        dia,
        horaInicio,
        horaFin,
        nivel,
        orden,
      ]
    );

    const horarioId = resultado.insertId;

    for (const profesorId of profesorIds) {
      await connection.query(
        `
        INSERT INTO horario_profesor
          (
            horario_id,
            profesor_id
          )
        VALUES
          (?, ?)
        `,
        [horarioId, profesorId]
      );
    }

    await connection.commit();
    connection.release();

    return Response.json({
      correcto: true,
      mensaje: "Horario creado correctamente",
      id: horarioId,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Error creando horario:", error);

    return Response.json(
      {
        correcto: false,
        mensaje: "Error creando horario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const connection = await pool.getConnection();

  try {
    const body = await request.json();

    const id = Number(body.id);
    const actividadId = Number(body.actividadId);
    const dia = body.dia?.trim();
    const horaInicio = body.horaInicio;
    const horaFin = body.horaFin;
    const nivel = body.nivel?.trim() || null;
    const profesorIds = Array.isArray(body.profesorIds)
      ? body.profesorIds.map(Number).filter(Boolean)
      : [];
    const activa =
      typeof body.activa === "boolean"
        ? body.activa
        : true;
    const orden = Number(body.orden) || 0;

    if (!id) {
      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje: "El ID del horario es obligatorio",
        },
        { status: 400 }
      );
    }

    if (!actividadId) {
      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje: "La actividad es obligatoria",
        },
        { status: 400 }
      );
    }

    if (!dia || !horaInicio || !horaFin) {
      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje: "Día y horas son obligatorios",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE horarios
      SET
        actividad_id = ?,
        dia = ?,
        hora_inicio = ?,
        hora_fin = ?,
        nivel = ?,
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
        activa,
        orden,
        id,
      ]
    );

    await connection.query(
      `
      DELETE FROM horario_profesor
      WHERE horario_id = ?
      `,
      [id]
    );

    for (const profesorId of profesorIds) {
      await connection.query(
        `
        INSERT INTO horario_profesor
          (
            horario_id,
            profesor_id
          )
        VALUES
          (?, ?)
        `,
        [id, profesorId]
      );
    }

    await connection.commit();
    connection.release();

    return Response.json({
      correcto: true,
      mensaje: "Horario actualizado correctamente",
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Error actualizando horario:", error);

    return Response.json(
      {
        correcto: false,
        mensaje: "Error actualizando horario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const connection = await pool.getConnection();

  try {
    const body = await request.json();

    const id = Number(body.id);

    if (!id) {
      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje: "El ID del horario es obligatorio",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    await connection.query(
      `
      DELETE FROM horario_profesor
      WHERE horario_id = ?
      `,
      [id]
    );

    await connection.query(
      `
      DELETE FROM horarios
      WHERE id = ?
      `,
      [id]
    );

    await connection.commit();
    connection.release();

    return Response.json({
      correcto: true,
      mensaje: "Horario eliminado correctamente",
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Error eliminando horario:", error);

    return Response.json(
      {
        correcto: false,
        mensaje: "Error eliminando horario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
