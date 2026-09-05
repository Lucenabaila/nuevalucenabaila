"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginAdmin from "./LoginAdmin";

export default function AdminPage() {
  const router = useRouter();

  const [comprobandoSesion, setComprobandoSesion] =
    useState(true);

  const [autenticado, setAutenticado] =
    useState(false);

  useEffect(() => {
    comprobarSesion();
  }, []);

  async function comprobarSesion() {
    try {
      const respuesta = await fetch(
        "/api/admin-session",
        {
          cache: "no-store",
        }
      );

      const datos = await respuesta.json();

      if (datos.autenticado) {
        setAutenticado(true);
      } else {
        setAutenticado(false);
      }

    } catch (error) {
      console.error(
        "Error comprobando sesión:",
        error
      );

      setAutenticado(false);

    } finally {
      setComprobandoSesion(false);
    }
  }

  function accesoCorrecto() {
    setAutenticado(true);
  }

  if (comprobandoSesion) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080808",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Comprobando acceso...
      </div>
    );
  }

  if (!autenticado) {
    return (
      <LoginAdmin
        onLogin={accesoCorrecto}
      />
    );
  }

  return <AdminPanel />;
}

function AdminPanel() {
  const [seccionActiva, setSeccionActiva] =
    useState("inicio");

  const [profesores, setProfesores] =
    useState([]);

  const [actividades, setActividades] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);

      const [
        respuestaProfesores,
        respuestaActividades,
      ] = await Promise.all([
        fetch(
          "/api/profesores?admin=true",
          {
            cache: "no-store",
          }
        ),
        fetch(
          "/api/actividades?admin=true",
          {
            cache: "no-store",
          }
        ),
      ]);

      const datosProfesores =
        await respuestaProfesores.json();

      const datosActividades =
        await respuestaActividades.json();

      if (datosProfesores.correcto) {
        setProfesores(
          datosProfesores.profesores || []
        );
      }

      if (datosActividades.correcto) {
        setActividades(
          datosActividades.actividades || []
        );
      }

    } catch (error) {

      console.error(
        "Error cargando datos:",
        error
      );

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

  return (
        <div style={estilos.pagina}>

      {/* MENÚ LATERAL */}

      <aside style={estilos.menuLateral}>

        <div style={estilos.logoArea}>

          <div style={estilos.logo}>
            LB
          </div>

          <div>

            <div style={estilos.nombreEscuela}>
              Lucena
            </div>

            <div style={estilos.nombreEscuela}>
              Baila
            </div>

            <div style={estilos.administracion}>
              Administración
            </div>

          </div>

        </div>


        <nav style={estilos.navegacion}>

          {menu.map((item) => (

            <button
              key={item.id}
              type="button"
              onClick={() =>
                setSeccionActiva(item.id)
              }
              style={{
                ...estilos.botonMenu,
                ...(seccionActiva === item.id
                  ? estilos.botonMenuActivo
                  : {}),
              }}
            >

              <span style={estilos.iconoMenu}>
                {item.icono}
              </span>

              <span>
                {item.nombre}
              </span>

            </button>

          ))}

        </nav>


        <div style={estilos.estadoWeb}>

          <span style={estilos.puntoVerde}></span>

          <span>
            Web en pruebas
          </span>

        </div>

      </aside>


      {/* ZONA PRINCIPAL */}

      <div style={estilos.zonaPrincipal}>

        <header style={estilos.cabecera}>

          <div style={estilos.tituloPequeno}>
            PANEL DE ADMINISTRACIÓN
          </div>

          <h1 style={estilos.titulo}>
            Hola 👋
          </h1>

        </header>


        <main style={estilos.contenido}>

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


          {seccionActiva === "horarios" && (

            <Horarios
              actividades={actividades}
              profesores={profesores}
            />

          )}


          {seccionActiva === "eventos" && (

            <Eventos />

          )}


          {seccionActiva === "galeria" && (

            <Galeria />

          )}


          {seccionActiva === "mensajes" && (

            <SeccionProximamente
              titulo="Mensajes"
            />

          )}

        </main>

      </div>

    </div>
  );
}
           /* =========================================================
   INICIO
========================================================= */

function Inicio({
  profesores,
  actividades,
  cargando,
}) {

  return (

    <div>

      <div style={estilos.etiquetaSeccion}>
        RESUMEN
      </div>

      <h2 style={estilos.tituloSeccion}>
        Panel de administración
      </h2>

      <p style={estilos.descripcionSeccion}>
        Desde aquí puedes gestionar profesores,
        actividades, horarios y eventos de la escuela.
      </p>

      <div style={estilos.tarjetas}>

        <div style={estilos.tarjeta}>

          <div style={estilos.tarjetaIcono}>
            💃
          </div>

          <div style={estilos.tarjetaNumero}>
            {cargando
              ? "..."
              : actividades.length}
          </div>

          <div style={estilos.tarjetaTexto}>
            Actividades
          </div>

        </div>


        <div style={estilos.tarjeta}>

          <div style={estilos.tarjetaIcono}>
            👥
          </div>

          <div style={estilos.tarjetaNumero}>
            {cargando
              ? "..."
              : profesores.length}
          </div>

          <div style={estilos.tarjetaTexto}>
            Profesores
          </div>

        </div>


        <div style={estilos.tarjeta}>

          <div style={estilos.tarjetaIcono}>
            🕐
          </div>

          <div style={estilos.tarjetaNumero}>
            Horarios
          </div>

          <div style={estilos.tarjetaTexto}>
            Clases semanales
          </div>

        </div>

      </div>

    </div>
  );
}
        /* =========================================================
   ACTIVIDADES
========================================================= */

