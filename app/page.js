"use client";

import { useEffect, useState } from "react";

const activities = [
  {
    title: "Salsa",
    subtitle: "Baila",
    image: "/carteles/salsa.png",
  },
  {
    title: "Bachata",
    subtitle: "Sensual",
    image: "/carteles/bachata.png",
  },
  {
    title: "Bailes de Salón",
    subtitle: "Parejas",
    image: "/carteles/bailes-de-salon.png",
  },
  {
    title: "Ladies Style",
    subtitle: "Style",
    image: "/carteles/ladies-style.png",
  },
  {
    title: "Latinos",
    subtitle: "Mix",
    image: "/carteles/latinos.png",
  },
  {
    title: "Coreográfico",
    subtitle: "Dance",
    image: "/carteles/coreografico.png",
  },
  {
    title: "Ballet Clásico",
    subtitle: "Clásico",
    image: "/carteles/ballet.png",
  },
  {
    title: "Fitness Barré",
    subtitle: "Fit",
    image: "/carteles/fitness-barre.png",
  },
  {
    title: "Baile Urbano",
    subtitle: "Urban",
    image: "/carteles/baile-urbano.png",
  },
  {
    title: "K-Pop",
    subtitle: "Dance",
    image: "/carteles/k-pop.png",
  },
];

