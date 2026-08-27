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

export default function AdminPage() {
  const [seccion, setSeccion] = useState("actividades");

  const [actividades, setActividades] = useState([]);
  const [profesores, setProfesores] = useState([]);

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

  useEffect(() => {
    cargarActividades();
    cargarProfesores();
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

  function cambiarSeccion(id) {
    setSeccion(id);
    setMensaje("");
    setProfesorEditando(null);
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

        {/* ACTIVIDADES */}

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

        {/* PROFESORES */}

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

                /* FORMULARIO DE EDICIÓN */

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

                      <div
                        style={estilos.formularioVertical}
                      >
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

                        <div
                          style={estilos.botonesEdicion}
                        >
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

                /* PROFESOR NORMAL */

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
                        <small
                          style={{
                            color: "#777",
                            marginTop: "3px",
                          }}
                        >
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

                    {/* ESTE ES EL BOTÓN QUE FALTABA */}

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

            {/* NUEVO PROFESOR */}

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

        {/* RESTO DE SECCIONES */}

        {seccion !== "actividades" &&
          seccion !== "profesores" && (
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
    minHeight: "100vh",
    padding: "28px 18px",
    background: "#111114",
    borderRight: "1px solid #29292f",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
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
    padding: "50px",
    maxWidth: "1100px",
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

  edicion: {
    padding: "25px",
    borderBottom: "1px solid #29292f",
    background: "#151519",
  },

  tituloEdicion: {
    margin: "8px 0 20px",
    fontSize: "22px",
  },

  formularioVertical: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "700px",
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