function Actividades({
  actividades,
  recargar,
}) {

  const [mostrandoFormulario, setMostrandoFormulario] =
    useState(false);

  const [editando, setEditando] =
    useState(null);

  const [nombre, setNombre] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [orden, setOrden] =
    useState(0);

  const [imagen, setImagen] =
    useState("");

  const [vistaPrevia, setVistaPrevia] =
    useState("");

  const [subiendoImagen, setSubiendoImagen] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);


  // =======================================================
  // LIMPIAR FORMULARIO
  // =======================================================

  function limpiarFormulario() {

    setNombre("");
    setDescripcion("");
    setOrden(0);
    setImagen("");
    setVistaPrevia("");
    setEditando(null);
    setMostrandoFormulario(false);

  }


  // =======================================================
  // NUEVA ACTIVIDAD
  // =======================================================

  function nuevaActividad() {

    setNombre("");
    setDescripcion("");
    setOrden(0);
    setImagen("");
    setVistaPrevia("");
    setEditando(null);
    setMostrandoFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  // =======================================================
  // EDITAR ACTIVIDAD
  // =======================================================

  function editarActividad(actividad) {

    setNombre(
      actividad.nombre || ""
    );

    setDescripcion(
      actividad.descripcion || ""
    );

    setOrden(
      actividad.orden || 0
    );

    setImagen(
      actividad.imagen || ""
    );

    setVistaPrevia(
      actividad.imagen || ""
    );

    setEditando(
      actividad
    );

    setMostrandoFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  // =======================================================
  // SUBIR CARTEL
  // =======================================================

  async function subirImagen(event) {

    const archivo =
      event.target.files?.[0];


    if (!archivo) {
      return;
    }


    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];


    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {

      alert(
        "El cartel debe ser JPG, PNG o WEBP."
      );

      event.target.value = "";

      return;

    }


    if (
      archivo.size >
      15 * 1024 * 1024
    ) {

      alert(
        "El cartel no puede superar los 15 MB."
      );

      event.target.value = "";

      return;

    }


    const preview =
      URL.createObjectURL(
        archivo
      );

    setVistaPrevia(
      preview
    );


    try {

      setSubiendoImagen(true);


      const formData =
        new FormData();


      formData.append(
        "imagen",
        archivo
      );


      const respuesta =
        await fetch(
          "/api/actividades-imagen",
          {
            method: "POST",
            body: formData,
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        console.error(
          "Error subiendo cartel:",
          datos
        );


        setImagen("");

        setVistaPrevia(
          editando?.imagen || ""
        );


        alert(
          datos.mensaje ||
          "No se pudo subir el cartel."
        );

        return;

      }


      const nuevaImagen =
        datos.ruta ||
        datos.imagen ||
        "";


      setImagen(
        nuevaImagen
      );

      setVistaPrevia(
        nuevaImagen
      );


    } catch (error) {

      console.error(
        "Error subiendo cartel:",
        error
      );


      setImagen("");

      setVistaPrevia(
        editando?.imagen || ""
      );


      alert(
        "Ha ocurrido un error al subir el cartel."
      );


    } finally {

      setSubiendoImagen(false);

      event.target.value = "";

    }

  }


  // =======================================================
  // QUITAR CARTEL
  // =======================================================

  function quitarImagen() {

    setImagen("");
    setVistaPrevia("");

  }


  // =======================================================
  // GUARDAR ACTIVIDAD
  // =======================================================

  async function guardarActividad(event) {

    event.preventDefault();


    if (!nombre.trim()) {

      alert(
        "El nombre de la actividad es obligatorio."
      );

      return;

    }


    if (subiendoImagen) {

      alert(
        "Espera a que termine de subir el cartel."
      );

      return;

    }


    try {

      setGuardando(true);


      const metodo =
        editando
          ? "PUT"
          : "POST";


      const cuerpo = {

        nombre:
          nombre.trim(),

        descripcion:
          descripcion.trim(),

        imagen:
          imagen || null,

        orden:
          Number(orden) || 0,

      };


      if (editando) {

        cuerpo.id =
          editando.id;

        cuerpo.activa =
          Number(
            editando.activa
          ) !== 0;

      }


      const respuesta =
        await fetch(
          "/api/actividades",
          {
            method:
              metodo,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                cuerpo
              ),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        console.error(
          "Error guardando actividad:",
          datos
        );


        alert(
          datos.mensaje ||
          "No se pudo guardar la actividad."
        );

        return;

      }


      limpiarFormulario();

      await recargar();


    } catch (error) {

      console.error(
        "Error guardando actividad:",
        error
      );


      alert(
        "Ha ocurrido un error al guardar la actividad."
      );


    } finally {

      setGuardando(false);

    }

  }


  // =======================================================
  // CAMBIAR ESTADO
  // =======================================================

  async function cambiarEstadoActividad(
    actividad
  ) {

    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/actividades",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                id:
                  actividad.id,

                nombre:
                  actividad.nombre,

                descripcion:
                  actividad.descripcion || "",

                imagen:
                  actividad.imagen || null,

                activa:
                  Number(
                    actividad.activa
                  ) === 0,

                orden:
                  Number(
                    actividad.orden
                  ) || 0,

              }),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo cambiar el estado."
        );

        return;

      }


      await recargar();


    } catch (error) {

      console.error(
        "Error cambiando estado:",
        error
      );


      alert(
        "Ha ocurrido un error al cambiar el estado."
      );


    } finally {

      setGuardando(false);

    }

  }


  // =======================================================
  // ELIMINAR ACTIVIDAD
  // =======================================================

  async function eliminarActividad(
    actividad
  ) {

    const confirmar =
      window.confirm(
        `¿Seguro que quieres eliminar la actividad "${actividad.nombre}"?\n\nTambién se eliminarán sus asignaciones y horarios relacionados.`
      );


    if (!confirmar) {
      return;
    }


    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/actividades",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id:
                  actividad.id,
              }),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo eliminar la actividad."
        );

        return;

      }


      await recargar();


    } catch (error) {

      console.error(
        "Error eliminando actividad:",
        error
      );


      alert(
        "Ha ocurrido un error al eliminar la actividad."
      );


    } finally {

      setGuardando(false);

    }

  }


  return (

    <div>

      <div style={estilos.cabeceraSeccion}>

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

        </div>


        <button
          type="button"
          onClick={
            nuevaActividad
          }
          style={
            estilos.botonNuevo
          }
        >
          + Añadir actividad
        </button>

      </div>


      {mostrandoFormulario && (

        <div style={estilos.editor}>

          <div style={estilos.editorCabecera}>

            <div style={estilos.editorTitulo}>
              {editando
                ? "Editar actividad"
                : "Nueva actividad"}
            </div>

          </div>


          <form
            onSubmit={
              guardarActividad
            }
          >

            <label style={estilos.label}>
              Nombre
            </label>


            <input
              value={nombre}
              onChange={(e) =>
                setNombre(
                  e.target.value
                )
              }
              placeholder="Ej.: Bachata"
              style={estilos.input}
              disabled={
                guardando ||
                subiendoImagen
              }
            />


            <label style={estilos.label}>
              Descripción
            </label>


            <textarea
              value={descripcion}
              onChange={(e) =>
                setDescripcion(
                  e.target.value
                )
              }
              placeholder="Descripción de la actividad"
              style={estilos.textarea}
              rows={3}
              disabled={
                guardando ||
                subiendoImagen
              }
            />


            <label style={estilos.label}>
              Cartel de la actividad
            </label>


            <div
              style={{
                border:
                  "1px dashed rgba(255,255,255,0.18)",
                borderRadius:
                  "16px",
                padding:
                  "18px",
                marginBottom:
                  "20px",
              }}
            >

              {vistaPrevia ? (

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "18px",
                    flexWrap:
                      "wrap",
                  }}
                >

                  <img
                    src={vistaPrevia}
                    alt={
                      `Cartel de ${nombre}`
                    }
                    style={{
                      width:
                        "150px",
                      maxHeight:
                        "210px",
                      objectFit:
                        "contain",
                      borderRadius:
                        "12px",
                      display:
                        "block",
                      background:
                        "rgba(255,255,255,0.05)",
                    }}
                  />


                  <div>

                    <div
                      style={{
                        color:
                          "#ffffff",
                        fontWeight:
                          "700",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Cartel seleccionado
                    </div>


                    {subiendoImagen && (

                      <div
                        style={{
                          color:
                            "#ff9aa5",
                          fontSize:
                            "13px",
                          marginBottom:
                            "12px",
                        }}
                      >
                        📤 Subiendo cartel...
                      </div>

                    )}


                    {!subiendoImagen &&
                      imagen && (

                        <div
                          style={{
                            color:
                              "#9ff0b2",
                            fontSize:
                              "13px",
                            marginBottom:
                              "12px",
                          }}
                        >
                          ✓ Cartel subido correctamente
                        </div>

                      )}


                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "10px",
                        flexWrap:
                          "wrap",
                      }}
                    >

                      <label
                        style={{
                          ...estilos.botonNuevo,
                          display:
                            "inline-flex",
                          cursor:
                            "pointer",
                          fontSize:
                            "12px",
                        }}
                      >

                        Cambiar cartel

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            subirImagen
                          }
                          style={{
                            display:
                              "none",
                          }}
                          disabled={
                            guardando ||
                            subiendoImagen
                          }
                        />

                      </label>


                      <button
                        type="button"
                        onClick={
                          quitarImagen
                        }
                        style={{
                          ...estilos.botonCancelar,
                          fontSize:
                            "12px",
                        }}
                        disabled={
                          guardando ||
                          subiendoImagen
                        }
                      >
                        Quitar cartel
                      </button>

                    </div>

                  </div>

                </div>

              ) : (

                <div>

                  <div
                    style={{
                      color:
                        "rgba(255,255,255,0.65)",
                      fontSize:
                        "13px",
                      marginBottom:
                        "14px",
                    }}
                  >
                    Añade el cartel A4 de esta actividad.
                  </div>


                  <label
                    style={{
                      ...estilos.botonNuevo,
                      display:
                        "inline-flex",
                      cursor:
                        "pointer",
                    }}
                  >

                    📷 Seleccionar cartel

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        subirImagen
                      }
                      style={{
                        display:
                          "none",
                      }}
                      disabled={
                        guardando ||
                        subiendoImagen
                      }
                    />

                  </label>

                </div>

              )}

            </div>


            <label style={estilos.label}>
              Orden
            </label>


            <input
              type="number"
              value={orden}
              onChange={(e) =>
                setOrden(
                  e.target.value
                )
              }
              style={estilos.input}
              disabled={
                guardando ||
                subiendoImagen
              }
            />


            <div style={estilos.botonesEditor}>

              <button
                type="button"
                onClick={
                  limpiarFormulario
                }
                style={
                  estilos.botonCancelar
                }
                disabled={
                  guardando ||
                  subiendoImagen
                }
              >
                Cancelar
              </button>


              <button
                type="submit"
                style={
                  estilos.botonGuardar
                }
                disabled={
                  guardando ||
                  subiendoImagen
                }
              >
                {subiendoImagen
                  ? "Subiendo cartel..."
                  : guardando
                  ? "Guardando..."
                  : editando
                  ? "Guardar cambios"
                  : "Crear actividad"}
              </button>

            </div>

          </form>

        </div>

      )}


      <div style={estilos.lista}>

        {actividades.length === 0 ? (

          <div style={estilos.vacio}>
            No hay actividades creadas.
          </div>

        ) : (

          actividades.map(
            (actividad, indice) => (

              <div
                key={
                  actividad.id
                }
                style={
                  estilos.fila
                }
              >

                <div style={estilos.numero}>
                  {String(
                    indice + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>


                <div
                  style={{
                    width:
                      "58px",
                    height:
                      "78px",
                    borderRadius:
                      "10px",
                    overflow:
                      "hidden",
                    flexShrink:
                      0,
                    background:
                      "rgba(255,255,255,0.06)",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    marginRight:
                      "16px",
                  }}
                >

                  {actividad.imagen ? (

                    <img
                      src={
                        actividad.imagen
                      }
                      alt={
                        actividad.nombre
                      }
                      style={{
                        width:
                          "100%",
                        height:
                          "100%",
                        objectFit:
                          "cover",
                      }}
                    />

                  ) : (

                    <span
                      style={{
                        fontSize:
                          "22px",
                        opacity:
                          0.45,
                      }}
                    >
                      🖼️
                    </span>

                  )}

                </div>


                <div
                  style={
                    estilos.filaContenido
                  }
                >

                  <div
                    style={
                      estilos.filaTitulo
                    }
                  >
                    {actividad.nombre}
                  </div>


                  {actividad.descripcion && (

                    <div
                      style={
                        estilos.filaDescripcion
                      }
                    >
                      {
                        actividad.descripcion
                      }
                    </div>

                  )}


                  {actividad.imagen ? (

                    <div
                      style={{
                        ...estilos.filaDescripcion,
                        color:
                          "#9ff0b2",
                        marginTop:
                          "5px",
                      }}
                    >
                      ✓ Cartel configurado
                    </div>

                  ) : (

                    <div
                      style={{
                        ...estilos.filaDescripcion,
                        color:
                          "#ff9aa5",
                        marginTop:
                          "5px",
                      }}
                    >
                      ⚠ Sin cartel
                    </div>

                  )}

                </div>


                <div
                  style={
                    estilos.filaAcciones
                  }
                >

                  <button
                    type="button"
                    onClick={() =>
                      cambiarEstadoActividad(
                        actividad
                      )
                    }
                    style={{
                      ...estilos.estadoActivo,
                      border:
                        "0",
                      cursor:
                        "pointer",
                    }}
                    disabled={
                      guardando
                    }
                  >

                    {Number(
                      actividad.activa
                    ) !== 0
                      ? "ACTIVA"
                      : "OCULTA"}

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      editarActividad(
                        actividad
                      )
                    }
                    style={
                      estilos.botonEditar
                    }
                    disabled={
                      guardando
                    }
                  >
                    Editar
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      eliminarActividad(
                        actividad
                      )
                    }
                    style={{
                      ...estilos.botonEditar,
                      color:
                        "#ff8995",
                    }}
                    disabled={
                      guardando
                    }
                  >
                    Eliminar
                  </button>

                </div>

              </div>

            )

          )

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

  const [
    mostrandoFormulario,
    setMostrandoFormulario,
  ] = useState(false);

  const [nombre, setNombre] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [foto, setFoto] =
    useState("");

  const [vistaPrevia, setVistaPrevia] =
    useState("");

  const [
    actividadesSeleccionadas,
    setActividadesSeleccionadas,
  ] = useState([]);

  const [guardando, setGuardando] =
    useState(false);

  const [subiendoFoto, setSubiendoFoto] =
    useState(false);


  function limpiarFormulario() {

    setNombre("");
    setDescripcion("");
    setFoto("");
    setVistaPrevia("");
    setActividadesSeleccionadas([]);
    setMostrandoFormulario(false);

  }


  function nuevoProfesor() {

    setNombre("");
    setDescripcion("");
    setFoto("");
    setVistaPrevia("");
    setActividadesSeleccionadas([]);
    setMostrandoFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  async function subirFoto(event) {

    const archivo =
      event.target.files?.[0];

    if (!archivo) {
      return;
    }


    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];


    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {

      alert(
        "La fotografía debe ser JPG, PNG, WEBP o GIF."
      );

      event.target.value = "";

      return;

    }


    if (
      archivo.size >
      10 * 1024 * 1024
    ) {

      alert(
        "La fotografía no puede superar los 10 MB."
      );

      event.target.value = "";

      return;

    }


    const preview =
      URL.createObjectURL(
        archivo
      );

    setVistaPrevia(
      preview
    );


    try {

      setSubiendoFoto(true);


      const formData =
        new FormData();


      formData.append(
        "foto",
        archivo
      );


      const respuesta =
        await fetch(
          "/api/profesores-imagen",
          {
            method: "POST",
            body: formData,
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        console.error(
          "Error subiendo fotografía:",
          datos
        );


        setFoto("");
        setVistaPrevia("");


        alert(
          datos.mensaje ||
          "No se pudo subir la fotografía."
        );


        return;

      }


      setFoto(
        datos.ruta ||
        datos.foto ||
        ""
      );


    } catch (error) {

      console.error(
        "Error subiendo fotografía:",
        error
      );


      setFoto("");
      setVistaPrevia("");


      alert(
        "Ha ocurrido un error al subir la fotografía."
      );


    } finally {

      setSubiendoFoto(false);

      event.target.value = "";

    }

  }


  function quitarFoto() {

    setFoto("");
    setVistaPrevia("");

  }


  function cambiarActividadNuevoProfesor(id) {

    setActividadesSeleccionadas(
      (actuales) => {

        if (
          actuales.includes(id)
        ) {

          return actuales.filter(
            (actividadId) =>
              actividadId !== id
          );

        }


        return [
          ...actuales,
          id,
        ];

      }
    );

  }


  async function guardarProfesor(event) {

    event.preventDefault();


    if (!nombre.trim()) {

      alert(
        "El nombre del profesor es obligatorio."
      );

      return;

    }


    if (subiendoFoto) {

      alert(
        "Espera a que termine de subir la fotografía."
      );

      return;

    }


    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/profesores",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                nombre:
                  nombre.trim(),

                descripcion:
                  descripcion.trim(),

                foto:
                  foto || null,

                actividadIds:
                  actividadesSeleccionadas,

              }),

          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        console.error(
          "Error creando profesor:",
          datos
        );


        alert(
          datos.mensaje ||
          "No se pudo crear el profesor."
        );


        return;

      }


      limpiarFormulario();

      await recargar();


    } catch (error) {

      console.error(
        "Error creando profesor:",
        error
      );


      alert(
        "Ha ocurrido un error al crear el profesor."
      );


    } finally {

      setGuardando(false);

    }

  }


  return (

    <div>

      <div style={estilos.cabeceraSeccion}>

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

        </div>


        <button
          type="button"
          onClick={nuevoProfesor}
          style={estilos.botonNuevo}
        >
          + Añadir profesor
        </button>

      </div>


      {mostrandoFormulario && (

        <div style={estilos.editor}>

          <div style={estilos.editorCabecera}>

            <div style={estilos.editorTitulo}>
              Nuevo profesor
            </div>

          </div>


          <form
            onSubmit={
              guardarProfesor
            }
          >

            <label style={estilos.label}>
              Nombre
            </label>


            <input
              value={nombre}
              onChange={(e) =>
                setNombre(
                  e.target.value
                )
              }
              placeholder="Ej.: Juárez"
              style={estilos.input}
              disabled={
                guardando ||
                subiendoFoto
              }
            />


            <label style={estilos.label}>
              Descripción
            </label>


            <textarea
              value={descripcion}
              onChange={(e) =>
                setDescripcion(
                  e.target.value
                )
              }
              placeholder="Descripción del profesor"
              style={estilos.textarea}
              rows={3}
              disabled={
                guardando ||
                subiendoFoto
              }
            />


            <label style={estilos.label}>
              Fotografía del profesor
            </label>


            <div
              style={{
                border:
                  "1px dashed rgba(255,255,255,0.18)",
                borderRadius:
                  "16px",
                padding:
                  "18px",
                marginBottom:
                  "20px",
              }}
            >

              {vistaPrevia ? (

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "18px",
                    flexWrap:
                      "wrap",
                  }}
                >

                  <img
                    src={vistaPrevia}
                    alt="Vista previa"
                    style={{
                      width:
                        "130px",
                      height:
                        "130px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "16px",
                      display:
                        "block",
                    }}
                  />


                  <div>

                    <div
                      style={{
                        color:
                          "#ffffff",
                        fontWeight:
                          "700",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Fotografía seleccionada
                    </div>


                    {subiendoFoto && (

                      <div
                        style={{
                          color:
                            "#ff9aa5",
                          fontSize:
                            "13px",
                          marginBottom:
                            "12px",
                        }}
                      >
                        📤 Subiendo fotografía...
                      </div>

                    )}


                    {!subiendoFoto &&
                      foto && (

                        <div
                          style={{
                            color:
                              "#9ff0b2",
                            fontSize:
                              "13px",
                            marginBottom:
                              "12px",
                          }}
                        >
                          ✓ Fotografía subida correctamente
                        </div>

                      )}


                    <button
                      type="button"
                      onClick={
                        quitarFoto
                      }
                      style={{
                        ...estilos.botonCancelar,
                        fontSize:
                          "12px",
                      }}
                      disabled={
                        guardando ||
                        subiendoFoto
                      }
                    >
                      Quitar fotografía
                    </button>

                  </div>

                </div>

              ) : (

                <div>

                  <div
                    style={{
                      color:
                        "rgba(255,255,255,0.65)",
                      fontSize:
                        "13px",
                      marginBottom:
                        "14px",
                    }}
                  >
                    Añade una fotografía del profesor.
                  </div>


                  <label
                    style={{
                      ...estilos.botonNuevo,
                      display:
                        "inline-flex",
                      cursor:
                        "pointer",
                    }}
                  >

                    📷 Seleccionar fotografía

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={
                        subirFoto
                      }
                      style={{
                        display:
                          "none",
                      }}
                      disabled={
                        guardando ||
                        subiendoFoto
                      }
                    />

                  </label>

                </div>

              )}

            </div>


            <label style={estilos.label}>
              Actividades que imparte
            </label>


            <div
              style={
                estilos.actividadesChecks
              }
            >

              {actividades.map(
                (actividad) => {

                  const seleccionada =
                    actividadesSeleccionadas.includes(
                      actividad.id
                    );


                  return (

                    <label
                      key={
                        actividad.id
                      }
                      style={{
                        ...estilos.check,
                        ...(seleccionada
                          ? estilos.checkActivo
                          : {}),
                      }}
                    >

                      <input
                        type="checkbox"
                        checked={
                          seleccionada
                        }
                        onChange={() =>
                          cambiarActividadNuevoProfesor(
                            actividad.id
                          )
                        }
                        disabled={
                          guardando ||
                          subiendoFoto
                        }
                      />


                      <span>
                        {
                          actividad.nombre
                        }
                      </span>

                    </label>

                  );

                }
              )}

            </div>


            <div
              style={
                estilos.botonesEditor
              }
            >

              <button
                type="button"
                onClick={
                  limpiarFormulario
                }
                style={
                  estilos.botonCancelar
                }
                disabled={
                  guardando ||
                  subiendoFoto
                }
              >
                Cancelar
              </button>


              <button
                type="submit"
                style={
                  estilos.botonGuardar
                }
                disabled={
                  guardando ||
                  subiendoFoto
                }
              >
                {subiendoFoto
                  ? "Subiendo fotografía..."
                  : guardando
                  ? "Guardando..."
                  : "Crear profesor"}
              </button>

            </div>

          </form>

        </div>

      )}


      <div style={estilos.lista}>

        {profesores.length === 0 ? (

          <div style={estilos.vacio}>
            No hay profesores creados.
          </div>

        ) : (

          profesores.map(
            (profesor, indice) => (

              <ProfesorFila
                key={
                  profesor.id
                }
                profesor={
                  profesor
                }
                indice={
                  indice
                }
                actividades={
                  actividades
                }
                recargar={
                  recargar
                }
              />

            )
          )

        )}

      </div>

    </div>

  );

}


