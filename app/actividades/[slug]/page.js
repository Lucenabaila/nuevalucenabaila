import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.lucenabaila.es";


// ======================================================
// SLUG
// ======================================================

function slugify(text = "") {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


// ======================================================
// FORMATEAR HORA
// ======================================================

function formatearHora(hora) {
  if (!hora) return "";

  return String(hora).slice(0, 5);
}


// ======================================================
// OBTENER DATOS
// ======================================================

async function obtenerDatos() {

  const [
    actividadesRes,
    horariosRes,
    profesoresRes,
  ] = await Promise.all([

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


  if (
    !actividadesRes.ok ||
    !horariosRes.ok ||
    !profesoresRes.ok
  ) {
    throw new Error(
      "No se han podido cargar los datos."
    );
  }


  const actividadesData =
    await actividadesRes.json();

  const horariosData =
    await horariosRes.json();

  const profesoresData =
    await profesoresRes.json();


  return {

    actividades:
      Array.isArray(actividadesData)
        ? actividadesData
        : actividadesData.actividades || [],

    horarios:
      Array.isArray(horariosData)
        ? horariosData
        : horariosData.horarios || [],

    profesores:
      Array.isArray(profesoresData)
        ? profesoresData
        : profesoresData.profesores || [],

  };
}


// ======================================================
// OBTENER ACTIVIDAD
// ======================================================

async function obtenerActividad(slug) {

  const {
    actividades,
    horarios,
    profesores,
  } = await obtenerDatos();


  const actividad =
    actividades.find(
      (item) =>
        slugify(item.nombre) === slug
    );


  if (!actividad) {
    return null;
  }


  const horariosActividad =
    horarios.filter(
      (horario) =>
        Number(horario.actividad_id) ===
        Number(actividad.id)
    );


  const profesoresActividad =
    profesores.filter(
      (profesor) =>
        Array.isArray(
          profesor.actividad_ids
        )
          ? profesor.actividad_ids.includes(
              Number(actividad.id)
            )
          : false
    );


  return {

    actividad,

    horarios:
      horariosActividad,

    profesores:
      profesoresActividad,

  };
}


// ======================================================
// SEO
// ======================================================

export async function generateMetadata({
  params,
}) {

  const { slug } = await params;


  const datos =
    await obtenerActividad(slug);


  if (!datos) {

    return {

      title:
        "Actividad no encontrada | Artes Escénicas Paradise",

      robots: {
        index: false,
        follow: true,
      },

    };
  }


  const nombre =
    datos.actividad.nombre;


  const description =
    datos.actividad.descripcion ||
    `Clases de ${nombre} en Lucena en Artes Escénicas Paradise.`;


  return {

    title:
      `${nombre} en Lucena | Artes Escénicas Paradise`,

    description,

    alternates: {
      canonical:
        `${SITE_URL}/actividades/${slug}`,
    },

    openGraph: {

      title:
        `${nombre} en Lucena | Artes Escénicas Paradise`,

      description,

      url:
        `${SITE_URL}/actividades/${slug}`,

      siteName:
        "Artes Escénicas Paradise",

      locale:
        "es_ES",

      type:
        "website",

    },

    robots: {
      index: true,
      follow: true,
    },

  };
}


// ======================================================
// PÁGINA
// ======================================================

export default async function ActividadPage({
  params,
}) {

  const { slug } = await params;


  const datos =
    await obtenerActividad(slug);


  if (!datos) {
    notFound();
  }


  const {
    actividad,
    horarios,
    profesores,
  } = datos;


  return (

    <main className="activity-page">


      {/* ==================================================
          HERO
      ================================================== */}

      <section className="activity-hero">

        <div className="activity-container">


          {/* LOGOTIPO */}

          <div className="activity-logo">

            <a href="/" aria-label="Artes Escénicas Paradise">

              <img
                src="/icon.png"
                alt="Artes Escénicas Paradise"
              />

            </a>

          </div>


          {/* VOLVER */}

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


      {/* ==================================================
          INFORMACIÓN DE LA ACTIVIDAD
      ================================================== */}

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
                Clases de{" "}
                {actividad.nombre} en Lucena
              </h2>


              <p>
                {actividad.descripcion}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          HORARIOS
      ================================================== */}

      <section className="actividad-horarios">

        <div className="activity-container">


          <div className="horarios-header">

            <div>

              <p className="eyebrow">
                HORARIOS
              </p>

              <h2>
                Elige tu horario
              </h2>

            </div>


            <p className="horarios-descripcion">

              Consulta los días y horarios
              disponibles para{" "}
              {actividad.nombre}.

            </p>

          </div>


          {horarios.length > 0 ? (

            <div className="horarios-grid">

              {horarios.map(
                (horario) => {

                  const profesoresHorario =
                    Array.isArray(
                      horario.profesor_nombres
                    )
                      ? horario.profesor_nombres
                      : [];


                  return (

                    <article
                      className="horario-card"
                      key={horario.id}
                    >


                      {/* DÍA Y HORA */}

                      <div className="horario-top">


                        <div className="horario-dia">

                          <span className="horario-icon">
                            ◷
                          </span>

                          <strong>
                            {horario.dia}
                          </strong>

                        </div>


                        <div className="horario-hora">

                          {formatearHora(
                            horario.hora_inicio
                          )}

                          <span>
                            –
                          </span>

                          {formatearHora(
                            horario.hora_fin
                          )}

                        </div>


                      </div>


                      {/* NIVEL */}

                      {horario.nivel && (

                        <div className="horario-nivel">

                          {horario.nivel}

                        </div>

                      )}


                      {/* PROFESOR */}

                      <div className="horario-profesor">

                        <span>
                          PROFESOR/A
                        </span>


                        <strong>

                          {profesoresHorario.length > 0
                            ? profesoresHorario.join(" · ")
                            : "Consultar"}

                        </strong>

                      </div>


                    </article>

                  );

                }
              )}

            </div>

          ) : (

            <div className="sin-horarios">

              Próximamente publicaremos
              los horarios de esta actividad.

            </div>

          )}


        </div>

      </section>


      {/* ==================================================
          PROFESORES
      ================================================== */}

      {profesores.length > 0 && (

        <section className="activity-teachers">

          <div className="activity-container">


            <p className="eyebrow">
              NUESTRO EQUIPO
            </p>


            <h2>
              Profesores de{" "}
              {actividad.nombre}
            </h2>


            <div className="teachers-grid">

              {profesores.map(
                (profesor) => (

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

                )
              )}

            </div>


          </div>

        </section>

      )}


      {/* ==================================================
          CTA
      ================================================== */}

      <section className="activity-cta">

        <div className="activity-container">


          <p className="eyebrow">
            ¿TE APETECE BAILAR?
          </p>


          <h2>
            Ven a probar una clase
          </h2>


          <p>

            Descubre nuestras clases de{" "}
            {actividad.nombre} en Lucena
            y encuentra tu lugar en
            Artes Escénicas Paradise.

          </p>


          <a
            href="/#contacto"
            className="button primary"
          >
            QUIERO PROBAR UNA CLASE
          </a>


        </div>

      </section>


      {/* ==================================================
          ESTILOS
      ================================================== */}

      <style>{`

        /* ================================================
           GENERAL
        ================================================ */

        .activity-page {
          min-height: 100vh;
          background: #ffffff;
          color: #171717;
        }


        .activity-container {
          width: min(1180px, 92%);
          margin: 0 auto;
        }


        .eyebrow {
          margin: 0;
          color: #8c8c8c;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }


        /* ================================================
           LOGOTIPO
        ================================================ */

        .activity-logo {
          display: flex;
          justify-content: center;
          align-items: center;

          margin-bottom: 28px;
        }


        .activity-logo a {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 92px;
          height: 92px;

          border-radius: 50%;

          background: rgba(255,255,255,0.08);

          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }


        .activity-logo a:hover {
          transform: scale(1.04);

          background:
            rgba(255,255,255,0.13);
        }


        .activity-logo img {
          display: block;

          width: 78px;
          height: 78px;

          object-fit: contain;
        }


        /* ================================================
           HERO
        ================================================ */

        .activity-hero {
          padding: 45px 0 85px;

          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(229, 161, 26, 0.22),
              transparent 35%
            ),
            #111111;

          color: #ffffff;
        }


        .activity-back {
          display: inline-block;

          margin-bottom: 45px;

          color: #ffffff;

          text-decoration: none;

          font-size: 15px;

          font-weight: 600;

          opacity: 0.8;

          transition:
            opacity 0.2s ease;
        }


        .activity-back:hover {
          opacity: 1;
        }


        .activity-hero h1 {
          margin: 12px 0 22px;

          font-size:
            clamp(
              42px,
              7vw,
              82px
            );

          line-height: 0.95;

          letter-spacing: -0.045em;
        }


        .activity-intro {
          max-width: 820px;

          margin: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.82
            );

          font-size: 19px;

          line-height: 1.7;
        }


        /* ================================================
           CONTENIDO
        ================================================ */

        .activity-content {
          padding: 90px 0;

          background: #ffffff;
        }


        .activity-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 0.9fr)
            minmax(0, 1.1fr);

          gap: 70px;

          align-items: center;
        }


        .activity-image {
          overflow: hidden;

          border-radius: 28px;

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

          color: #ffffff;

          font-size: 38px;

          font-weight: 800;

          text-align: center;
        }


        .activity-info h2 {
          margin: 12px 0 22px;

          color: #171717;

          font-size:
            clamp(
              34px,
              5vw,
              54px
            );

          line-height: 1;

          letter-spacing: -0.035em;
        }


        .activity-info > p {
          margin: 0;

          color: #555555;

          font-size: 18px;

          line-height: 1.75;
        }


        /* ================================================
           HORARIOS
        ================================================ */

        .actividad-horarios {
          padding: 100px 0 110px;

          background: #f3f3f3;
        }


        .horarios-header {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 40px;

          margin-bottom: 42px;
        }


        .horarios-header h2 {
          margin: 10px 0 0;

          color: #111111;

          font-size:
            clamp(
              42px,
              5vw,
              64px
            );

          line-height: 0.95;

          letter-spacing: -0.045em;
        }


        .horarios-descripcion {
          max-width: 430px;

          margin: 0;

          color: #555555;

          font-size: 16px;

          line-height: 1.6;

          text-align: right;
        }


        /* ================================================
           GRID HORARIOS
        ================================================ */

        .horarios-grid {

          display: grid;

          /*
           * AQUÍ ESTÁ EL CAMBIO PRINCIPAL:
           * 4 columnas en ordenador.
           */

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 22px;

          width: 100%;
        }


        /* ================================================
           TARJETA HORARIO
        ================================================ */

        .horario-card {

          min-width: 0;

          box-sizing: border-box;

          background: #ffffff;

          border: 1px solid #dedede;

          border-radius: 22px;

          padding: 27px 24px 25px;

          box-shadow:
            0 8px 25px
            rgba(0,0,0,0.055);

          overflow: hidden;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .horario-card:hover {

          transform:
            translateY(-3px);

          box-shadow:
            0 14px 30px
            rgba(0,0,0,0.09);
        }


        /* ================================================
           DÍA + HORA
        ================================================ */

        .horario-top {

          display: flex;

          align-items: center;

          /*
           * Permite que la hora baje de línea
           * en pantallas estrechas.
           */

          flex-wrap: wrap;

          gap: 8px 12px;

          min-width: 0;
        }


        .horario-dia {

          display: flex;

          align-items: center;

          gap: 8px;

          min-width: 0;

          color: #171717;

          font-size: 16px;

          line-height: 1.25;

          font-weight: 800;

          white-space: nowrap;
        }


        .horario-icon {

          flex: 0 0 auto;

          color: #777777;

          font-size: 20px;

          line-height: 1;
        }


        .horario-dia strong {

          color: #171717;

          font-weight: 800;
        }


        .horario-hora {

          flex: 0 0 auto;

          color: #171717;

          font-size: 16px;

          line-height: 1.25;

          font-weight: 800;

          /*
           * Evita que una hora se corte.
           */

          white-space: nowrap;
        }


        .horario-hora span {

          display: inline-block;

          margin:
            0 4px;

          color: #777777;
        }


        /* ================================================
           NIVEL
        ================================================ */

        .horario-nivel {

          display: block;

          width: fit-content;

          max-width: 100%;

          box-sizing: border-box;

          margin-top: 25px;

          padding: 8px 13px;

          border-radius: 999px;

          background: #111111;

          color: #ffffff;

          font-size: 12px;

          line-height: 1.25;

          font-weight: 700;

          overflow-wrap: anywhere;
        }


        /* ================================================
           PROFESOR
        ================================================ */

        .horario-profesor {

          margin-top: 30px;
        }


        .horario-profesor span {

          display: block;

          margin-bottom: 7px;

          color: #999999;

          font-size: 10px;

          line-height: 1.2;

          font-weight: 800;

          letter-spacing: 0.16em;

          text-transform: uppercase;
        }


        .horario-profesor strong {

          display: block;

          color: #333333;

          font-size: 15px;

          line-height: 1.4;

          font-weight: 600;

          overflow-wrap: anywhere;
        }


        /* ================================================
           SIN HORARIOS
        ================================================ */

        .sin-horarios {

          padding: 45px 30px;

          border:
            1px solid #dddddd;

          border-radius: 22px;

          background: #ffffff;

          color: #666666;

          text-align: center;

          font-size: 17px;
        }


        /* ================================================
           PROFESORES
        ================================================ */

        .activity-teachers {

          padding: 90px 0;

          background: #f7f7f7;
        }


        .activity-teachers h2 {

          margin: 10px 0 45px;

          color: #171717;

          font-size:
            clamp(
              34px,
              5vw,
              55px
            );

          line-height: 1;

          letter-spacing: -0.04em;
        }


        .teachers-grid {

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 25px;
        }


        .teacher-card {

          overflow: hidden;

          border-radius: 22px;

          background: #ffffff;
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

          margin:
            0 0 10px;

          color: #171717;

          font-size: 24px;
        }


        .teacher-content p {

          margin: 0;

          color: #666666;

          line-height: 1.6;
        }


        /* ================================================
           CTA
        ================================================ */

        .activity-cta {

          padding: 100px 0;

          background: #111111;

          color: #ffffff;

          text-align: center;
        }


        .activity-cta h2 {

          margin:
            10px 0 20px;

          font-size:
            clamp(
              38px,
              6vw,
              65px
            );

          line-height: 1;

          letter-spacing: -0.04em;
        }


        .activity-cta p:not(.eyebrow) {

          max-width: 650px;

          margin:
            0 auto 32px;

          color:
            rgba(
              255,
              255,
              255,
              0.8
            );

          font-size: 18px;

          line-height: 1.7;
        }


        /* ================================================
           TABLET
        ================================================ */

        @media (max-width: 1050px) {

          .horarios-grid {

            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );

          }

        }


        /* ================================================
           MÓVIL
        ================================================ */

        @media (max-width: 800px) {

          .activity-hero {

            padding:
              35px 0 65px;

          }


          .activity-logo {

            margin-bottom:
              22px;

          }


          .activity-logo a {

            width: 78px;
            height: 78px;

          }


          .activity-logo img {

            width: 66px;
            height: 66px;

          }


          .activity-content {

            padding:
              60px 0;

          }


          .activity-grid {

            grid-template-columns:
              1fr;

            gap: 40px;

          }


          .actividad-horarios {

            padding:
              65px 0 75px;

          }


          .horarios-header {

            display: block;

            margin-bottom:
              30px;

          }


          .horarios-header h2 {

            font-size:
              48px;

          }


          .horarios-descripcion {

            max-width:
              600px;

            margin-top:
              18px;

            text-align:
              left;

          }


          .horarios-grid {

            grid-template-columns:
              1fr;

            gap: 16px;

          }


          .horario-card {

            padding:
              24px 22px;

          }


          .horario-top {

            gap:
              9px 14px;

          }


          .horario-dia,
          .horario-hora {

            font-size:
              17px;

          }


          .activity-teachers {

            padding:
              65px 0;

          }


          .teachers-grid {

            grid-template-columns:
              1fr;

          }


          .activity-cta {

            padding:
              75px 0;

          }

        }


        /* ================================================
           MÓVIL PEQUEÑO
        ================================================ */

        @media (max-width: 430px) {

          .activity-container {

            width:
              min(
                100% - 32px,
                1180px
              );

          }


          .activity-hero h1 {

            font-size:
              45px;

          }


          .horarios-header h2 {

            font-size:
              42px;

          }


          .horario-card {

            border-radius:
              18px;

            padding:
              22px 19px;

          }


          .horario-dia,
          .horario-hora {

            font-size:
              16px;

          }


          .horario-profesor {

            margin-top:
              25px;

          }

        }

      `}</style>


    </main>

  );
}
