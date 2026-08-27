import pool from "../../lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT 1 AS conectado");

    return Response.json({
      correcto: true,
      mensaje: "Conexión con MySQL correcta",
      resultado: rows,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        correcto: false,
        mensaje: "Error conectando con MySQL",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