/* =========================================================
   FILA PROFESOR
========================================================= */

function ProfesorFila({
  profesor,
  indice,
  actividades,
  recargar,
}) {

  const [editando, setEditando] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [nombre, setNombre] =
    useState(
      profesor.nombre || ""
    );

  const [descripcion, setDescripcion] =
    useState(
      profesor.descripcion || ""
    );

  const [foto, setFoto] =
    useState(
      profesor.foto || ""
    );

  const [vistaPrevia, setVistaPrevia] =
    useState(
      profesor.foto || ""
    );

  const [subiendoFoto, setSubiendoFoto] =
    useState(false);

  const [
    actividadesSeleccionadas,
    setActividadesSeleccionadas,
  ] = useState(
    profesor.actividad_ids || []
  );


  function cambiarActividad(id) {

    setActividadesSeleccionadas(
      (actuales) => {

        if (
          actuales.includes(id)
        ) {

          return actuales.filter(
            (item) =>
              item !== id
          );

        }


        return [
          ...actuales,
          id,
        ];

      }
    );

  }


  async function subirFoto(event) {

    const archivo =
      event.target.files?.[0];


    if (!archivo) {
      return;
    }


    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];


    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {

      alert(
        "La fotografía debe ser JPG, PNG, WEBP o GIF."
      );

      event.target.value = "";

      return;

    }


    if (
      archivo.size >
      10 * 1024 * 1024
    ) {

      alert(
        "La fotografía no puede superar los 10 MB."
      );

      event.target.value = "";

      return;

    }


    const preview =
      URL.createObjectURL(
        archivo
      );

    setVistaPrevia(
      preview
    );


    try {

      setSubiendoFoto(true);


      const formData =
        new FormData();


      formData.append(
        "foto",
        archivo
      );


      const respuesta =
        await fetch(
          "/api/profesores-imagen",
          {
            method: "POST",
            body: formData,
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        console.error(
          "Error subiendo fotografía:",
          datos
        );


        setVistaPrevia(
          foto || ""
        );


        alert(
          datos.mensaje ||
          "No se pudo subir la fotografía."
        );


        return;

      }


      const nuevaFoto =
        datos.ruta ||
        datos.foto ||
        "";


      setFoto(
        nuevaFoto
      );

      setVistaPrevia(
        nuevaFoto
      );


    } catch (error) {

      console.error(
        "Error subiendo fotografía:",
        error
      );


      setVistaPrevia(
        foto || ""
      );


      alert(
        "Ha ocurrido un error al subir la fotografía."
      );


    } finally {

      setSubiendoFoto(false);

      event.target.value = "";

    }

  }


  function quitarFoto() {

    setFoto("");
    setVistaPrevia("");

  }


  async function guardarCambios() {

    if (subiendoFoto) {

      alert(
        "Espera a que termine de subir la fotografía."
      );

      return;

    }


    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/profesores",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                id:
                  profesor.id,

                nombre:
                  nombre.trim(),

                descripcion:
                  descripcion.trim(),

                foto:
                  foto || null,

                actividadIds:
                  actividadesSeleccionadas,

                activa:
                  Number(
                    profesor.activa
                  ) !== 0,

                orden:
                  Number(
                    profesor.orden
                  ) || 0,

              }),

          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        console.error(
          "Error recibido de la API:",
          datos
        );


        alert(
          [
            datos.mensaje ||
              "Error al guardar el profesor.",

            datos.error
              ? `\n\nError: ${datos.error}`
              : "",

            datos.codigo
              ? `\nCódigo: ${datos.codigo}`
              : "",

            datos.sqlMessage
              ? `\n\nMySQL: ${datos.sqlMessage}`
              : "",
          ].join("")
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


  async function cambiarEstadoProfesor() {

    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/profesores",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                id:
                  profesor.id,

                nombre:
                  profesor.nombre,

                descripcion:
                  profesor.descripcion || "",

                foto:
                  profesor.foto || null,

                actividadIds:
                  profesor.actividad_ids || [],

                activa:
                  Number(
                    profesor.activa
                  ) === 0,

                orden:
                  Number(
                    profesor.orden
                  ) || 0,

              }),

          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo cambiar el estado."
        );

        return;

      }


      await recargar();


    } catch (error) {

      console.error(
        "Error cambiando estado del profesor:",
        error
      );


      alert(
        "Ha ocurrido un error al cambiar el estado."
      );


    } finally {

      setGuardando(false);

    }

  }


  async function eliminarProfesor() {

    const confirmar =
      window.confirm(
        `¿Seguro que quieres eliminar al profesor "${profesor.nombre}"?\n\nTambién se eliminarán sus asignaciones de actividades.`
      );


    if (!confirmar) {
      return;
    }


    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/profesores",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id:
                  profesor.id,
              }),

          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo eliminar el profesor."
        );

        return;

      }


      await recargar();


    } catch (error) {

      console.error(
        "Error eliminando profesor:",
        error
      );


      alert(
        "Ha ocurrido un error al eliminar el profesor."
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
            {String(
              indice + 1
            ).padStart(
              2,
              "0"
            )}
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
          onChange={(e) =>
            setNombre(
              e.target.value
            )
          }
          style={estilos.input}
          disabled={
            guardando ||
            subiendoFoto
          }
        />


        <label style={estilos.label}>
          Descripción
        </label>


        <textarea
          value={descripcion}
          onChange={(e) =>
            setDescripcion(
              e.target.value
            )
          }
          style={estilos.textarea}
          rows={3}
          disabled={
            guardando ||
            subiendoFoto
          }
        />


        <label style={estilos.label}>
          Fotografía del profesor
        </label>


        <div
          style={{
            border:
              "1px dashed rgba(255,255,255,0.18)",
            borderRadius:
              "16px",
            padding:
              "18px",
            marginBottom:
              "20px",
          }}
        >

          {vistaPrevia ? (

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "18px",
                flexWrap:
                  "wrap",
              }}
            >

              <img
                src={vistaPrevia}
                alt={
                  `Foto de ${nombre}`
                }
                style={{
                  width:
                    "130px",
                  height:
                    "130px",
                  objectFit:
                    "cover",
                  borderRadius:
                    "16px",
                  display:
                    "block",
                }}
              />


              <div>

                <div
                  style={{
                    color:
                      "#ffffff",
                    fontWeight:
                      "700",
                    marginBottom:
                      "8px",
                  }}
                >
                  Fotografía del profesor
                </div>


                {subiendoFoto && (

                  <div
                    style={{
                      color:
                        "#ff9aa5",
                      fontSize:
                        "13px",
                      marginBottom:
                        "12px",
                    }}
                  >
                    📤 Subiendo fotografía...
                  </div>

                )}


                {!subiendoFoto && (

                  <div
                    style={{
                      color:
                        "#9ff0b2",
                      fontSize:
                        "13px",
                      marginBottom:
                        "12px",
                    }}
                  >
                    ✓ Fotografía lista
                  </div>

                )}


                <div
                  style={{
                    display:
                      "flex",
                    gap:
                      "10px",
                    flexWrap:
                      "wrap",
                  }}
                >

                  <label
                    style={{
                      ...estilos.botonNuevo,
                      display:
                        "inline-flex",
                      cursor:
                        "pointer",
                      fontSize:
                        "12px",
                    }}
                  >

                    Cambiar fotografía

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={
                        subirFoto
                      }
                      style={{
                        display:
                          "none",
                      }}
                      disabled={
                        guardando ||
                        subiendoFoto
                      }
                    />

                  </label>


                  <button
                    type="button"
                    onClick={
                      quitarFoto
                    }
                    style={{
                      ...estilos.botonCancelar,
                      fontSize:
                        "12px",
                    }}
                    disabled={
                      guardando ||
                      subiendoFoto
                    }
                  >
                    Quitar fotografía
                  </button>

                </div>

              </div>

            </div>

          ) : (

            <div>

              <div
                style={{
                  color:
                    "rgba(255,255,255,0.65)",
                  fontSize:
                    "13px",
                  marginBottom:
                    "14px",
                }}
              >
                Este profesor no tiene fotografía.
              </div>


              <label
                style={{
                  ...estilos.botonNuevo,
                  display:
                    "inline-flex",
                  cursor:
                    "pointer",
                }}
              >

                📷 Seleccionar fotografía

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={
                    subirFoto
                  }
                  style={{
                    display:
                      "none",
                  }}
                  disabled={
                    guardando ||
                    subiendoFoto
                  }
                />

              </label>

            </div>

          )}

        </div>


        <label style={estilos.label}>
          Actividades que imparte
        </label>


        <div
          style={
            estilos.actividadesChecks
          }
        >

          {actividades.map(
            (actividad) => {

              const seleccionada =
                actividadesSeleccionadas.includes(
                  actividad.id
                );


              return (

                <label
                  key={
                    actividad.id
                  }
                  style={{
                    ...estilos.check,
                    ...(seleccionada
                      ? estilos.checkActivo
                      : {}),
                  }}
                >

                  <input
                    type="checkbox"
                    checked={
                      seleccionada
                    }
                    onChange={() =>
                      cambiarActividad(
                        actividad.id
                      )
                    }
                    disabled={
                      guardando ||
                      subiendoFoto
                    }
                  />


                  <span>
                    {actividad.nombre}
                  </span>

                </label>

              );

            }
          )}

        </div>


        <div
          style={
            estilos.botonesEditor
          }
        >

          <button
            type="button"
            onClick={() =>
              setEditando(false)
            }
            style={
              estilos.botonCancelar
            }
            disabled={
              guardando ||
              subiendoFoto
            }
          >
            Cancelar
          </button>


          <button
            type="button"
            onClick={
              guardarCambios
            }
            style={
              estilos.botonGuardar
            }
            disabled={
              guardando ||
              subiendoFoto
            }
          >
            {subiendoFoto
              ? "Subiendo fotografía..."
              : guardando
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
        {String(
          indice + 1
        ).padStart(
          2,
          "0"
        )}
      </div>


      <div
        style={{
          width:
            "58px",
          height:
            "58px",
          borderRadius:
            "12px",
          overflow:
            "hidden",
          flexShrink:
            0,
          background:
            "rgba(255,255,255,0.06)",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          marginRight:
            "16px",
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
            }}
          />

        ) : (

          <span
            style={{
              fontSize:
                "22px",
              opacity:
                0.45,
            }}
          >
            👤
          </span>

        )}

      </div>


      <div
        style={
          estilos.filaContenido
        }
      >

        <div
          style={
            estilos.filaTitulo
          }
        >
          {profesor.nombre}
        </div>


        <div
          style={
            estilos.filaDescripcion
          }
        >
          {profesor.descripcion ||
            "Sin descripción"}
        </div>


        <div style={estilos.chips}>

          {profesor.actividad_ids &&
          profesor.actividad_ids.length >
            0 ? (

            profesor.actividad_ids.map(
              (actividadId) => {

                const actividad =
                  actividades.find(
                    (item) =>
                      item.id ===
                      actividadId
                  );


                if (!actividad) {
                  return null;
                }


                return (

                  <span
                    key={
                      actividadId
                    }
                    style={
                      estilos.chip
                    }
                  >
                    {actividad.nombre}
                  </span>

                );

              }
            )

          ) : (

            <span
              style={
                estilos.sinActividades
              }
            >
              Sin actividades asignadas
            </span>

          )}

        </div>

      </div>


      <div
        style={
          estilos.filaAcciones
        }
      >

        <button
          type="button"
          onClick={
            cambiarEstadoProfesor
          }
          style={{
            ...estilos.estadoActivo,
            border:
              "0",
            cursor:
              "pointer",
          }}
          disabled={
            guardando
          }
        >

          {Number(
            profesor.activa
          ) !== 0
            ? "ACTIVO"
            : "OCULTO"}

        </button>


        <button
          type="button"
          onClick={() =>
            setEditando(true)
          }
          style={
            estilos.botonEditar
          }
          disabled={
            guardando
          }
        >
          Editar
        </button>


        <button
          type="button"
          onClick={
            eliminarProfesor
          }
          style={{
            ...estilos.botonEditar,
            color:
              "#ff8995",
          }}
          disabled={
            guardando
          }
        >
          Eliminar
        </button>

      </div>

    </div>

  );

}
/* =========================================================
   HORARIOS
========================================================= */

