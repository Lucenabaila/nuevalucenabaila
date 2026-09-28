import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.lucenabaila.es";

function slugify(text = "") {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function obtenerDatos() {
  const [actividadesRes, horariosRes, profesoresRes] =
    await Promise.all([
      fetch(`${SITE_URL}/api/actividades`, {
        cache: "no-store",
      }),
      fetch(`${SITE_URL}/api/horarios`, {
        cache: "no-store",
      }),
      fetch(`${SITE_URL}/api/profesores`, {
        cache: "no-store",
      }),
    ]);
  }

  if (
    !actividadesRes.ok ||
    !horariosRes.ok ||
    !profesoresRes.ok
  ) {
    throw new Error("No se han podido cargar los datos.");
  }

const actividadesData = await actividadesRes.json();
const horariosData = await horariosRes.json();
const profesoresData = await profesoresRes.json();

return {
  actividades: Array.isArray(actividadesData)
    ? actividadesData
    : actividadesData.actividades || [],

  horarios: Array.isArray(horariosData)
    ? horariosData
    : horariosData.horarios || [],

  profesores: Array.isArray(profesoresData)
    ? profesoresData
    : profesoresData.profesores || [],
};

async function obtenerActividad(slug) {
  const { actividades, horarios, profesores } =
    await obtenerDatos();

  const actividad = actividades.find(
    (item) => slugify(item.nombre) === slug
  );

  if (!actividad) {
    return null;
  }

  const horariosActividad = horarios.filter(
    (horario) =>
      Number(horario.actividad_id) === Number(actividad.id)
  );

  const profesoresActividad = profesores.filter((profesor) =>
    Array.isArray(profesor.actividad_ids)
      ? profesor.actividad_ids.includes(Number(actividad.id))
      : false
  );

  return {
    actividad,
    horarios: horariosActividad,
    profesores: profesoresActividad,
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const datos = await obtenerActividad(slug);

  if (!datos) {
    return {
      title: "Actividad no encontrada | Artes Escénicas Paradise",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const nombre = datos.actividad.nombre;

  const description =
    datos.actividad.descripcion ||
    `Clases de ${nombre} en Lucena en Artes Escénicas Paradise.`;

  return {
    title: `${nombre} en Lucena | Artes Escénicas Paradise`,

    description,

    alternates: {
      canonical: `${SITE_URL}/actividades/${slug}`,
    },

    openGraph: {
      title: `${nombre} en Lucena | Artes Escénicas Paradise`,
      description,
      url: `${SITE_URL}/actividades/${slug}`,
      siteName: "Artes Escénicas Paradise",
      locale: "es_ES",
      type: "website",
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ActividadPage({ params }) {
  const { slug } = await params;

  const datos = await obtenerActividad(slug);

  if (!datos) {
    notFound();
  }

  const { actividad, horarios, profesores } = datos;

  return (
    <main className="activity-page">

      {/* =====================================================
          CABECERA
      ====================================================== */}

      <section className="activity-hero">

        <div className="activity-container">

          <a
            href="/"
            className="activity-back"
          >
            ← Volver a la escuela
          </a>

          <p className="eyebrow">
            ESCUELA DE BAILE · LUCENA
          </p>

          <h1>
            {actividad.nombre} en Lucena
          </h1>

          <p className="activity-intro">
            {actividad.descripcion}
          </p>

        </div>

      </section>


      {/* =====================================================
          INFORMACIÓN DE LA ACTIVIDAD
      ====================================================== */}

      <section className="activity-content">

        <div className="activity-container">

          <div className="activity-grid">

            {/* IMAGEN */}

            <div className="activity-image">

              {actividad.imagen ? (
                <img
                  src={actividad.imagen}
                  alt={`${actividad.nombre} en Lucena`}
                />
              ) : (
                <div className="activity-image-placeholder">
                  <span>
                    {actividad.nombre}
                  </span>
                </div>
              )}

            </div>


            {/* INFORMACIÓN */}

            <div className="activity-info">

              <p className="eyebrow">
                CLASES EN LUCENA
              </p>

              <h2>
                Clases de {actividad.nombre} en Lucena
              </h2>

              <p>
                {actividad.descripcion}
              </p>


              {/* HORARIOS */}

              {horarios.length > 0 && (
                <div className="activity-schedule">

                  <h3>
                    Horarios
                  </h3>

                  <div className="schedule-list">

                    {horarios.map((horario) => (

                      <div
                        className="schedule-item"
                        key={horario.id}
                      >

                        <div>

                          <strong>
                            {horario.dia}
                          </strong>

                          {horario.nivel && (
                            <span>
                              {horario.nivel}
                            </span>
                          )}

                        </div>

                        <div className="schedule-time">

                          {horario.hora_inicio}

                          {horario.hora_fin && (
                            <>
                              {" - "}
                              {horario.hora_fin}
                            </>
                          )}

                        </div>

                      </div>

                    ))}

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROFESORES
      ====================================================== */}

      {profesores.length > 0 && (

        <section className="activity-teachers">

          <div className="activity-container">

            <p className="eyebrow">
              NUESTRO EQUIPO
            </p>

            <h2>
              Profesores de {actividad.nombre}
            </h2>

            <div className="teachers-grid">

              {profesores.map((profesor) => (

                <article
                  className="teacher-card"
                  key={profesor.id}
                >

                  {profesor.foto && (
                    <div className="teacher-photo">

                      <img
                        src={profesor.foto}
                        alt={`${profesor.nombre}, profesor de ${actividad.nombre}`}
                      />

                    </div>
                  )}

                  <div className="teacher-content">

                    <h3>
                      {profesor.nombre}
                    </h3>

                    {profesor.descripcion && (
                      <p>
                        {profesor.descripcion}
                      </p>
                    )}

                  </div>

                </article>

              ))}

            </div>

          </div>

        </section>

      )}


      {/* =====================================================
          LLAMADA A LA ACCIÓN
      ====================================================== */}

      <section className="activity-cta">

        <div className="activity-container">

          <p className="eyebrow">
            ¿TE APETECE BAILAR?
          </p>

          <h2>
            Ven a probar una clase
          </h2>

          <p>
            Descubre nuestras clases de {actividad.nombre} en
            Lucena y encuentra tu lugar en Artes Escénicas
            Paradise.
          </p>

          <a
            href="/#contacto"
            className="button primary"
          >
            QUIERO PROBAR UNA CLASE
          </a>

        </div>

      </section>


      {/* =====================================================
          ESTILOS DE LA PÁGINA
      ====================================================== */}

      <style>{`

        .activity-page {
          min-height: 100vh;
          background: #fff;
        }

        .activity-container {
          width: min(1180px, 92%);
          margin: 0 auto;
        }

        .activity-hero {
          padding: 70px 0 80px;
          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(229, 161, 26, 0.20),
              transparent 35%
            ),
            #111;
          color: #fff;
        }

        .activity-back {
          display: inline-block;
          margin-bottom: 45px;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          opacity: 0.85;
        }

        .activity-back:hover {
          opacity: 1;
        }

        .activity-hero h1 {
          margin: 10px 0 20px;
          font-size: clamp(42px, 7vw, 82px);
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .activity-intro {
          max-width: 800px;
          margin: 0;
          font-size: 19px;
          line-height: 1.7;
          color: rgba(255,255,255,0.82);
        }

        .activity-content {
          padding: 90px 0;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 70px;
          align-items: center;
        }

        .activity-image {
          overflow: hidden;
          border-radius: 24px;
          background: #f1f1f1;
        }

        .activity-image img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .activity-image-placeholder {
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: #181818;
          color: #fff;
          font-size: 40px;
          font-weight: 800;
          text-align: center;
        }

        .activity-info h2 {
          margin: 10px 0 20px;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1;
        }

        .activity-info > p {
          font-size: 18px;
          line-height: 1.7;
          color: #555;
        }

        .activity-schedule {
          margin-top: 40px;
        }

        .activity-schedule h3 {
          margin-bottom: 15px;
          font-size: 25px;
        }

        .schedule-list {
          border-top: 1px solid #ddd;
        }

        .schedule-item {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 0;
          border-bottom: 1px solid #ddd;
        }

        .schedule-item strong {
          display: block;
          font-size: 17px;
        }

        .schedule-item span {
          display: block;
          margin-top: 4px;
          color: #777;
          font-size: 14px;
        }

        .schedule-time {
          font-weight: 700;
          white-space: nowrap;
        }

        .activity-teachers {
          padding: 90px 0;
          background: #f7f7f7;
        }

        .activity-teachers h2 {
          margin: 10px 0 45px;
          font-size: clamp(34px, 5vw, 55px);
        }

        .teachers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
        }

        .teacher-card {
          overflow: hidden;
          border-radius: 20px;
          background: #fff;
        }

        .teacher-photo img {
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
        }

        .teacher-content {
          padding: 25px;
        }

        .teacher-content h3 {
          margin: 0 0 10px;
          font-size: 24px;
        }

        .teacher-content p {
          margin: 0;
          line-height: 1.6;
          color: #666;
        }

        .activity-cta {
          padding: 100px 0;
          text-align: center;
          background: #111;
          color: #fff;
        }

        .activity-cta h2 {
          margin: 10px 0 20px;
          font-size: clamp(38px, 6vw, 65px);
        }

        .activity-cta p:not(.eyebrow) {
          max-width: 650px;
          margin: 0 auto 30px;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255,255,255,0.8);
        }

        @media (max-width: 800px) {

          .activity-hero {
            padding: 50px 0 60px;
          }

          .activity-content {
            padding: 60px 0;
          }

          .activity-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .teachers-grid {
            grid-template-columns: 1fr;
          }

          .activity-teachers {
            padding: 60px 0;
          }

          .activity-cta {
            padding: 70px 0;
          }

          .schedule-item {
            align-items: flex-start;
          }

        }

      `}</style>

    </main>
  );
}
