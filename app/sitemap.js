import pool from "./lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;


// =======================================================
// CREAR SLUG
// Debe coincidir con las URLs de /actividades/[slug]
// =======================================================

function crearSlug(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}


// =======================================================
// SITEMAP
// =======================================================

export default async function sitemap() {

  const URL_BASE =
    "https://www.lucenabaila.es";


  // =====================================================
  // PÁGINAS FIJAS
  // =====================================================

  const paginas = [
    {
      url: URL_BASE,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];


  // =====================================================
  // ACTIVIDADES DESDE MYSQL
  // =====================================================

  try {

    const [actividades] = await pool.query(`
      SELECT
        id,
        nombre,
        activa
      FROM actividades
      WHERE activa = TRUE
      ORDER BY orden ASC, nombre ASC
    `);


    const paginasActividades =
      actividades.map((actividad) => {

        const slug =
          crearSlug(actividad.nombre);


        return {
          url:
            `${URL_BASE}/actividades/${slug}`,

          changeFrequency:
            "weekly",

          priority:
            0.8,
        };

      });


    return [
      ...paginas,
      ...paginasActividades,
    ];


  } catch (error) {

    console.error(
      "Error generando sitemap:",
      error
    );


    // Si la base de datos falla,
    // al menos mantenemos la página principal.
    return paginas;

  }
}
