import pool from "../../lib/db";

export async function GET() {
  try {
    const [profesores] = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.foto,
        p.activa,
        p.orden,
        GROUP_CONCAT(pa.actividad_id) AS actividad_ids
      FROM profesores p
      LEFT JOIN profesor_actividad pa
        ON p.id = pa.profesor_id
      WHERE p.activa = TRUE
      GROUP BY p.id
      ORDER BY p.orden ASC, p.nombre ASC
    `);

    const resultado = profesores.map((profesor) => ({
      ...profesor,
      actividad_ids: profesor.actividad_ids
        ? profesor.actividad_ids.split(",").map(Number)
        : [],
    }));

    return Response.json({
      correcto: true,
      profesores: resultado,
    });
  } catch (error) {
    console.error("Error obteniendo profesores:", error);

    return Response.json(
      {
        correcto: false,
        mensaje: "Error obteniendo profesores",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const connection = await pool.getConnection();

  try {
    const body = await request.json();

    const nombre = body.nombre?.trim();
    const descripcion = body.descripcion?.trim() || null;
    const actividadIds = Array.isArray(body.actividadIds)
      ? body.actividadIds
      : [];

    if (!nombre) {
      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje: "El nombre es obligatorio",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const [resultado] = await connection.query(
      `
      INSERT INTO profesores
        (nombre, descripcion)
      VALUES
        (?, ?)
      `,
      [nombre, descripcion]
    );

    const profesorId = resultado.insertId;

    for (const actividadId of actividadIds) {
      await connection.query(
        `
        INSERT INTO profesor_actividad
          (profesor_id, actividad_id)
        VALUES
          (?, ?)
        `,
        [profesorId, actividadId]
      );
    }

    await connection.commit();

    connection.release();

    return Response.json({
      correcto: true,
      mensaje: "Profesor creado correctamente",
      id: profesorId,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error("Error creando profesor:", error);

    return Response.json(
      {
        correcto: false,
        mensaje: "Error creando profesor",
      },
      { status: 500 }
    );
  }
}
