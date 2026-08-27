import pool from "../../lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM profesores WHERE activa = TRUE ORDER BY orden ASC, nombre ASC"
    );

    return Response.json({
      correcto: true,
      profesores: rows,
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
  try {
    const body = await request.json();

    const nombre = body.nombre?.trim();
    const descripcion = body.descripcion?.trim() || null;

    if (!nombre) {
      return Response.json(
        {
          correcto: false,
          mensaje: "El nombre es obligatorio",
        },
        { status: 400 }
      );
    }

    const [resultado] = await pool.query(
      "INSERT INTO profesores (nombre, descripcion) VALUES (?, ?)",
      [nombre, descripcion]
    );

    return Response.json({
      correcto: true,
      mensaje: "Profesor creado correctamente",
      id: resultado.insertId,
    });
  } catch (error) {
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
