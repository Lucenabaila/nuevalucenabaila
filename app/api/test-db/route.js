import pool from "../../lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT 1 AS conectado");

    return Response.json({
      ok: true,
      mensaje: "Conexión a MySQL correcta",
      resultado: rows,
    });
  } catch (error) {
    console.error("Error MySQL:", error);

    return Response.json(
      {
        ok: false,
        mensaje: "No se ha podido conectar con MySQL",
      },
      { status: 500 }
    );
  }
}
