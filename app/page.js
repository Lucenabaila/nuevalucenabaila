"use client";

import { useEffect, useMemo, useState } from "react";

// =========================================================
// ICONOS
// =========================================================

function obtenerIcono(nombre = "") {
  const texto = nombre.toLowerCase();

  if (texto.includes("salsa")) return "💃";
  if (texto.includes("bachata")) return "🔥";
  if (texto.includes("ballet")) return "🩰";

  if (
    texto.includes("urbano") ||
    texto.includes("funky") ||
    texto.includes("hip hop") ||
    texto.includes("hip-hop")
  ) {
    return "⚡";
  }

  if (texto.includes("k-pop") || texto.includes("kpop")) {
    return "✨";
  }

  if (texto.includes("barré") || texto.includes("barre")) {
    return "🌸";
  }

  if (texto.includes("ladies")) return "💫";

  return "🎶";
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

export default function Home() {
  const [actividades, setActividades] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [profesores, setProfesores] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [filtroActividad, setFiltroActividad] = useState("todas");

  // =======================================================
  // CARGAR DATOS
  // =======================================================

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
          fetch("/api/actividades", {
            cache: "no-store",
          }),

          fetch("/api/horarios", {
            cache: "no-store",
          }),

          fetch("/api/profesores", {
            cache: "no-store",
          }),
        ]);

        if (!respuestaActividades.ok) {
          throw new Error(
            "No se pudieron cargar las actividades."
          );
        }

        if (!respuestaHorarios.ok) {
          throw new Error(
            "No se pudieron cargar los horarios."
          );
        }

        if (!respuestaProfesores.ok) {
          throw new Error(
            "No se pudieron cargar los profesores."
          );
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
            datosActividades.mensaje ||
              "Error cargando actividades."
          );
        }

        if (!datosHorarios.correcto) {
          throw new Error(
            datosHorarios.mensaje ||
              "Error cargando horarios."
          );
        }

        if (!datosProfesores.correcto) {
          throw new Error(
            datosProfesores.mensaje ||
              "Error cargando profesores."
          );
        }

        setActividades(
          Array.isArray(
            datosActividades.actividades
          )
            ? datosActividades.actividades
            : []
        );

        setHorarios(
          Array.isArray(datosHorarios.horarios)
            ? datosHorarios.horarios
            : []
        );

        setProfesores(
          Array.isArray(
            datosProfesores.profesores
          )
            ? datosProfesores.profesores
            : []
        );
      } catch (err) {
        console.error(
          "Error cargando la web:",
          err
        );

        setError(
          err.message ||
            "No se pudieron cargar los datos."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  // =======================================================
  // HORARIOS FILTRADOS
  // =======================================================

  const horariosFiltrados = useMemo(() => {
    if (filtroActividad === "todas") {
      return horarios;
    }

    return horarios.filter(
      (horario) =>
        Number(horario.actividad_id) ===
        Number(filtroActividad)
    );
  }, [horarios, filtroActividad]);

  // =======================================================
  // PROFESORES DEL HORARIO
  // =======================================================

  function obtenerProfesoresHorario(horario) {
    if (!Array.isArray(horario.profesor_ids)) {
      return [];
    }

    return horario.profesor_ids
      .map((profesorId) =>
        profesores.find(
          (profesor) =>
            Number(profesor.id) ===
            Number(profesorId)
        )
      )
      .filter(Boolean);
  }

  // =======================================================
  // FORMATO HORA
  // =======================================================

  function formatearHora(hora) {
    if (!hora) return "";

    return String(hora).slice(0, 5);
  }

  // =======================================================
  // ACTIVIDADES PROFESOR
  // =======================================================

  function obtenerActividadesProfesor(profesor) {
    if (!Array.isArray(profesor.actividad_ids)) {
      return [];
    }

    return profesor.actividad_ids
      .map((actividadId) =>
        actividades.find(
          (actividad) =>
            Number(actividad.id) ===
            Number(actividadId)
        )
      )
      .filter(Boolean);
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="site">

      {/* =================================================
          NAVEGACIÓN
      ================================================= */}

      <header className="nav">

        <a
          className="brand"
          href="#inicio"
          aria-label="Artes Escénicas Paradise"
        >
          <div className="brand-logo">
            AP
          </div>

          <div className="brand-text">
            <span>ARTES ESCÉNICAS</span>
            <strong>PARADISE</strong>
          </div>
        </a>

        <nav>
          <a href="#clases">CLASES</a>
          <a href="#horarios">HORARIOS</a>
          <a href="#profesores">PROFESORES</a>
          <a href="#escuela">LA ESCUELA</a>
          <a href="#contacto">CONTACTO</a>
        </nav>

        <a
          className="nav-cta"
          href="#contacto"
        >
          PRUEBA UNA CLASE
        </a>

      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section
        id="inicio"
        className="hero"
      >

        <div className="hero-background"></div>

        <div className="hero-copy">

          <p className="hero-eyebrow">
            ESCUELA DE BAILE · LUCENA
          </p>

          <h1>
            BAILA<span>.</span>
            <br />

            <em>DISFRUTA.</em>

            <br />

            CONECTA<span>.</span>
          </h1>

          <div className="hero-line"></div>

          <p className="hero-text">
            Un espacio para aprender,
            compartir y vivir el baile.
            Encuentra tu estilo, conoce
            a tu gente y disfruta cada paso.
          </p>

          <div className="hero-actions">

            <a
              className="button primary"
              href="#clases"
            >
              VER ACTIVIDADES
            </a>

            <a
              className="button outline"
              href="#contacto"
            >
              QUIERO PROBAR
            </a>

          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-glow"></div>

          <img
            src="/hero.png"
            alt="Artes Escénicas Paradise"
            className="hero-image"
          />

          <div className="hero-photo-overlay"></div>

        </div>

      </section>

      {/* =================================================
          INFORMACIÓN HERO
      ================================================= */}

      <section className="hero-info">

        <div className="hero-info-item">

          <div className="hero-info-icon">
            ◎
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


        <div className="hero-info-item">

          <div className="hero-info-icon">
            ◉
          </div>

          <div>
            <strong>
              676 421 944
            </strong>

            <span className="pink">
              WHATSAPP
            </span>
          </div>

        </div>


        <div className="hero-info-item">

          <div className="hero-info-icon">
            ◎
          </div>

          <div>
            <strong>
              @ARTESCENICASPARADISE
            </strong>

            <span className="pink">
              SÍGUENOS
            </span>
          </div>

        </div>


        <div className="hero-quote">

          <span>
            No se trata de ser el mejor,
          </span>

          <em>
            se trata de disfrutar el camino.
          </em>

        </div>

      </section>


      {/* =================================================
          ACTIVIDADES
      ================================================= */}

      <section
        id="clases"
        className="section dark-section"
      >

        <div className="section-head">

          <div>

            <p className="eyebrow">
              ENCUENTRA TU ESTILO
            </p>

            <h2>
              Clases para{" "}
              <em>todos</em>
            </h2>

          </div>

          <p>
            Desde tus primeros pasos
            hasta perfeccionar tu técnica.
            Aquí hay un lugar para ti.
          </p>

        </div>


        {cargando ? (

          <div className="vacio-web">
            Cargando actividades...
          </div>

        ) : actividades.length === 0 ? (

          <div className="vacio-web">
            Actualmente no hay actividades
            disponibles.
          </div>

        ) : (

          <div className="cards">

            {actividades.map(
              (actividad) => (

                <article
                  className="card"
                  key={actividad.id}
                >

                  <span className="card-icon">
                    {obtenerIcono(
                      actividad.nombre
                    )}
                  </span>

                  <h3>
                    {actividad.nombre}
                  </h3>

                  <p>
                    {actividad.descripcion ||
                      "Descubre esta actividad y disfruta del baile con nosotros."}
                  </p>

                  <a href="#contacto">
                    MÁS INFORMACIÓN →
                  </a>

                </article>

              )
            )}

          </div>

        )}

      </section>


      {/* =================================================
          HORARIOS
      ================================================= */}

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
            Consulta nuestras clases,
            horarios, niveles y profesores.
          </p>

        </div>


        {!cargando &&
          actividades.length > 0 && (

            <div className="schedule-filters">

              <button
                type="button"
                className={
                  filtroActividad === "todas"
                    ? "filter active"
                    : "filter"
                }
                onClick={() =>
                  setFiltroActividad(
                    "todas"
                  )
                }
              >
                TODAS
              </button>


              {actividades.map(
                (actividad) => (

                  <button
                    key={actividad.id}
                    type="button"
                    className={
                      Number(
                        filtroActividad
                      ) ===
                      Number(
                        actividad.id
                      )
                        ? "filter active"
                        : "filter"
                    }
                    onClick={() =>
                      setFiltroActividad(
                        String(
                          actividad.id
                        )
                      )
                    }
                  >
                    {actividad.nombre}
                  </button>

                )
              )}

            </div>

          )}


        <div className="schedule">

          {cargando ? (

            <div className="vacio-web">
              Cargando horarios...
            </div>

          ) : error ? (

            <div className="vacio-web">
              No se pudieron cargar
              los horarios.
            </div>

          ) : horariosFiltrados.length ===
            0 ? (

            <div className="vacio-web">
              No hay horarios disponibles
              para esta actividad.
            </div>

          ) : (

            horariosFiltrados.map(
              (horario) => {

                const profesoresHorario =
                  obtenerProfesoresHorario(
                    horario
                  );

                return (

                  <div
                    className="schedule-row"
                    key={horario.id}
                  >

                    <strong>
                      {horario.dia}
                    </strong>

                    <span className="time">
                      {formatearHora(
                        horario.hora_inicio
                      )}
                      {" – "}
                      {formatearHora(
                        horario.hora_fin
                      )}
                    </span>

                    <span className="schedule-activity">

                      {
                        horario.actividad_nombre
                      }

                      {horario.nivel && (
                        <small>
                          {horario.nivel}
                        </small>
                      )}

                    </span>

                    <span className="level">

                      {profesoresHorario.length >
                      0
                        ? profesoresHorario
                            .map(
                              (profesor) =>
                                profesor.nombre
                            )
                            .join(
                              " · "
                            )
                        : ""}

                    </span>

                  </div>

                );
              }
            )

          )}

        </div>

      </section>


      {/* =================================================
          PROFESORES
      ================================================= */}

      <section
        id="profesores"
        className="section dark-section"
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
            Profesionales que comparten
            su pasión por el baile y te
            acompañan en cada paso.
          </p>

        </div>


        {cargando ? (

          <div className="vacio-web">
            Cargando profesores...
          </div>

        ) : profesores.length === 0 ? (

          <div className="vacio-web">
            Actualmente no hay profesores
            disponibles.
          </div>

        ) : (

          <div className="teacher-grid">

            {profesores.map(
              (profesor) => {

                const actividadesProfesor =
                  obtenerActividadesProfesor(
                    profesor
                  );

                return (

                  <article
                    className="teacher-card"
                    key={profesor.id}
                  >

                    <div className="teacher-photo">

                      {profesor.foto ? (

                        <img
                          src={
                            profesor.foto
                          }
                          alt={
                            profesor.nombre
                          }
                        />

                      ) : (

                        <div className="teacher-placeholder">
                          👤
                        </div>

                      )}

                    </div>


                    <div className="teacher-content">

                      <h3>
                        {profesor.nombre}
                      </h3>

                      <p>
                        {profesor.descripcion ||
                          "Profesor de la Escuela Artes Escénicas Paradise."}
                      </p>


                      {actividadesProfesor.length >
                        0 && (

                        <div className="teacher-tags">

                          {actividadesProfesor.map(
                            (actividad) => (

                              <span
                                key={
                                  actividad.id
                                }
                              >
                                {
                                  actividad.nombre
                                }
                              </span>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </article>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* =================================================
          LA ESCUELA
      ================================================= */}

      <section
        id="escuela"
        className="story"
      >

        <div className="story-image">

          <div className="story-overlay"></div>

          <div className="story-label">
            ARTES ESCÉNICAS
            <br />
            PARADISE
          </div>

        </div>


        <div className="story-copy">

          <p className="eyebrow">
            MUCHO MÁS QUE UNA ESCUELA
          </p>

          <h2>
            Un lugar para{" "}
            <em>sentirte tú</em>
          </h2>

          <p>
            Queremos que venir a clase
            sea uno de los mejores
            momentos de tu semana.
            Profesores, compañeros y
            un espacio pensado para que
            disfrutes del baile.
          </p>

          <p>
            En Artes Escénicas Paradise
            encontrarás diferentes
            disciplinas, profesores y
            niveles para disfrutar del
            baile y seguir aprendiendo.
          </p>

          <a
            className="button primary"
            href="#contacto"
          >
            CONOCE LA ESCUELA
          </a>

        </div>

      </section>


      {/* =================================================
          BANNER
      ================================================= */}

      <section className="banner">

        <p className="eyebrow">
          ¿EMPEZAMOS?
        </p>

        <h2>
          Tu próxima clase
          <br />
          <em>
            puede ser hoy.
          </em>
        </h2>

        <a
          className="button light"
          href="#contacto"
        >
          QUIERO PROBAR
        </a>

      </section>


      {/* =================================================
          CONTACTO
      ================================================= */}

      <section
        id="contacto"
        className="contact section dark-section"
      >

        <div>

          <p className="eyebrow">
            DA EL PRIMER PASO
          </p>

          <h2>
            ¿Quieres{" "}
            <em>bailar</em>{" "}
            con nosotros?
          </h2>

          <p>
            Déjanos tus datos y te
            contamos qué clase encaja
            mejor contigo.
          </p>

        </div>


        <form
          className="form"
          action="contacto"
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

            <option
              value=""
              disabled
            >
              ¿Qué actividad te interesa?
            </option>

            {actividades.map(
              (actividad) => (

                <option
                  key={
                    actividad.id
                  }
                  value={
                    actividad.id
                  }
                >
                  {actividad.nombre}
                </option>

              )
            )}

            <option value="otra">
              Otra
            </option>

          </select>

          <button
            className="button primary"
            type="submit"
          >
            SOLICITAR INFORMACIÓN
          </button>

        </form>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="web-error">
          {error}
        </div>

      )}


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <div className="footer-brand">

          <div className="brand-logo">
            AP
          </div>

          <div className="brand-text">
            <span>
              ARTES ESCÉNICAS
            </span>

            <strong>
              PARADISE
            </strong>
          </div>

        </div>

        <p>
          Escuela de baile · Lucena
        </p>

        <p>
          © {new Date().getFullYear()}
          {" "}
          Artes Escénicas Paradise
        </p>

      </footer>

    </main>
  );
}
