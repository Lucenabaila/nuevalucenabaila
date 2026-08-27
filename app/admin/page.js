"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [profesores, setProfesores] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);

      const [respuestaProfesores, respuestaActividades] =
        await Promise.all([
          fetch("/api/profesores"),
          fetch("/api/actividades"),
        ]);

      const datosProfesores = await respuestaProfesores.json();
      const datosActividades = await respuestaActividades.json();

      if (datosProfesores.correcto) {
        setProfesores(datosProfesores.profesores || []);
      }

      if (datosActividades.correcto) {
        setActividades(datosActividades.actividades || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  }

  const menu = [
    {
      id: "inicio",
      nombre: "Inicio",
      icono: "🏠",
    },
    {
      id: "actividades",
      nombre: "Actividades",
      icono: "💃",
    },
    {
      id: "profesores",
      nombre: "Profesores",
      icono: "👥",
    },
    {
      id: "horarios",
      nombre: "Horarios",
      icono: "🕐",
    },
    {
      id: "eventos",
      nombre: "Eventos",
      icono: "📅",
    },
    {
      id: "galeria",
      nombre: "Galería",
      icono: "🖼️",
    },
    {
      id: "mensajes",
      nombre: "Mensajes",
      icono: "💌",
    },
  ];

  function cambiarSeccion(id) {
    setSeccionActiva(id);
  }

  return (
    <main style={estilos.pagina}>
      {/* MENÚ LATERAL */}
      <aside style={estilos.menu}>
        <div style={estilos.logoArea}>
          <div style={estilos.logo}>LB</div>

          <div>
            <div style={estilos.nombreEscuela}>Lucena</div>
            <div style={estilos.nombreEscuela}>Baila</div>
            <div style={estilos.administracion}>Administración</div>
          </div>
        </div>

        <nav style={estilos.navegacion}>
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => cambiarSeccion(item.id)}
              style={{
                ...estilos.botonMenu,
                ...(seccionActiva === item.id
                  ? estilos.botonMenuActivo
                  : {}),
              }}
            >
              <span style={estilos.iconoMenu}>{item.icono}</span>
              <span>{item.nombre}</span>
            </button>
          ))}
        </nav>

        <div style={estilos.estadoWeb}>
          <span style={estilos.puntoVerde}></span>
          <span>Web en pruebas</span>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <section style={estilos.contenido}>
        <header style={estilos.cabecera}>
          <div>
            <div style={estilos.tituloPequeno}>
              PANEL DE ADMINISTRACIÓN
            </div>

            <h1 style={estilos.titulo}>
              Hola 👋
            </h1>

            <p style={estilos.subtitulo}>
              Gestiona fácilmente el contenido de la escuela.
            </p>
          </div>
        </header>

        {seccionActiva === "inicio" && (
          <Inicio
            profesores={profesores}
            actividades={actividades}
            cargando={cargando}
          />
        )}

        {seccionActiva === "actividades" && (
          <Actividades
            actividades={actividades}
            recargar={cargarDatos}
          />
        )}

        {seccionActiva === "profesores" && (
          <Profesores
            profesores={profesores}
            actividades={actividades}
            recargar={cargarDatos}
          />
        )}

        {seccionActiva === "horarios" && <SeccionProximamente titulo="Horarios" />}

        {seccionActiva === "eventos" && <SeccionProximamente titulo="Eventos" />}

        {seccionActiva === "galeria" && <SeccionProximamente titulo="Galería" />}

        {seccionActiva === "mensajes" && (
          <SeccionProximamente titulo="Mensajes" />
        )}
      </section>
    </main>
  );
}


/* =========================================================
   INICIO
========================================================= */

