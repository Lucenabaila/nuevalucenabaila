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
    horarios: horariosActividad,
    profesores: profesoresActividad,
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

  /*
   * Título SEO
   *
   * Ejemplo:
   * Clases de Bachata en Lucena | Artes Escénicas Paradise
   */
  const title =
    `Clases de ${nombre} en Lucena | Artes Escénicas Paradise`;

  /*
   * Descripción SEO
   *
   * Utilizamos la descripción introducida
   * desde Administración → Actividades.
   */
  const description =
    datos.actividad.descripcion ||
    `Clases de ${nombre} en Lucena en Artes Escénicas Paradise. Aprende, disfruta y mejora tu baile con nuestras clases en Lucena.`;

  /*
   * URL canónica
   */
  const canonical =
    `${SITE_URL}/actividades/${slug}`;

  return {
    title,

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      title,

      description,

      url: canonical,

      siteName:
        "Artes Escénicas Paradise",

      locale: "es_ES",

      type: "website",

      images: datos.actividad.imagen
        ? [
            {
              url: datos.actividad.imagen,
              alt:
                `Clases de ${nombre} en Lucena`,
            },
          ]
        : [],
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
      },
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


        {/* FONDO DEL CARTEL DIFUMINADO */}

        {actividad.imagen && (
          <div
            className="hero-poster-background"
            style={{
              backgroundImage:
                `url("${actividad.imagen}")`,
            }}
          />
        )}


        {/* OSCURECIMIENTO */}

        <div className="hero-overlay" />


        {/* LUCES */}

        <div className="hero-glow hero-glow-one" />

        <div className="hero-glow hero-glow-two" />


        <div className="activity-container">


          {/* ==================================================
              LOGO
          ================================================== */}

          <div className="activity-logo">

            <a
              href="/"
              aria-label="Artes Escénicas Paradise"
            >

              <img
                src="/logo-paradise.png"
                alt="Artes Escénicas Paradise"
              />

            </a>

          </div>


          {/* ==================================================
              VOLVER
          ================================================== */}

          <a
            href="/"
            className="activity-back"
          >
            ← Volver a la escuela
          </a>


          {/* ==================================================
              HERO PRINCIPAL
          ================================================== */}

          <div className="hero-layout">


            {/* ==================================================
                TEXTO
            ================================================== */}

            <div className="hero-copy">

              <p className="eyebrow hero-eyebrow">
                ESCUELA DE BAILE · LUCENA
              </p>


              <h1>

                <span>
                  {actividad.nombre}
                </span>

                <em>
                  en Lucena
                </em>

              </h1>


              <p className="activity-intro">
                {actividad.descripcion}
              </p>


              <div className="hero-actions">

                <a
                  href="#horarios"
                  className="hero-button"
                >
                  VER HORARIOS
                </a>


                <a
                  href="/#contacto"
                  className="hero-link"
                >
                  Quiero probar una clase →
                </a>

              </div>

            </div>


            {/* ==================================================
                CARTEL
            ================================================== */}

            <div className="hero-visual">

              <div className="hero-image-frame">

                {actividad.imagen ? (

                  <img
                    src={actividad.imagen}
                    alt={`${actividad.nombre} en Lucena`}
                  />

                ) : (

                  <div className="hero-image-placeholder">

                    <span>
                      {actividad.nombre}
                    </span>

                  </div>

                )}

              </div>


              <div className="hero-circle">
                PARADISE
              </div>

            </div>


          </div>

        </div>

      </section>


      {/* ==================================================
          INFORMACIÓN
      ================================================== */}

      <section className="activity-intro-section">

        <div className="activity-container">

          <div className="intro-grid">


            {/* IMAGEN */}

            <div className="intro-image">

              {actividad.imagen ? (

                <img
                  src={actividad.imagen}
                  alt={`${actividad.nombre} en Artes Escénicas Paradise`}
                />

              ) : (

                <div className="intro-placeholder">
                  {actividad.nombre}
                </div>

              )}

            </div>


            {/* TEXTO */}

            <div className="intro-copy">

              <p className="eyebrow orange">
                CLASES EN LUCENA
              </p>


              <h2>

                Clases de{" "}

                <span>
                  {actividad.nombre}
                </span>

                {" "}en Lucena

              </h2>


              <p className="intro-description">
                {actividad.descripcion}
              </p>


              <div className="benefits">


                <div className="benefit">

                  <div className="benefit-icon">
                    ✦
                  </div>

                  <div>

                    <strong>
                      Todos los niveles
                    </strong>

                    <span>
                      Aprende y evoluciona
                    </span>

                  </div>

                </div>


                <div className="benefit">

                  <div className="benefit-icon">
                    ♪
                  </div>

                  <div>

                    <strong>
                      Ritmo y técnica
                    </strong>

                    <span>
                      Mejora en cada clase
                    </span>

                  </div>

                </div>


                <div className="benefit">

                  <div className="benefit-icon">
                    ♡
                  </div>

                  <div>

                    <strong>
                      Disfruta bailando
                    </strong>

                    <span>
                      Comparte tu pasión
                    </span>

                  </div>

                </div>


                <div className="benefit">

                  <div className="benefit-icon">
                    ★
                  </div>

                  <div>

                    <strong>
                      Ambiente cercano
                    </strong>

                    <span>
                      Aprende y conoce gente
                    </span>

                  </div>

                </div>


              </div>

            </div>


          </div>

        </div>

      </section>


      {/* ==================================================
          HORARIOS
      ================================================== */}

      <section
        id="horarios"
        className="activity-schedule-section"
      >

        <div className="activity-container">


          <div className="schedule-heading">

            <div>

              <p className="eyebrow orange">
                HORARIOS
              </p>

              <h2>

                Elige tu{" "}

                <span>
                  horario
                </span>

              </h2>

            </div>


            <p>
              Consulta los días y horarios
              disponibles para{" "}
              {actividad.nombre}.
            </p>

          </div>


        {horarios.length > 0 ? (

          <div className="schedule-grid">

            {(() => {
              const grupos = {};

              const ordenDias = {
                Lunes: 1,
                Martes: 2,
                Miércoles: 3,
                Jueves: 4,
                Viernes: 5,
                Sábado: 6,
                Domingo: 7,
              };

              horarios.forEach((horario) => {
                const profesoresIds = Array.isArray(
                  horario.profesor_ids
                )
                  ? [...horario.profesor_ids]
                      .map(Number)
                      .sort((a, b) => a - b)
                      .join(",")
                  : "";

                const clave = [
                  horario.hora_inicio,
                  horario.hora_fin,
                  horario.nivel || "",
                  profesoresIds,
                ].join("|");

                if (!grupos[clave]) {
                  grupos[clave] = {
                    ...horario,
                    dias: [],
                  };
                }

                if (
                  horario.dia &&
                  !grupos[clave].dias.includes(horario.dia)
                ) {
                  grupos[clave].dias.push(horario.dia);
                }
              });

              return Object.values(grupos).map((grupo) => {
                grupo.dias.sort(
                  (a, b) =>
                    (ordenDias[a] || 99) -
                    (ordenDias[b] || 99)
                );

                let diasTexto = "";

                if (grupo.dias.length === 1) {
                  diasTexto = grupo.dias[0];
                } else if (grupo.dias.length === 2) {
                  diasTexto =
                    grupo.dias[0] +
                    " y " +
                    grupo.dias[1];
                } else {
                  diasTexto =
                    grupo.dias.slice(0, -1).join(", ") +
                    " y " +
                    grupo.dias[grupo.dias.length - 1];
                }

                const profesoresHorario =
                  Array.isArray(grupo.profesor_nombres)
                    ? grupo.profesor_nombres
                    : [];

                return (
                  <article
                                    className="schedule-card"
                    key={`${grupo.id}-${diasTexto}`}
                  >

                    <div className="schedule-top">

                      <div className="schedule-day">
                        <span className="clock">◷</span>
                        <strong>{diasTexto}</strong>
                      </div>

                      <div className="schedule-time">
                        {formatearHora(grupo.hora_inicio)}
                        <span>–</span>
                        {formatearHora(grupo.hora_fin)}
                      </div>

                    </div>

                    {grupo.nivel && (
                      <div className="schedule-level">
                        {grupo.nivel}
                      </div>
                    )}

                    <div className="schedule-line" />

                    <div className="schedule-teacher">
                      <span>PROFESOR/A</span>
                      <strong>
                        {profesoresHorario.length > 0
                          ? profesoresHorario.join(" · ")
                          : "Consultar"}
                      </strong>
                    </div>

                  </article>
                );
              });
            })()}

          </div>

        ) : (

          <div className="no-schedule">
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


            <div className="teachers-heading">

              <div>

                <p className="eyebrow orange">
                  NUESTRO EQUIPO
                </p>

                <h2>

                  Tus{" "}

                  <span>
                    profesores
                  </span>

                </h2>

              </div>


              <p>
                Aprende de un equipo apasionado,
                con experiencia y comprometido
                con tu evolución en el baile.
              </p>

            </div>


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


                    <div className="teacher-info">

                      <h3>
                        {profesor.nombre}
                      </h3>


                      <span>
                        PROFESOR/A DE{" "}
                        {actividad.nombre.toUpperCase()}
                      </span>


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

        <div className="cta-glow" />

        <div className="activity-container">

          <div className="cta-grid">


            <div>

              <p className="eyebrow">
                ¿TE APETECE BAILAR?
              </p>


              <h2>

                Ven a probar

                <br />

                <span>
                  una clase.
                </span>

              </h2>

            </div>


            <div className="cta-content">

              <p>

                Descubre nuestras clases de{" "}
                {actividad.nombre} en Lucena
                y empieza a formar parte de
                Artes Escénicas Paradise.

              </p>


              <a
                href="/#contacto"
                className="cta-button"
              >

                QUIERO PROBAR UNA CLASE

                <span>
                  →
                </span>

              </a>

            </div>


          </div>

        </div>

      </section>


      {/* ==================================================
          ESTILOS
      ================================================== */}

      <style>{`

        /* ==================================================
           GENERAL
        ================================================== */

        .activity-page {
          min-height: 100vh;
          background: #ffffff;
          color: #111111;
        }


        .activity-container {
          width: min(1180px, 92%);
          margin: 0 auto;
          position: relative;
          z-index: 3;
        }


        .eyebrow {
          margin: 0;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }


        .orange {
          color: #f58a00;
        }


        /* ==================================================
           HERO
        ================================================== */

        .activity-hero {
          position: relative;
          overflow: hidden;

          padding: 25px 0 95px;

          background: #050505;

          color: #ffffff;
        }


        /* ==================================================
           FONDO DEL CARTEL
        ================================================== */

        .hero-poster-background {
          position: absolute;

          z-index: 0;

          inset: -35% -15% -30% 5%;

          background-position: center top;

          background-size: cover;

          background-repeat: no-repeat;

          opacity: 0.42;

          filter:
            blur(10px)
            saturate(1.45);

          transform:
            scale(1.15)
            rotate(-2deg);

          pointer-events: none;
        }


        /* ==================================================
           OSCURECER FONDO
        ================================================== */

        .hero-overlay {
          position: absolute;

          z-index: 1;

          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(5, 5, 5, 0.96) 0%,
              rgba(5, 5, 5, 0.72) 32%,
              rgba(5, 5, 5, 0.38) 62%,
              rgba(5, 5, 5, 0.58) 100%
            );

          pointer-events: none;
        }


        /* ==================================================
           DEGRADADO INFERIOR
        ================================================== */

        .activity-hero::after {
          content: "";

          position: absolute;

          z-index: 2;

          left: 0;
          right: 0;
          bottom: 0;

          height: 90px;

          background:
            linear-gradient(
              to bottom,
              transparent,
              #050505
            );

          pointer-events: none;
        }


        /* ==================================================
           LUCES
        ================================================== */

        .hero-glow {
          position: absolute;

          z-index: 1;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(80px);
        }


        .hero-glow-one {
          width: 350px;
          height: 350px;

          right: -100px;
          top: 120px;

          background:
            rgba(
              255,
              119,
              0,
              0.18
            );
        }


        .hero-glow-two {
          width: 300px;
          height: 300px;

          left: -150px;
          bottom: -120px;

          background:
            rgba(
              155,
              0,
              180,
              0.20
            );
        }


        /* ==================================================
           LOGO
        ================================================== */

        .activity-logo {
          position: relative;

          z-index: 5;

          display: flex;

          justify-content: center;

          align-items: center;

          margin-bottom: 10px;
        }


        .activity-logo a {
          display: flex;

          align-items: center;

          justify-content: center;

          width: 135px;
          height: 135px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              #050505 45%,
              #111111 72%,
              transparent 73%
            );

          box-shadow:
            0 0 40px
            rgba(
              255,
              111,
              0,
              0.16
            );

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }


        .activity-logo a:hover {
          transform: scale(1.04);

          box-shadow:
            0 0 55px
            rgba(
              255,
              111,
              0,
              0.25
            );
        }


        .activity-logo img {
          display: block;

          width: 120px;
          height: 120px;

          object-fit: contain;
        }


        /* ==================================================
           VOLVER
        ================================================== */

        .activity-back {
          position: relative;

          z-index: 5;

          display: inline-block;

          margin-bottom: 35px;

          color: #ffffff;

          text-decoration: none;

          font-size: 14px;

          font-weight: 700;

          opacity: 0.82;

          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }


        .activity-back:hover {
          opacity: 1;

          transform: translateX(-3px);
        }


        /* ==================================================
           HERO LAYOUT
        ================================================== */

        .hero-layout {
          position: relative;

          z-index: 5;

          display: grid;

          grid-template-columns:
            minmax(0, 0.95fr)
            minmax(400px, 1.05fr);

          gap: 35px;

          align-items: center;
        }


        /* ==================================================
           TEXTO HERO
        ================================================== */

        .hero-eyebrow {
          color: #f5a000;
        }


        .hero-copy h1 {
          margin: 14px 0 25px;

          font-size:
            clamp(
              55px,
              7vw,
              94px
            );

          line-height: 0.88;

          letter-spacing: -0.055em;
        }


        .hero-copy h1 span {
          display: block;

          color: #ffffff;
        }


        .hero-copy h1 em {
          display: block;

          color: #f58a00;

          font-style: normal;
        }


        .activity-intro {
          max-width: 620px;

          margin: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.86
            );

          font-size: 17px;

          line-height: 1.7;
        }


        .hero-actions {
          display: flex;

          align-items: center;

          gap: 25px;

          margin-top: 35px;

          flex-wrap: wrap;
        }


        .hero-button {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          min-height: 48px;

          padding: 0 24px;

          border-radius: 999px;

          background: #f5a000;

          color: #111111;

          font-size: 12px;

          font-weight: 900;

          letter-spacing: 0.08em;

          text-decoration: none;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .hero-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 10px 25px
            rgba(
              245,
              138,
              0,
              0.22
            );
        }


        .hero-link {
          color: #ffffff;

          font-size: 14px;

          font-weight: 700;

          text-decoration: none;

          opacity: 0.85;
        }


        .hero-link:hover {
          opacity: 1;
        }


        /* ==================================================
           CARTEL DELANTERO
        ================================================== */

        .hero-visual {
          position: relative;

          display: flex;

          align-items: center;

          justify-content: center;

          min-height: 560px;

          padding:
            20px
            0
            40px
            20px;

          overflow: visible;

          transform:
            rotate(-4deg)
            translate(18px, 5px);

          transform-origin:
            center center;
        }
                .hero-image-frame {
          position: relative;

          width: 108%;

          height: 610px;

          overflow: hidden;

          border-radius: 32px;

          border:
            1px solid
            rgba(
              255,
              140,
              0,
              0.65
            );

          background: #111111;

          box-shadow:
            0 30px 80px
            rgba(
              0,
              0,
              0,
              0.65
            ),

            0 0 35px
            rgba(
              255,
              100,
              0,
              0.16
            );

          transform:
            translateX(25px);

          isolation: isolate;
        }


        /*
         * OSCURECE / RECORTA LA PARTE INFERIOR
         */

        .hero-image-frame::before {
          content: "";

          position: absolute;

          left: -10%;
          right: -10%;
          bottom: -2px;

          height: 28%;

          z-index: 2;

          background:
            linear-gradient(
              to bottom,
              transparent 0%,
              rgba(
                5,
                5,
                5,
                0.35
              ) 45%,
              #050505 100%
            );

          pointer-events: none;
        }


        /*
         * BRILLO SUPERIOR
         */

        .hero-image-frame::after {
          content: "";

          position: absolute;

          inset: 0;

          z-index: 3;

          background:
            linear-gradient(
              135deg,
              rgba(
                255,
                140,
                0,
                0.12
              ),
              transparent 38%
            );

          pointer-events: none;
        }


        .hero-image-frame img {
          display: block;

          width: 100%;

          height: 100%;

          object-fit: cover;

          object-position: center top;

          transform: scale(1.03);
        }


        .hero-image-placeholder {
          min-height: 500px;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #111111;

          color: #ffffff;

          font-size: 38px;

          font-weight: 900;
        }


        /* ==================================================
           CÍRCULO PARADISE
        ================================================== */

        .hero-circle {
          position: absolute;

          left: -25px;

          bottom: -10px;

          z-index: 6;

          display: flex;

          align-items: center;

          justify-content: center;

          width: 105px;

          height: 105px;

          border-radius: 50%;

          border:
            1px solid
            rgba(
              245,
              138,
              0,
              0.7
            );

          background: #050505;

          color: #f58a00;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 0.16em;

          box-shadow:
            0 0 30px
            rgba(
              245,
              138,
              0,
              0.16
            );
        }


        /* ==================================================
           INTRO
        ================================================== */

        .activity-intro-section {
          padding: 100px 0;

          background: #ffffff;
        }


        .intro-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 0.9fr)
            minmax(0, 1.1fr);

          gap: 75px;

          align-items: center;
        }


        .intro-image {
          overflow: hidden;

          border-radius: 25px;

          background: #f2f2f2;

          box-shadow:
            0 20px 55px
            rgba(
              0,
              0,
              0,
              0.10
            );
        }


        .intro-image img {
          display: block;

          width: 100%;

          height: auto;
        }


        .intro-placeholder {
          min-height: 450px;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #111111;

          color: #ffffff;

          font-size: 40px;

          font-weight: 900;
        }


        .intro-copy h2 {
          margin: 12px 0 22px;

          color: #111111;

          font-size:
            clamp(
              38px,
              5vw,
              60px
            );

          line-height: 0.98;

          letter-spacing: -0.045em;
        }


        .intro-copy h2 span {
          color: #f58a00;
        }


        .intro-description {
          max-width: 650px;

          margin: 0;

          color: #555555;

          font-size: 17px;

          line-height: 1.75;
        }


        /* ==================================================
           BENEFICIOS
        ================================================== */

        .benefits {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap: 20px;

          margin-top: 35px;
        }


        .benefit {
          display: flex;

          align-items: center;

          gap: 13px;
        }


        .benefit-icon {
          flex: 0 0 auto;

          display: flex;

          align-items: center;

          justify-content: center;

          width: 43px;

          height: 43px;

          border-radius: 50%;

          background: #fff2e2;

          color: #f58a00;

          font-size: 18px;

          font-weight: 900;
        }


        .benefit strong {
          display: block;

          color: #222222;

          font-size: 14px;
        }


        .benefit span {
          display: block;

          margin-top: 3px;

          color: #888888;

          font-size: 12px;
        }


        /* ==================================================
           HORARIOS
        ================================================== */

        .activity-schedule-section {
          padding:
            100px 0
            110px;

          background: #f2f2f3;
        }


        .schedule-heading {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 40px;

          margin-bottom: 42px;
        }


        .schedule-heading h2 {
          margin: 10px 0 0;

          color: #111111;

          font-size:
            clamp(
              43px,
              5vw,
              66px
            );

          line-height: 0.92;

          letter-spacing: -0.05em;
        }


        .schedule-heading h2 span {
          color: #f58a00;
        }


        .schedule-heading > p {
          max-width: 430px;

          margin: 0;

          color: #666666;

          font-size: 15px;

          line-height: 1.6;

          text-align: right;
        }


        .schedule-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 20px;
        }


        .schedule-card {
          min-width: 0;

          box-sizing: border-box;

          padding:
            24px 21px;

          border:
            1px solid
            #dedede;

          border-radius: 20px;

          background: #ffffff;

          box-shadow:
            0 8px 25px
            rgba(
              0,
              0,
              0,
              0.045
            );

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .schedule-card:hover {
          transform:
            translateY(-4px);

          box-shadow:
            0 15px 35px
            rgba(
              0,
              0,
              0,
              0.08
            );
        }


        .schedule-top {
          display: flex;

          align-items: center;

          justify-content: flex-start;

          gap: 9px;

          flex-wrap: wrap;

          min-width: 0;
        }


        .schedule-day {
          display: flex;

          align-items: center;

          gap: 7px;

          min-width: 0;

          color: #171717;

          font-size: 15px;

          line-height: 1.25;

          font-weight: 800;

          white-space: nowrap;
        }


        .clock {
          flex: 0 0 auto;

          color: #f58a00;

          font-size: 19px;

          line-height: 1;
        }


        .schedule-time {
          flex: 0 0 auto;

          color: #171717;

          font-size: 15px;

          line-height: 1.25;

          font-weight: 900;

          white-space: nowrap;
        }


        .schedule-time span {
          margin: 0 3px;

          color: #888888;
        }


        .schedule-level {
          display: inline-block;

          max-width: 100%;

          box-sizing: border-box;

          margin-top: 22px;

          padding:
            7px 12px;

          border-radius: 999px;

          background: #111111;

          color: #ffffff;

          font-size: 11px;

          font-weight: 800;

          line-height: 1.25;

          overflow-wrap: anywhere;
        }


        .schedule-line {
          height: 1px;

          margin:
            20px 0;

          background: #eeeeee;
        }


        .schedule-teacher span {
          display: block;

          margin-bottom: 6px;

          color: #999999;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 0.16em;
        }


        .schedule-teacher strong {
          display: block;

          color: #333333;

          font-size: 14px;

          line-height: 1.4;

          overflow-wrap: anywhere;
        }


        .no-schedule {
          padding:
            45px 30px;

          border:
            1px solid
            #dddddd;

          border-radius: 20px;

          background: #ffffff;

          color: #666666;

          text-align: center;
        }


        /* ==================================================
           PROFESORES
        ================================================== */

        .activity-teachers {
          padding: 95px 0;

          background: #ffffff;
        }


        .teachers-heading {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 40px;

          margin-bottom: 50px;
        }


        .teachers-heading h2 {
          margin: 10px 0 0;

          color: #111111;

          font-size:
            clamp(
              40px,
              5vw,
              62px
            );

          line-height: 0.95;

          letter-spacing: -0.045em;
        }


        .teachers-heading h2 span {
          color: #f58a00;
        }


        .teachers-heading > p {
          max-width: 420px;

          margin: 0;

          color: #666666;

          font-size: 15px;

          line-height: 1.6;
        }
                /*
         * DOS PROFESORES = DOS COLUMNAS
         */

        .teachers-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(
                0,
                1fr
              )
            );

          gap: 30px;

          max-width: 1000px;

          margin: 0 auto;
        }


        .teacher-card {
          display: grid;

          grid-template-columns:
            180px
            1fr;

          align-items: center;

          gap: 25px;

          min-width: 0;

          padding: 25px;

          border:
            1px solid
            #eeeeee;

          border-radius: 25px;

          background: #ffffff;

          box-shadow:
            0 10px 30px
            rgba(
              0,
              0,
              0,
              0.055
            );

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .teacher-card:hover {
          transform:
            translateY(-4px);

          box-shadow:
            0 18px 40px
            rgba(
              0,
              0,
              0,
              0.09
            );
        }


        /*
         * FOTO GRANDE
         */

        .teacher-photo {
          overflow: hidden;

          width: 180px;

          height: 180px;

          border-radius: 50%;

          border:
            5px solid
            #f58a00;

          background: #eeeeee;

          box-shadow:
            0 8px 25px
            rgba(
              245,
              138,
              0,
              0.15
            );
        }


        .teacher-photo img {
          display: block;

          width: 100%;

          height: 100%;

          object-fit: cover;
        }


        .teacher-info h3 {
          margin:
            0 0 7px;

          color: #111111;

          font-size: 28px;

          line-height: 1.05;
        }


        .teacher-info > span {
          display: block;

          color: #999999;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 0.12em;

          line-height: 1.4;
        }


        .teacher-info p {
          margin:
            14px 0 0;

          color: #666666;

          font-size: 13px;

          line-height: 1.6;
        }


        /* ==================================================
           CTA
        ================================================== */

        .activity-cta {
          position: relative;

          overflow: hidden;

          padding: 95px 0;

          background:
            radial-gradient(
              circle at 85% 50%,
              rgba(
                245,
                138,
                0,
                0.24
              ),
              transparent 30%
            ),

            radial-gradient(
              circle at 10% 100%,
              rgba(
                135,
                0,
                160,
                0.25
              ),
              transparent 35%
            ),

            #070707;

          color: #ffffff;
        }


        .cta-glow {
          position: absolute;

          width: 400px;

          height: 400px;

          right: -200px;

          top: -200px;

          border-radius: 50%;

          background:
            rgba(
              245,
              138,
              0,
              0.12
            );

          filter: blur(70px);
        }


        .cta-grid {
          display: grid;

          grid-template-columns:
            1fr
            0.75fr;

          gap: 70px;

          align-items: center;
        }


        .activity-cta h2 {
          margin:
            12px 0 0;

          font-size:
            clamp(
              48px,
              6vw,
              76px
            );

          line-height: 0.9;

          letter-spacing: -0.05em;
        }


        .activity-cta h2 span {
          color: #f58a00;
        }


        .cta-content p {
          max-width: 500px;

          margin:
            0 0 28px;

          color:
            rgba(
              255,
              255,
              255,
              0.76
            );

          font-size: 17px;

          line-height: 1.7;
        }


        .cta-button {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 18px;

          min-height: 52px;

          padding:
            0 24px;

          border-radius: 999px;

          background: #f58a00;

          color: #111111;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: 0.07em;

          text-decoration: none;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .cta-button span {
          font-size: 18px;
        }


        .cta-button:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 12px 30px
            rgba(
              245,
              138,
              0,
              0.22
            );
        }


        /* ==================================================
           TABLET
        ================================================== */

        @media (max-width: 1100px) {

          .hero-layout {
            grid-template-columns:
              1fr
              0.9fr;

            gap: 25px;
          }


          .hero-visual {
            min-height: 500px;
          }


          .hero-image-frame {
            height: 540px;
          }


          .schedule-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }


          .teachers-grid {
            grid-template-columns:
              1fr 1fr;
          }


          .teacher-card {
            grid-template-columns:
              145px
              1fr;
          }


          .teacher-photo {
            width: 145px;

            height: 145px;
          }

        }


        /* ==================================================
           MÓVIL
        ================================================== */

        @media (max-width: 800px) {

          .activity-container {
            width:
              min(
                calc(100% - 32px),
                1180px
              );
          }


          .activity-hero {
            padding:
              20px 0 70px;
          }


          .hero-poster-background {
            inset:
              -15%
              -35%
              -15%
              -10%;

            opacity: 0.30;

            filter:
              blur(10px)
              saturate(1.25);

            transform:
              scale(1.18)
              rotate(-2deg);
          }


          .hero-overlay {
            background:
              linear-gradient(
                180deg,
                rgba(
                  5,
                  5,
                  5,
                  0.92
                ),
                rgba(
                  5,
                  5,
                  5,
                  0.62
                ),
                rgba(
                  5,
                  5,
                  5,
                  0.96
                )
              );
          }


          .activity-logo a {
            width: 120px;
            height: 120px;
          }


          .activity-logo img {
            width: 105px;
            height: 105px;
          }


          .activity-back {
            margin-bottom: 30px;
          }


          .hero-layout {
            grid-template-columns: 1fr;

            gap: 20px;
          }


          .hero-copy h1 {
            font-size:
              clamp(
                50px,
                14vw,
                75px
              );
          }


          .hero-visual {
            min-height: 450px;

            padding:
              0
              10px
              35px
              10px;

            transform:
              rotate(-3deg)
              translate(5px, 0);
          }


          .hero-image-frame {
            width: 100%;

            height: 500px;

            transform:
              translateX(0);
          }


          .hero-circle {
            left: 5px;

            bottom: -5px;

            width: 90px;

            height: 90px;
          }


          .activity-intro-section {
            padding: 70px 0;
          }


          .intro-grid {
            grid-template-columns: 1fr;

            gap: 45px;
          }


          .benefits {
            grid-template-columns: 1fr;
          }


          .activity-schedule-section {
            padding:
              70px 0
              80px;
          }


          .schedule-heading {
            display: block;
          }


          .schedule-heading > p {
            margin-top: 18px;

            text-align: left;
          }


          .schedule-grid {
            grid-template-columns: 1fr;

            gap: 15px;
          }


          .schedule-card {
            padding:
              23px 21px;
          }


          .activity-teachers {
            padding: 70px 0;
          }


          .teachers-heading {
            display: block;
          }


          .teachers-heading > p {
            margin-top: 18px;
          }


          .teachers-grid {
            grid-template-columns: 1fr;
          }


          .teacher-card {
            grid-template-columns:
              150px
              1fr;

            gap: 20px;

            padding: 20px;
          }


          .teacher-photo {
            width: 150px;

            height: 150px;
          }


          .cta-grid {
            grid-template-columns: 1fr;

            gap: 30px;
          }


          .activity-cta {
            padding: 75px 0;
          }

        }


        /* ==================================================
           MÓVIL PEQUEÑO
        ================================================== */

        @media (max-width: 500px) {

          .hero-actions {
            align-items: flex-start;

            flex-direction: column;

            gap: 18px;
          }


          .hero-copy h1 {
            font-size: 52px;
          }


          .hero-visual {
            min-height: 390px;
          }


          .hero-image-frame {
            height: 430px;
          }


          .schedule-day,
          .schedule-time {
            font-size: 15px;
          }


          .teacher-card {
            grid-template-columns:
              105px
              1fr;

            padding: 15px;

            gap: 15px;
          }


          .teacher-photo {
            width: 105px;

            height: 105px;

            border-width: 4px;
          }


          .teacher-info h3 {
            font-size: 22px;
          }


          .teacher-info > span {
            font-size: 8px;
          }


          .teacher-info p {
            font-size: 12px;

            margin-top: 9px;
          }


          .activity-cta h2 {
            font-size: 52px;
          }

        }

      `}</style>


    </main>
  );
}
