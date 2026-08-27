
import pool from "../../lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM actividades WHERE activa = TRUE ORDER BY orden ASC, nombre ASC"
    );

    return Response.json({
      correcto: true,
      actividades: rows,
    });
  } catch (error) {
    console.error("Error obteniendo actividades:", error);

    return Response.json(
      {
        correcto: false,
        mensaje: "Error obteniendo actividades",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { nombre, descripcion, orden } = body;

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
      "INSERT INTO actividades (nombre, descripcion, orden) VALUES (?, ?, ?)",
      [nombre, descripcion || null, orden || 0]
    );

    return Response.json({
      correcto: true,
      mensaje: "Actividad creada correctamente",
      id: resultado.insertId,
    });
  } catch (error) {
    console.error("Error creando actividad:", error);

    return Response.json(
      {
        correcto: false,
        mensaje: "Error creando actividad",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
