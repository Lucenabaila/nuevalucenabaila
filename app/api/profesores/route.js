import pool from "../../lib/db";


// =========================================================
// GET — OBTENER PROFESORES
// =========================================================

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
        GROUP_CONCAT(
          DISTINCT pa.actividad_id
          ORDER BY pa.actividad_id
          SEPARATOR ','
        ) AS actividad_ids
      FROM profesores p
      LEFT JOIN profesor_actividad pa
        ON p.id = pa.profesor_id
      WHERE p.activa = TRUE
      GROUP BY
        p.id,
        p.nombre,
        p.descripcion,
        p.foto,
        p.activa,
        p.orden
      ORDER BY
        p.orden ASC,
        p.nombre ASC
    `);

    const resultado = profesores.map((profesor) => ({
      ...profesor,
      actividad_ids: profesor.actividad_ids
        ? profesor.actividad_ids
            .split(",")
            .map(Number)
            .filter(Boolean)
        : [],
    }));

    return Response.json({
      correcto: true,
      profesores: resultado,
    });

  } catch (error) {

    console.error(
      "ERROR OBTENIENDO PROFESORES:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje: "Error obteniendo profesores",
        error: error.message,
        codigo: error.code || null,
        errno: error.errno || null,
        sqlMessage: error.sqlMessage || null,
      },
      {
        status: 500,
      }
    );
  }
}


// =========================================================
// POST — CREAR PROFESOR
// =========================================================

export async function POST(request) {

  const connection =
    await pool.getConnection();

  try {

    const body =
      await request.json();

    const nombre =
      body.nombre?.trim();

    const descripcion =
      body.descripcion?.trim() || null;

    const actividadIds =
      Array.isArray(body.actividadIds)
        ? [
            ...new Set(
              body.actividadIds
                .map(Number)
                .filter(Boolean)
            ),
          ]
        : [];


    if (!nombre) {

      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El nombre es obligatorio",
        },
        {
          status: 400,
        }
      );
    }


    await connection.beginTransaction();


    // -----------------------------------------------------
    // CREAR PROFESOR
    // -----------------------------------------------------

    const [resultado] =
      await connection.query(
        `
        INSERT INTO profesores
          (
            nombre,
            descripcion
          )
        VALUES
          (?, ?)
        `,
        [
          nombre,
          descripcion,
        ]
      );


    const profesorId =
      resultado.insertId;


    // -----------------------------------------------------
    // COMPROBAR ACTIVIDADES
    // -----------------------------------------------------

    if (actividadIds.length > 0) {

      const placeholders =
        actividadIds
          .map(() => "?")
          .join(",");


      const [
        actividadesValidas,
      ] = await connection.query(
        `
        SELECT id
        FROM actividades
        WHERE id IN (${placeholders})
        `,
        actividadIds
      );


      const idsValidos =
        actividadesValidas.map(
          (actividad) =>
            Number(actividad.id)
        );


      // ---------------------------------------------------
      // ASIGNAR ACTIVIDADES
      // ---------------------------------------------------

      for (
        const actividadId
        of idsValidos
      ) {

        await connection.query(
          `
          INSERT INTO profesor_actividad
            (
              profesor_id,
              actividad_id
            )
          VALUES
            (?, ?)
          `,
          [
            profesorId,
            actividadId,
          ]
        );

      }
    }


    await connection.commit();

    connection.release();


    return Response.json(
      {
        correcto: true,
        mensaje:
          "Profesor creado correctamente",
        id: profesorId,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "ERROR HACIENDO ROLLBACK:",
        rollbackError
      );
    }

    connection.release();

    console.error(
      "ERROR CREANDO PROFESOR:",
      error
    );

    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error creando profesor",

        error:
          error.message,

        codigo:
          error.code || null,

        errno:
          error.errno || null,

        sqlMessage:
          error.sqlMessage || null,
      },
      {
        status: 500,
      }
    );
  }
}


// =========================================================
// PUT — ACTUALIZAR PROFESOR
// =========================================================

export async function PUT(request) {

  const connection =
    await pool.getConnection();

  try {

    const body =
      await request.json();


    const id =
      Number(body.id);


    const nombre =
      body.nombre?.trim();


    const descripcion =
      body.descripcion?.trim() || null;


    const actividadIds =
      Array.isArray(body.actividadIds)
        ? [
            ...new Set(
              body.actividadIds
                .map(Number)
                .filter(Boolean)
            ),
          ]
        : [];


    // -----------------------------------------------------
    // VALIDACIONES
    // -----------------------------------------------------

    if (!id) {

      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El ID del profesor es obligatorio",
        },
        {
          status: 400,
        }
      );
    }


    if (!nombre) {

      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El nombre es obligatorio",
        },
        {
          status: 400,
        }
      );
    }


    await connection.beginTransaction();


    // -----------------------------------------------------
    // COMPROBAR PROFESOR
    // -----------------------------------------------------

    const [
      profesorExiste,
    ] = await connection.query(
      `
      SELECT id
      FROM profesores
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );


    if (
      profesorExiste.length === 0
    ) {

      await connection.rollback();

      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El profesor no existe.",
        },
        {
          status: 404,
        }
      );
    }


    // -----------------------------------------------------
    // ACTUALIZAR PROFESOR
    // -----------------------------------------------------

    await connection.query(
      `
      UPDATE profesores
      SET
        nombre = ?,
        descripcion = ?
      WHERE id = ?
      `,
      [
        nombre,
        descripcion,
        id,
      ]
    );


    // -----------------------------------------------------
    // COMPROBAR ACTIVIDADES
    // -----------------------------------------------------

    let idsValidos = [];


    if (actividadIds.length > 0) {

      const placeholders =
        actividadIds
          .map(() => "?")
          .join(",");


      const [
        actividadesValidas,
      ] = await connection.query(
        `
        SELECT
          id,
          nombre,
          activa
        FROM actividades
        WHERE id IN (${placeholders})
        `,
        actividadIds
      );


      idsValidos =
        actividadesValidas
          .filter(
            (actividad) =>
              Number(actividad.activa) === 1
          )
          .map(
            (actividad) =>
              Number(actividad.id)
          );


      console.log(
        "Actividades recibidas:",
        actividadIds
      );

      console.log(
        "Actividades válidas:",
        idsValidos
      );

    }


    // -----------------------------------------------------
    // ELIMINAR ASIGNACIONES ANTERIORES
    // -----------------------------------------------------

    await connection.query(
      `
      DELETE FROM profesor_actividad
      WHERE profesor_id = ?
      `,
      [id]
    );


    // -----------------------------------------------------
    // CREAR NUEVAS ASIGNACIONES
    // -----------------------------------------------------

    for (
      const actividadId
      of idsValidos
    ) {

      await connection.query(
        `
        INSERT INTO profesor_actividad
          (
            profesor_id,
            actividad_id
          )
        VALUES
          (?, ?)
        `,
        [
          id,
          actividadId,
        ]
      );

    }


    // -----------------------------------------------------
    // CONFIRMAR
    // -----------------------------------------------------

    await connection.commit();

    connection.release();


    return Response.json({
      correcto: true,
      mensaje:
        "Profesor actualizado correctamente",
    });


  } catch (error) {

    try {

      await connection.rollback();

    } catch (rollbackError) {

      console.error(
        "ERROR HACIENDO ROLLBACK:",
        rollbackError
      );

    }


    connection.release();


    console.error(
      "ERROR REAL ACTUALIZANDO PROFESOR:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error actualizando profesor",

        error:
          error.message,

        codigo:
          error.code || null,

        errno:
          error.errno || null,

        sqlMessage:
          error.sqlMessage || null,
      },
      {
        status: 500,
      }
    );
  }
}
