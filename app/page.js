"use client";

import { useEffect, useMemo, useState } from "react";

export default function Home() {
const [actividades, setActividades] = useState([]);
const [horarios, setHorarios] = useState([]);
const [profesores, setProfesores] = useState([]);
const [eventos, setEventos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroActividad, setFiltroActividad] = useState("todas");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cartelAbierto, setCartelAbierto] = useState(null);
  const [eventoAbierto, setEventoAbierto] = useState(null);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(true);
        setError("");

       const [
  respuestaActividades,
  respuestaHorarios,
  respuestaProfesores,
  respuestaEventos,
] = await Promise.all([
  fetch("/api/actividades", { cache: "no-store" }),
  fetch("/api/horarios", { cache: "no-store" }),
  fetch("/api/profesores", { cache: "no-store" }),
  fetch("/api/eventos", { cache: "no-store" }),
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
  datosEventos,
] = await Promise.all([
  respuestaActividades.json(),
  respuestaHorarios.json(),
  respuestaProfesores.json(),
  respuestaEventos.json(),
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
        setEventos(
  Array.isArray(datosEventos.eventos)
    ? datosEventos.eventos
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
  // CORREGIR NAVEGACIÓN A #CONTACTO
  // =======================================================

  useEffect(() => {
    if (!cargando && window.location.hash === "#contacto") {
      const elemento = document.getElementById("contacto");

      if (elemento) {
        setTimeout(() => {
          elemento.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 150);
      }
    }
  }, [cargando]);

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
// AGRUPAR HORARIOS DE DOS O MÁS DÍAS
// =======================================================

const horariosAgrupados = useMemo(() => {
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

  horariosFiltrados.forEach((horario) => {
    const profesoresIds = Array.isArray(
      horario.profesor_ids
    )
      ? [...horario.profesor_ids]
          .map(Number)
          .sort((a, b) => a - b)
          .join(",")
      : "";

    const clave = [
      horario.actividad_id,
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
      !grupos[clave].dias.includes(
        horario.dia
      )
    ) {
      grupos[clave].dias.push(
        horario.dia
      );
    }
  });

  return Object.values(grupos).map(
    (grupo) => {
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
          `${grupo.dias[0]} y ${grupo.dias[1]}`;
      } else {
        diasTexto =
          grupo.dias
            .slice(0, -1)
            .join(", ") +
          " y " +
          grupo.dias[
            grupo.dias.length - 1
          ];
      }

      return {
        ...grupo,
        diasTexto,
      };
    }
  );
}, [horariosFiltrados]);

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

  function formatearHora(hora) {
    if (!hora) return "";

    return String(hora).slice(0, 5);
  }
  function formatearFecha(fecha) {
  if (!fecha) return "";

  const fechaLocal = new Date(
    `${String(fecha).slice(0, 10)}T00:00:00`
  );

  return fechaLocal.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
}


const eventosProximos = useMemo(() => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return eventos
    .filter((evento) => {
      if (!evento.activa) return false;
      if (!evento.fecha) return false;

      const fechaEvento = new Date(
        `${String(evento.fecha).slice(0, 10)}T00:00:00`
      );

      return fechaEvento >= hoy;
    })
    .sort((a, b) => {
      const fechaA = new Date(
        `${String(a.fecha).slice(0, 10)}T00:00:00`
      );

      const fechaB = new Date(
        `${String(b.fecha).slice(0, 10)}T00:00:00`
      );

      return fechaA - fechaB;
    })
    .slice(0, 3);
}, [eventos]);

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

  function obtenerCartel(actividad) {
  // Primero utilizamos el cartel guardado
  // desde Administración.
  if (actividad?.imagen) {
    return actividad.imagen;
  }

  // Respaldo para las actividades que todavía
  // no tengan imagen guardada en MySQL.
  const nombre = String(
    actividad?.nombre || ""
  ).toLowerCase();

  if (nombre.includes("bachata")) {
    return "/actividades/bachata.webp";
  }

  if (nombre.includes("salsa")) {
    return "/actividades/salsa.webp";
  }

  if (
    nombre.includes("salón") ||
    nombre.includes("salon")
  ) {
    return "/actividades/bailes-de-salon.webp";
  }

  if (nombre.includes("ladies")) {
    return "/actividades/ladies-style.webp";
  }

  if (nombre.includes("ballet")) {
    return "/actividades/ballet.webp";
  }

  if (
    nombre.includes("barré") ||
    nombre.includes("barre")
  ) {
    return "/actividades/fitness-barre.webp";
  }

  if (nombre.includes("urbano")) {
    return "/actividades/baile-urbano.webp";
  }

  if (
    nombre.includes("k-pop") ||
    nombre.includes("kpop")
  ) {
    return "/actividades/kpop.webp";
  }

  return null;
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

            <small>
              ARTES ESCÉNICAS
            </small>

            <strong>
              PA<span>R</span>ADISE
            </strong>

            <div className="brand-subtitle">
              <i></i>

              <b>
                ESCUELA DE BAILE
              </b>

              <i></i>
            </div>

            <div className="brand-star">
              ★
            </div>

          </span>

        </a>


        <nav
          className={
            menuAbierto
              ? "mobile-open"
              : ""
          }
        >

          <a
            href="#clases"
            onClick={cerrarMenu}
          >
            Clases
          </a>

          <a
            href="#horarios"
            onClick={cerrarMenu}
          >
            Horarios
          </a>
              <a
  href="#eventos"
  onClick={cerrarMenu}
>
  Eventos
</a>

          <a
            href="#profesores"
            onClick={cerrarMenu}
          >
            Profesores
          </a>

          <a
            href="#escuela"
            onClick={cerrarMenu}
          >
            La escuela
          </a>

          <a
            href="#contacto"
            onClick={cerrarMenu}
          >
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
            menuAbierto
              ? "active"
              : ""
          }`}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          onClick={() =>
            setMenuAbierto(
              !menuAbierto
            )
          }
        >

          <span></span>
          <span></span>
          <span></span>

        </button>

      </header>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        id="inicio"
        className="hero"
      >

        <div className="hero-glow"></div>


        <div className="hero-copy">

          <p className="eyebrow">
            ESCUELA DE BAILE · LUCENA
          </p>


         <h1 aria-label="Escuela de baile en Lucena">
  <span aria-hidden="true">
    BAILA
    <span className="dot">.</span>
  </span>

  <em aria-hidden="true">
    DISFRUTA
    <span className="dot">.</span>
  </em>

  <span aria-hidden="true">
    CONECTA
    <span className="dot">.</span>
  </span>
</h1>

<p className="seo-title">
  Escuela de baile en Lucena
</p>


          <div className="hero-line"></div>


          <p className="hero-text">
            Un espacio para aprender,
            compartir y vivir el baile.
            Encuentra tu estilo, conoce
            a tu gente y empieza a moverte.
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

            <strong>
              BAILA
            </strong>

            <span>
              CON NOSOTROS
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          FRANJA INFORMACIÓN
      ====================================================== */}

      <section className="quick-info">

        <div className="quick-item">

          <span className="quick-icon">
            ⌖
          </span>

          <div>

            <strong>
              CARRETERA DE RUTE 15
            </strong>

            <span>
              LUCENA, CÓRDOBA
            </span>

          </div>

        </div>


        <div className="quick-item">

          <span className="quick-icon">
            ◉
          </span>

          <div>

            <strong>
              676 421 944
            </strong>

            <span className="pink-text">
              WHATSAPP
            </span>

          </div>

        </div>


        <div className="quick-item">

          <span className="quick-icon">
            ◎
          </span>

          <div>

            <strong>
              @ARTESCENICASPARADISE
            </strong>

            <span className="pink-text">
              SÍGUENOS
            </span>

          </div>

        </div>


        <div className="quick-message">

          <span>

            No se trata de ser el mejor,
            <br />

            se trata de{" "}
            <em>
              disfrutar
            </em>{" "}
            el camino.

          </span>

          <b>
            ♡
          </b>

        </div>

      </section>


      {/* =====================================================
          ACTIVIDADES
      ====================================================== */}

      <section
        id="clases"
        className="section activities-section"
      >

        <div className="section-head">

          <div>

            <p className="eyebrow">
              ENCUENTRA TU ESTILO
            </p>

            <h2>
              Clases para{" "}
              <em>
                todos
              </em>
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
              (actividad) => {

                const cartel =
                  obtenerCartel(
                    actividad
                  );

                return (

                  <article
                    className="card card-poster"
                    key={actividad.id}
                  >

                    {cartel ? (

                      <button
                        type="button"
                        className="card-poster-button"
                        onClick={() =>
                          setCartelAbierto({
                            src: cartel,
                            nombre:
                              actividad.nombre,
                          })
                        }
                        aria-label={
                          `Ver cartel de ${actividad.nombre} en grande`
                        }
                      >

                        <img
                          src={cartel}
                          alt={
                            `Cartel de ${actividad.nombre}`
                          }
                          className="card-poster-image"
                          loading="lazy"
                        />


                        <span className="card-poster-overlay">

                          <strong>
                            VER CARTEL
                          </strong>

                          <small>
                            AMPLIAR
                          </small>

                        </span>

                      </button>

                    ) : (

                      <div className="card-image-placeholder">

                        <span>
                          {obtenerIcono(
                            actividad.nombre
                          )}
                        </span>

                        <small>
                          PRÓXIMAMENTE
                        </small>

                      </div>

                    )}


                    <div className="card-content">

                      <h3>
                        {actividad.nombre}
                      </h3>


                      <p>
                        {actividad.descripcion ||
                          "Descubre esta actividad y disfruta del baile con nosotros."}
                      </p>


                      <a
  href="#horarios"
  onClick={() =>
    setFiltroActividad(
      String(actividad.id)
    )
  }
>
  VER HORARIOS →
</a>
                    </div>

                  </article>

                );
              }
            )}

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

  ) : horariosAgrupados.length ===
    0 ? (

    <div className="vacio-web">
      No hay horarios disponibles
      para esta actividad.
    </div>

  ) : (

    horariosAgrupados.map(
      (horario) => {

        const profesoresHorario =
          obtenerProfesoresHorario(
            horario
          );

        return (

          <div
            className="schedule-row"
            key={`${horario.actividad_id}-${horario.hora_inicio}-${horario.hora_fin}-${horario.nivel || ""}-${horario.diasTexto}`}
          >

            <strong>
              {horario.diasTexto}
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
                .map(
                  (profesor) =>
                    profesor.nombre
                )
                .join(" · ")}

            </span>

          </div>

        );

      }
    )

  )}

</div>

</section>
{/* =====================================================
    EVENTOS
====================================================== */}

{eventosProximos.length > 0 && (
  <section
    id="eventos"
    className="section events-section"
  >

    <div className="section-head">

      <div>

        <p className="eyebrow">
          VIVE EL BAILE
        </p>

        <h2>
          Próximos <em>eventos</em>
        </h2>

      </div>

      <p>
        Mucho más que clases.
        <br />
        Vive también nuestros eventos.
      </p>

    </div>


    <div className="events-grid">

      {eventosProximos.map((evento) => {

        const informacionAbierta =
          eventoAbierto === evento.id;

        return (

          <article
            className="event-card"
            key={evento.id}
          >

            {/* CARTEL */}

            {evento.imagen ? (

              <div className="event-image">

                <img
                  src={evento.imagen}
                  alt={evento.titulo}
                  loading="lazy"
                />

              </div>

            ) : (

              <div className="event-image event-image-placeholder">
                <span>🎉</span>
              </div>

            )}


            {/* INFORMACIÓN PRINCIPAL */}

            <div className="event-content">

              <div className="event-date">

                <strong>
                  {formatearFecha(evento.fecha)}
                </strong>

                {evento.hora && (
                  <strong>
                    {formatearHora(evento.hora)}
                  </strong>
                )}

              </div>


              <h3>
                {evento.titulo}
              </h3>


              {evento.lugar && (
                <div className="event-place">
                  📍 {evento.lugar}
                </div>
              )}


              {/* BOTÓN MÁS INFORMACIÓN */}

              {evento.descripcion && (

                <>

                  <button
                    type="button"
                    className="event-more-button"
                    onClick={() =>
                      setEventoAbierto(
                        informacionAbierta
                          ? null
                          : evento.id
                      )
                    }
                    aria-expanded={informacionAbierta}
                  >

                    {informacionAbierta
                      ? "− OCULTAR INFORMACIÓN"
                      : "+ MÁS INFORMACIÓN"}

                  </button>


                  {/* DESCRIPCIÓN DESPLEGABLE */}

                  {informacionAbierta && (

                    <div className="event-description">

                      {evento.descripcion}

                    </div>

                  )}

                </>

              )}

            </div>

          </article>

        );

      })}

    </div>

  </section>
)}
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
              (profesor) => (

                <article
                  className="teacher-card"
                  key={profesor.id}
                >

                  <div className="teacher-photo">

                    {profesor.foto ? (

                      <img
  src={profesor.foto}
  alt={profesor.nombre}
  loading="eager"
  style={{
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }}
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

              )
            )}

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

          <img
            src="/footer-paradise.png"
            alt="Artes Escénicas Paradise, escuela de baile en Lucena"
          />

        </div>


        <div className="story-copy">

          <p className="eyebrow">
            MUCHO MÁS QUE UNA ESCUELA
          </p>


          <h2>
            Tu escuela de{" "}
            <em>
              baile en Lucena
            </em>
          </h2>


          <p>
            En Artes Escénicas Paradise somos una escuela de baile en Lucena
            donde puedes aprender, disfrutar y compartir tu pasión por el baile.
            Creamos un espacio cercano y dinámico para que cada persona encuentre
            su estilo y disfrute de cada clase.
          </p>


          <p>
            Ofrecemos clases de Bachata, Salsa, Bailes de Salón, Ballet Clásico,
            K-Pop, Baile Urbano, Ladies Style, Fitness Barré y otras actividades
            para diferentes edades y niveles. Nuestro equipo de profesores te
            acompaña desde tus primeros pasos hasta el perfeccionamiento de tu
            técnica.
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


      {/* =====================================================
    CONTACTO
====================================================== */}

<section
  id="contacto"
  className="contact section"
>

  <div className="contact-info">

    <p className="eyebrow">
      DA EL PRIMER PASO
    </p>

    <h2>
      ¿Quieres{" "}
      <em>
        bailar
      </em>{" "}
      con nosotros?
    </h2>

    <p>
      Ponte en contacto con nosotros.
      Te ayudaremos a encontrar la clase
      que mejor se adapte a ti.
    </p>


    <div className="contact-details">

  <a
    href="tel:+34676421944"
    className="contact-detail"
  >
    <span className="contact-detail-icon">
      📞
    </span>

    <span className="contact-detail-text">
      <strong>
        676 421 944
      </strong>

      <small>
        LLÁMANOS
      </small>
    </span>
  </a>


  <a
    href="https://wa.me/34676421944?text=Hola%2C%20estoy%20interesado%2Fa%20en%20las%20clases%20de%20Artes%20Esc%C3%A9nicas%20Paradise."
    target="_blank"
    rel="noopener noreferrer"
    className="contact-detail contact-whatsapp"
  >
    <span className="contact-detail-icon">
      💬
    </span>

    <span className="contact-detail-text">
      <strong>
        WhatsApp
      </strong>

      <small>
        RESPUESTA RÁPIDA
      </small>
    </span>
  </a>


  <a
    href="mailto:info@lucenabaila.com"
    className="contact-detail"
  >
    <span className="contact-detail-icon">
      ✉
    </span>

    <span className="contact-detail-text">
      <strong>
        info@lucenabaila.com
      </strong>

      <small>
        ENVÍANOS UN EMAIL
      </small>
    </span>
  </a>


  <div className="contact-detail">
    <span className="contact-detail-icon">
      📍
    </span>

    <span className="contact-detail-text">
      <strong>
        Carretera de Rute, 15
      </strong>

      <small>
        14900 LUCENA · CÓRDOBA
      </small>
    </span>
  </div>

</div>

</div>

  <div className="contact-right">

    <form
      className="form"
      onSubmit={(event) => {

        event.preventDefault();

        const formData =
          new FormData(event.currentTarget);

        const nombre =
          formData.get("nombre") || "";

        const telefono =
          formData.get("telefono") || "";

        const actividadId =
          formData.get("actividad") || "";

        const actividadSeleccionada =
          actividades.find(
            (actividad) =>
              String(actividad.id) ===
              String(actividadId)
          );

        const actividadNombre =
          actividadSeleccionada?.nombre ||
          "una actividad de la escuela";
        const mensajePersonalizado =
  formData.get("mensaje") || "";

        const mensaje =
  `Hola, soy ${nombre}. Estoy interesado/a en ${actividadNombre}. Mi teléfono es ${telefono}.` +
  (mensajePersonalizado
    ? `\n\nMensaje:\n${mensajePersonalizado}`
    : "");

        const whatsappUrl =
          `https://wa.me/34676421944?text=${encodeURIComponent(
            mensaje
          )}`;

        window.open(
          whatsappUrl,
          "_blank",
          "noopener,noreferrer"
        );

      }}
    >

      <input
        name="nombre"
        aria-label="Nombre"
        placeholder="Tu nombre"
        required
      />


      <input
        name="telefono"
        aria-label="Teléfono"
        placeholder="Teléfono"
        type="tel"
        required
      />


      <select
        name="actividad"
        aria-label="Actividad"
        defaultValue=""
        required
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
              key={actividad.id}
              value={actividad.id}
            >
              {actividad.nombre}
            </option>

          )
        )}

      </select>
            <textarea
  name="mensaje"
  aria-label="Mensaje"
  placeholder="Cuéntanos qué necesitas o qué quieres preguntarnos..."
  rows="5"
/>


      <button
        className="button primary"
        type="submit"
      >
        💬 SOLICITAR INFORMACIÓN POR WHATSAPP
      </button>

    </form>


    <div className="contact-map">

      <div className="contact-map-header">

        <div>

          <p className="eyebrow">
            ENCUÉNTRANOS
          </p>

          <strong>
            Carretera de Rute, 15 · Lucena
          </strong>

        </div>


        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Carretera%20de%20Rute%2C%2015%2C%2014900%20Lucena%2C%20C%C3%B3rdoba&travelmode=driving"
          target="_blank"
          rel="noopener noreferrer"
          className="map-button"
        >
          📍 CÓMO LLEGAR
        </a>

      </div>


      <iframe
        title="Mapa de Artes Escénicas Paradise"
        src="https://www.google.com/maps?q=Carretera%20de%20Rute%2C%2015%2C%2014900%20Lucena%2C%20C%C3%B3rdoba&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>

    </div>

  </div>

</section>


      {/* =====================================================
          VENTANA EMERGENTE DEL CARTEL
      ====================================================== */}

      {cartelAbierto && (

        <div
          className="poster-modal"
          role="dialog"
          aria-modal="true"
          aria-label={
            `Cartel de ${cartelAbierto.nombre}`
          }
          onClick={() =>
            setCartelAbierto(null)
          }
        >

          <div
            className="poster-modal-inner"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="poster-modal-close"
              onClick={() =>
                setCartelAbierto(null)
              }
              aria-label="Cerrar cartel"
            >
              ×
            </button>


            <img
              src={cartelAbierto.src}
              alt={
                `Cartel de ${cartelAbierto.nombre}`
              }
              className="poster-modal-image"
            />

          </div>

        </div>

      )}


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer>

  <div className="footer-logo">

    <span className="footer-logo-mark">
      P
    </span>

    <div>

      <small>
        ARTES ESCÉNICAS
      </small>

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


      {/* =====================================================
          ESTILOS DEL VISOR DE CARTELES
      ====================================================== */}

      <style jsx>{`

        .card-poster {
          overflow: hidden;
        }


        .card-poster-button {
          position: relative;

          display: block;

          width: 100%;

          padding: 0;

          border: 0;

          background: transparent;

          cursor: pointer;

          overflow: hidden;
        }


        .card-poster-image {
          display: block;

          width: 100%;

          aspect-ratio: 2 / 3;

          object-fit: cover;

          transition:
            transform .35s ease;
        }


        .card-poster-button:hover
        .card-poster-image {
          transform: scale(1.035);
        }


        .card-poster-overlay {
  position: absolute;

  left: 14px;
  right: 14px;
  bottom: 14px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  padding: 12px 16px;

  border-radius: 999px;

  background: #ff8a00;

  color: #fff;

  font-size: 13px;

  font-weight: 800;

  letter-spacing: .08em;

  opacity: 1;

  transform: translateY(0);

  transition:
    background .25s ease,
    transform .25s ease;
}


        .card-poster-overlay strong {
          font-size: 13px;
        }


        .card-poster-overlay small {
          font-size: 9px;

          opacity: .85;

          letter-spacing: .08em;
        }


        .card-poster-button:hover
        .card-poster-overlay,

        .card-poster-button:focus-visible
        .card-poster-overlay {
          opacity: 1;

          transform:
            translateY(0);
        }

/* ============================
   EVENTOS
============================ */

.events-section {
  position: relative;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.event-card {
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, .04);
  border: 1px solid rgba(255, 255, 255, .08);
  transition:
    transform .3s ease,
    border-color .3s ease;
}

.event-card:hover {
  transform: translateY(-6px);
  border-color: #ff8a00;
}


/* CARTEL */

.event-image {
  width: 100%;
  height: 320px;
  overflow: hidden;
  background: #181818;

  display: flex;
  align-items: center;
  justify-content: center;
}

.event-image img {
  display: block;
  width: 100%;
  height: 100%;

  /* IMPORTANTE:
     muestra el cartel COMPLETO */
  object-fit: contain;

  transition: transform .4s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.02);
}


