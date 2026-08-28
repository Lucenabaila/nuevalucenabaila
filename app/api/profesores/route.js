import pool from "../../lib/db";


// =========================================================
// GET — OBTENER PROFESORES
// =========================================================

export async function GET(request) {

  try {

    const url =
      new URL(request.url);

    const admin =
      url.searchParams.get("admin") === "true";


    let consulta = `
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
    `;


    // Para la web pública solamente profesores activos.
    // Para el administrador, todos.
    if (!admin) {

      consulta += `
        WHERE p.activa = TRUE
      `;

    }


    consulta += `
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
    `;


    const [
      profesores
    ] = await pool.query(
      consulta
    );


    const resultado =
      profesores.map(
        (profesor) => ({

          ...profesor,

          actividad_ids:
            profesor.actividad_ids
              ? profesor.actividad_ids
                  .split(",")
                  .map(Number)
                  .filter(Boolean)
              : [],

        })
      );


    return Response.json({

      correcto: true,

      profesores:
        resultado,

    });


  } catch (error) {

    console.error(
      "ERROR OBTENIENDO PROFESORES:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error obteniendo profesores",

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
      body.descripcion?.trim() ||
      null;


    // NUEVO — FOTO
    const foto =
      typeof body.foto === "string"
        ? body.foto.trim() || null
        : null;


    const actividadIds =
      Array.isArray(
        body.actividadIds
      )
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

    const [
      resultado
    ] = await connection.query(
      `
      INSERT INTO profesores
        (
          nombre,
          descripcion,
          foto,
          activa,
          orden
        )
      VALUES
        (?, ?, ?, TRUE, 0)
      `,
      [
        nombre,
        descripcion,
        foto,
      ]
    );


    const profesorId =
      resultado.insertId;


    // -----------------------------------------------------
    // COMPROBAR ACTIVIDADES
    // -----------------------------------------------------

    if (
      actividadIds.length > 0
    ) {

      const placeholders =
        actividadIds
          .map(() => "?")
          .join(",");


      const [
        actividadesValidas
      ] = await connection.query(
        `
        SELECT
          id
        FROM actividades
        WHERE id IN (${placeholders})
          AND activa = TRUE
        `,
        actividadIds
      );


      const idsValidos =
        actividadesValidas.map(
          (actividad) =>
            Number(
              actividad.id
            )
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

        id:
          profesorId,
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
      body.descripcion?.trim() ||
      null;


    // -----------------------------------------------------
    // FOTO
    // -----------------------------------------------------
    // Si el campo foto viene en la petición:
    //   - string = cambiar foto
    //   - null/vacío = quitar foto
    //
    // Si el campo no viene:
    //   - conservar la foto existente.

    const tieneCampoFoto =
      Object.prototype.hasOwnProperty.call(
        body,
        "foto"
      );


    let foto = null;


    if (tieneCampoFoto) {

      foto =
        typeof body.foto === "string"
          ? body.foto.trim() || null
          : null;

    }


    const actividadIds =
      Array.isArray(
        body.actividadIds
      )
        ? [
            ...new Set(
              body.actividadIds
                .map(Number)
                .filter(Boolean)
            ),
          ]
        : [];


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

      connection.release();

      return Response.json(
        {
          correcto: false,

          mensaje:
            "El ID del profesor es obligatorio",
        },
        {
          status: 400
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
          status: 400
        }
      );

    }


    await connection.beginTransaction();


    // -----------------------------------------------------
    // COMPROBAR PROFESOR
    // -----------------------------------------------------

    const [
      profesorExiste
    ] = await connection.query(
      `
      SELECT
        id,
        foto
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
          status: 404
        }
      );

    }


    // -----------------------------------------------------
    // DETERMINAR FOTO FINAL
    // -----------------------------------------------------

    const fotoFinal =
      tieneCampoFoto
        ? foto
        : profesorExiste[0].foto;


    // -----------------------------------------------------
    // ACTUALIZAR DATOS DEL PROFESOR
    // -----------------------------------------------------

    await connection.query(
      `
      UPDATE profesores
      SET
        nombre = ?,
        descripcion = ?,
        foto = ?,
        activa = ?,
        orden = ?
      WHERE id = ?
      `,
      [
        nombre,
        descripcion,
        fotoFinal,
        activa,
        orden,
        id,
      ]
    );


    // -----------------------------------------------------
    // COMPROBAR ACTIVIDADES
    // -----------------------------------------------------

    let idsValidos = [];


    if (
      actividadIds.length > 0
    ) {

      const placeholders =
        actividadIds
          .map(() => "?")
          .join(",");


      const [
        actividadesValidas
      ] = await connection.query(
        `
        SELECT
          id,
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
              Number(
                actividad.activa
              ) === 1
          )
          .map(
            (actividad) =>
              Number(
                actividad.id
              )
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
      "ERROR ACTUALIZANDO PROFESOR:",
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
        status: 500
      }
    );

  }

}


// =========================================================
// DELETE — ELIMINAR PROFESOR
// =========================================================

export async function DELETE(request) {

  const connection =
    await pool.getConnection();


  try {

    const body =
      await request.json();


    const id =
      Number(body.id);


    if (!id) {

      connection.release();

      return Response.json(
        {
          correcto: false,

          mensaje:
            "El ID del profesor es obligatorio",
        },
        {
          status: 400
        }
      );

    }


    await connection.beginTransaction();


    // -----------------------------------------------------
    // COMPROBAR PROFESOR
    // -----------------------------------------------------

    const [
      profesorExiste
    ] = await connection.query(
      `
      SELECT
        id
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
          status: 404
        }
      );

    }


    // -----------------------------------------------------
    // ELIMINAR RELACIONES CON ACTIVIDADES
    // -----------------------------------------------------

    await connection.query(
      `
      DELETE FROM profesor_actividad
      WHERE profesor_id = ?
      `,
      [id]
    );


    // -----------------------------------------------------
    // ELIMINAR PROFESOR
    // -----------------------------------------------------

    const [
      resultado
    ] = await connection.query(
      `
      DELETE FROM profesores
      WHERE id = ?
      `,
      [id]
    );


    if (
      resultado.affectedRows === 0
    ) {

      await connection.rollback();

      connection.release();

      return Response.json(
        {
          correcto: false,

          mensaje:
            "No se pudo eliminar el profesor.",
        },
        {
          status: 500
        }
      );

    }


    await connection.commit();

    connection.release();


    return Response.json({

      correcto: true,

      mensaje:
        "Profesor eliminado correctamente",

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
      "ERROR ELIMINANDO PROFESOR:",
      error
    );


    return Response.json(
      {
        correcto: false,

        mensaje:
          "Error eliminando profesor",

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
        status: 500
      }
    );

  }

}
