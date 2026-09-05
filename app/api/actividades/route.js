import pool from "../../lib/db";


// =========================================================
// GET — OBTENER ACTIVIDADES
// =========================================================

export async function GET(request) {
  try {

    const url = new URL(request.url);

    const admin =
      url.searchParams.get("admin") === "true";


    let consulta = `
      SELECT
        id,
        nombre,
        descripcion,
        imagen,
        activa,
        orden
      FROM actividades
    `;


    // Para la web pública solo mostramos activas.
    // Para el administrador mostramos todas.
    if (!admin) {
      consulta += `
        WHERE activa = TRUE
      `;
    }


    consulta += `
      ORDER BY
        orden ASC,
        nombre ASC
    `;


    const [rows] =
      await pool.query(consulta);


    return Response.json({
      correcto: true,
      actividades: rows,
    });


  } catch (error) {

    console.error(
      "Error obteniendo actividades:",
      error
    );


    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error obteniendo actividades",
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
// POST — CREAR ACTIVIDAD
// =========================================================

export async function POST(request) {

  try {

    const body =
      await request.json();


    const nombre =
      body.nombre?.trim();

    const descripcion =
      body.descripcion?.trim() || null;

    const imagen =
      body.imagen?.trim() || null;

    const orden =
      Number(body.orden) || 0;


    if (!nombre) {

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


    const [resultado] =
      await pool.query(
        `
        INSERT INTO actividades
          (
            nombre,
            descripcion,
            imagen,
            activa,
            orden
          )
        VALUES
          (?, ?, ?, TRUE, ?)
        `,
        [
          nombre,
          descripcion,
          imagen,
          orden,
        ]
      );


    return Response.json(
      {
        correcto: true,
        mensaje:
          "Actividad creada correctamente",
        id:
          resultado.insertId,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(
      "Error creando actividad:",
      error
    );


    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error creando actividad",
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
// PUT — MODIFICAR ACTIVIDAD
// =========================================================

export async function PUT(request) {

  try {

    const body =
      await request.json();


    const id =
      Number(body.id);

    const nombre =
      body.nombre?.trim();

    const descripcion =
      body.descripcion?.trim() || null;

    const imagen =
      body.imagen?.trim() || null;

    const orden =
      Number(body.orden) || 0;

    const activa =
      body.activa === false
        ? false
        : true;


    // -----------------------------------------------------
    // VALIDAR ID
    // -----------------------------------------------------

    if (!id) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "El ID de la actividad es obligatorio",
        },
        {
          status: 400,
        }
      );

    }


    // -----------------------------------------------------
    // VALIDAR NOMBRE
    // -----------------------------------------------------

    if (!nombre) {

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


    // -----------------------------------------------------
    // COMPROBAR QUE EXISTE
    // -----------------------------------------------------

    const [
      actividadExiste,
    ] = await pool.query(
      `
      SELECT id
      FROM actividades
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );


    if (
      actividadExiste.length === 0
    ) {

      return Response.json(
        {
          correcto: false,
          mensaje:
            "La actividad no existe.",
        },
        {
          status: 404,
        }
      );

    }


    // -----------------------------------------------------
    // ACTUALIZAR
    // -----------------------------------------------------

    await pool.query(
      `
      UPDATE actividades
      SET
        nombre = ?,
        descripcion = ?,
        imagen = ?,
        activa = ?,
        orden = ?
      WHERE id = ?
      `,
      [
        nombre,
        descripcion,
        imagen,
        activa,
        orden,
        id,
      ]
    );


    return Response.json({
      correcto: true,
      mensaje:
        "Actividad actualizada correctamente",
    });


  } catch (error) {

    console.error(
      "Error actualizando actividad:",
      error
    );


    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error actualizando actividad",
        error:
          error.message,
        codigo:
          error.code,
        sqlMessage:
          error.sqlMessage,
      },
      {
        status: 500,
      }
    );

  }

}


// =========================================================
// DELETE — ELIMINAR ACTIVIDAD
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
            "El ID de la actividad es obligatorio",
        },
        {
          status: 400,
        }
      );

    }


    await connection.beginTransaction();


    // -----------------------------------------------------
    // COMPROBAR QUE EXISTE
    // -----------------------------------------------------

    const [
      actividadExiste,
    ] = await connection.query(
      `
      SELECT id
      FROM actividades
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );


    if (
      actividadExiste.length === 0
    ) {

      await connection.rollback();

      connection.release();

      return Response.json(
        {
          correcto: false,
          mensaje:
            "La actividad no existe.",
        },
        {
          status: 404,
        }
      );

    }


    // -----------------------------------------------------
    // ELIMINAR RELACIONES CON PROFESORES
    // -----------------------------------------------------

    await connection.query(
      `
      DELETE FROM profesor_actividad
      WHERE actividad_id = ?
      `,
      [id]
    );


    // -----------------------------------------------------
    // ELIMINAR HORARIOS DE LA ACTIVIDAD
    // -----------------------------------------------------

    await connection.query(
      `
      DELETE FROM horarios
      WHERE actividad_id = ?
      `,
      [id]
    );


    // -----------------------------------------------------
    // ELIMINAR ACTIVIDAD
    // -----------------------------------------------------

    const [
      resultado,
    ] = await connection.query(
      `
      DELETE FROM actividades
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
            "No se pudo eliminar la actividad.",
        },
        {
          status: 500,
        }
      );

    }


    await connection.commit();

    connection.release();


    return Response.json({
      correcto: true,
      mensaje:
        "Actividad eliminada correctamente",
    });


  } catch (error) {

    await connection.rollback();

    connection.release();


    console.error(
      "Error eliminando actividad:",
      error
    );


    return Response.json(
      {
        correcto: false,
        mensaje:
          "Error eliminando actividad",
        error:
          error.message,
        codigo:
          error.code,
        sqlMessage:
          error.sqlMessage,
      },
      {
        status: 500,
      }
    );

  }

}
