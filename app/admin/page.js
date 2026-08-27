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
          fetch("/api/profesores", { cache: "no-store" }),
          fetch("/api/actividades", { cache: "no-store" }),
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
    { id: "inicio", nombre: "Inicio", icono: "🏠" },
    { id: "actividades", nombre: "Actividades", icono: "💃" },
    { id: "profesores", nombre: "Profesores", icono: "👥" },
    { id: "horarios", nombre: "Horarios", icono: "🕐" },
    { id: "eventos", nombre: "Eventos", icono: "📅" },
    { id: "galeria", nombre: "Galería", icono: "🖼️" },
    { id: "mensajes", nombre: "Mensajes", icono: "💌" },
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
          <span>Web en pruebas</span>
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
            <SeccionProximamente titulo="Eventos" />
          )}

          {seccionActiva === "galeria" && (
            <SeccionProximamente titulo="Galería" />
          )}

          {seccionActiva === "mensajes" && (
            <SeccionProximamente titulo="Mensajes" />
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
        actividades y próximamente todos los contenidos
        de la escuela.
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

  const [guardando, setGuardando] =
    useState(false);


  function limpiarFormulario() {
    setNombre("");
    setDescripcion("");
    setOrden(0);
    setEditando(null);
    setMostrandoFormulario(false);
  }


  function nuevaActividad() {
    setNombre("");
    setDescripcion("");
    setOrden(0);
    setEditando(null);
    setMostrandoFormulario(true);
  }


  function editarActividad(actividad) {
    setNombre(actividad.nombre || "");
    setDescripcion(actividad.descripcion || "");
    setOrden(actividad.orden || 0);
    setEditando(actividad);
    setMostrandoFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  async function guardarActividad(event) {
    event.preventDefault();

    if (!nombre.trim()) {
      alert("El nombre de la actividad es obligatorio.");
      return;
    }

    try {
      setGuardando(true);

      const metodo = editando ? "PUT" : "POST";

      const cuerpo = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        orden: Number(orden) || 0,
      };

      if (editando) {
        cuerpo.id = editando.id;
      }

      const respuesta = await fetch(
        "/api/actividades",
        {
          method: metodo,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cuerpo),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok || !datos.correcto) {
        alert(
          datos.mensaje ||
          "No se pudo guardar la actividad."
        );
        return;
      }

      limpiarFormulario();
      await recargar();

    } catch (error) {

      console.error(error);

      alert(
        "Ha ocurrido un error al guardar la actividad."
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
          onClick={nuevaActividad}
          style={estilos.botonNuevo}
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


          <form onSubmit={guardarActividad}>

            <label style={estilos.label}>
              Nombre
            </label>

            <input
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Ej.: Bachata"
              style={estilos.input}
              disabled={guardando}
            />


            <label style={estilos.label}>
              Descripción
            </label>

            <textarea
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
              placeholder="Descripción de la actividad"
              style={estilos.textarea}
              rows={3}
              disabled={guardando}
            />


            <label style={estilos.label}>
              Orden
            </label>

            <input
              type="number"
              value={orden}
              onChange={(e) =>
                setOrden(e.target.value)
              }
              style={estilos.input}
              disabled={guardando}
            />


            <div style={estilos.botonesEditor}>

              <button
                type="button"
                onClick={limpiarFormulario}
                style={estilos.botonCancelar}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                style={estilos.botonGuardar}
                disabled={guardando}
              >
                {guardando
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

                <div style={estilos.filaAcciones}>

                  <span style={estilos.estadoActivo}>
                    ACTIVA
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      editarActividad(actividad)
                    }
                    style={estilos.botonEditar}
                  >
                    Editar
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

  const [mostrandoFormulario, setMostrandoFormulario] =
    useState(false);

  const [nombre, setNombre] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [actividadesSeleccionadas, setActividadesSeleccionadas] =
    useState([]);

  const [guardando, setGuardando] =
    useState(false);


  function limpiarFormulario() {
    setNombre("");
    setDescripcion("");
    setActividadesSeleccionadas([]);
    setMostrandoFormulario(false);
  }


  function nuevoProfesor() {
    setNombre("");
    setDescripcion("");
    setActividadesSeleccionadas([]);
    setMostrandoFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  function cambiarActividadNuevoProfesor(id) {

    setActividadesSeleccionadas((actuales) => {

      if (actuales.includes(id)) {
        return actuales.filter(
          (actividadId) =>
            actividadId !== id
        );
      }

      return [
        ...actuales,
        id,
      ];

    });

  }


  async function guardarProfesor(event) {

    event.preventDefault();

    if (!nombre.trim()) {
      alert("El nombre del profesor es obligatorio.");
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

        alert(
          datos.mensaje ||
          "No se pudo crear el profesor."
        );

        return;
      }

      limpiarFormulario();

      await recargar();

    } catch (error) {

      console.error(error);

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
            onSubmit={guardarProfesor}
          >

            <label style={estilos.label}>
              Nombre
            </label>

            <input
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Ej.: Juárez"
              style={estilos.input}
              disabled={guardando}
            />


            <label style={estilos.label}>
              Descripción
            </label>

            <textarea
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
              placeholder="Descripción del profesor"
              style={estilos.textarea}
              rows={3}
              disabled={guardando}
            />


            <label style={estilos.label}>
              Actividades que imparte
            </label>


            <div style={estilos.actividadesChecks}>

              {actividades.map(
                (actividad) => {

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
                          cambiarActividadNuevoProfesor(
                            actividad.id
                          )
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


            <div style={estilos.botonesEditor}>

              <button
                type="button"
                onClick={limpiarFormulario}
                style={estilos.botonCancelar}
                disabled={guardando}
              >
                Cancelar
              </button>


              <button
                type="submit"
                style={estilos.botonGuardar}
                disabled={guardando}
              >
                {guardando
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
                key={profesor.id}
                profesor={profesor}
                indice={indice}
                actividades={actividades}
                recargar={recargar}
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
    useState(profesor.nombre || "");

  const [descripcion, setDescripcion] =
    useState(profesor.descripcion || "");

  const [
    actividadesSeleccionadas,
    setActividadesSeleccionadas,
  ] = useState(
    profesor.actividad_ids || []
  );


  function cambiarActividad(id) {

    setActividadesSeleccionadas(
      (actuales) => {

        if (actuales.includes(id)) {

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


  async function guardarCambios() {

    try {

      setGuardando(true);

      const respuesta =
  await fetch(
    "/api/profesores",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: profesor.id,
        nombre,
        descripcion,
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
    "Error recibido de la API:",
    datos
  );

  alert(
    [
      datos.mensaje || "Error al guardar el profesor.",
      datos.error ? `\n\nError: ${datos.error}` : "",
      datos.codigo ? `\nCódigo: ${datos.codigo}` : "",
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
          onChange={(e) =>
            setNombre(e.target.value)
          }
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

          {actividades.map(
            (actividad) => {

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
                      cambiarActividad(
                        actividad.id
                      )
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


        <div style={estilos.botonesEditor}>

          <button
            type="button"
            onClick={() =>
              setEditando(false)
            }
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

            profesor.actividad_ids.map(
              (actividadId) => {

                const actividad =
                  actividades.find(
                    (item) =>
                      item.id === actividadId
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

              }
            )

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
          onClick={() =>
            setEditando(true)
          }
          style={estilos.botonEditar}
        >
          Editar
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

        profesorIds: existe
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
              id: editando.id,
            }
          : {}),

      };

      const respuesta =
        await fetch(
          "/api/horarios",
          {
            method: metodo,
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
            value={formulario.dia}
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

      <div style={estilos.vacio}>

        <div style={estilos.vacioIcono}>
          ✨
        </div>

        <div style={estilos.vacioTitulo}>
          Esta sección la prepararemos ahora.
        </div>

        <div style={estilos.vacioTexto}>
          La estructura ya está preparada
          para añadir este apartado al panel.
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
    margin: 0,
    padding: 0,
    background: "#111114",
    color: "#ffffff",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
    position: "relative",
  },


  menuLateral: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "260px",
    height: "100vh",
    padding: "28px 18px",
    background: "#111114",
    borderRight:
      "1px solid #29292f",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    zIndex: 9999,
    overflowY: "auto",
    overflowX: "hidden",
  },


  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "35px",
    paddingLeft: "5px",
    flexShrink: 0,
  },


  logo: {
    width: "50px",
    height: "50px",
    minWidth: "50px",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #ff7b88, #ff9eaa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
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
    boxSizing: "border-box",
    flexShrink: 0,
  },


  botonMenu: {
    width: "100%",
    minWidth: 0,
    height: "50px",
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
    flexShrink: 0,
  },


  botonMenuActivo: {
    background:
      "linear-gradient(135deg, #ff7d8b, #ff9aaa)",
    color: "#ffffff",
  },


  iconoMenu: {
    width: "24px",
    minWidth: "24px",
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
    flexShrink: 0,
  },


  puntoVerde: {
    width: "8px",
    height: "8px",
    minWidth: "8px",
    borderRadius: "50%",
    background: "#8ee35f",
    display: "inline-block",
  },


  zonaPrincipal: {
    marginLeft: "260px",
    width: "calc(100% - 260px)",
    minHeight: "100vh",
    boxSizing: "border-box",
    overflowX: "hidden",
    position: "relative",
  },


  cabecera: {
    width: "100%",
    boxSizing: "border-box",
    padding:
      "50px 50px 0 50px",
    margin: 0,
    position: "relative",
    zIndex: 1,
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
    margin: 0,
    padding: 0,
    color: "#fff5d7",
    fontWeight: "500",
  },


  contenido: {
    width: "100%",
    boxSizing: "border-box",
    padding:
      "55px 50px 60px 50px",
    overflowX: "hidden",
  },


  cabeceraSeccion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "30px",
    marginBottom: "30px",
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
    marginTop: 0,
    marginBottom: "30px",
    lineHeight: "1.5",
  },


  botonNuevo: {
    border: 0,
    background:
      "linear-gradient(135deg, #ff7d8b, #ff9aaa)",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },


  tarjetas: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
    width: "100%",
  },


  tarjeta: {
    background: "#18181d",
    border:
      "1px solid #29292f",
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
    width: "100%",
  },


  fila: {
    width: "100%",
    background: "#18181d",
    border:
      "1px solid #29292f",
    borderRadius: "18px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxSizing: "border-box",
    position: "relative",
  },


  numero: {
    color: "#ff7f8c",
    fontSize: "14px",
    fontWeight: "800",
    width: "35px",
    minWidth: "35px",
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
    background:
      "rgba(128, 220, 83, 0.12)",
    color: "#9bea6b",
    borderRadius: "30px",
    padding: "7px 12px",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    whiteSpace: "nowrap",
  },


  botonEditar: {
    border:
      "1px solid #45454d",
    background: "#222228",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "9px 14px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },


  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "10px",
  },


  chip: {
    background:
      "rgba(255, 128, 143, 0.12)",
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
    border:
      "1px solid #29292f",
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
    width: "100%",
    background: "#18181d",
    border:
      "1px solid #393941",
    borderRadius: "20px",
    padding: "25px",
    boxSizing: "border-box",
    marginBottom: "25px",
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
    border:
      "1px solid #393941",
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
    border:
      "1px solid #393941",
    borderRadius: "10px",
    padding: "12px",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
    resize: "vertical",
    fontFamily:
      "Arial, Helvetica, sans-serif",
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
    border:
      "1px solid #393941",
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
    border:
      "1px solid #45454d",
    background: "transparent",
    color: "#c4c4ca",
    borderRadius: "10px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: "600",
  },


  botonGuardar: {
    border: 0,
    background:
      "linear-gradient(135deg, #ff7d8b, #ff9aaa)",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "11px 20px",
    cursor: "pointer",
    fontWeight: "700",
  },

};
