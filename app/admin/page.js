"use client";

import { useState } from "react";

const secciones = [
  { id: "actividades", icono: "💃", nombre: "Actividades" },
  { id: "profesores", icono: "👥", nombre: "Profesores" },
  { id: "horarios", icono: "🕐", nombre: "Horarios" },
  { id: "eventos", icono: "📅", nombre: "Eventos" },
  { id: "galeria", icono: "🖼️", nombre: "Galería" },
  { id: "mensajes", icono: "📩", nombre: "Mensajes" },
];

const actividadesIniciales = [
  "Bachata",
  "Salsa",
  "Bailes de Salón",
  "Ladies Style",
  "Ballet Clásico",
  "Fitness Barré",
  "Baile Urbano",
  "K-Pop",
];

export default function AdminPage() {
  const [seccion, setSeccion] = useState("actividades");
  const [actividades, setActividades] = useState(actividadesIniciales);
  const [nuevaActividad, setNuevaActividad] = useState("");

  function agregarActividad(e) {
    e.preventDefault();

    const nombre = nuevaActividad.trim();

    if (!nombre) return;

    setActividades([...actividades, nombre]);
    setNuevaActividad("");
  }

  return (
    <main style={estilos.contenedor}>
      <aside style={estilos.menu}>
        <div style={estilos.logo}>
          <span>LB</span>
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
                <h2>Actividades</h2>
                <p>
                  Añade, modifica u oculta las disciplinas de la escuela.
                </p>
              </div>

              <span style={estilos.contador}>
                {actividades.length} actividades
              </span>
            </div>

            <div style={estilos.tarjeta}>
              {actividades.map((actividad, index) => (
                <div key={actividad} style={estilos.fila}>
                  <div style={estilos.numero}>
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div style={estilos.nombreActividad}>
                    <strong>{actividad}</strong>
                    <span>Actividad activa</span>
                  </div>

                  <button style={estilos.editar}>Editar</button>
                </div>
              ))}
            </div>

            <div style={estilos.anadir}>
              <h3>+ Añadir actividad</h3>

              <form onSubmit={agregarActividad} style={estilos.formulario}>
                <input
                  value={nuevaActividad}
                  onChange={(e) => setNuevaActividad(e.target.value)}
                  placeholder="Ej.: Flamenco"
                  style={estilos.input}
                />

                <button type="submit" style={estilos.botonAnadir}>
                  Añadir
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

            <h2>
              {secciones.find((item) => item.id === seccion)?.nombre}
            </h2>

            <p>
              Este apartado lo construiremos en el siguiente paso.
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
    fontFamily: "Arial, sans-serif",
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

  contenido: {
    flex: 1,
    padding: "50px",
    maxWidth: "1100px",
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
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  titulo: {
    fontSize: "46px",
    margin: "10px 0 5px",
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
    alignItems: "center",
    marginBottom: "20px",
  },

  tituloSeccionH2: {
    fontSize: "30px",
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
  },

  nombreActividad: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  editar: {
    background: "#222228",
    color: "#fff",
    border: "1px solid #3a3a42",
    borderRadius: "8px",
    padding: "9px 15px",
    cursor: "pointer",
  },

  contador: {
    background: "#222228",
    color: "#ccc",
    padding: "8px 13px",
    borderRadius: "20px",
    fontSize: "13px",
  },

  anadir: {
    marginTop: "25px",
    padding: "25px",
    background: "#151519",
    borderRadius: "16px",
    border: "1px solid #29292f",
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

  proximamente: {
    textAlign: "center",
    padding: "100px 20px",
    background: "#111114",
    borderRadius: "20px",
    border: "1px solid #29292f",
  },

  iconoGrande: {
    fontSize: "55px",
    marginBottom: "15px",
  },
};
