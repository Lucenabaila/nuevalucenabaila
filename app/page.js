"use client";

import { useEffect, useMemo, useState } from "react";


// =========================================================
// ICONOS PARA ACTIVIDADES
// =========================================================

function obtenerIcono(nombre = "") {

  const texto =
    nombre.toLowerCase();

  if (texto.includes("salsa")) {
    return "💃";
  }

  if (texto.includes("bachata")) {
    return "🔥";
  }

  if (texto.includes("ballet")) {
    return "🩰";
  }

  if (
    texto.includes("urbano") ||
    texto.includes("funky") ||
    texto.includes("hip hop") ||
    texto.includes("hip-hop")
  ) {
    return "⚡";
  }

  if (
    texto.includes("k-pop") ||
    texto.includes("kpop")
  ) {
    return "✨";
  }

  if (
    texto.includes("barré") ||
    texto.includes("barre")
  ) {
    return "🌸";
  }

  if (texto.includes("ladies")) {
    return "💫";
  }

  return "🎶";
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

export default function Home() {

  const [
    actividades,
    setActividades,
  ] = useState([]);

  const [
    horarios,
    setHorarios,
  ] = useState([]);

  const [
    profesores,
    setProfesores,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    filtroActividad,
    setFiltroActividad,
  ] = useState("todas");


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

          fetch(
            "/api/actividades",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/horarios",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/profesores",
            {
              cache: "no-store",
            }
          ),

        ]);


        if (
          !respuestaActividades.ok
        ) {

          throw new Error(
            "No se pudieron cargar las actividades."
          );

        }


        if (
          !respuestaHorarios.ok
        ) {

          throw new Error(
            "No se pudieron cargar los horarios."
          );

        }


        if (
          !respuestaProfesores.ok
        ) {

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


        if (
          !datosActividades.correcto
        ) {

          throw new Error(
            datosActividades.mensaje ||
            "Error cargando actividades."
          );

        }


        if (
          !datosHorarios.correcto
        ) {

          throw new Error(
            datosHorarios.mensaje ||
            "Error cargando horarios."
          );

        }


        if (
          !datosProfesores.correcto
        ) {

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
          Array.isArray(
            datosHorarios.horarios
          )
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

  const horariosFiltrados =
    useMemo(() => {

      if (
        filtroActividad === "todas"
      ) {

        return horarios;

      }


      return horarios.filter(
        (horario) =>
          Number(
            horario.actividad_id
          ) ===
          Number(
            filtroActividad
          )
      );

    }, [
      horarios,
      filtroActividad,
    ]);


  // =======================================================
  // OBTENER NOMBRES DE PROFESORES
  // =======================================================

  function obtenerProfesoresHorario(
    horario
  ) {

    if (
      !Array.isArray(
        horario.profesor_ids
      )
    ) {

      return [];

    }


    return horario.profesor_ids
      .map(
        (profesorId) =>
          profesores.find(
            (profesor) =>
              Number(
                profesor.id
              ) ===
              Number(
                profesorId
              )
          )
      )
      .filter(Boolean);

  }


  // =======================================================
  // FORMATO DE HORA
  // =======================================================

  function formatearHora(
    hora
  ) {

    if (!hora) {
      return "";
    }


    return String(
      hora
    ).slice(0, 5);

  }


  // =======================================================
  // ACTIVIDADES DE UN PROFESOR
  // =======================================================

  function obtenerActividadesProfesor(
    profesor
  ) {

    if (
      !Array.isArray(
        profesor.actividad_ids
      )
    ) {

      return [];

    }


    return profesor.actividad_ids
      .map(
        (actividadId) =>
          actividades.find(
            (actividad) =>
              Number(
                actividad.id
              ) ===
              Number(
                actividadId
              )
          )
      )
      .filter(Boolean);

  }


  // =========================================================
// RENDER
// =========================================================

return (

  <main>

    {/* =================================================
        NAVEGACIÓN
    ================================================= */}

    <header className="nav">

  <a
    className="brand"
    href="#inicio"
    aria-label="Artes Escénicas Paradise"
  >

    <span className="brand-mark">
      AP
    </span>

    <span>
      Artes Escénicas{" "}
      <strong>
        Paradise
      </strong>
    </span>

  </a>


  <nav>

    <a href="#clases">
      Clases
    </a>

    <a href="#horarios">
      Horarios
    </a>

    <a href="#profesores">
      Profesores
    </a>

    <a href="#escuela">
      La escuela
    </a>

    <a href="#contacto">
      Contacto
    </a>

  </nav>


  <a
    className="nav-cta"
    href="#contacto"
  >
    Prueba una clase
  </a>

</header>

{/* =================================================
    HERO
================================================= */}

<section
  id="inicio"
  className="hero"
>

  <div className="hero-copy">

    <p className="eyebrow">
      ARTES ESCÉNICAS · LUCENA
    </p>

    <h1>
      Baila.
      <br />
      <em>Disfruta.</em>
      <br />
      Conecta.
    </h1>

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
        Ver actividades
      </a>

      <a
        className="button secondary"
        href="#contacto"
      >
        Quiero probar una clase
      </a>

    </div>

  </div>


  <div
    className="hero-art"
    aria-label="Artes Escénicas Paradise"
  >

    <img
      src="/hero.jpg"
      alt="Artes Escénicas Paradise"
      className="hero-image"
    />

    <div className="hero-overlay"></div>


    <div className="hero-sticker">

      BAILA

      <br />

      <span>
        CON NOSOTROS
      </span>

    </div>

  </div>

</section>

    {/* =================================================
        ACTIVIDADES
    ================================================= */}

    <section
      id="clases"
      className="section"
    >

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
                key={
                  actividad.id
                }
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
                  Más información →
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


        <a
          className="text-link"
          href="#contacto"
        >
          Consultar todos →
        </a>

      </div>


      {/* FILTRO DE ACTIVIDADES */}

      {!cargando &&
        actividades.length > 0 && (

          <div
            style={{
              display:
                "flex",
              flexWrap:
                "wrap",
              gap:
                "10px",
              marginBottom:
                "30px",
            }}
          >

            <button
              type="button"
              onClick={() =>
                setFiltroActividad(
                  "todas"
                )
              }
              style={{
                padding:
                  "10px 16px",

                border:
                  filtroActividad ===
                  "todas"
                    ? "1px solid var(--ink)"
                    : "1px solid var(--line)",

                background:
                  filtroActividad ===
                  "todas"
                    ? "var(--ink)"
                    : "var(--white)",

                color:
                  filtroActividad ===
                  "todas"
                    ? "var(--white)"
                    : "var(--ink)",

                cursor:
                  "pointer",

                fontSize:
                  "12px",

                fontWeight:
                  "700",
              }}
            >
              Todas
            </button>


            {actividades.map(
              (actividad) => (

                <button
                  key={
                    actividad.id
                  }
                  type="button"
                  onClick={() =>
                    setFiltroActividad(
                      String(
                        actividad.id
                      )
                    )
                  }
                  style={{
                    padding:
                      "10px 16px",

                    border:
                      Number(
                        filtroActividad
                      ) ===
                      Number(
                        actividad.id
                      )
                        ? "1px solid var(--ink)"
                        : "1px solid var(--line)",

                    background:
                      Number(
                        filtroActividad
                      ) ===
                      Number(
                        actividad.id
                      )
                        ? "var(--ink)"
                        : "var(--white)",

                    color:
                      Number(
                        filtroActividad
                      ) ===
                      Number(
                        actividad.id
                      )
                        ? "var(--white)"
                        : "var(--ink)",

                    cursor:
                      "pointer",

                    fontSize:
                      "12px",

                    fontWeight:
                      "700",
                  }}
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
            No se pudieron cargar los horarios.
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
                  key={
                    horario.id
                  }
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


                  <span>

                    {
                      horario.actividad_nombre
                    }

                    {horario.nivel && (
                      <>
                        {" · "}
                        {
                          horario.nivel
                        }
                      </>
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
      className="section"
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

        <div className="cards">

          {profesores.map(
            (profesor) => {

              const actividadesProfesor =
                obtenerActividadesProfesor(
                  profesor
                );


              return (

                <article
                  className="card"
                  key={
                    profesor.id
                  }
                  style={{
                    minHeight:
                      "auto",
                  }}
                >

                  {/* FOTO */}

                  <div
                    style={{
                      width:
                        "100%",
                      height:
                        "300px",
                      marginBottom:
                        "25px",
                      overflow:
                        "hidden",
                      background:
                        "var(--soft)",
                    }}
                  >

                    {profesor.foto ? (

                      <img
                        src={
                          profesor.foto
                        }
                        alt={
                          profesor.nombre
                        }
                        style={{
                          width:
                            "100%",
                          height:
                            "100%",
                          objectFit:
                            "cover",
                          display:
                            "block",
                        }}
                      />

                    ) : (

                      <div
                        style={{
                          width:
                            "100%",
                          height:
                            "100%",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          fontSize:
                            "55px",
                        }}
                      >
                        👤
                      </div>

                    )}

                  </div>


                  <h3
                    style={{
                      marginTop:
                        "0",
                    }}
                  >
                    {profesor.nombre}
                  </h3>


                  <p>
                    {profesor.descripcion ||
                      "Profesor de la Escuela Artes Escénicas Paradise."}
                  </p>


                  {/* ACTIVIDADES */}

                  {actividadesProfesor.length >
                    0 && (

                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap:
                          "7px",
                        marginTop:
                          "15px",
                      }}
                    >

                      {actividadesProfesor.map(
                        (actividad) => (

                          <span
                            key={
                              actividad.id
                            }
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "6px 9px",
                              background:
                                "var(--soft)",
                              fontSize:
                                "11px",
                              fontWeight:
                                "700",
                            }}
                          >
                            {
                              actividad.nombre
                            }
                          </span>

                        )
                      )}

                    </div>

                  )}


                  <a
                    href="#contacto"
                    style={{
                      marginTop:
                        "18px",
                    }}
                  >
                    Más información →
                  </a>

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

        <span>
          FOTO DE LA ESCUELA
        </span>

      </div>


      <div className="story-copy">

        <p className="eyebrow">
          MUCHO MÁS QUE UNA ESCUELA
        </p>


        <h2>
          Un lugar para{" "}
          <em>
            sentirte tú
          </em>
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
          Conoce la escuela
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
        Quiero probar
      </a>

    </section>


    {/* =================================================
        CONTACTO
    ================================================= */}

    <section
      id="contacto"
      className="contact section"
    >

      <div>

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
          Solicitar información
        </button>

      </form>

    </section>


    {/* =================================================
        ERROR DE CARGA
    ================================================= */}

    {error && (

      <div
        style={{
          maxWidth:
            "1100px",
          margin:
            "0 auto 40px",
          padding:
            "15px 6vw",
          color:
            "var(--muted)",
          fontSize:
            "12px",
        }}
      >
        {error}
      </div>

    )}


    {/* =================================================
        FOOTER
    ================================================= */}

    <footer>

      <div
        className="brand footer-brand"
      >

        <span className="brand-mark">
          LB
        </span>

        <span>
          Lucena <strong>Baila</strong>
        </span>

      </div>


      <p>
        Escuela de baile · Lucena
      </p>


      <p>
        ©{" "}
        {new Date().getFullYear()}
        {" "}
        Lucena Baila
      </p>

    </footer>

  </main>

);

}