/* SIN CARTEL */

.event-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 54px;
}


/* CONTENIDO */

.event-content {
  padding: 22px;
}


/* FECHA Y HORA GRANDES */

.event-date {
  display: flex;
  flex-direction: column;
  gap: 3px;

  margin-bottom: 12px;

  color: #ff8a00;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.event-date strong:first-child {
  font-size: 24px;
  line-height: 1.15;
}

.event-date strong:last-child {
  font-size: 20px;
  line-height: 1.15;
}


/* TÍTULO */

.event-content h3 {
  margin: 0 0 10px;
  font-size: 23px;
}


/* LUGAR */

.event-place {
  margin-bottom: 15px;

  font-size: 13px;
  font-weight: 700;
  opacity: .85;
}


/* BOTÓN MÁS INFORMACIÓN */

.event-more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  margin-top: 4px;
  padding: 10px 15px;

  border: 1px solid #ff8a00;
  border-radius: 999px;

  background: transparent;
  color: #ff8a00;

  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;

  cursor: pointer;

  transition:
    background .25s ease,
    color .25s ease,
    transform .25s ease;
}

.event-more-button:hover {
  background: #ff8a00;
  color: #fff;
  transform: translateY(-1px);
}


/* DESCRIPCIÓN DESPLEGABLE */