function Inicio({ profesores, actividades, cargando }) {
  return (
    <div>
      <div style={estilos.etiquetaSeccion}>RESUMEN</div>

      <h2 style={estilos.tituloSeccion}>
        Panel de administración
      </h2>

      <p style={estilos.descripcionSeccion}>
        Desde aquí puedes gestionar profesores, actividades y
        próximamente todos los contenidos de la escuela.
      </p>

      <div style={estilos.tarjetas}>
        <div style={estilos.tarjeta}>
          <div style={estilos.tarjetaIcono}>💃</div>
          <div style={estilos.tarjetaNumero}>
            {cargando ? "..." : actividades.length}
          </div>
          <div style={estilos.tarjetaTexto}>
            Actividades
          </div>
        </div>

        <div style={estilos.tarjeta}>
          <div style={estilos.tarjetaIcono}>👥</div>
          <div style={estilos.tarjetaNumero}>
            {cargando ? "..." : profesores.length}
          </div>
          <div style={estilos.tarjetaTexto}>
            Profesores
          </div>
        </div>

        <div style={estilos.tarjeta}>
          <div style={estilos.tarjetaIcono}>🕐</div>
          <div style={estilos.tarjetaNumero}>
            Próximamente
          </div>
          <div style={estilos.tarjetaTexto}>
            Horarios
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   ACTIVIDADES
========================================================= */

function Actividades({ actividades, recargar }) {
  return (
    <div>
      <div style={estilos.etiquetaSeccion}>
        GESTIÓN
      </div>

      <h2 style={estilos.tituloSeccion}>
        Actividades
      </h2>

      <p style={estilos.descripcionSeccion}>
        Gestiona las disciplinas que ofrece la escuela.
      </p>

      <div style={estilos.lista}>
        {actividades.length === 0 ? (
          <div style={estilos.vacio}>
            No hay actividades creadas.
          </div>
        ) : (
          actividades.map((actividad, indice) => (
            <div
              key={actividad.id}
              style={estilos.fila}
            >
              <div style={estilos.numero}>
                {String(indice + 1).padStart(2, "0")}
              </div>

              <div style={estilos.filaContenido}>
                <div style={estilos.filaTitulo}>
                  {actividad.nombre}
                </div>

                {actividad.descripcion && (
                  <div style={estilos.filaDescripcion}>
                    {actividad.descripcion}
                  </div>
                )}
              </div>

              <div style={estilos.estadoActivo}>
                ACTIVA
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


/* =========================================================
   PROFESORES
========================================================= */

function Profesores({
  profesores,
  actividades,
  recargar,
}) {
  return (
    <div>
      <div style={estilos.etiquetaSeccion}>
        EQUIPO DOCENTE
      </div>

      <h2 style={estilos.tituloSeccion}>
        Profesores
      </h2>

      <p style={estilos.descripcionSeccion}>
        Gestiona los profesores y las disciplinas que imparten.
      </p>

      <div style={estilos.lista}>
        {profesores.length === 0 ? (
          <div style={estilos.vacio}>
            No hay profesores creados.
          </div>
        ) : (
          profesores.map((profesor, indice) => (
            <ProfesorFila
              key={profesor.id}
              profesor={profesor}
              indice={indice}
              actividades={actividades}
              recargar={recargar}
            />
          ))
        )}
      </div>
    </div>
  );
}


/* =========================================================
   FILA DE PROFESOR
========================================================= */

function ProfesorFila({
  profesor,
  indice,
  actividades,
  recargar,
}) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState(profesor.nombre || "");
  const [descripcion, setDescripcion] = useState(
    profesor.descripcion || ""
  );

  const [actividadesSeleccionadas, setActividadesSeleccionadas] =
    useState(profesor.actividad_ids || []);

  function cambiarActividad(id) {
    setActividadesSeleccionadas((actuales) => {
      if (actuales.includes(id)) {
        return actuales.filter((item) => item !== id);
      }

      return [...actuales, id];
    });
  }

  async function guardarCambios() {
    try {
      setGuardando(true);

      const respuesta = await fetch(
        `/api/profesores/${profesor.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            descripcion,
            actividadIds: actividadesSeleccionadas,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        alert(
          datos.mensaje ||
            "No se han podido guardar los cambios."
        );
        return;
      }

      setEditando(false);
      await recargar();
    } catch (error) {
      console.error(error);

      alert(
        "Ha ocurrido un error al guardar el profesor."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (editando) {
    return (
      <div style={estilos.editor}>
        <div style={estilos.editorCabecera}>
          <div style={estilos.numero}>
            {String(indice + 1).padStart(2, "0")}
          </div>

          <div style={estilos.editorTitulo}>
            Editar profesor
          </div>
        </div>

        <label style={estilos.label}>
          Nombre
        </label>

        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={estilos.input}
        />

        <label style={estilos.label}>
          Descripción
        </label>

        <textarea
          value={descripcion}
          onChange={(e) =>
            setDescripcion(e.target.value)
          }
          style={estilos.textarea}
          rows={3}
        />

        <label style={estilos.label}>
          Actividades que imparte
        </label>

        <div style={estilos.actividadesChecks}>
          {actividades.map((actividad) => {
            const seleccionada =
              actividadesSeleccionadas.includes(
                actividad.id
              );

            return (
              <label
                key={actividad.id}
                style={{
                  ...estilos.check,
                  ...(seleccionada
                    ? estilos.checkActivo
                    : {}),
                }}
              >
                <input
                  type="checkbox"
                  checked={seleccionada}
                  onChange={() =>
                    cambiarActividad(actividad.id)
                  }
                />

                <span>
                  {actividad.nombre}
                </span>
              </label>
            );
          })}
        </div>

        <div style={estilos.botonesEditor}>
          <button
            type="button"
            onClick={() => setEditando(false)}
            style={estilos.botonCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={guardarCambios}
            style={estilos.botonGuardar}
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={estilos.fila}>
      <div style={estilos.numero}>
        {String(indice + 1).padStart(2, "0")}
      </div>

      <div style={estilos.filaContenido}>
        <div style={estilos.filaTitulo}>
          {profesor.nombre}
        </div>

        <div style={estilos.filaDescripcion}>
          {profesor.descripcion ||
            "Sin descripción"}
        </div>

        <div style={estilos.chips}>
          {profesor.actividad_ids &&
          profesor.actividad_ids.length > 0 ? (
            profesor.actividad_ids.map((actividadId) => {
              const actividad = actividades.find(
                (item) => item.id === actividadId
              );

              if (!actividad) {
                return null;
              }

              return (
                <span
                  key={actividadId}
                  style={estilos.chip}
                >
                  {actividad.nombre}
                </span>
              );
            })
          ) : (
            <span style={estilos.sinActividades}>
              Sin actividades asignadas
            </span>
          )}
        </div>
      </div>

      <div style={estilos.filaAcciones}>
        <span style={estilos.estadoActivo}>
          ACTIVO
        </span>

        <button
          type="button"
          onClick={() => setEditando(true)}
          style={estilos.botonEditar}
        >
          Editar
        </button>
      </div>
    </div>
  );
}


/* =========================================================
   SECCIONES FUTURAS
========================================================= */

function SeccionProximamente({ titulo }) {
  return (
    <div>
      <div style={estilos.etiquetaSeccion}>
        PRÓXIMAMENTE
      </div>

      <h2 style={estilos.tituloSeccion}>
        {titulo}
      </h2>

      <div style={estilos.vacio}>
        <div style={estilos.vacioIcono}>
          ✨
        </div>

        <div style={estilos.vacioTitulo}>
          Esta sección la prepararemos ahora.
        </div>

        <div style={estilos.vacioTexto}>
          La estructura ya está preparada para añadir
          este apartado al panel.
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   ESTILOS
========================================================= */

const estilos = {
  pagina: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    background: "#111114",
    color: "#ffffff",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
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

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "35px",
    paddingLeft: "5px",
  },

  logo: {
    width: "50px",
    height: "50px",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #ff7b88, #ff9eaa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "800",
    fontSize: "17px",
    flexShrink: 0,
  },

  nombreEscuela: {
    fontSize: "17px",
    fontWeight: "700",
    lineHeight: "19px",
  },

  administracion: {
    fontSize: "11px",
    marginTop: "3px",
    color: "#ff8794",
    fontWeight: "700",
  },

  navegacion: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "7px",
    alignItems: "stretch",
    boxSizing: "border-box",
  },

  botonMenu: {
    width: "100%",
    minHeight: "50px",
    border: "0",
    borderRadius: "14px",
    background: "transparent",
    color: "#d7d7dc",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "0 16px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
    boxSizing: "border-box",
  },

  botonMenuActivo: {
    background:
      "linear-gradient(135deg, #ff7d8b, #ff9aaa)",
    color: "#ffffff",
  },

  iconoMenu: {
    width: "24px",
    textAlign: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  estadoWeb: {
    marginTop: "auto",
    padding: "15px 10px 5px",
    color: "#a8a8af",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  puntoVerde: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#8ee35f",
    display: "inline-block",
  },

  contenido: {
    flex: 1,
    minWidth: 0,
    padding: "50px",
    maxWidth: "1200px",
    boxSizing: "border-box",
  },

  cabecera: {
    marginBottom: "55px",
  },

  tituloPequeno: {
    color: "#ff8995",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "3px",
    marginBottom: "12px",
  },

  titulo: {
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "58px",
    lineHeight: "1",
    margin: "0",
    color: "#fff5d7",
    fontWeight: "500",
  },

  subtitulo: {
    marginTop: "15px",
    marginBottom: "0",
    color: "#bdbdc4",
    fontSize: "16px",
  },

  etiquetaSeccion: {
    color: "#ff8995",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "3px",
    marginBottom: "10px",
  },

  tituloSeccion: {
    fontFamily:
      "Georgia, 'Times New Roman', serif",
    fontSize: "42px",
    fontWeight: "500",
    color: "#fff5d7",
    margin: "0 0 10px",
  },

  descripcionSeccion: {
    color: "#a9a9b1",
    fontSize: "15px",
    marginTop: "0",
    marginBottom: "30px",
  },

  tarjetas: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
  },

  tarjeta: {
    background: "#18181d",
    border: "1px solid #29292f",
    borderRadius: "20px",
    padding: "25px",
    minHeight: "130px",
    boxSizing: "border-box",
  },

  tarjetaIcono: {
    fontSize: "25px",
    marginBottom: "15px",
  },

  tarjetaNumero: {
    color: "#fff5d7",
    fontSize: "28px",
    fontWeight: "700",
  },

  tarjetaTexto: {
    color: "#92929a",
    fontSize: "13px",
    marginTop: "4px",
  },

  lista: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  fila: {
    width: "100%",
    background: "#18181d",
    border: "1px solid #29292f",
    borderRadius: "18px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxSizing: "border-box",
  },

  numero: {
    color: "#ff7f8c",
    fontSize: "14px",
    fontWeight: "800",
    width: "35px",
    flexShrink: 0,
  },

  filaContenido: {
    flex: 1,
    minWidth: 0,
  },

  filaTitulo: {
    color: "#fff5d7",
    fontSize: "19px",
    fontWeight: "700",
    marginBottom: "6px",
  },

  filaDescripcion: {
    color: "#aaaab2",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  filaAcciones: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },

  estadoActivo: {
    background: "rgba(128, 220, 83, 0.12)",
    color: "#9bea6b",
    borderRadius: "30px",
    padding: "7px 12px",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    whiteSpace: "nowrap",
  },

  botonEditar: {
    border: "1px solid #45454d",
    background: "#222228",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "10px",
  },

  chip: {
    background: "rgba(255, 128, 143, 0.12)",
    color: "#ff9aa5",
    borderRadius: "20px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: "600",
  },

  sinActividades: {
    display: "inline-block",
    marginTop: "9px",
    color: "#8d8d95",
    fontSize: "12px",
    fontStyle: "italic",
  },

  vacio: {
    background: "#18181d",
    border: "1px solid #29292f",
    borderRadius: "20px",
    padding: "45px 30px",
    textAlign: "center",
    color: "#92929a",
  },

  vacioIcono: {
    fontSize: "32px",
    marginBottom: "12px",
  },

  vacioTitulo: {
    color: "#fff5d7",
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "7px",
  },

  vacioTexto: {
    fontSize: "13px",
    color: "#85858d",
  },

  editor: {
    background: "#18181d",
    border: "1px solid #393941",
    borderRadius: "20px",
    padding: "25px",
    boxSizing: "border-box",
  },

  editorCabecera: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "25px",
  },

  editorTitulo: {
    color: "#fff5d7",
    fontSize: "20px",
    fontWeight: "700",
  },

  label: {
    display: "block",
    color: "#c7c7cd",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "7px",
    marginTop: "15px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#101014",
    border: "1px solid #393941",
    borderRadius: "10px",
    padding: "12px",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "#101014",
    border: "1px solid #393941",
    borderRadius: "10px",
    padding: "12px",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  actividadesChecks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },

  check: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1px solid #393941",
    background: "#101014",
    color: "#bdbdc4",
    fontSize: "12px",
    cursor: "pointer",
  },

  checkActivo: {
    borderColor: "#ff8794",
    color: "#ffffff",
    background:
      "rgba(255, 127, 140, 0.12)",
  },

  botonesEditor: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "25px",
  },

  botonCancelar: {
    border: "1px solid #45454d",
    background: "transparent",
    color: "#c4c4ca",
    borderRadius: "10px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },

  botonGuardar: {
    border: "0",
    background:
      "linear-gradient(135deg, #ff7d8b, #ff9aaa)",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "11px 20px",
    cursor: "pointer",
    fontWeight: "700",
  },
};
