"use client";

import { useEffect, useState } from "react";

const secciones = [
  { id: "actividades", icono: "💃", nombre: "Actividades" },
  { id: "profesores", icono: "👥", nombre: "Profesores" },
  { id: "horarios", icono: "🕐", nombre: "Horarios" },
  { id: "eventos", icono: "📅", nombre: "Eventos" },
  { id: "galeria", icono: "🖼️", nombre: "Galería" },
  { id: "mensajes", icono: "📩", nombre: "Mensajes" },
];

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function AdminPage() {
  const [seccion, setSeccion] = useState("actividades");

  const [actividades, setActividades] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [horarios, setHorarios] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [nuevaActividad, setNuevaActividad] = useState("");

  const [nuevoProfesor, setNuevoProfesor] = useState({
    nombre: "",
    descripcion: "",
    actividadIds: [],
  });

  const [profesorEditando, setProfesorEditando] = useState(null);

  const [nuevoHorario, setNuevoHorario] = useState({
    actividadId: "",
    dia: "Lunes",
    horaInicio: "",
    horaFin: "",
    nivel: "",
    profesorIds: [],
    orden: 0,
  });

  const [horarioEditando, setHorarioEditando] = useState(null);

  useEffect(() => {
    cargarActividades();
    cargarProfesores();
    cargarHorarios();
  }, []);

  async function cargarActividades() {
    try {
      const respuesta = await fetch("/api/actividades", {
        cache: "no-store",
      });

      const datos = await respuesta.json();

      if (datos.correcto) {
        setActividades(datos.actividades || []);
      }
    } catch (error) {
      console.error("Error cargando actividades:", error);
      setMensaje("❌ No se pudieron cargar las actividades.");
    } finally {
      setCargando(false);
    }
  }

  async function cargarProfesores() {
    try {
      const respuesta = await fetch("/api/profesores", {
        cache: "no-store",
      });

      const datos = await respuesta.json();

      if (datos.correcto) {
        setProfesores(datos.profesores || []);
      }
    } catch (error) {
      console.error("Error cargando profesores:", error);
      setMensaje("❌ No se pudieron cargar los profesores.");
    }
  }

  async function cargarHorarios() {
    try {
      const respuesta = await fetch("/api/horarios", {
        cache: "no-store",
      });

      const datos = await respuesta.json();

      if (datos.correcto) {
        setHorarios(datos.horarios || []);
      }
    } catch (error) {
      console.error("Error cargando horarios:", error);
      setMensaje("❌ No se pudieron cargar los horarios.");
    }
  }

  async function agregarActividad(event) {
    event.preventDefault();

    const nombre = nuevaActividad.trim();

    if (!nombre) {
      setMensaje("⚠️ Escribe el nombre de la actividad.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const respuesta = await fetch("/api/actividades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          descripcion: "",
          orden: actividades.length,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        throw new Error(
          datos.mensaje || "No se pudo crear la actividad"
        );
      }

      setNuevaActividad("");
      setMensaje("✅ Actividad creada correctamente.");

      await cargarActividades();
    } catch (error) {
      console.error(error);
      setMensaje(`❌ ${error.message}`);
    } finally {
      setGuardando(false);
    }
  }

  function cambiarActividadProfesor(id) {
    setNuevoProfesor((actual) => {
      const existe = actual.actividadIds.includes(id);

      return {
        ...actual,
        actividadIds: existe
          ? actual.actividadIds.filter(
              (actividadId) => actividadId !== id
            )
          : [...actual.actividadIds, id],
      };
    });
  }

  function cambiarActividadEdicion(id) {
    setProfesorEditando((actual) => {
      if (!actual) return actual;

      const existe = actual.actividadIds.includes(id);

      return {
        ...actual,
        actividadIds: existe
          ? actual.actividadIds.filter(
              (actividadId) => actividadId !== id
            )
          : [...actual.actividadIds, id],
      };
    });
  }

  async function agregarProfesor(event) {
    event.preventDefault();

    const nombre = nuevoProfesor.nombre.trim();

    if (!nombre) {
      setMensaje("⚠️ Escribe el nombre del profesor.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const respuesta = await fetch("/api/profesores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoProfesor),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        throw new Error(
          datos.mensaje || "No se pudo crear el profesor"
        );
      }

      setNuevoProfesor({
        nombre: "",
        descripcion: "",
        actividadIds: [],
      });

      setMensaje("✅ Profesor creado correctamente.");

      await cargarProfesores();
    } catch (error) {
      console.error(error);
      setMensaje(`❌ ${error.message}`);
    } finally {
      setGuardando(false);
    }
  }

  function comenzarEdicion(profesor) {
    setMensaje("");

    setProfesorEditando({
      id: profesor.id,
      nombre: profesor.nombre || "",
      descripcion: profesor.descripcion || "",
      actividadIds: profesor.actividad_ids || [],
    });
  }

  function cancelarEdicion() {
    setProfesorEditando(null);
  }

  async function guardarProfesor() {
    if (!profesorEditando) return;

    const nombre = profesorEditando.nombre.trim();

    if (!nombre) {
      setMensaje("⚠️ El nombre es obligatorio.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const respuesta = await fetch("/api/profesores", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: profesorEditando.id,
          nombre,
          descripcion: profesorEditando.descripcion.trim(),
          actividadIds: profesorEditando.actividadIds,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        throw new Error(
          datos.mensaje || "No se pudo actualizar el profesor"
        );
      }

      setProfesorEditando(null);
      setMensaje("✅ Profesor actualizado correctamente.");

      await cargarProfesores();
    } catch (error) {
      console.error(error);
      setMensaje(`❌ ${error.message}`);
    } finally {
      setGuardando(false);
    }
  }

  function cambiarProfesorHorario(id) {
    setNuevoHorario((actual) => {
      const existe = actual.profesorIds.includes(id);

      return {
        ...actual,
        profesorIds: existe
          ? actual.profesorIds.filter(
              (profesorId) => profesorId !== id
            )
          : [...actual.profesorIds, id],
      };
    });
  }

  function cambiarProfesorHorarioEdicion(id) {
    setHorarioEditando((actual) => {
      if (!actual) return actual;

      const existe = actual.profesorIds.includes(id);

      return {
        ...actual,
        profesorIds: existe
          ? actual.profesorIds.filter(
              (profesorId) => profesorId !== id
            )
          : [...actual.profesorIds, id],
      };
    });
  }

  async function agregarHorario(event) {
    event.preventDefault();

    if (!nuevoHorario.actividadId) {
      setMensaje("⚠️ Selecciona una actividad.");
      return;
    }

    if (!nuevoHorario.horaInicio || !nuevoHorario.horaFin) {
      setMensaje("⚠️ Indica la hora de inicio y de fin.");
      return;
    }

    if (nuevoHorario.profesorIds.length === 0) {
      setMensaje("⚠️ Selecciona al menos un profesor.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const respuesta = await fetch("/api/horarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoHorario),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        throw new Error(
          datos.mensaje || "No se pudo crear el horario"
        );
      }

      setNuevoHorario({
        actividadId: "",
        dia: "Lunes",
        horaInicio: "",
        horaFin: "",
        nivel: "",
        profesorIds: [],
        orden: horarios.length,
      });

      setMensaje("✅ Horario creado correctamente.");

      await cargarHorarios();
    } catch (error) {
      console.error(error);
      setMensaje(`❌ ${error.message}`);
    } finally {
      setGuardando(false);
    }
  }

  function comenzarEdicionHorario(horario) {
    setMensaje("");

    setHorarioEditando({
      id: horario.id,
      actividadId: horario.actividad_id,
      dia: horario.dia,
      horaInicio: horario.hora_inicio
        ? String(horario.hora_inicio).slice(0, 5)
        : "",
      horaFin: horario.hora_fin
        ? String(horario.hora_fin).slice(0, 5)
        : "",
      nivel: horario.nivel || "",
      profesorIds: horario.profesor_ids || [],
      activa: horario.activa,
      orden: horario.orden || 0,
    });
  }

  function cancelarEdicionHorario() {
    setHorarioEditando(null);
  }

  async function guardarHorario() {
    if (!horarioEditando) return;

    if (!horarioEditando.actividadId) {
      setMensaje("⚠️ Selecciona una actividad.");
      return;
    }

    if (
      !horarioEditando.horaInicio ||
      !horarioEditando.horaFin
    ) {
      setMensaje("⚠️ Indica la hora de inicio y de fin.");
      return;
    }

    if (horarioEditando.profesorIds.length === 0) {
      setMensaje("⚠️ Selecciona al menos un profesor.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const respuesta = await fetch("/api/horarios", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(horarioEditando),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        throw new Error(
          datos.mensaje || "No se pudo actualizar el horario"
        );
      }

      setHorarioEditando(null);
      setMensaje("✅ Horario actualizado correctamente.");

      await cargarHorarios();
    } catch (error) {
      console.error(error);
      setMensaje(`❌ ${error.message}`);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarHorario(id) {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar este horario?"
    );

    if (!confirmar) return;

    setGuardando(true);
    setMensaje("");

    try {
      const respuesta = await fetch("/api/horarios", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        throw new Error(
          datos.mensaje || "No se pudo eliminar el horario"
        );
      }

      setMensaje("✅ Horario eliminado correctamente.");

      await cargarHorarios();
    } catch (error) {
      console.error(error);
      setMensaje(`❌ ${error.message}`);
    } finally {
      setGuardando(false);
    }
  }

  function cambiarSeccion(id) {
    setSeccion(id);
    setMensaje("");
    setProfesorEditando(null);
    setHorarioEditando(null);
  }

  function nombreProfesor(id) {
    const profesor = profesores.find(
      (item) => item.id === id
    );

    return profesor ? profesor.nombre : "";
  }

  return (
    <main style={estilos.contenedor}>
      <aside style={estilos.menu}>
        <div style={estilos.logo}>
          <span style={estilos.logoMarca}>LB</span>

          <div>
            <strong>Lucena Baila</strong>
            <small style={{ display: "block", color: "#777" }}>
              Administración
            </small>
          </div>
        </div>

        <nav>
<nav style={estilos.navegacion}>
  {secciones.map((item) => (
            <button
              key={item.id}
              onClick={() => cambiarSeccion(item.id)}
              style={{
                ...estilos.botonMenu,
                ...(seccion === item.id
                  ? estilos.botonActivo
                  : {}),
              }}
            >
              <span>{item.icono}</span>
              {item.nombre}
            </button>
          ))}
        </nav>

        <div style={estilos.pieMenu}>
          🟢 Web en pruebas
        </div>
      </aside>

      <section style={estilos.contenido}>
        <header style={estilos.cabecera}>
          <div>
            <p style={estilos.eyebrow}>
              PANEL DE ADMINISTRACIÓN
            </p>

            <h1 style={estilos.titulo}>Hola 👋</h1>

            <p style={estilos.subtitulo}>
              Gestiona fácilmente el contenido de Lucena Baila.
            </p>
          </div>

          <a href="/" style={estilos.verWeb}>
            Ver web →
          </a>
        </header>

        {mensaje && (
          <div
            style={{
              ...estilos.mensaje,
              ...(mensaje.startsWith("❌")
                ? estilos.mensajeError
                : estilos.mensajeCorrecto),
            }}
          >
            {mensaje}
          </div>
        )}

        {/* ================= ACTIVIDADES ================= */}

        {seccion === "actividades" && (
          <section>
            <div style={estilos.tituloSeccion}>
              <div>
                <p style={estilos.eyebrow}>
                  CONTENIDO DE LA ESCUELA
                </p>

                <h2 style={estilos.tituloH2}>
                  Actividades
                </h2>

                <p style={estilos.descripcionSeccion}>
                  Añade y gestiona las disciplinas de la escuela.
                </p>
              </div>

              <span style={estilos.contador}>
                {actividades.length} actividades
              </span>
            </div>

            <div style={estilos.tarjeta}>
              {cargando ? (
                <div style={estilos.cargando}>
                  Cargando actividades...
                </div>
              ) : (
                actividades.map((actividad, index) => (
                  <div
                    key={actividad.id}
                    style={estilos.fila}
                  >
                    <div style={estilos.numero}>
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div style={estilos.nombreActividad}>
                      <strong>{actividad.nombre}</strong>

                      <span>
                        {actividad.activa
                          ? "Actividad activa"
                          : "Actividad oculta"}
                      </span>
                    </div>

                    <span
                      style={{
                        ...estilos.estado,
                        ...(actividad.activa
                          ? estilos.estadoActivo
                          : estilos.estadoInactivo),
                      }}
                    >
                      {actividad.activa
                        ? "ACTIVA"
                        : "OCULTA"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={estilos.anadir}>
              <p style={estilos.eyebrow}>
                NUEVA DISCIPLINA
              </p>

              <h3 style={estilos.tituloAnadir}>
                + Añadir actividad
              </h3>

              <form
                onSubmit={agregarActividad}
                style={estilos.formulario}
              >
                <input
                  value={nuevaActividad}
                  onChange={(event) =>
                    setNuevaActividad(event.target.value)
                  }
                  placeholder="Ej.: Flamenco"
                  style={estilos.input}
                  disabled={guardando}
                />

                <button
                  type="submit"
                  style={estilos.botonAnadir}
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Añadir"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ================= PROFESORES ================= */}

        {seccion === "profesores" && (
          <section>
            <div style={estilos.tituloSeccion}>
              <div>
                <p style={estilos.eyebrow}>
                  EQUIPO DOCENTE
                </p>

                <h2 style={estilos.tituloH2}>
                  Profesores
                </h2>

                <p style={estilos.descripcionSeccion}>
                  Gestiona los profesores y las disciplinas que imparten.
                </p>
              </div>

              <span style={estilos.contador}>
                {profesores.length} profesores
              </span>
            </div>

            <div style={estilos.tarjeta}>
              {profesores.map((profesor, index) => {
                const nombresActividades =
                  (profesor.actividad_ids || [])
                    .map((id) => {
                      const actividad = actividades.find(
                        (item) => item.id === id
                      );

                      return actividad
                        ? actividad.nombre
                        : null;
                    })
                    .filter(Boolean);

                const editando =
                  profesorEditando?.id === profesor.id;

                if (editando) {
                  return (
                    <div
                      key={profesor.id}
                      style={estilos.edicion}
                    >
                      <p style={estilos.eyebrow}>
                        EDITANDO PROFESOR
                      </p>

                      <h3 style={estilos.tituloEdicion}>
                        {profesor.nombre}
                      </h3>

                      <div style={estilos.formularioVertical}>
                        <input
                          value={profesorEditando.nombre}
                          onChange={(event) =>
                            setProfesorEditando({
                              ...profesorEditando,
                              nombre: event.target.value,
                            })
                          }
                          placeholder="Nombre"
                          style={estilos.input}
                          disabled={guardando}
                        />

                        <textarea
                          value={
                            profesorEditando.descripcion
                          }
                          onChange={(event) =>
                            setProfesorEditando({
                              ...profesorEditando,
                              descripcion:
                                event.target.value,
                            })
                          }
                          placeholder="Descripción"
                          style={estilos.textarea}
                          rows={3}
                          disabled={guardando}
                        />

                        <div>
                          <p style={estilos.etiqueta}>
                            ACTIVIDADES QUE IMPARTE
                          </p>

                          <div style={estilos.checkGrid}>
                            {actividades.map(
                              (actividad) => {
                                const seleccionada =
                                  profesorEditando.actividadIds.includes(
                                    actividad.id
                                  );

                                return (
                                  <label
                                    key={actividad.id}
                                    style={{
                                      ...estilos.checkbox,
                                      ...(seleccionada
                                        ? estilos.checkboxSeleccionada
                                        : {}),
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        seleccionada
                                      }
                                      onChange={() =>
                                        cambiarActividadEdicion(
                                          actividad.id
                                        )
                                      }
                                    />

                                    {actividad.nombre}
                                  </label>
                                );
                              }
                            )}
                          </div>
                        </div>

                        <div style={estilos.botonesEdicion}>
                          <button
                            type="button"
                            onClick={guardarProfesor}
                            style={estilos.botonAnadir}
                            disabled={guardando}
                          >
                            {guardando
                              ? "Guardando..."
                              : "Guardar cambios"}
                          </button>

                          <button
                            type="button"
                            onClick={cancelarEdicion}
                            style={estilos.botonCancelar}
                            disabled={guardando}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={profesor.id}
                    style={estilos.filaProfesor}
                  >
                    <div style={estilos.numero}>
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div style={estilos.nombreActividad}>
                      <strong>{profesor.nombre}</strong>

                      <span>
                        {nombresActividades.length > 0
                          ? nombresActividades.join(" · ")
                          : "Sin actividades asignadas"}
                      </span>

                      {profesor.descripcion && (
                        <small style={{ color: "#777" }}>
                          {profesor.descripcion}
                        </small>
                      )}
                    </div>

                    <span
                      style={{
                        ...estilos.estado,
                        ...(profesor.activa
                          ? estilos.estadoActivo
                          : estilos.estadoInactivo),
                      }}
                    >
                      {profesor.activa
                        ? "ACTIVO"
                        : "OCULTO"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        comenzarEdicion(profesor)
                      }
                      style={estilos.botonEditar}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={estilos.anadir}>
              <p style={estilos.eyebrow}>
                NUEVO PROFESOR
              </p>

              <h3 style={estilos.tituloAnadir}>
                + Añadir profesor
              </h3>

              <form
                onSubmit={agregarProfesor}
                style={estilos.formularioVertical}
              >
                <input
                  value={nuevoProfesor.nombre}
                  onChange={(event) =>
                    setNuevoProfesor({
                      ...nuevoProfesor,
                      nombre: event.target.value,
                    })
                  }
                  placeholder="Nombre del profesor"
                  style={estilos.input}
                  disabled={guardando}
                />

                <textarea
                  value={nuevoProfesor.descripcion}
                  onChange={(event) =>
                    setNuevoProfesor({
                      ...nuevoProfesor,
                      descripcion: event.target.value,
                    })
                  }
                  placeholder="Descripción"
                  style={estilos.textarea}
                  rows={3}
                  disabled={guardando}
                />

                <div>
                  <p style={estilos.etiqueta}>
                    ACTIVIDADES QUE IMPARTE
                  </p>

                  <div style={estilos.checkGrid}>
                    {actividades.map((actividad) => {
                      const seleccionada =
                        nuevoProfesor.actividadIds.includes(
                          actividad.id
                        );

                      return (
                        <label
                          key={actividad.id}
                          style={{
                            ...estilos.checkbox,
                            ...(seleccionada
                              ? estilos.checkboxSeleccionada
                              : {}),
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={seleccionada}
                            onChange={() =>
                              cambiarActividadProfesor(
                                actividad.id
                              )
                            }
                          />

                          {actividad.nombre}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  style={estilos.botonAnadir}
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : "Añadir profesor"}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ================= HORARIOS ================= */}

        {seccion === "horarios" && (
          <section>
            <div style={estilos.tituloSeccion}>
              <div>
                <p style={estilos.eyebrow}>
                  ORGANIZACIÓN DE LAS CLASES
                </p>

                <h2 style={estilos.tituloH2}>
                  Horarios
                </h2>

                <p style={estilos.descripcionSeccion}>
                  Crea y gestiona los horarios de todas las actividades.
                </p>
              </div>

              <span style={estilos.contador}>
                {horarios.length} horarios
              </span>
            </div>

            <div style={estilos.tarjeta}>
              {horarios.length === 0 ? (
                <div style={estilos.vacio}>
                  <div style={estilos.iconoVacio}>
                    🕐
                  </div>

                  <h3>
                    No hay horarios todavía
                  </h3>

                  <p>
                    Añade el primer horario de la escuela.
                  </p>
                </div>
              ) : (
                horarios.map((horario, index) => {
                  const profesoresHorario =
                    horario.profesor_ids || [];

                  const nombresProfesores =
                    profesoresHorario
                      .map(nombreProfesor)
                      .filter(Boolean);

                  return (
                    <div
                      key={horario.id}
                      style={estilos.filaHorario}
                    >
                      <div style={estilos.numero}>
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div style={estilos.horaHorario}>
                        <strong>
                          {String(
                            horario.hora_inicio
                          ).slice(0, 5)}
                          {" - "}
                          {String(
                            horario.hora_fin
                          ).slice(0, 5)}
                        </strong>

                        <span>
                          {horario.dia}
                        </span>
                      </div>

                      <div style={estilos.infoHorario}>
                        <strong>
                          {horario.actividad_nombre}
                        </strong>

                        <span>
                          {horario.nivel ||
                            "Nivel general"}
                        </span>

                        <small>
                          👤{" "}
                          {nombresProfesores.length > 0
                            ? nombresProfesores.join(" · ")
                            : "Sin profesor asignado"}
                        </small>
                      </div>

                      <span
                        style={{
                          ...estilos.estado,
                          ...(horario.activa
                            ? estilos.estadoActivo
                            : estilos.estadoInactivo),
                        }}
                      >
                        {horario.activa
                          ? "ACTIVO"
                          : "OCULTO"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          comenzarEdicionHorario(
                            horario
                          )
                        }
                        style={estilos.botonEditar}
                      >
                        ✏️ Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          eliminarHorario(horario.id)
                        }
                        style={estilos.botonEliminar}
                        disabled={guardando}
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* FORMULARIO NUEVO HORARIO */}

            <div style={estilos.anadir}>
              <p style={estilos.eyebrow}>
                NUEVO HORARIO
              </p>

              <h3 style={estilos.tituloAnadir}>
                + Añadir horario
              </h3>

              <form
                onSubmit={agregarHorario}
                style={estilos.formularioVertical}
              >
                <div style={estilos.gridFormulario}>
                  <div>
                    <label style={estilos.label}>
                      ACTIVIDAD
                    </label>

                    <select
                      value={nuevoHorario.actividadId}
                      onChange={(event) =>
                        setNuevoHorario({
                          ...nuevoHorario,
                          actividadId:
                            Number(event.target.value),
                        })
                      }
                      style={estilos.input}
                      disabled={guardando}
                    >
                      <option value="">
                        Selecciona una actividad
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
                  </div>

                  <div>
                    <label style={estilos.label}>
                      DÍA
                    </label>

                    <select
                      value={nuevoHorario.dia}
                      onChange={(event) =>
                        setNuevoHorario({
                          ...nuevoHorario,
                          dia: event.target.value,
                        })
                      }
                      style={estilos.input}
                      disabled={guardando}
                    >
                      {diasSemana.map((dia) => (
                        <option
                          key={dia}
                          value={dia}
                        >
                          {dia}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={estilos.gridFormulario}>
                  <div>
                    <label style={estilos.label}>
                      HORA DE INICIO
                    </label>

                    <input
                      type="time"
                      value={nuevoHorario.horaInicio}
                      onChange={(event) =>
                        setNuevoHorario({
                          ...nuevoHorario,
                          horaInicio:
                            event.target.value,
                        })
                      }
                      style={estilos.input}
                      disabled={guardando}
                    />
                  </div>

                  <div>
                    <label style={estilos.label}>
                      HORA DE FIN
                    </label>

                    <input
                      type="time"
                      value={nuevoHorario.horaFin}
                      onChange={(event) =>
                        setNuevoHorario({
                          ...nuevoHorario,
                          horaFin:
                            event.target.value,
                        })
                      }
                      style={estilos.input}
                      disabled={guardando}
                    />
                  </div>

                  <div>
                    <label style={estilos.label}>
                      NIVEL
                    </label>

                    <input
                      type="text"
                      value={nuevoHorario.nivel}
                      onChange={(event) =>
                        setNuevoHorario({
                          ...nuevoHorario,
                          nivel: event.target.value,
                        })
                      }
                      placeholder="Ej.: Inicial"
                      style={estilos.input}
                      disabled={guardando}
                    />
                  </div>
                </div>

                <div>
                  <p style={estilos.etiqueta}>
                    PROFESORES QUE IMPARTEN ESTA CLASE
                  </p>

                  <div style={estilos.checkGrid}>
                    {profesores.map((profesor) => {
                      const seleccionado =
                        nuevoHorario.profesorIds.includes(
                          profesor.id
                        );

                      return (
                        <label
                          key={profesor.id}
                          style={{
                            ...estilos.checkbox,
                            ...(seleccionado
                              ? estilos.checkboxSeleccionada
                              : {}),
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={seleccionado}
                            onChange={() =>
                              cambiarProfesorHorario(
                                profesor.id
                              )
                            }
                          />

                          {profesor.nombre}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  style={estilos.botonAnadir}
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : "Añadir horario"}
                </button>
              </form>
            </div>

            {/* EDICIÓN DE HORARIO */}

            {horarioEditando && (
              <div style={estilos.anadir}>
                <p style={estilos.eyebrow}>
                  EDITANDO HORARIO
                </p>

                <h3 style={estilos.tituloAnadir}>
                  Modificar horario
                </h3>

                <div style={estilos.formularioVertical}>
                  <div style={estilos.gridFormulario}>
                    <div>
                      <label style={estilos.label}>
                        ACTIVIDAD
                      </label>

                      <select
                        value={
                          horarioEditando.actividadId
                        }
                        onChange={(event) =>
                          setHorarioEditando({
                            ...horarioEditando,
                            actividadId:
                              Number(
                                event.target.value
                              ),
                          })
                        }
                        style={estilos.input}
                        disabled={guardando}
                      >
                        <option value="">
                          Selecciona una actividad
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
                    </div>

                    <div>
                      <label style={estilos.label}>
                        DÍA
                      </label>

                      <select
                        value={horarioEditando.dia}
                        onChange={(event) =>
                          setHorarioEditando({
                            ...horarioEditando,
                            dia: event.target.value,
                          })
                        }
                        style={estilos.input}
                        disabled={guardando}
                      >
                        {diasSemana.map((dia) => (
                          <option
                            key={dia}
                            value={dia}
                          >
                            {dia}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={estilos.gridFormulario}>
                    <div>
                      <label style={estilos.label}>
                        HORA DE INICIO
                      </label>

                      <input
                        type="time"
                        value={
                          horarioEditando.horaInicio
                        }
                        onChange={(event) =>
                          setHorarioEditando({
                            ...horarioEditando,
                            horaInicio:
                              event.target.value,
                          })
                        }
                        style={estilos.input}
                        disabled={guardando}
                      />
                    </div>

                    <div>
                      <label style={estilos.label}>
                        HORA DE FIN
                      </label>

                      <input
                        type="time"
                        value={
                          horarioEditando.horaFin
                        }
                        onChange={(event) =>
                          setHorarioEditando({
                            ...horarioEditando,
                            horaFin:
                              event.target.value,
                          })
                        }
                        style={estilos.input}
                        disabled={guardando}
                      />
                    </div>

                    <div>
                      <label style={estilos.label}>
                        NIVEL
                      </label>

                      <input
                        type="text"
                        value={horarioEditando.nivel}
                        onChange={(event) =>
                          setHorarioEditando({
                            ...horarioEditando,
                            nivel: event.target.value,
                          })
                        }
                        placeholder="Ej.: Inicial"
                        style={estilos.input}
                        disabled={guardando}
                      />
                    </div>
                  </div>

                  <div>
                    <p style={estilos.etiqueta}>
                      PROFESORES
                    </p>

                    <div style={estilos.checkGrid}>
                      {profesores.map((profesor) => {
                        const seleccionado =
                          horarioEditando.profesorIds.includes(
                            profesor.id
                          );

                        return (
                          <label
                            key={profesor.id}
                            style={{
                              ...estilos.checkbox,
                              ...(seleccionado
                                ? estilos.checkboxSeleccionada
                                : {}),
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={seleccionado}
                              onChange={() =>
                                cambiarProfesorHorarioEdicion(
                                  profesor.id
                                )
                              }
                            />

                            {profesor.nombre}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={estilos.botonesEdicion}>
                    <button
                      type="button"
                      onClick={guardarHorario}
                      style={estilos.botonAnadir}
                      disabled={guardando}
                    >
                      {guardando
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>

                    <button
                      type="button"
                      onClick={cancelarEdicionHorario}
                      style={estilos.botonCancelar}
                      disabled={guardando}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================= RESTO ================= */}

        {seccion !== "actividades" &&
          seccion !== "profesores" &&
          seccion !== "horarios" && (
            <section style={estilos.proximamente}>
              <div style={estilos.iconoGrande}>
                {
                  secciones.find(
                    (item) => item.id === seccion
                  )?.icono
                }
              </div>

              <p style={estilos.eyebrow}>
                PRÓXIMAMENTE
              </p>

              <h2 style={estilos.tituloH2}>
                {
                  secciones.find(
                    (item) => item.id === seccion
                  )?.nombre
                }
              </h2>

              <p>
                Este apartado lo construiremos y conectaremos
                con la base de datos.
              </p>
            </section>
          )}
      </section>
    </main>
  );
}

const estilos = {
  contenedor: {
    minHeight: "100vh",
    display: "flex",
    background: "#09090b",
    color: "#fff",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  menu: {
    width: "260px",
    minWidth: "260px",
    minHeight: "100vh",
    padding: "28px 18px",
    background: "#111114",
    borderRight: "1px solid #29292f",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    flexShrink: 0,
  },
   navegacion: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "5px",
    alignItems: "stretch",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "4px 10px 32px",
  },

  logoMarca: {
    width: "38px",
    height: "38px",
    display: "grid",
    placeItems: "center",
    background: "#ff3cac",
    color: "#fff",
    fontWeight: "800",
    fontSize: "12px",
    borderRadius: "9px",
  },

    contenido: {
    flex: 1,
    minWidth: 0,
    padding: "50px",
    maxWidth: "1200px",
    boxSizing: "border-box",
  },

  cabecera: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "55px",
  },

  eyebrow: {
    margin: 0,
    color: "#ff3cac",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  titulo: {
    fontSize: "46px",
    margin: "10px 0 5px",
  },

  tituloH2: {
    fontSize: "34px",
    margin: "8px 0",
  },

  subtitulo: {
    color: "#9b9ba3",
    margin: 0,
    fontSize: "16px",
  },

  verWeb: {
    color: "#fff",
    textDecoration: "none",
    border: "1px solid #44444b",
    padding: "12px 18px",
    borderRadius: "10px",
    fontSize: "13px",
  },

  botonMenu: {
    width: "100%",
    border: "0",
    background: "transparent",
    color: "#aaa",
    padding: "14px 15px",
    marginBottom: "5px",
    borderRadius: "10px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },

  botonActivo: {
    background: "#ff3cac",
    color: "#fff",
    fontWeight: "700",
  },

  pieMenu: {
    marginTop: "auto",
    color: "#777",
    fontSize: "12px",
    padding: "15px 10px",
  },

  tituloSeccion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "25px",
  },

  descripcionSeccion: {
    color: "#888891",
    margin: "5px 0 0",
    fontSize: "14px",
  },

  contador: {
    background: "#222228",
    color: "#ccc",
    padding: "8px 13px",
    borderRadius: "20px",
    fontSize: "13px",
  },

  tarjeta: {
    background: "#111114",
    border: "1px solid #29292f",
    borderRadius: "16px",
    overflow: "hidden",
  },

  fila: {
    display: "flex",
    alignItems: "center",
    padding: "18px 22px",
    borderBottom: "1px solid #29292f",
  },

  filaProfesor: {
    display: "flex",
    alignItems: "center",
    padding: "20px 22px",
    borderBottom: "1px solid #29292f",
    gap: "15px",
  },

  filaHorario: {
    display: "flex",
    alignItems: "center",
    padding: "20px 22px",
    borderBottom: "1px solid #29292f",
    gap: "15px",
  },

  numero: {
    width: "45px",
    color: "#ff3cac",
    fontWeight: "800",
    fontSize: "13px",
    flexShrink: 0,
  },

  nombreActividad: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  horaHorario: {
    width: "125px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flexShrink: 0,
  },

  infoHorario: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  estado: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
    marginRight: "5px",
    flexShrink: 0,
  },

  estadoActivo: {
    background: "#143d2a",
    color: "#54e59a",
  },

  estadoInactivo: {
    background: "#3d2020",
    color: "#ff8585",
  },

  botonEditar: {
    background: "#25252b",
    color: "#fff",
    border: "1px solid #55555e",
    borderRadius: "8px",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  botonEliminar: {
    background: "#3b2025",
    color: "#ff8585",
    border: "1px solid #63343d",
    borderRadius: "8px",
    padding: "10px 12px",
    cursor: "pointer",
    fontSize: "12px",
    flexShrink: 0,
  },

  edicion: {
    padding: "25px",
    borderBottom: "1px solid #29292f",
    background: "#151519",
  },

  tituloEdicion: {
    margin: "8px 0 20px",
    fontSize: "22px",
  },

  anadir: {
    marginTop: "25px",
    padding: "25px",
    background: "#151519",
    borderRadius: "16px",
    border: "1px solid #29292f",
  },

  tituloAnadir: {
    margin: "8px 0 20px",
    fontSize: "22px",
  },

  formulario: {
    display: "flex",
    gap: "10px",
  },

  formularioVertical: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "800px",
  },

  gridFormulario: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  label: {
    display: "block",
    color: "#aaa",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#09090b",
    color: "#fff",
    border: "1px solid #3a3a42",
    borderRadius: "9px",
    padding: "13px",
    fontSize: "15px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "#09090b",
    color: "#fff",
    border: "1px solid #3a3a42",
    borderRadius: "9px",
    padding: "13px",
    fontSize: "15px",
    resize: "vertical",
    outline: "none",
  },

  etiqueta: {
    color: "#aaa",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "10px",
  },

  checkGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "9px",
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "12px",
    border: "1px solid #34343b",
    borderRadius: "9px",
    color: "#aaa",
    cursor: "pointer",
    fontSize: "13px",
  },

  checkboxSeleccionada: {
    border: "1px solid #ff3cac",
    background: "#261322",
    color: "#fff",
  },

  botonAnadir: {
    background: "#ff3cac",
    color: "#fff",
    border: "0",
    borderRadius: "9px",
    padding: "13px 22px",
    fontWeight: "700",
    cursor: "pointer",
    alignSelf: "flex-start",
  },

  botonesEdicion: {
    display: "flex",
    gap: "10px",
  },

  botonCancelar: {
    background: "transparent",
    color: "#aaa",
    border: "1px solid #414149",
    borderRadius: "9px",
    padding: "13px 22px",
    fontWeight: "700",
    cursor: "pointer",
  },

  mensaje: {
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "13px",
  },

  mensajeCorrecto: {
    background: "#143d2a",
    color: "#54e59a",
  },

  mensajeError: {
    background: "#3d2020",
    color: "#ff8585",
  },

  cargando: {
    padding: "45px",
    textAlign: "center",
    color: "#888891",
  },

  vacio: {
    padding: "55px 25px",
    textAlign: "center",
    color: "#888891",
  },

  iconoVacio: {
    fontSize: "45px",
    marginBottom: "10px",
  },

  proximamente: {
    textAlign: "center",
    padding: "100px 20px",
    background: "#111114",
    borderRadius: "20px",
    border: "1px solid #29292f",
    color: "#888891",
  },

  iconoGrande: {
    fontSize: "55px",
    marginBottom: "15px",
  },
};