.event-description {
  margin-top: 16px;
  padding-top: 16px;

  border-top: 1px solid rgba(255, 255, 255, .10);

  line-height: 1.6;
  font-size: 14px;
  opacity: .82;

  animation: eventDescriptionIn .25s ease;
}

@keyframes eventDescriptionIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}


/* ============================
   EVENTOS — MÓVIL
============================ */

@media (max-width: 900px) {

  .events-grid {
    grid-template-columns: 1fr 1fr;
  }

  .event-image {
    height: 300px;
  }

}

@media (max-width: 700px) {

  .events-grid {
    grid-template-columns: 1fr;
  }

  .event-image {
    height: 360px;
  }

  .event-content {
    padding: 20px;
  }

  .event-date strong:first-child {
    font-size: 22px;
  }

  .event-date strong:last-child {
    font-size: 19px;
  }

}
        /* ============================
           MODAL
           ============================ */

        .poster-modal {
          position: fixed;

          z-index: 9999;

          inset: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 24px;

          background:
            rgba(0, 0, 0, .88);

          backdrop-filter:
            blur(8px);
        }


        .poster-modal-inner {
          position: relative;

          display: flex;

          align-items: center;

          justify-content: center;

          width: auto;

          max-width:
            min(92vw, 850px);

          max-height: 94vh;
        }


        .poster-modal-image {
          display: block;

          width: auto;

          max-width: 100%;

          max-height: 94vh;

          object-fit: contain;

          border-radius: 10px;

          box-shadow:
            0 20px 70px
            rgba(0, 0, 0, .65);
        }


        .poster-modal-close {
          position: absolute;

          z-index: 2;

          top: -18px;

          right: -18px;

          width: 44px;

          height: 44px;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 0;

          border:
            2px solid
            rgba(255, 255, 255, .8);

          border-radius: 50%;

          background:
            #ff8a00;

          color: #fff;

          font-size: 31px;

          line-height: 1;

          cursor: pointer;

          box-shadow:
            0 8px 25px
            rgba(0, 0, 0, .45);
        }


        .poster-modal-close:hover {
          background:
            #ffad33;

          transform:
            scale(1.05);
        }


        /* ============================
           MÓVIL
           ============================ */

        @media (max-width: 700px) {

          .poster-modal {
            padding: 12px;
          }


          .poster-modal-inner {
            max-width: 96vw;

            max-height: 92vh;
          }


          .poster-modal-image {
            max-width: 96vw;

            max-height: 92vh;

            border-radius: 7px;
          }


          .poster-modal-close {
            top: -8px;

            right: -4px;

            width: 40px;

            height: 40px;

            font-size: 28px;
          }


          .card-poster-overlay {
            opacity: 1;

            transform: none;

            font-size: 10px;

            padding: 9px 12px;
          }


          .card-poster-overlay strong {
            font-size: 10px;
          }


          .card-poster-overlay small {
            font-size: 8px;
          }

        }

      `}</style>

    </main>
  );
}