const dayOrder = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function Home() {
  const [horarios, setHorarios] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(true);

  useEffect(() => {
    async function cargarHorarios() {
      try {
        const response = await fetch("/api/horarios", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.correcto) {
          setHorarios(
            (data.horarios || []).filter(
              (horario) => horario.activa !== false
            )
          );
        }
      } catch (error) {
        console.error("Error cargando horarios:", error);
      } finally {
        setLoadingHorarios(false);
      }
    }

    cargarHorarios();
  }, []);

  const horariosOrdenados = [...horarios].sort((a, b) => {
    const diaA = dayOrder.indexOf(a.dia);
    const diaB = dayOrder.indexOf(b.dia);

    if (diaA !== diaB) {
      return diaA - diaB;
    }

    return String(a.hora_inicio).localeCompare(
      String(b.hora_inicio)
    );
  });

  function formatearHora(hora) {
    if (!hora) return "";

    return String(hora).slice(0, 5);
  }

  return (
    <main className="site">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="main-header">

        <a
          href="#inicio"
          className="paradise-logo"
          aria-label="Artes Escénicas Paradise"
        >
          <span className="logo-small">
            ARTES ESCÉNICAS
          </span>

          <span className="logo-main">
            PA<span>R</span>ADISE
          </span>

          <span className="logo-bottom">
            — ESCUELA DE BAILE —
          </span>

          <span className="logo-star">★</span>
        </a>

        <nav className="main-nav">
          <a href="#clases">CLASES</a>
          <a href="#horarios">HORARIOS</a>
          <a href="#profesores">PROFESORES</a>
          <a href="#escuela">LA ESCUELA</a>
          <a href="#contacto">CONTACTO</a>
        </nav>

        <a
          href="#contacto"
          className="header-button"
        >
          PRUEBA UNA CLASE
        </a>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="inicio"
        className="hero-paradise"
      >

        <div className="hero-background"></div>

        <div className="hero-content">

          <div className="hero-text-column">

            <p className="hero-eyebrow">
              ESCUELA DE BAILE · LUCENA
            </p>

            <h1 className="hero-title">
              <span>BAILA<span className="pink-dot">.</span></span>

              <span className="script-title">
                DISFRUTA<span className="pink-dot">.</span>
              </span>

              <span>CONECTA<span className="pink-dot">.</span></span>
            </h1>

            <div className="hero-line"></div>

            <p className="hero-description">
              Un espacio para aprender,
              <br />
              compartir y vivir el baile.
              <br />
              Encuentra tu estilo, conoce a tu gente
              <br />
              y empieza a moverte.
            </p>

            <div className="hero-buttons">

              <a
                href="#clases"
                className="pink-button"
              >
                VER ACTIVIDADES
              </a>

              <a
                href="#contacto"
                className="outline-button"
              >
                QUIERO PROBAR
              </a>

            </div>

          </div>


          <div className="hero-photo-column">

            <img
              src="/hero.png"
              alt="Pareja bailando en Artes Escénicas Paradise"
              className="hero-photo"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          INFORMACIÓN
      ===================================================== */}

      <section className="info-strip">

        <div className="info-item">

          <div className="info-icon">
            ♧
          </div>

          <div>
            <strong>
              CARRETERA DE RUTE 15
            </strong>

            <span>
              LUCENA, CÓRDOBA
            </span>
          </div>

        </div>


        <div className="info-separator"></div>


        <a
          href="https://wa.me/34676421944"
          className="info-item info-link"
          target="_blank"
          rel="noreferrer"
        >

          <div className="info-icon whatsapp">
            ◔
          </div>

          <div>
            <strong>
              676 421 944
            </strong>

            <span className="pink-text">
              WHATSAPP
            </span>
          </div>

        </a>


        <div className="info-separator"></div>


        <a
          href="https://www.instagram.com/artescenicasparadise/"
          className="info-item info-link"
          target="_blank"
          rel="noreferrer"
        >

          <div className="info-icon">
            ◎
          </div>

          <div>
            <strong>
              @ARTESCENICASPARADISE
            </strong>

            <span className="pink-text">
              SÍGUENOS
            </span>
          </div>

        </a>


        <div className="info-separator"></div>


        <div className="info-quote">

          <span>
            No se trata de ser el mejor,
          </span>

          <span>
            se trata de <em>disfrutar el camino.</em>
          </span>

          <b>♡</b>

        </div>

      </section>


      {/* =====================================================
          CLASES
      ===================================================== */}

      <section
        id="clases"
        className="classes-section"
      >

        <div className="section-heading">

          <div>

            <p className="section-eyebrow">
              ENCUENTRA TU ESTILO
            </p>

            <h2>
              Clases para <em>todos</em>
            </h2>

          </div>

          <p className="section-intro">
            Desde tus primeros pasos hasta perfeccionar
            tu técnica. Aquí hay un lugar para ti.
          </p>

        </div>


        <div className="activity-grid">

          {activities.map((activity) => (

            <a
              href="#horarios"
              className="activity-card"
              key={activity.title}
            >

              <div className="activity-image-wrapper">

                <img
                  src={activity.image}
                  alt={`${activity.title} - Artes Escénicas Paradise`}
                  className="activity-image"
                />

                <div className="activity-overlay">

                  <span>
                    {activity.title}
                  </span>

                  <small>
                    VER HORARIOS →
                  </small>

                </div>

              </div>

            </a>

          ))}

        </div>

      </section>


      {/* =====================================================
          HORARIOS
      ===================================================== */}

      <section
        id="horarios"
        className="schedule-section"
      >

        <div className="schedule-inner">

          <div className="section-heading schedule-heading">

            <div>

              <p className="section-eyebrow">
                ORGANIZA TU SEMANA
              </p>

              <h2>
                Horarios
              </h2>

            </div>

            <p className="section-intro">
              Consulta nuestras clases, horarios,
              niveles y profesores.
            </p>

          </div>


          {loadingHorarios ? (

            <div className="schedule-loading">
              Cargando horarios...
            </div>

          ) : horariosOrdenados.length === 0 ? (

            <div className="schedule-empty">
              Próximamente publicaremos todos los horarios.
            </div>

          ) : (

            <div className="public-schedule">

              {horariosOrdenados.map((horario) => (

                <div
                  className="public-schedule-row"
                  key={horario.id}
                >

                  <div className="schedule-day">
                    {horario.dia}
                  </div>

                  <div className="schedule-time">

                    {formatearHora(
                      horario.hora_inicio
                    )}

                    <span>–</span>

                    {formatearHora(
                      horario.hora_fin
                    )}

                  </div>

                  <div className="schedule-activity">

                    {horario.actividad_nombre}

                  </div>

                  <div className="schedule-level">

                    {horario.nivel || "Todos los niveles"}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          PROFESORES
      ===================================================== */}

      <section
        id="profesores"
        className="teachers-preview"
      >

        <div className="teachers-preview-content">

          <p className="section-eyebrow">
            NUESTRO EQUIPO
          </p>

          <h2>
            Profesores que
            <br />
            <em>viven el baile</em>
          </h2>

          <p>
            Profesionales apasionados por la danza,
            preparados para acompañarte en cada paso.
          </p>

          <a
            href="#contacto"
            className="pink-button"
          >
            CONOCE A NUESTRO EQUIPO
          </a>

        </div>

        <div className="teachers-preview-art">
          <div className="teachers-art-text">
            PARADISE
          </div>
        </div>

      </section>


      {/* =====================================================
          LA ESCUELA
      ===================================================== */}

      <section
        id="escuela"
        className="school-section"
      >

        <div className="school-photo">
          <div className="school-photo-overlay">
            ARTES ESCÉNICAS
            <br />
            <strong>PARADISE</strong>
          </div>
        </div>

        <div className="school-content">

          <p className="section-eyebrow">
            MUCHO MÁS QUE UNA ESCUELA
          </p>

          <h2>
            Un lugar para
            <br />
            <em>sentirte tú</em>
          </h2>

          <p>
            Queremos que venir a clase sea uno de los
            mejores momentos de tu semana.
          </p>

          <p>
            Un espacio donde aprender, disfrutar,
            conocer gente y compartir nuestra pasión
            por el baile.
          </p>

          <a
            href="#contacto"
            className="pink-button"
          >
            CONOCE LA ESCUELA
          </a>

        </div>

      </section>


      {/* =====================================================
          BANNER
      ===================================================== */}

      <section className="big-banner">

        <p className="section-eyebrow">
          ¿EMPEZAMOS?
        </p>

        <h2>
          Tu próxima clase
          <br />
          <em>puede ser hoy.</em>
        </h2>

        <a
          href="#contacto"
          className="white-button"
        >
          QUIERO PROBAR
        </a>

      </section>


      {/* =====================================================
          CONTACTO
      ===================================================== */}

      <section
        id="contacto"
        className="contact-section"
      >

        <div className="contact-copy">

          <p className="section-eyebrow">
            DA EL PRIMER PASO
          </p>

          <h2>
            ¿Quieres
            <br />
            <em>bailar</em> con nosotros?
          </h2>

          <p>
            Déjanos tus datos y te contamos
            qué clase encaja mejor contigo.
          </p>

        </div>


        <form
          className="contact-form"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >

          <input
            type="text"
            placeholder="Tu nombre"
            aria-label="Tu nombre"
          />

          <input
            type="tel"
            placeholder="Teléfono"
            aria-label="Teléfono"
          />

          <select
            aria-label="Actividad"
            defaultValue=""
          >

            <option value="" disabled>
              ¿Qué actividad te interesa?
            </option>

            {activities.map((activity) => (

              <option
                key={activity.title}
                value={activity.title}
              >
                {activity.title}
              </option>

            ))}

          </select>

          <button
            type="submit"
            className="pink-button"
          >
            SOLICITAR INFORMACIÓN
          </button>

        </form>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="site-footer">

        <div className="footer-logo">

          <span>
            ARTES ESCÉNICAS
          </span>

          <strong>
            PA<span>R</span>ADISE
          </strong>

          <small>
            ESCUELA DE BAILE
          </small>

        </div>


        <div className="footer-center">

          <span>
            Escuela de baile
          </span>

          <span>
            Lucena · Córdoba
          </span>

        </div>


        <div className="footer-right">

          <a
            href="https://www.instagram.com/artescenicasparadise/"
            target="_blank"
            rel="noreferrer"
          >
            INSTAGRAM
          </a>

          <a
            href="https://wa.me/34676421944"
            target="_blank"
            rel="noreferrer"
          >
            WHATSAPP
          </a>

        </div>


        <div className="footer-copy">

          © {new Date().getFullYear()} Artes Escénicas Paradise

        </div>

      </footer>

    </main>
  );
}