function Horarios({
  actividades,
  profesores,
}) {

  const [horarios, setHorarios] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [editando, setEditando] =
    useState(null);


  const horarioInicial = {
    actividadId: "",
    dia: "Lunes",
    horaInicio: "",
    horaFin: "",
    nivel: "",
    profesorIds: [],
    orden: 0,
  };


  const [formulario, setFormulario] =
    useState(horarioInicial);


  const dias = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];


  async function cargarHorarios() {

    try {

      setCargando(true);


      const respuesta =
        await fetch(
          "/api/horarios",
          {
            cache: "no-store",
          }
        );


      const datos =
        await respuesta.json();


      if (datos.correcto) {

        setHorarios(
          datos.horarios || []
        );

      } else {

        alert(
          datos.mensaje ||
          "No se pudieron cargar los horarios."
        );

      }


    } catch (error) {

      console.error(error);

      alert(
        "Error cargando los horarios."
      );

    } finally {

      setCargando(false);

    }

  }


  useEffect(() => {
    cargarHorarios();
  }, []);


  function cambiarProfesor(id) {

    setFormulario((actual) => {

      const existe =
        actual.profesorIds.includes(id);


      return {

        ...actual,

        profesorIds:
          existe
            ? actual.profesorIds.filter(
                (profesorId) =>
                  profesorId !== id
              )
            : [
                ...actual.profesorIds,
                id,
              ],

      };

    });

  }


  async function guardarHorario(event) {

    event.preventDefault();


    if (!formulario.actividadId) {

      alert(
        "Selecciona una actividad."
      );

      return;
    }


    if (
      !formulario.horaInicio ||
      !formulario.horaFin
    ) {

      alert(
        "Indica la hora de inicio y de fin."
      );

      return;
    }


    try {

      setGuardando(true);


      const metodo =
        editando
          ? "PUT"
          : "POST";


      const cuerpo = {

        ...formulario,

        ...(editando
          ? {
              id:
                editando.id,
            }
          : {}),

      };


      const respuesta =
        await fetch(
          "/api/horarios",
          {
            method:
              metodo,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                cuerpo
              ),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo guardar el horario."
        );

        return;
      }


      setFormulario(
        horarioInicial
      );

      setEditando(null);

      await cargarHorarios();


    } catch (error) {

      console.error(error);

      alert(
        "Error guardando el horario."
      );

    } finally {

      setGuardando(false);

    }

  }


  function editarHorario(horario) {

    setEditando(horario);


    setFormulario({

      actividadId:
        horario.actividad_id,

      dia:
        horario.dia,

      horaInicio:
        String(
          horario.hora_inicio
        ).slice(0, 5),

      horaFin:
        String(
          horario.hora_fin
        ).slice(0, 5),

      nivel:
        horario.nivel || "",

      profesorIds:
        horario.profesor_ids || [],

      orden:
        horario.orden || 0,

    });


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  async function eliminarHorario(id) {

    const confirmar =
      window.confirm(
        "¿Seguro que quieres eliminar este horario?"
      );


    if (!confirmar) {
      return;
    }


    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/horarios",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id,
              }),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo eliminar."
        );

        return;
      }


      await cargarHorarios();


    } catch (error) {

      console.error(error);

      alert(
        "Error eliminando el horario."
      );

    } finally {

      setGuardando(false);

    }

  }


  function cancelarEdicion() {

    setEditando(null);

    setFormulario(
      horarioInicial
    );

  }


  function nombreActividad(id) {

    const actividad =
      actividades.find(
        (item) =>
          item.id === id
      );


    return actividad
      ? actividad.nombre
      : "Actividad";

  }


  function nombresProfesores(ids) {

    return ids
      .map((id) => {

        const profesor =
          profesores.find(
            (item) =>
              item.id === id
          );


        return profesor
          ? profesor.nombre
          : null;

      })
      .filter(Boolean)
      .join(" · ");

  }


  return (

    <div>

      <div style={estilos.etiquetaSeccion}>
        HORARIOS
      </div>


      <h2 style={estilos.tituloSeccion}>
        Horarios
      </h2>


      <p style={estilos.descripcionSeccion}>
        Organiza las clases semanales de la escuela.
      </p>


      <div style={estilos.editor}>

        <div style={estilos.editorTitulo}>
          {editando
            ? "Editar horario"
            : "Añadir nuevo horario"}
        </div>


        <form onSubmit={guardarHorario}>

          <label style={estilos.label}>
            Actividad
          </label>


          <select
            value={
              formulario.actividadId
            }
            onChange={(event) =>
              setFormulario({
                ...formulario,
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


          <label style={estilos.label}>
            Día
          </label>


          <select
            value={
              formulario.dia
            }
            onChange={(event) =>
              setFormulario({
                ...formulario,
                dia:
                  event.target.value,
              })
            }
            style={estilos.input}
            disabled={guardando}
          >

            {dias.map((dia) => (

              <option
                key={dia}
                value={dia}
              >
                {dia}
              </option>

            ))}

          </select>


          <label style={estilos.label}>
            Hora de inicio
          </label>


          <input
            type="time"
            value={
              formulario.horaInicio
            }
            onChange={(event) =>
              setFormulario({
                ...formulario,
                horaInicio:
                  event.target.value,
              })
            }
            style={estilos.input}
            disabled={guardando}
          />


          <label style={estilos.label}>
            Hora de fin
          </label>


          <input
            type="time"
            value={
              formulario.horaFin
            }
            onChange={(event) =>
              setFormulario({
                ...formulario,
                horaFin:
                  event.target.value,
              })
            }
            style={estilos.input}
            disabled={guardando}
          />


          <label style={estilos.label}>
            Nivel / grupo
          </label>


          <input
            type="text"
            value={
              formulario.nivel
            }
            onChange={(event) =>
              setFormulario({
                ...formulario,
                nivel:
                  event.target.value,
              })
            }
            placeholder="Ej.: Inicial"
            style={estilos.input}
            disabled={guardando}
          />


          <label style={estilos.label}>
            Profesores
          </label>


          <div
            style={
              estilos.actividadesChecks
            }
          >

            {profesores.map(
              (profesor) => {

                const seleccionado =
                  formulario.profesorIds.includes(
                    profesor.id
                  );


                return (

                  <label
                    key={profesor.id}
                    style={{
                      ...estilos.check,
                      ...(seleccionado
                        ? estilos.checkActivo
                        : {}),
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={
                        seleccionado
                      }
                      onChange={() =>
                        cambiarProfesor(
                          profesor.id
                        )
                      }
                    />

                    {profesor.nombre}

                  </label>

                );

              }
            )}

          </div>


          <div style={estilos.botonesEditor}>

            {editando && (

              <button
                type="button"
                onClick={
                  cancelarEdicion
                }
                style={
                  estilos.botonCancelar
                }
                disabled={guardando}
              >
                Cancelar
              </button>

            )}


            <button
              type="submit"
              style={
                estilos.botonGuardar
              }
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : editando
                ? "Guardar cambios"
                : "Añadir horario"}
            </button>

          </div>

        </form>

      </div>


      <div
        style={{
          marginTop: "30px",
        }}
      >

        <div style={estilos.etiquetaSeccion}>
          HORARIOS CREADOS
        </div>


        {cargando ? (

          <div style={estilos.vacio}>
            Cargando horarios...
          </div>

        ) : horarios.length === 0 ? (

          <div style={estilos.vacio}>

            <div style={estilos.vacioIcono}>
              🕐
            </div>

            <div style={estilos.vacioTitulo}>
              No hay horarios todavía.
            </div>

            <div style={estilos.vacioTexto}>
              Añade el primer horario
              utilizando el formulario.
            </div>

          </div>

        ) : (

          <div style={estilos.lista}>

            {horarios.map(
              (horario, indice) => (

                <div
                  key={horario.id}
                  style={estilos.fila}
                >

                  <div style={estilos.numero}>
                    {String(
                      indice + 1
                    ).padStart(2, "0")}
                  </div>


                  <div
                    style={
                      estilos.filaContenido
                    }
                  >

                    <div
                      style={
                        estilos.filaTitulo
                      }
                    >

                      {horario.dia}

                      {" · "}

                      {String(
                        horario.hora_inicio
                      ).slice(0, 5)}

                      {" - "}

                      {String(
                        horario.hora_fin
                      ).slice(0, 5)}

                    </div>


                    <div
                      style={
                        estilos.filaDescripcion
                      }
                    >

                      {nombreActividad(
                        horario.actividad_id
                      )}

                      {horario.nivel
                        ? ` · ${horario.nivel}`
                        : ""}

                    </div>


                    <div
                      style={
                        estilos.chips
                      }
                    >

                      {horario.profesor_ids &&
                      horario.profesor_ids.length >
                        0 ? (

                        <span
                          style={
                            estilos.chip
                          }
                        >

                          👤{" "}

                          {nombresProfesores(
                            horario.profesor_ids
                          )}

                        </span>

                      ) : (

                        <span
                          style={
                            estilos.sinActividades
                          }
                        >
                          Sin profesor asignado
                        </span>

                      )}

                    </div>

                  </div>


                  <div
                    style={
                      estilos.filaAcciones
                    }
                  >

                    <span
                      style={
                        estilos.estadoActivo
                      }
                    >
                      ACTIVO
                    </span>


                    <button
                      type="button"
                      onClick={() =>
                        editarHorario(
                          horario
                        )
                      }
                      style={
                        estilos.botonEditar
                      }
                    >
                      Editar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        eliminarHorario(
                          horario.id
                        )
                      }
                      style={{
                        ...estilos.botonEditar,
                        color: "#ff8995",
                      }}
                      disabled={guardando}
                    >
                      Eliminar
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   EVENTOS
========================================================= */

function Eventos() {

  const eventoInicial = {
    titulo: "",
    descripcion: "",
    fecha: "",
    hora: "",
    lugar: "",
    imagen: "",
    activa: true,
  };


  const [eventos, setEventos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [mostrandoFormulario, setMostrandoFormulario] =
    useState(false);

  const [editando, setEditando] =
    useState(null);

  const [formulario, setFormulario] =
    useState(eventoInicial);


  async function cargarEventos() {

    try {

      setCargando(true);


      const respuesta =
        await fetch(
          "/api/eventos",
          {
            cache: "no-store",
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudieron cargar los eventos."
        );

        return;
      }


      setEventos(
        datos.eventos || []
      );


    } catch (error) {

      console.error(
        "Error cargando eventos:",
        error
      );


      alert(
        "Error cargando los eventos."
      );


    } finally {

      setCargando(false);

    }

  }


  useEffect(() => {

    cargarEventos();

  }, []);


  function nuevoEvento() {

    setFormulario({
      ...eventoInicial,
    });

    setEditando(null);

    setMostrandoFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  function editarEvento(evento) {

    setFormulario({

      titulo:
        evento.titulo || "",

      descripcion:
        evento.descripcion || "",

      fecha:
        evento.fecha
          ? String(
              evento.fecha
            ).slice(0, 10)
          : "",

      hora:
        evento.hora
          ? String(
              evento.hora
            ).slice(0, 5)
          : "",

      lugar:
        evento.lugar || "",

      imagen:
        evento.imagen || "",

      activa:
        Number(evento.activa) !== 0,

    });


    setEditando(evento);

    setMostrandoFormulario(true);


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  function cerrarFormulario() {

    setFormulario({
      ...eventoInicial,
    });

    setEditando(null);
    setMostrandoFormulario(false);

  }


  function cambiarCampo(campo, valor) {

    setFormulario(
      (actual) => ({
        ...actual,
        [campo]: valor,
      })
    );

  }


  async function guardarEvento(event) {

    event.preventDefault();


    if (
      !formulario.titulo.trim()
    ) {

      alert(
        "El título del evento es obligatorio."
      );

      return;
    }


    if (!formulario.fecha) {

      alert(
        "La fecha del evento es obligatoria."
      );

      return;
    }


    try {

      setGuardando(true);


      const metodo =
        editando
          ? "PUT"
          : "POST";


      const cuerpo = {

        titulo:
          formulario.titulo.trim(),

        descripcion:
          formulario.descripcion.trim(),

        fecha:
          formulario.fecha,

        hora:
          formulario.hora || null,

        lugar:
          formulario.lugar.trim(),

        activa:
          formulario.activa,

      };


      if (editando) {

        cuerpo.id =
          editando.id;

      }


      const respuesta =
        await fetch(
          "/api/eventos",
          {
            method:
              metodo,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                cuerpo
              ),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo guardar el evento."
        );

        return;
      }


      cerrarFormulario();

      await cargarEventos();


    } catch (error) {

      console.error(
        "Error guardando evento:",
        error
      );


      alert(
        "Error guardando el evento."
      );


    } finally {

      setGuardando(false);

    }

  }


  async function eliminarEvento(id) {

    const confirmar =
      window.confirm(
        "¿Seguro que quieres eliminar este evento?"
      );


    if (!confirmar) {
      return;
    }


    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/eventos",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id,
              }),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo eliminar el evento."
        );

        return;
      }


      await cargarEventos();


    } catch (error) {

      console.error(
        "Error eliminando evento:",
        error
      );


      alert(
        "Error eliminando el evento."
      );


    } finally {

      setGuardando(false);

    }

  }


  async function cambiarEstadoEvento(evento) {

    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/eventos",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                id:
                  evento.id,

                titulo:
                  evento.titulo,

                descripcion:
                  evento.descripcion || "",

                fecha:
                  evento.fecha,

                hora:
                  evento.hora || null,

                lugar:
                  evento.lugar || "",

                activa:
                  Number(
                    evento.activa
                  ) === 0,

              }),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo cambiar el estado."
        );

        return;
      }


      await cargarEventos();


    } catch (error) {

      console.error(
        "Error cambiando estado del evento:",
        error
      );


      alert(
        "Error cambiando el estado."
      );


    } finally {

      setGuardando(false);

    }

  }


  return (

    <div>

      <div style={estilos.cabeceraSeccion}>

        <div>

          <div style={estilos.etiquetaSeccion}>
            ACTIVIDADES
          </div>

          <h2 style={estilos.tituloSeccion}>
            Eventos
          </h2>

          <p style={estilos.descripcionSeccion}>
            Gestiona los eventos que aparecerán en la web.
          </p>

        </div>


        <button
          type="button"
          onClick={
            nuevoEvento
          }
          style={
            estilos.botonNuevo
          }
        >
          + Añadir evento
        </button>

      </div>


      {mostrandoFormulario && (

        <div style={estilos.editor}>

          <div style={estilos.editorCabecera}>

            <div style={estilos.editorTitulo}>
              {editando
                ? "Editar evento"
                : "Nuevo evento"}
            </div>

          </div>


          <form
            onSubmit={
              guardarEvento
            }
          >

            <label style={estilos.label}>
              Título
            </label>


            <input
              value={
                formulario.titulo
              }
              onChange={(event) =>
                cambiarCampo(
                  "titulo",
                  event.target.value
                )
              }
              style={estilos.input}
              disabled={guardando}
            />


            <label style={estilos.label}>
              Descripción
            </label>


            <textarea
              value={
                formulario.descripcion
              }
              onChange={(event) =>
                cambiarCampo(
                  "descripcion",
                  event.target.value
                )
              }
              style={estilos.textarea}
              rows={4}
              disabled={guardando}
            />


            <label style={estilos.label}>
              Fecha
            </label>


            <input
              type="date"
              value={
                formulario.fecha
              }
              onChange={(event) =>
                cambiarCampo(
                  "fecha",
                  event.target.value
                )
              }
              style={estilos.input}
              disabled={guardando}
            />


            <label style={estilos.label}>
              Hora
            </label>


            <input
              type="time"
              value={
                formulario.hora
              }
              onChange={(event) =>
                cambiarCampo(
                  "hora",
                  event.target.value
                )
              }
              style={estilos.input}
              disabled={guardando}
            />


            <label style={estilos.label}>
              Lugar
            </label>


            <input
              value={
                formulario.lugar
              }
              onChange={(event) =>
                cambiarCampo(
                  "lugar",
                  event.target.value
                )
              }
              style={estilos.input}
              disabled={guardando}
            />


            <div
              style={
                estilos.botonesEditor
              }
            >

              <button
                type="button"
                onClick={
                  cerrarFormulario
                }
                style={
                  estilos.botonCancelar
                }
                disabled={
                  guardando
                }
              >
                Cancelar
              </button>


              <button
                type="submit"
                style={
                  estilos.botonGuardar
                }
                disabled={
                  guardando
                }
              >
                {guardando
                  ? "Guardando..."
                  : editando
                  ? "Guardar cambios"
                  : "Crear evento"}
              </button>

            </div>

          </form>

        </div>

      )}


      <div style={estilos.lista}>

        {cargando ? (

          <div style={estilos.vacio}>
            Cargando eventos...
          </div>

        ) : eventos.length === 0 ? (

          <div style={estilos.vacio}>

            <div style={estilos.vacioIcono}>
              📅
            </div>

            <div style={estilos.vacioTitulo}>
              No hay eventos todavía.
            </div>

            <div style={estilos.vacioTexto}>
              Añade un evento para mostrarlo en la web.
            </div>

          </div>

        ) : (

          eventos.map(
            (evento, indice) => (

              <div
                key={
                  evento.id
                }
                style={
                  estilos.fila
                }
              >

                <div style={estilos.numero}>
                  {String(
                    indice + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>


                <div
                  style={
                    estilos.filaContenido
                  }
                >

                  <div
                    style={
                      estilos.filaTitulo
                    }
                  >
                    {evento.titulo}
                  </div>


                  <div
                    style={
                      estilos.filaDescripcion
                    }
                  >

                    {evento.fecha
                      ? String(
                          evento.fecha
                        ).slice(0, 10)
                      : ""}

                    {evento.hora
                      ? ` · ${String(
                          evento.hora
                        ).slice(0, 5)}`
                      : ""}

                    {evento.lugar
                      ? ` · ${evento.lugar}`
                      : ""}

                  </div>


                  {evento.descripcion && (

                    <div
                      style={
                        estilos.filaDescripcion
                      }
                    >
                      {
                        evento.descripcion
                      }
                    </div>

                  )}

                </div>


                <div
                  style={
                    estilos.filaAcciones
                  }
                >

                  <button
                    type="button"
                    onClick={() =>
                      cambiarEstadoEvento(
                        evento
                      )
                    }
                    style={{
                      ...estilos.estadoActivo,
                      border:
                        "0",
                      cursor:
                        "pointer",
                    }}
                    disabled={
                      guardando
                    }
                  >

                    {Number(
                      evento.activa
                    ) !== 0
                      ? "ACTIVO"
                      : "OCULTO"}

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      editarEvento(
                        evento
                      )
                    }
                    style={
                      estilos.botonEditar
                    }
                    disabled={
                      guardando
                    }
                  >
                    Editar
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      eliminarEvento(
                        evento.id
                      )
                    }
                    style={{
                      ...estilos.botonEditar,
                      color:
                        "#ff8995",
                    }}
                    disabled={
                      guardando
                    }
                  >
                    Eliminar
                  </button>

                </div>

              </div>

            )

          )

        )}

      </div>

    </div>
  );
}
/* =========================================================
   GALERÍA
========================================================= */

function Galeria() {

  const galeriaInicial = {
    titulo: "",
    descripcion: "",
    activa: true,
    orden: 0,
  };


  const [galerias, setGalerias] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [
    mostrandoFormulario,
    setMostrandoFormulario,
  ] = useState(false);

  const [editando, setEditando] =
    useState(null);

  const [formulario, setFormulario] =
    useState(galeriaInicial);


  const [galeriaFotos, setGaleriaFotos] =
    useState([]);

  const [cargandoFotos, setCargandoFotos] =
    useState(false);

  const [subiendoFotos, setSubiendoFotos] =
    useState(false);

  const [galeriaAbierta, setGaleriaAbierta] =
    useState(null);


  const inputFotosId =
    "input-fotos-galeria";


  // =======================================================
  // CARGAR GALERÍAS
  // =======================================================

  async function cargarGalerias() {

    try {

      setCargando(true);


      const respuesta =
        await fetch(
          "/api/galeria",
          {
            cache: "no-store",
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudieron cargar las galerías."
        );

        return;

      }


      setGalerias(
        datos.galerias || []
      );


    } catch (error) {

      console.error(
        "Error cargando galerías:",
        error
      );


      alert(
        "Error cargando las galerías."
      );


    } finally {

      setCargando(false);

    }

  }


  useEffect(() => {

    cargarGalerias();

  }, []);


  // =======================================================
  // NUEVA GALERÍA
  // =======================================================

  function nuevaGaleria() {

    setFormulario({
      ...galeriaInicial,
    });

    setEditando(null);

    setMostrandoFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  // =======================================================
  // EDITAR GALERÍA
  // =======================================================

  function editarGaleria(galeria) {

    setFormulario({

      titulo:
        galeria.titulo || "",

      descripcion:
        galeria.descripcion || "",

      imagen:
        galeria.imagen || "",

      activa:
        Number(galeria.activa) !== 0,

      orden:
        Number(galeria.orden) || 0,

    });


    setEditando(galeria);

    setMostrandoFormulario(true);


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  // =======================================================
  // CERRAR FORMULARIO
  // =======================================================

  function cerrarFormulario() {

    setFormulario({
      ...galeriaInicial,
    });

    setEditando(null);

    setMostrandoFormulario(false);

  }


  // =======================================================
  // CAMBIAR CAMPO
  // =======================================================

  function cambiarCampo(
    campo,
    valor
  ) {

    setFormulario(
      (actual) => ({
        ...actual,
        [campo]: valor,
      })
    );

  }


  // =======================================================
  // GUARDAR GALERÍA
  // =======================================================

  async function guardarGaleria(event) {

    event.preventDefault();


    if (
      !formulario.titulo.trim()
    ) {

      alert(
        "El título de la galería es obligatorio."
      );

      return;

    }


    try {

      setGuardando(true);


      const metodo =
        editando
          ? "PUT"
          : "POST";


      const cuerpo = {

        titulo:
          formulario.titulo.trim(),

        descripcion:
          formulario.descripcion.trim(),

        activa:
          formulario.activa,

        orden:
          Number(
            formulario.orden
          ) || 0,

      };


      if (editando) {

        cuerpo.id =
          editando.id;

      }


      const respuesta =
        await fetch(
          "/api/galeria",
          {
            method:
              metodo,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                cuerpo
              ),

          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        console.error(
          "Error guardando galería:",
          datos
        );


        alert(
          datos.mensaje ||
          "No se pudo guardar la galería."
        );

        return;

      }


      cerrarFormulario();

      await cargarGalerias();


    } catch (error) {

      console.error(
        "Error guardando galería:",
        error
      );


      alert(
        "Ha ocurrido un error al guardar la galería."
      );


    } finally {

      setGuardando(false);

    }

  }


  // =======================================================
  // CARGAR FOTOGRAFÍAS
  // =======================================================

  async function cargarFotos(
    galeriaId
  ) {

    try {

      setCargandoFotos(true);


      const respuesta =
        await fetch(
          `/api/galeria-imagenes?galeriaId=${galeriaId}`,
          {
            cache: "no-store",
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudieron cargar las fotografías."
        );

        return;

      }


      setGaleriaFotos(
        datos.imagenes || []
      );


    } catch (error) {

      console.error(
        "Error cargando fotografías:",
        error
      );


      alert(
        "Error cargando las fotografías."
      );


    } finally {

      setCargandoFotos(false);

    }

  }


  // =======================================================
  // ABRIR GESTIÓN DE FOTOGRAFÍAS
  // =======================================================

  async function abrirGaleria(
    galeria
  ) {

    setGaleriaAbierta(
      galeria
    );

    setGaleriaFotos([]);

    await cargarFotos(
      galeria.id
    );

  }


  // =======================================================
  // CERRAR GESTIÓN DE FOTOGRAFÍAS
  // =======================================================

  function cerrarGaleria() {

    setGaleriaAbierta(null);

    setGaleriaFotos([]);

  }


  // =======================================================
  // SUBIR FOTOGRAFÍAS
  // =======================================================

  async function subirFotos(
    event
  ) {

    const archivos =
      Array.from(
        event.target.files || []
      );


    if (
      archivos.length === 0
    ) {

      return;

    }


    if (
      !galeriaAbierta
    ) {

      alert(
        "No hay ninguna galería seleccionada."
      );

      return;

    }


    try {

      setSubiendoFotos(true);


      const formData =
        new FormData();


      formData.append(
        "galeriaId",
        String(
          galeriaAbierta.id
        )
      );


      archivos.forEach(
        (archivo) => {

          formData.append(
            "archivos",
            archivo
          );

        }
      );


      const respuesta =
        await fetch(
          "/api/galeria-imagenes",
          {
            method: "POST",
            body: formData,
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        console.error(
          "Error subiendo fotografías:",
          datos
        );


        alert(
          datos.mensaje ||
          "No se pudieron subir las fotografías."
        );

        return;

      }


      if (
        datos.errores &&
        datos.errores.length > 0
      ) {

        console.warn(
          "Algunas fotografías no se pudieron subir:",
          datos.errores
        );


        alert(
          `${datos.mensaje}\n\nAlgunas fotografías no se pudieron subir.`
        );

      } else {

        alert(
          datos.mensaje
        );

      }


      await cargarFotos(
        galeriaAbierta.id
      );


      await cargarGalerias();


    } catch (error) {

      console.error(
        "Error subiendo fotografías:",
        error
      );


      alert(
        "Ha ocurrido un error al subir las fotografías."
      );


    } finally {

      setSubiendoFotos(false);


      event.target.value =
        "";

    }

  }


  // =======================================================
  // ELIMINAR FOTOGRAFÍA
  // =======================================================

  async function eliminarFoto(
    foto
  ) {

    const confirmar =
      window.confirm(
        "¿Seguro que quieres eliminar esta fotografía?"
      );


    if (!confirmar) {

      return;

    }


    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/galeria-imagenes",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id:
                  foto.id,
              }),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo eliminar la fotografía."
        );

        return;

      }


      await cargarFotos(
        galeriaAbierta.id
      );


      await cargarGalerias();


    } catch (error) {

      console.error(
        "Error eliminando fotografía:",
        error
      );


      alert(
        "Ha ocurrido un error al eliminar la fotografía."
      );


    } finally {

      setGuardando(false);

    }

  }


  // =======================================================
  // ELIMINAR GALERÍA
  // =======================================================

  async function eliminarGaleria(
    id
  ) {

    const confirmar =
      window.confirm(
        "¿Seguro que quieres eliminar esta galería? También se eliminarán las fotografías asociadas."
      );


    if (!confirmar) {

      return;

    }


    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/galeria",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id,
              }),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo eliminar la galería."
        );

        return;

      }


      if (
        galeriaAbierta &&
        galeriaAbierta.id === id
      ) {

        cerrarGaleria();

      }


      await cargarGalerias();


    } catch (error) {

      console.error(
        "Error eliminando galería:",
        error
      );


      alert(
        "Ha ocurrido un error al eliminar la galería."
      );


    } finally {

      setGuardando(false);

    }

  }


  // =======================================================
  // CAMBIAR ESTADO
  // =======================================================

  async function cambiarEstadoGaleria(
    galeria
  ) {

    try {

      setGuardando(true);


      const respuesta =
        await fetch(
          "/api/galeria",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({

                id:
                  galeria.id,

                titulo:
                  galeria.titulo,

                descripcion:
                  galeria.descripcion ||
                  "",

                imagen:
                  galeria.imagen ||
                  "",

                activa:
                  Number(
                    galeria.activa
                  ) === 0,

                orden:
                  Number(
                    galeria.orden
                  ) || 0,

              }),
          }
        );


      const datos =
        await respuesta.json();


      if (
        !respuesta.ok ||
        !datos.correcto
      ) {

        alert(
          datos.mensaje ||
          "No se pudo cambiar el estado."
        );

        return;

      }


      await cargarGalerias();


    } catch (error) {

      console.error(
        "Error cambiando estado:",
        error
      );


      alert(
        "Error cambiando el estado de la galería."
      );


    } finally {

      setGuardando(false);

    }

  }


  // =======================================================
  // VISTA DE GESTIÓN DE FOTOGRAFÍAS
  // =======================================================

  if (galeriaAbierta) {

    return (

      <div>

        <div style={estilos.cabeceraSeccion}>

          <div>

            <div style={estilos.etiquetaSeccion}>
              FOTOGRAFÍAS
            </div>

            <h2 style={estilos.tituloSeccion}>
              {galeriaAbierta.titulo}
            </h2>

            <p style={estilos.descripcionSeccion}>
              Gestiona las fotografías de esta galería.
            </p>

          </div>


          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    inputFotosId
                  )
                  ?.click()
              }
              style={estilos.botonNuevo}
              disabled={subiendoFotos}
            >
              {subiendoFotos
                ? "Subiendo..."
                : "+ Añadir fotografías"}
            </button>


            <button
              type="button"
              onClick={
                cerrarGaleria
              }
              style={
                estilos.botonCancelar
              }
              disabled={subiendoFotos}
            >
              ← Volver a galerías
            </button>

          </div>

        </div>


        <input
          id={inputFotosId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={
            subirFotos
          }
          style={{
            display: "none",
          }}
        />


        {subiendoFotos && (

          <div
            style={{
              ...estilos.editor,
              textAlign: "center",
            }}
          >

            <div style={estilos.vacioIcono}>
              📤
            </div>

            <div style={estilos.vacioTitulo}>
              Subiendo fotografías...
            </div>

            <div style={estilos.vacioTexto}>
              No cierres ni recargues esta página.
            </div>

          </div>

        )}


        {cargandoFotos ? (

          <div style={estilos.vacio}>
            <div style={estilos.vacioIcono}>
              🖼️
            </div>

            <div style={estilos.vacioTitulo}>
              Cargando fotografías...
            </div>
          </div>

        ) : galeriaFotos.length === 0 ? (

          <div style={estilos.vacio}>

            <div style={estilos.vacioIcono}>
              📷
            </div>

            <div style={estilos.vacioTitulo}>
              Esta galería todavía no tiene fotografías.
            </div>

            <div style={estilos.vacioTexto}>
              Pulsa «Añadir fotografías» para seleccionar imágenes desde tu ordenador.
            </div>

          </div>

        ) : (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(190px, 1fr))",
              gap: "18px",
              marginTop: "25px",
            }}
          >

            {galeriaFotos.map(
              (foto) => (

                <div
                  key={foto.id}
                  style={{
                    background:
                      "rgba(255,255,255,0.035)",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "18px",
                    overflow: "hidden",
                  }}
                >

                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "4 / 3",
                      background:
                        "rgba(0,0,0,0.2)",
                      overflow: "hidden",
                    }}
                  >

                    <img
                      src={foto.imagen}
                      alt={
                        foto.titulo ||
                        "Fotografía"
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                  </div>


                  <div
                    style={{
                      padding: "13px",
                    }}
                  >

                    <div
                      style={{
                        color: "#fff2cf",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace:
                          "nowrap",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        marginBottom:
                          "10px",
                      }}
                    >
                      {foto.titulo ||
                        "Fotografía"}
                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        eliminarFoto(
                          foto
                        )
                      }
                      style={{
                        ...estilos.botonEditar,
                        color:
                          "#ff8995",
                        width: "100%",
                      }}
                      disabled={
                        guardando ||
                        subiendoFotos
                      }
                    >
                      Eliminar
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    );

  }


  // =======================================================
  // LISTADO DE GALERÍAS
  // =======================================================

  return (

    <div>

      <div style={estilos.cabeceraSeccion}>

        <div>

          <div style={estilos.etiquetaSeccion}>
            FOTOGRAFÍAS
          </div>

          <h2 style={estilos.tituloSeccion}>
            Galería
          </h2>

          <p style={estilos.descripcionSeccion}>
            Gestiona los álbumes y fotografías de la escuela.
          </p>

        </div>


        <button
          type="button"
          onClick={
            nuevaGaleria
          }
          style={estilos.botonNuevo}
        >
          + Nueva galería
        </button>

      </div>
        {mostrandoFormulario && (

          <div style={estilos.editor}>

            <div style={estilos.editorCabecera}>

              <div style={estilos.editorTitulo}>
                {editando
                  ? "Editar galería"
                  : "Nueva galería"}
              </div>

            </div>


            <form
              onSubmit={
                guardarGaleria
              }
            >

              <label style={estilos.label}>
                Título
              </label>


              <input
                value={
                  formulario.titulo
                }
                onChange={(e) =>
                  cambiarCampo(
                    "titulo",
                    e.target.value
                  )
                }
                placeholder="Ej.: Festival de Fin de Curso 2026"
                style={estilos.input}
                disabled={guardando}
              />


              <label style={estilos.label}>
                Descripción
              </label>


              <textarea
                value={
                  formulario.descripcion
                }
                onChange={(e) =>
                  cambiarCampo(
                    "descripcion",
                    e.target.value
                  )
                }
                placeholder="Descripción del álbum..."
                style={estilos.textarea}
                rows={4}
                disabled={guardando}
              />


              <label style={estilos.label}>
                Orden
              </label>


              <input
                type="number"
                value={
                  formulario.orden
                }
                onChange={(e) =>
                  cambiarCampo(
                    "orden",
                    e.target.value
                  )
                }
                style={estilos.input}
                disabled={guardando}
              />


              <div
                style={
                  estilos.checkboxSimple
                }
              >

                <label
                  style={
                    estilos.checkEstado
                  }
                >

                  <input
                    type="checkbox"
                    checked={
                      formulario.activa
                    }
                    onChange={(e) =>
                      cambiarCampo(
                        "activa",
                        e.target.checked
                      )
                    }
                    disabled={guardando}
                  />

                  <span>
                    Galería visible / activa
                  </span>

                </label>

              </div>


              <div
                style={
                  estilos.botonesEditor
                }
              >

                <button
                  type="button"
                  onClick={
                    cerrarFormulario
                  }
                  style={
                    estilos.botonCancelar
                  }
                  disabled={guardando}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  style={
                    estilos.botonGuardar
                  }
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                    ? "Guardar cambios"
                    : "Crear galería"}
                </button>

              </div>

            </form>

          </div>

        )}


        <div style={estilos.lista}>

          {cargando ? (

            <div style={estilos.vacio}>
              Cargando galerías...
            </div>

          ) : galerias.length === 0 ? (

            <div style={estilos.vacio}>

              <div style={estilos.vacioIcono}>
                🖼️
              </div>

              <div style={estilos.vacioTitulo}>
                No hay galerías todavía.
              </div>

              <div style={estilos.vacioTexto}>
                Crea el primer álbum utilizando el botón de arriba.
              </div>

            </div>

          ) : (

            galerias.map(
              (galeria, indice) => (

                <div
                  key={
                    galeria.id
                  }
                  style={
                    estilos.fila
                  }
                >

                  <div
                    style={
                      estilos.numero
                    }
                  >
                    {String(
                      indice + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>


                  <div
                    style={
                      estilos.filaContenido
                    }
                  >

                    <div
                      style={
                        estilos.filaTitulo
                      }
                    >
                      {galeria.titulo}
                    </div>


                    {galeria.descripcion && (

                      <div
                        style={
                          estilos.filaDescripcion
                        }
                      >
                        {galeria.descripcion}
                      </div>

                    )}


                    {galeria.imagen && (

                      <div
                        style={{
                          ...estilos.filaDescripcion,
                          marginTop: "8px",
                        }}
                      >
                        🖼️ Imagen de portada añadida
                      </div>

                    )}

                  </div>


                  <div
                    style={
                      estilos.filaAcciones
                    }
                  >

                    <button
                      type="button"
                      onClick={() =>
                        cambiarEstadoGaleria(
                          galeria
                        )
                      }
                      style={{
                        ...estilos.estadoActivo,
                        border: "0",
                        cursor: "pointer",
                      }}
                      disabled={
                        guardando
                      }
                    >
                      {Number(
                        galeria.activa
                      ) !== 0
                        ? "ACTIVA"
                        : "OCULTA"}
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        abrirGaleria(
                          galeria
                        )
                      }
                      style={{
                        ...estilos.botonEditar,
                        color: "#fff2cf",
                      }}
                      disabled={
                        guardando
                      }
                    >
                      📷 Gestionar fotos
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        editarGaleria(
                          galeria
                        )
                      }
                      style={
                        estilos.botonEditar
                      }
                      disabled={
                        guardando
                      }
                    >
                      Editar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        eliminarGaleria(
                          galeria.id
                        )
                      }
                      style={{
                        ...estilos.botonEditar,
                        color:
                          "#ff8995",
                      }}
                      disabled={
                        guardando
                      }
                    >
                      Eliminar
                    </button>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>

  );

}
/* =========================================================
   SECCIONES FUTURAS
========================================================= */

function SeccionProximamente({
  titulo,
}) {

  return (

    <div>

      <div style={estilos.etiquetaSeccion}>
        PRÓXIMAMENTE
      </div>


      <h2 style={estilos.tituloSeccion}>
        {titulo}
      </h2>


      <p style={estilos.descripcionSeccion}>
        Este apartado estará disponible próximamente.
      </p>


      <div style={estilos.vacio}>

        <div style={estilos.vacioIcono}>
          🚧
        </div>

        <div style={estilos.vacioTitulo}>
          En construcción
        </div>

        <div style={estilos.vacioTexto}>
          Seguimos trabajando para completar el panel de administración.
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
    background:
      "linear-gradient(135deg, #17151c 0%, #211d27 50%, #151319 100%)",
    color: "#fff",
    display: "flex",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },


  menuLateral: {
    width: "250px",
    minHeight: "100vh",
    padding: "28px 18px",
    background:
      "rgba(12, 11, 15, 0.96)",
    borderRight:
      "1px solid rgba(255,255,255,0.06)",
    boxSizing: "border-box",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
  },


  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "42px",
  },


  logo: {
    width: "48px",
    height: "48px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #ff8794, #ffb36b)",
    color: "#fff",
    fontWeight: 900,
    fontSize: "16px",
    boxShadow:
      "0 10px 30px rgba(255,135,148,0.18)",
  },


  nombreEscuela: {
    fontSize: "18px",
    fontWeight: 800,
    lineHeight: 1.05,
    color: "#fff6dd",
  },


  administracion: {
    fontSize: "11px",
    color: "#ff9ca7",
    marginTop: "5px",
    letterSpacing: "0.04em",
  },


  navegacion: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },


  botonMenu: {
    width: "100%",
    border: "0",
    background: "transparent",
    color: "#b9b1bd",
    borderRadius: "15px",
    padding: "14px 15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
    transition:
      "all 0.2s ease",
  },


  botonMenuActivo: {
    background:
      "linear-gradient(135deg, #ff8794, #ff9c9d)",
    color: "#fff",
    boxShadow:
      "0 12px 25px rgba(255,135,148,0.16)",
  },


  iconoMenu: {
    width: "22px",
    textAlign: "center",
    fontSize: "16px",
  },


  estadoWeb: {
    position: "absolute",
    bottom: "28px",
    left: "24px",
    right: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#77727e",
    fontSize: "11px",
  },


  puntoVerde: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#9ae85c",
    boxShadow:
      "0 0 10px rgba(154,232,92,0.7)",
  },


  zonaPrincipal: {
    marginLeft: "250px",
    minHeight: "100vh",
    flex: 1,
    boxSizing: "border-box",
  },


  cabecera: {
    padding:
      "54px 62px 20px",
  },


  tituloPequeno: {
    color: "#ff8e9a",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.2em",
    marginBottom: "7px",
  },


  titulo: {
    margin: 0,
    fontFamily:
      "Georgia, Times New Roman, serif",
    fontSize: "58px",
    lineHeight: 1,
    color: "#fff2cf",
    fontWeight: 500,
  },


  contenido: {
    padding:
      "20px 62px 70px",
    maxWidth: "1250px",
  },


  etiquetaSeccion: {
    color: "#ff8e9a",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.18em",
    marginBottom: "8px",
  },


  tituloSeccion: {
    margin:
      "0 0 10px",
    fontFamily:
      "Georgia, Times New Roman, serif",
    color: "#fff2cf",
    fontSize: "43px",
    lineHeight: 1.05,
    fontWeight: 500,
  },


  descripcionSeccion: {
    margin:
      "0 0 28px",
    color: "#bdb5c1",
    fontSize: "14px",
    lineHeight: 1.6,
  },


  cabeceraSeccion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "28px",
  },


  botonNuevo: {
    border: "0",
    borderRadius: "14px",
    padding: "13px 18px",
    background:
      "linear-gradient(135deg, #ff8794, #ffab78)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow:
      "0 12px 28px rgba(255,135,148,0.18)",
    whiteSpace: "nowrap",
  },


  tarjetas: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    marginTop: "34px",
  },


  tarjeta: {
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px solid rgba(255,255,255,0.07)",
    borderRadius: "22px",
    padding: "25px",
  },


  tarjetaIcono: {
    fontSize: "24px",
    marginBottom: "12px",
  },


  tarjetaNumero: {
    fontSize: "31px",
    fontWeight: 900,
    color: "#fff2cf",
  },


  tarjetaTexto: {
    color: "#8e8892",
    fontSize: "12px",
    marginTop: "5px",
  },


  lista: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },


  fila: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    minHeight: "100px",
    padding:
      "18px 20px",
    borderTop:
      "1px solid rgba(255,255,255,0.06)",
  },


  numero: {
    color: "#ff8e9a",
    fontSize: "13px",
    fontWeight: 900,
    minWidth: "30px",
  },


  filaContenido: {
    flex: 1,
    minWidth: 0,
  },


  filaTitulo: {
    color: "#fff2cf",
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "6px",
  },


  filaDescripcion: {
    color: "#aaa2ad",
    fontSize: "12px",
    lineHeight: 1.5,
  },


  filaAcciones: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },


  estadoActivo: {
    color: "#a9ef61",
    background:
      "rgba(169,239,97,0.09)",
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.05em",
  },


  botonEditar: {
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.03)",
    color: "#d4ccd5",
    borderRadius: "10px",
    padding: "8px 11px",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
  },


  editor: {
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: "22px",
    padding: "25px",
    marginBottom: "25px",
  },


  editorCabecera: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "22px",
  },


  editorTitulo: {
    color: "#fff2cf",
    fontSize: "20px",
    fontWeight: 800,
  },


  label: {
    display: "block",
    color: "#cfc6cf",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "7px",
    marginTop: "16px",
  },


  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid rgba(255,255,255,0.09)",
    background:
      "rgba(0,0,0,0.18)",
    color: "#fff",
    borderRadius: "12px",
    padding: "12px 13px",
    outline: "none",
    fontSize: "13px",
  },


  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid rgba(255,255,255,0.09)",
    background:
      "rgba(0,0,0,0.18)",
    color: "#fff",
    borderRadius: "12px",
    padding: "12px 13px",
    outline: "none",
    fontSize: "13px",
    resize: "vertical",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },


  actividadesChecks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
    marginTop: "10px",
  },


  check: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "rgba(255,255,255,0.025)",
    color: "#aaa2ad",
    borderRadius: "999px",
    padding: "9px 12px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
  },


  checkActivo: {
    background:
      "rgba(255,135,148,0.12)",
    border:
      "1px solid rgba(255,135,148,0.3)",
    color: "#fff1d2",
  },


  checkboxSimple: {
    marginTop: "18px",
  },


  checkEstado: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    color: "#c8c0ca",
    fontSize: "12px",
    cursor: "pointer",
  },


  botonesEditor: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "25px",
  },


  botonCancelar: {
    border:
      "1px solid rgba(255,255,255,0.09)",
    background:
      "rgba(255,255,255,0.025)",
    color: "#aaa2ad",
    borderRadius: "11px",
    padding: "11px 16px",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },


  botonGuardar: {
    border: "0",
    background:
      "linear-gradient(135deg, #ff8794, #ffab78)",
    color: "#fff",
    borderRadius: "11px",
    padding: "11px 18px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },


  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "10px",
  },


  chip: {
    display: "inline-flex",
    alignItems: "center",
    border:
      "1px solid rgba(255,255,255,0.07)",
    background:
      "rgba(255,255,255,0.035)",
    color: "#c9c1ca",
    borderRadius: "999px",
    padding: "5px 8px",
    fontSize: "10px",
    fontWeight: 700,
  },


  sinActividades: {
    color: "#77727e",
    fontSize: "10px",
    fontStyle: "italic",
  },


  vacio: {
    marginTop: "20px",
    padding: "55px 30px",
    textAlign: "center",
    border:
      "1px dashed rgba(255,255,255,0.1)",
    borderRadius: "20px",
    background:
      "rgba(255,255,255,0.02)",
  },


  vacioIcono: {
    fontSize: "34px",
    marginBottom: "13px",
  },


  vacioTitulo: {
    color: "#fff2cf",
    fontSize: "17px",
    fontWeight: 800,
    marginBottom: "7px",
  },


  vacioTexto: {
    color: "#817a85",
    fontSize: "12px",
    lineHeight: 1.5,
  },

};
