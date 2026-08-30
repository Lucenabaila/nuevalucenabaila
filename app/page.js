"use client";

import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [actividades, setActividades] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [profesores, setProfesores] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroActividad, setFiltroActividad] = useState("todas");
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(true);
        setError("");

        const [
          respuestaActividades,
          respuestaHorarios,
          respuestaProfesores,
        ] = await Promise.all([
          fetch("/api/actividades", { cache: "no-store" }),
          fetch("/api/horarios", { cache: "no-store" }),
          fetch("/api/profesores", { cache: "no-store" }),
        ]);

        if (!respuestaActividades.ok) {
          throw new Error("No se pudieron cargar las actividades.");
        }

        if (!respuestaHorarios.ok) {
          throw new Error("No se pudieron cargar los horarios.");
        }

        if (!respuestaProfesores.ok) {
          throw new Error("No se pudieron cargar los profesores.");
        }

        const [
          datosActividades,
          datosHorarios,
          datosProfesores,
        ] = await Promise.all([
          respuestaActividades.json(),
          respuestaHorarios.json(),
          respuestaProfesores.json(),
        ]);

        if (!datosActividades.correcto) {
          throw new Error(
            datosActividades.mensaje || "Error cargando actividades."
          );
        }

        if (!datosHorarios.correcto) {
          throw new Error(
            datosHorarios.mensaje || "Error cargando horarios."
          );
        }

        if (!datosProfesores.correcto) {
          throw new Error(
            datosProfesores.mensaje || "Error cargando profesores."
          );
        }

        setActividades(
          Array.isArray(datosActividades.actividades)
            ? datosActividades.actividades
            : []
        );

        setHorarios(
          Array.isArray(datosHorarios.horarios)
            ? datosHorarios.horarios
            : []
        );

        setProfesores(
          Array.isArray(datosProfesores.profesores)
            ? datosProfesores.profesores
            : []
        );
      } catch (err) {
        console.error("Error cargando la web:", err);

        setError(
          err.message || "No se pudieron cargar los datos."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  const horariosFiltrados = useMemo(() => {
    if (filtroActividad === "todas") {
      return horarios;
    }

    return horarios.filter(
      (horario) =>
        Number(horario.actividad_id) === Number(filtroActividad)
    );
  }, [horarios, filtroActividad]);

  function obtenerProfesoresHorario(horario) {
    if (!Array.isArray(horario.profesor_ids)) {
      return [];
    }

    return horario.profesor_ids
      .map((profesorId) =>
        profesores.find(
          (profesor) =>
            Number(profesor.id) === Number(profesorId)
        )
      )
      .filter(Boolean);
  }

  function formatearHora(hora) {
    if (!hora) return "";
    return String(hora).slice(0, 5);
  }

  function obtenerIcono(nombre = "") {
    const texto = nombre.toLowerCase();

    if (texto.includes("salsa")) return "💃";
    if (texto.includes("bachata")) return "🔥";
    if (texto.includes("ballet")) return "🩰";
    if (texto.includes("urbano")) return "⚡";
    if (texto.includes("k-pop")) return "✨";
    if (texto.includes("kpop")) return "✨";
    if (texto.includes("barré")) return "🌸";
    if (texto.includes("barre")) return "🌸";
    if (texto.includes("ladies")) return "💫";

    return "🎶";
  }

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <main className="site">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="nav">

        <a
  className="brand"
  href="#inicio"
  aria-label="Artes Escénicas Paradise"
  onClick={cerrarMenu}
>
  <span className="brand-wordmark">
    <small>ARTES ESCÉNICAS</small>

    <strong>
      PA<span>R</span>ADISE
    </strong>

    <div className="brand-subtitle">
      <i></i>
      <b>ESCUELA DE BAILE</b>
      <i></i>
    </div>

    <div className="brand-star">★</div>
  </span>
</a>

        <nav className={menuAbierto ? "mobile-open" : ""}>
          <a href="#clases" onClick={cerrarMenu}>
            Clases
          </a>

          <a href="#horarios" onClick={cerrarMenu}>
            Horarios
          </a>

          <a href="#profesores" onClick={cerrarMenu}>
            Profesores
          </a>

          <a href="#escuela" onClick={cerrarMenu}>
            La escuela
          </a>

          <a href="#contacto" onClick={cerrarMenu}>
            Contacto
          </a>
        </nav>

        <a
          className="nav-cta"
          href="#contacto"
          onClick={cerrarMenu}
        >
          Prueba una clase
        </a>

        <button
          type="button"
          className={`menu-toggle ${
            menuAbierto ? "active" : ""
          }`}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </header>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section id="inicio" className="hero">

        <div className="hero-glow"></div>

        <div className="hero-copy">

          <p className="eyebrow">
            ESCUELA DE BAILE · LUCENA
          </p>

          <h1>
            <span>BAILA<span className="dot">.</span></span>

            <em>
              DISFRUTA<span className="dot">.</span>
            </em>

            <span>CONECTA<span className="dot">.</span></span>
          </h1>

          <div className="hero-line"></div>

          <p className="hero-text">
            Un espacio para aprender, compartir y vivir el baile.
            Encuentra tu estilo, conoce a tu gente y empieza a moverte.
          </p>

          <div className="hero-actions">

            <a
              className="button primary"
              href="#clases"
            >
              VER ACTIVIDADES
            </a>

            <a
              className="button secondary"
              href="#contacto"
            >
              QUIERO PROBAR
            </a>

          </div>

        </div>


        <div className="hero-art">

          <div className="hero-photo-glow"></div>

          <img
            src="/hero.png"
            alt="Artes Escénicas Paradise"
            className="hero-image"
          />

          <div className="hero-fade"></div>

          <div className="hero-sticker">
            <strong>BAILA</strong>
            <span>CON NOSOTROS</span>
          </div>

        </div>

      </section>


      {/* =====================================================
          FRANJA INFORMACIÓN
      ====================================================== */}

      <section className="quick-info">

        <div className="quick-item">
          <span className="quick-icon">⌖</span>
          <div>
            <strong>CARRETERA DE RUTE 15</strong>
            <span>LUCENA, CÓRDOBA</span>
          </div>
        </div>

        <div className="quick-item">
          <span className="quick-icon">◉</span>
          <div>
            <strong>676 421 944</strong>
            <span className="pink-text">WHATSAPP</span>
          </div>
        </div>

        <div className="quick-item">
          <span className="quick-icon">◎</span>
          <div>
            <strong>@ARTESCENICASPARADISE</strong>
            <span className="pink-text">SÍGUENOS</span>
          </div>
        </div>

        <div className="quick-message">
          <span>
            No se trata de ser el mejor,
            <br />
            se trata de <em>disfrutar</em> el camino.
          </span>
          <b>♡</b>
        </div>

      </section>


      {/* =====================================================
          ACTIVIDADES
      ====================================================== */}

      <section id="clases" className="section activities-section">

        <div className="section-head">

          <div>
            <p className="eyebrow">
              ENCUENTRA TU ESTILO
            </p>

            <h2>
              Clases para <em>todos</em>
            </h2>
          </div>

          <p>
            Desde tus primeros pasos hasta perfeccionar tu técnica.
            Aquí hay un lugar para ti.
          </p>

        </div>


        {cargando ? (

          <div className="vacio-web">
            Cargando actividades...
          </div>

        ) : actividades.length === 0 ? (

          <div className="vacio-web">
            Actualmente no hay actividades disponibles.
          </div>

        ) : (

          <div className="cards">

            {actividades.map((actividad) => (

              <article
                className="card"
                key={actividad.id}
              >

                <div className="card-image-placeholder">
                  <span>
                    {obtenerIcono(actividad.nombre)}
                  </span>

                  <small>
                    PRÓXIMAMENTE
                  </small>
                </div>

                <div className="card-content">

                  <h3>
                    {actividad.nombre}
                  </h3>

                  <p>
                    {actividad.descripcion ||
                      "Descubre esta actividad y disfruta del baile con nosotros."}
                  </p>

                  <a href="#horarios">
                    VER HORARIOS →
                  </a>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          HORARIOS
      ====================================================== */}

      <section
        id="horarios"
        className="section schedule-section"
      >

        <div className="section-head">

          <div>
            <p className="eyebrow">
              ORGANIZA TU SEMANA
            </p>

            <h2>
              Horarios
            </h2>
          </div>

          <p>
            Consulta nuestras clases, horarios,
            niveles y profesores.
          </p>

        </div>


        {!cargando && actividades.length > 0 && (

          <div className="schedule-filters">

            <button
              type="button"
              className={
                filtroActividad === "todas"
                  ? "filter active"
                  : "filter"
              }
              onClick={() => setFiltroActividad("todas")}
            >
              TODAS
            </button>

            {actividades.map((actividad) => (

              <button
                key={actividad.id}
                type="button"
                className={
                  Number(filtroActividad) === Number(actividad.id)
                    ? "filter active"
                    : "filter"
                }
                onClick={() =>
                  setFiltroActividad(String(actividad.id))
                }
              >
                {actividad.nombre}
              </button>

            ))}

          </div>

        )}


        <div className="schedule">

          {cargando ? (

            <div className="vacio-web">
              Cargando horarios...
            </div>

          ) : error ? (

            <div className="vacio-web">
              No se pudieron cargar los horarios.
            </div>

          ) : horariosFiltrados.length === 0 ? (

            <div className="vacio-web">
              No hay horarios disponibles para esta actividad.
            </div>

          ) : (

            horariosFiltrados.map((horario) => {

              const profesoresHorario =
                obtenerProfesoresHorario(horario);

              return (

                <div
                  className="schedule-row"
                  key={horario.id}
                >

                  <strong>
                    {horario.dia}
                  </strong>

                  <span className="time">
                    {formatearHora(horario.hora_inicio)}
                    {" – "}
                    {formatearHora(horario.hora_fin)}
                  </span>

                  <span className="schedule-class">
                    {horario.actividad_nombre}

                    {horario.nivel && (
                      <small>
                        {horario.nivel}
                      </small>
                    )}
                  </span>

                  <span className="level">
                    {profesoresHorario
                      .map((profesor) => profesor.nombre)
                      .join(" · ")}
                  </span>

                </div>

              );
            })

          )}

        </div>

      </section>


      {/* =====================================================
          PROFESORES
      ====================================================== */}

      <section
        id="profesores"
        className="section teachers-section"
      >

        <div className="section-head">

          <div>
            <p className="eyebrow">
              NUESTRO EQUIPO
            </p>

            <h2>
              Profesores
            </h2>
          </div>

          <p>
            Profesionales que comparten su pasión por el baile
            y te acompañan en cada paso.
          </p>

        </div>


        {cargando ? (

          <div className="vacio-web">
            Cargando profesores...
          </div>

        ) : profesores.length === 0 ? (

          <div className="vacio-web">
            Actualmente no hay profesores disponibles.
          </div>

        ) : (

          <div className="teacher-grid">

            {profesores.map((profesor) => (

              <article
                className="teacher-card"
                key={profesor.id}
              >

                <div className="teacher-photo">

                  {profesor.foto ? (

                    <img
                      src={profesor.foto}
                      alt={profesor.nombre}
                    />

                  ) : (

                    <div className="teacher-placeholder">
                      👤
                    </div>

                  )}

                </div>

                <div className="teacher-content">

                  <p className="teacher-label">
                    PROFESOR / PROFESORA
                  </p>

                  <h3>
                    {profesor.nombre}
                  </h3>

                  <p>
                    {profesor.descripcion ||
                      "Profesor de Artes Escénicas Paradise."}
                  </p>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          LA ESCUELA
      ====================================================== */}

      <section
        id="escuela"
        className="story"
      >

        <div className="story-image">

          <div className="story-circle">
            <span>P</span>
          </div>

          <span className="story-caption">
            ARTES ESCÉNICAS PARADISE
          </span>

        </div>

        <div className="story-copy">

          <p className="eyebrow">
            MUCHO MÁS QUE UNA ESCUELA
          </p>

          <h2>
            Un lugar para <em>sentirte tú</em>
          </h2>

          <p>
            Queremos que venir a clase sea uno de los mejores
            momentos de tu semana. Profesores, compañeros y
            un espacio pensado para que disfrutes del baile.
          </p>

          <p>
            En Artes Escénicas Paradise encontrarás diferentes
            disciplinas, niveles y profesores para aprender,
            disfrutar y compartir nuestra pasión por el baile.
          </p>

          <a
            className="button primary"
            href="#contacto"
          >
            CONOCE LA ESCUELA
          </a>

        </div>

      </section>


      {/* =====================================================
          BANNER
      ====================================================== */}

      <section className="banner">

        <p className="eyebrow">
          ¿EMPEZAMOS?
        </p>

        <h2>
          Tu próxima clase
          <br />
          <em>puede ser hoy.</em>
        </h2>

        <a
          className="button light"
          href="#contacto"
        >
          QUIERO PROBAR
        </a>

      </section>


      {/* =====================================================
          CONTACTO
      ====================================================== */}

      <section
        id="contacto"
        className="contact section"
      >

        <div>

          <p className="eyebrow">
            DA EL PRIMER PASO
          </p>

          <h2>
            ¿Quieres <em>bailar</em> con nosotros?
          </h2>

          <p>
            Déjanos tus datos y te contamos qué clase
            encaja mejor contigo.
          </p>

        </div>


        <form
          className="form"
          onSubmit={(event) => event.preventDefault()}
        >

          <input
            aria-label="Nombre"
            placeholder="Tu nombre"
          />

          <input
            aria-label="Teléfono"
            placeholder="Teléfono"
          />

          <select
            aria-label="Actividad"
            defaultValue=""
          >

            <option value="" disabled>
              ¿Qué actividad te interesa?
            </option>

            {actividades.map((actividad) => (

              <option
                key={actividad.id}
                value={actividad.id}
              >
                {actividad.nombre}
              </option>

            ))}

          </select>

          <button
            className="button primary"
            type="submit"
          >
            SOLICITAR INFORMACIÓN
          </button>

        </form>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer>

        <div className="footer-logo">
          <span className="footer-logo-mark">P</span>

          <div>
            <small>ARTES ESCÉNICAS</small>
            <strong>PARADISE</strong>
          </div>
        </div>

        <p>
          Escuela de baile · Lucena
        </p>

        <p>
          © {new Date().getFullYear()} Artes Escénicas Paradise
        </p>

      </footer>

    </main>
  );
}
