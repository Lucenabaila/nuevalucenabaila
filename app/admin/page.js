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
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nuevaActividad, setNuevaActividad] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarActividades();
  }, []);

  async function cargarActividades() {
    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await fetch("/api/actividades", {
        cache: "no-store",
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        throw new Error(datos.mensaje || "No se pudieron cargar las actividades");
      }

      setActividades(datos.actividades || []);
    } catch (error) {
      console.error(error);
      setMensaje("❌ No se pudieron cargar las actividades.");
    } finally {
      setCargando(false);
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
        throw new Error(datos.mensaje || "No se pudo crear la actividad");
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

  return (
    <main style={estilos.contenedor}>
      <aside style={estilos.menu}>
        <div style={estilos.logo}>
          <span style={estilos.logoMarca}>LB</span>

          <div>
            <strong>Lucena Baila</strong>
            <small>Administración</small>
          </div>
        </div>

        <nav>
          {secciones.map((item) => (
            <button
              key={item.id}
              onClick={() => setSeccion(item.id)}
              style={{
                ...estilos.botonMenu,
                ...(seccion === item.id ? estilos.botonActivo : {}),
              }}
            >
              <span>{item.icono}</span>
              {item.nombre}
            </button>
          ))}
        </nav>

        <div style={estilos.pieMenu}>
          <span>🟢</span> Web en pruebas
        </div>
      </aside>

      <section style={estilos.contenido}>
        <header style={estilos.cabecera}>
          <div>
            <p style={estilos.eyebrow}>PANEL DE ADMINISTRACIÓN</p>

            <h1 style={estilos.titulo}>Hola 👋🏼</h1>

            <p style={estilos.subtitulo}>
              Gestiona fácilmente el contenido de Lucena Baila.
            </p>
          </div>

          <a href="/" style={estilos.verWeb}>
            Ver web →
          </a>
        </header>

        {seccion === "actividades" && (
          <section>
            <div style={estilos.tituloSeccion}>
              <div>
                <p style={estilos.eyebrow}>CONTENIDO DE LA ESCUELA</p>

                <h2 style={estilos.tituloH2}>Actividades</h2>

                <p style={estilos.descripcionSeccion}>
                  Añade, modifica y gestiona las disciplinas de la escuela.
                </p>
              </div>

              <span style={estilos.contador}>
                {actividades.length} actividades
              </span>
            </div>

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

            <div style={estilos.tarjeta}>
              {cargando ? (
                <div style={estilos.cargando}>
                  Cargando actividades...
                </div>
              ) : actividades.length === 0 ? (
                <div style={estilos.vacio}>
                  <div style={estilos.iconoVacio}>💃</div>

                  <h3>No hay actividades todavía</h3>

                  <p>
                    Añade la primera actividad utilizando el formulario de
                    abajo.
                  </p>
                </div>
              ) : (
                actividades.map((actividad, index) => (
                  <div key={actividad.id} style={estilos.fila}>
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
                      {actividad.activa ? "ACTIVA" : "OCULTA"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={estilos.anadir}>
              <p style={estilos.eyebrow}>NUEVA DISCIPLINA</p>

              <h3 style={estilos.tituloAnadir}>
                + Añadir actividad
              </h3>

              <p style={estilos.descripcionAnadir}>
                La nueva actividad quedará guardada en la base de datos.
              </p>

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

        {seccion !== "actividades" && (
          <section style={estilos.proximamente}>
            <div style={estilos.iconoGrande}>
              {secciones.find((item) => item.id === seccion)?.icono}
            </div>

            <p style={estilos.eyebrow}>PRÓXIMAMENTE</p>

            <h2 style={estilos.tituloH2}>
              {secciones.find((item) => item.id === seccion)?.nombre}
            </h2>

            <p>
              Este apartado lo construiremos y conectaremos con la base de
              datos en los siguientes pasos.
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
    letterSpacing: "-1px",
  },

  tituloH2: {
    fontSize: "34px",
    margin: "8px 0",
    letterSpacing: "-1px",
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

  numero: {
    width: "45px",
    color: "#ff3cac",
    fontWeight: "800",
    fontSize: "13px",
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
    marginRight: "15px",
  },

  estadoActivo: {
    background: "#143d2a",
    color: "#54e59a",
  },

  estadoInactivo: {
    background: "#3d2020",
    color: "#ff8585",
  },

  anadir: {
    marginTop: "25px",
    padding: "25px",
    background: "#151519",
    borderRadius: "16px",
    border: "1px solid #29292f",
  },

  tituloAnadir: {
    margin: "8px 0",
    fontSize: "22px",
  },

  descripcionAnadir: {
    color: "#888891",
    fontSize: "13px",
    margin: "0 0 20px",
  },

  formulario: {
    display: "flex",
    gap: "10px",
  },

  input: {
    flex: 1,
    background: "#09090b",
    color: "#fff",
    border: "1px solid #3a3a42",
    borderRadius: "9px",
    padding: "13px",
    fontSize: "15px",
    outline: "none",
  },

  botonAnadir: {
    background: "#ff3cac",
    color: "#fff",
    border: "0",
    borderRadius: "9px",
    padding: "13px 22px",
    fontWeight: "700",
    cursor: "pointer",
  },

  mensaje: {
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "15px",
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
