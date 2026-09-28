import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.lucenabaila.es";


/* =========================================================
   SLUG
========================================================= */

function slugify(text = "") {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


/* =========================================================
   FORMATEAR HORA
========================================================= */

function formatearHora(hora) {

  if (!hora) {
    return "";
  }

  const texto = String(hora);

  if (texto.length >= 5) {
    return texto.substring(0, 5);
  }

  return texto;
}


/* =========================================================
   CARGAR DATOS
========================================================= */

async function obtenerDatos() {

  const [
    actividadesRes,
    horariosRes,
    profesoresRes,
  ] = await Promise.all([

    fetch(
      `${SITE_URL}/api/actividades`,
      {
        cache: "no-store",
      }
    ),

    fetch(
      `${SITE_URL}/api/horarios`,
      {
        cache: "no-store",
      }
    ),

    fetch(
      `${SITE_URL}/api/profesores`,
      {
        cache: "no-store",
      }
    ),

  ]);


  if (
    !actividadesRes.ok ||
    !horariosRes.ok ||
    !profesoresRes.ok
  ) {

    throw new Error(
      "No se han podido cargar los datos."
    );

  }


  const actividadesData =
    await actividadesRes.json();

  const horariosData =
    await horariosRes.json();

  const profesoresData =
    await profesoresRes.json();


  return {

    actividades:
      Array.isArray(actividadesData)
        ? actividadesData
        : actividadesData.actividades || [],

    horarios:
      Array.isArray(horariosData)
        ? horariosData
        : horariosData.horarios || [],

    profesores:
      Array.isArray(profesoresData)
        ? profesoresData
        : profesoresData.profesores || [],

  };

}


/* =========================================================
   OBTENER ACTIVIDAD
========================================================= */

async function obtenerActividad(slug) {

  const {
    actividades,
    horarios,
    profesores,
  } = await obtenerDatos();


  const actividad =
    actividades.find(
      (item) =>
        slugify(item.nombre) === slug
    );


  if (!actividad) {
    return null;
  }


  const horariosActividad =
    horarios.filter(
      (horario) =>
        Number(
          horario.actividad_id
        ) === Number(
          actividad.id
        )
    );


  const profesoresActividad =
    profesores.filter(
      (profesor) =>
        Array.isArray(
          profesor.actividad_ids
        )
          ? profesor.actividad_ids.includes(
              Number(actividad.id)
            )
          : false
    );


  return {

    actividad,

    horarios:
      horariosActividad,

    profesores:
      profesoresActividad,

  };

}


/* =========================================================
   SEO
========================================================= */

export async function generateMetadata({
  params,
}) {

  const { slug } =
    await params;


  const datos =
    await obtenerActividad(slug);


  if (!datos) {

    return {

      title:
        "Actividad no encontrada | Artes Escénicas Paradise",

      robots: {
        index: false,
        follow: true,
      },

    };

  }


  const nombre =
    datos.actividad.nombre;


  const description =
    datos.actividad.descripcion ||
    `Clases de ${nombre} en Lucena en Artes Escénicas Paradise.`;


  return {

    title:
      `${nombre} en Lucena | Artes Escénicas Paradise`,

    description,

    alternates: {

      canonical:
        `${SITE_URL}/actividades/${slug}`,

    },

    openGraph: {

      title:
        `${nombre} en Lucena | Artes Escénicas Paradise`,

      description,

      url:
        `${SITE_URL}/actividades/${slug}`,

      siteName:
        "Artes Escénicas Paradise",

      locale:
        "es_ES",

      type:
        "website",

    },

    robots: {

      index: true,

      follow: true,

    },

  };

}


/* =========================================================
   PÁGINA
========================================================= */

export default async function ActividadPage({
  params,
}) {

  const { slug } =
    await params;


  const datos =
    await obtenerActividad(slug);


  if (!datos) {
    notFound();
  }


  const {
    actividad,
    horarios,
    profesores,
  } = datos;


  return (

    <main className="actividad-page">


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="actividad-hero">

        <div className="actividad-hero-fondo"></div>


        <div className="actividad-container">

          <a
            href="/"
            className="actividad-volver"
          >
            ← Volver a Artes Escénicas Paradise
          </a>


          <div className="actividad-hero-grid">


            {/* INFORMACIÓN */}

            <div className="actividad-hero-info">

              <div className="actividad-etiqueta">
                ESCUELA DE BAILE · LUCENA
              </div>


              <h1>
                {actividad.nombre}
              </h1>


              <div className="actividad-linea"></div>


              <p className="actividad-hero-texto">
                {actividad.descripcion}
              </p>


              <div className="actividad-hero-localizacion">

                <span>
                  📍
                </span>

                <span>
                  Carretera de Rute 15 · Lucena
                </span>

              </div>


            </div>


            {/* CARTEL */}

            <div className="actividad-hero-imagen">

              {actividad.imagen ? (

                <img
                  src={actividad.imagen}
                  alt={`${actividad.nombre} en Lucena - Artes Escénicas Paradise`}
                />

              ) : (

                <div className="actividad-sin-imagen">

                  <span>
                    {actividad.nombre}
                  </span>

                </div>

              )}

            </div>


          </div>

        </div>

      </section>



      {/* =====================================================
          DESCRIPCIÓN
      ====================================================== */}

      <section className="actividad-descripcion">

        <div className="actividad-container">

          <div className="descripcion-contenido">

            <div className="descripcion-titulo">

              <span className="mini-etiqueta">
                DESCUBRE LA ACTIVIDAD
              </span>

              <h2>
                Aprende, disfruta
                <br />
                <em>y conecta.</em>
              </h2>

            </div>


            <div className="descripcion-texto">

              <p>
                {actividad.descripcion}
              </p>

              <p>
                En Artes Escénicas Paradise
                encontrarás un ambiente cercano,
                dinámico y pensado para disfrutar
                del baile, mejorar tu técnica y
                compartir tu pasión con otras
                personas.
              </p>

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          HORARIOS
      ====================================================== */}

      <section className="actividad-horarios">

        <div className="actividad-container">


          <div className="seccion-cabecera">

            <div>

              <span className="mini-etiqueta">
                HORARIOS
              </span>

              <h2>
                Elige tu horario
              </h2>

            </div>


            <p>
              Consulta los días y horarios
              disponibles para {actividad.nombre}.
            </p>

          </div>



          {horarios.length > 0 ? (

            <div className="horarios-grid">

              {horarios.map(
                (horario) => (

                  <article
                    className="horario-card"
                    key={horario.id}
                  >


                    <div className="horario-card-top">

                      <div className="horario-dia">

                        <span className="horario-icono">
                          ◷
                        </span>

                        <strong>
                          {horario.dia}
                        </strong>

                      </div>


                      <div className="horario-hora">

                        {formatearHora(
                          horario.hora_inicio
                        )}

                        {horario.hora_fin && (

                          <>

                            <span>
                              –
                            </span>

                            {formatearHora(
                              horario.hora_fin
                            )}

                          </>

                        )}

                      </div>

                    </div>



                    {horario.nivel && (

                      <div className="horario-nivel">

                        {horario.nivel}

                      </div>

                    )}



                    {Array.isArray(
                      horario.profesor_nombres
                    ) &&
                    horario.profesor_nombres.length >
                      0 && (

                      <div className="horario-profesor">

                        <span>
                          PROFESOR/A
                        </span>

                        <strong>
                          {horario.profesor_nombres.join(
                            " · "
                          )}
                        </strong>

                      </div>

                    )}


                  </article>

                )
              )}

            </div>

          ) : (

            <div className="horarios-vacio">

              <div>
                🕐
              </div>

              <h3>
                Próximamente publicaremos
                los horarios.
              </h3>

              <p>
                Si quieres información sobre
                {` ${actividad.nombre}`},
                puedes contactar con nosotros.
              </p>

            </div>

          )}


        </div>

      </section>



      {/* =====================================================
          PROFESORES
      ====================================================== */}

      {profesores.length > 0 && (

        <section className="actividad-profesores">

          <div className="actividad-container">


            <div className="seccion-cabecera">

              <div>

                <span className="mini-etiqueta">
                  NUESTRO EQUIPO
                </span>

                <h2>
                  Tus profesores
                </h2>

              </div>

            </div>



            <div className="profesores-grid">

              {profesores.map(
                (profesor) => (

                  <article
                    className="profesor-card"
                    key={profesor.id}
                  >


                    <div className="profesor-imagen">

                      {profesor.foto ? (

                        <img
                          src={profesor.foto}
                          alt={`${profesor.nombre} - profesor/a de ${actividad.nombre}`}
                        />

                      ) : (

                        <div className="profesor-sin-foto">
                          {profesor.nombre}
                        </div>

                      )}

                    </div>


                    <div className="profesor-info">

                      <span>
                        PROFESOR/A
                      </span>

                      <h3>
                        {profesor.nombre}
                      </h3>


                      {profesor.descripcion && (

                        <p>
                          {profesor.descripcion}
                        </p>

                      )}

                    </div>


                  </article>

                )
              )}

            </div>

          </div>

        </section>

      )}



      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="actividad-cta">

        <div className="actividad-container">

          <div className="cta-contenido">

            <span className="mini-etiqueta">
              ¿TE APETECE BAILAR?
            </span>


            <h2>
              Ven a probar
              <br />
              una clase.
            </h2>


            <p>
              Descubre {actividad.nombre} en
              Artes Escénicas Paradise y
              empieza a disfrutar del baile.
            </p>


            <a
              href="/#contacto"
              className="cta-boton"
            >
              QUIERO PROBAR UNA CLASE
              <span>
                →
              </span>
            </a>

          </div>

        </div>

      </section>



      {/* =====================================================
          ESTILOS
      ====================================================== */}

      <style>{`

        /* =====================================================
           BASE
        ====================================================== */

        .actividad-page {

          min-height: 100vh;

          background: #ffffff;

          color: #171717;

        }


        .actividad-container {

          width: min(
            1180px,
            calc(100% - 40px)
          );

          margin: 0 auto;

        }


        .mini-etiqueta {

          display: inline-block;

          font-size: 12px;

          font-weight: 800;

          letter-spacing: 0.18em;

          color: #d89b19;

        }


        /* =====================================================
           HERO
        ====================================================== */

        .actividad-hero {

          position: relative;

          overflow: hidden;

          padding:
            35px 0
            90px;

          background:
            linear-gradient(
              135deg,
              #0c0c0c 0%,
              #191919 55%,
              #111111 100%
            );

          color: #ffffff;

        }


        .actividad-hero-fondo {

          position: absolute;

          width: 500px;

          height: 500px;

          right: -180px;

          top: -180px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(229,161,26,0.32),
              transparent 68%
            );

          pointer-events: none;

        }


        .actividad-volver {

          position: relative;

          display: inline-block;

          margin-bottom: 65px;

          color: rgba(
            255,
            255,
            255,
            0.72
          );

          text-decoration: none;

          font-size: 14px;

          font-weight: 600;

        }


        .actividad-volver:hover {

          color: #ffffff;

        }


        .actividad-hero-grid {

          position: relative;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(360px, 480px);

          gap: 80px;

          align-items: center;

        }


        .actividad-etiqueta {

          margin-bottom: 18px;

          font-size: 13px;

          font-weight: 800;

          letter-spacing: 0.16em;

          color: #e5a11a;

        }


        .actividad-hero h1 {

          margin: 0;

          font-size:
            clamp(
              52px,
              8vw,
              105px
            );

          line-height: 0.88;

          letter-spacing:
            -0.055em;

          color: #ffffff;

        }


        .actividad-linea {

          width: 90px;

          height: 5px;

          margin:
            32px 0
            28px;

          background: #e5a11a;

          border-radius: 10px;

        }


        .actividad-hero-texto {

          max-width: 680px;

          margin: 0;

          font-size: 19px;

          line-height: 1.7;

          color:
            rgba(
              255,
              255,
              255,
              0.78
            );

        }


        .actividad-hero-localizacion {

          display: flex;

          align-items: center;

          gap: 10px;

          margin-top: 28px;

          font-size: 14px;

          color:
            rgba(
              255,
              255,
              255,
              0.65
            );

        }


        .actividad-hero-imagen {

          position: relative;

          overflow: hidden;

          border-radius: 26px;

          background: #222;

          box-shadow:
            0 30px 80px
            rgba(
              0,
              0,
              0,
              0.42
            );

          transform:
            rotate(1.5deg);

        }


        .actividad-hero-imagen img {

          display: block;

          width: 100%;

          height: auto;

          object-fit: cover;

        }


        .actividad-sin-imagen {

          min-height: 500px;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 30px;

          background:
            linear-gradient(
              135deg,
              #222,
              #111
            );

          color: #ffffff;

          text-align: center;

          font-size: 38px;

          font-weight: 800;

        }


        /* =====================================================
           DESCRIPCIÓN
        ====================================================== */

        .actividad-descripcion {

          padding:
            100px 0;

          background: #ffffff;

        }


        .descripcion-contenido {

          display: grid;

          grid-template-columns:
            minmax(0, 0.9fr)
            minmax(0, 1.1fr);

          gap: 90px;

          align-items: start;

        }


        .descripcion-titulo h2 {

          margin:
            12px 0 0;

          font-size:
            clamp(
              40px,
              5vw,
              68px
            );

          line-height: 0.98;

          letter-spacing:
            -0.04em;

          color: #171717;

        }


        .descripcion-titulo h2 em {

          color: #d89b19;

          font-style: normal;

        }


        .descripcion-texto {

          padding-top: 8px;

        }


        .descripcion-texto p {

          margin:
            0 0 22px;

          font-size: 18px;

          line-height: 1.8;

          color: #555555;

        }


        /* =====================================================
           HORARIOS
        ====================================================== */

        .actividad-horarios {

          padding:
            100px 0
            110px;

          background:
            #f3f3f3;

        }


        .seccion-cabecera {

          display: flex;

          justify-content:
            space-between;

          align-items: end;

          gap: 40px;

          margin-bottom: 45px;

        }


        .seccion-cabecera h2 {

          margin:
            10px 0 0;

          font-size:
            clamp(
              40px,
              5vw,
              68px
            );

          line-height: 0.95;

          letter-spacing:
            -0.04em;

          color: #171717;

        }


        .seccion-cabecera > p {

          max-width: 420px;

          margin: 0;

          font-size: 16px;

          line-height: 1.6;

          color: #666666;

        }


        .horarios-grid {

          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(
                280px,
                1fr
              )
            );

          gap: 18px;

        }


        .horario-card {

          position: relative;

          padding: 27px;

          border-radius: 18px;

          background: #ffffff;

          border:
            1px solid
            #dedede;

          box-shadow:
            0 10px 30px
            rgba(
              0,
              0,
              0,
              0.06
            );

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;

        }


        .horario-card:hover {

          transform:
            translateY(-4px);

          box-shadow:
            0 18px 40px
            rgba(
              0,
              0,
              0,
              0.10
            );

        }


        .horario-card-top {

          display: flex;

          justify-content:
            space-between;

          align-items:
            center;

          gap: 15px;

        }


        .horario-dia {

          display: flex;

          align-items:
            center;

          gap: 10px;

        }


        .horario-icono {

          display: flex;

          align-items: center;

          justify-content: center;

          width: 38px;

          height: 38px;

          border-radius: 50%;

          background:
            rgba(
              229,
              161,
              26,
              0.13
            );

          color: #b77d00;

          font-size: 20px;

        }


        .horario-dia strong {

          display: block;

          font-size: 18px;

          font-weight: 800;

          color: #171717;

        }


        .horario-hora {

          display: flex;

          align-items: center;

          gap: 7px;

          color: #171717;

          font-size: 21px;

          font-weight: 900;

          white-space: nowrap;

        }


        .horario-hora span {

          color: #d89b19;

        }


        .horario-nivel {

          display: inline-block;

          margin-top: 20px;

          padding:
            7px 12px;

          border-radius: 30px;

          background:
            #171717;

          color: #ffffff;

          font-size: 12px;

          font-weight: 800;

          letter-spacing:
            0.04em;

        }


        .horario-profesor {

          display: flex;

          flex-direction: column;

          gap: 4px;

          margin-top: 20px;

          padding-top: 17px;

          border-top:
            1px solid
            #eeeeee;

        }


        .horario-profesor span {

          font-size: 10px;

          font-weight: 800;

          letter-spacing:
            0.14em;

          color: #999999;

        }


        .horario-profesor strong {

          font-size: 14px;

          color: #333333;

        }


        .horarios-vacio {

          padding: 60px 30px;

          text-align: center;

          border-radius: 20px;

          background: #ffffff;

          border:
            1px solid
            #dddddd;

        }


        .horarios-vacio > div {

          font-size: 35px;

        }


        .horarios-vacio h3 {

          margin:
            15px 0 8px;

          color: #171717;

        }


        .horarios-vacio p {

          margin: 0;

          color: #666666;

        }


        /* =====================================================
           PROFESORES
        ====================================================== */

        .actividad-profesores {

          padding:
            100px 0;

          background: #ffffff;

        }


        .profesores-grid {

          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(
                250px,
                1fr
              )
            );

          gap: 25px;

        }


        .profesor-card {

          overflow: hidden;

          border-radius: 20px;

          background: #f5f5f5;

          border:
            1px solid
            #e5e5e5;

        }


        .profesor-imagen {

          aspect-ratio: 1 / 1;

          overflow: hidden;

          background: #222222;

        }


        .profesor-imagen img {

          display: block;

          width: 100%;

          height: 100%;

          object-fit: cover;

        }


        .profesor-sin-foto {

          width: 100%;

          height: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 30px;

          color: #ffffff;

          text-align: center;

          font-size: 25px;

          font-weight: 800;

        }


        .profesor-info {

          padding: 25px;

        }


        .profesor-info > span {

          font-size: 10px;

          font-weight: 800;

          letter-spacing:
            0.14em;

          color: #b77d00;

        }


        .profesor-info h3 {

          margin:
            7px 0 12px;

          font-size: 27px;

          color: #171717;

        }


        .profesor-info p {

          margin: 0;

          font-size: 15px;

          line-height: 1.6;

          color: #666666;

        }


        /* =====================================================
           CTA
        ====================================================== */

        .actividad-cta {

          position: relative;

          overflow: hidden;

          padding:
            110px 0;

          background:
            linear-gradient(
              135deg,
              #111111,
              #202020
            );

          color: #ffffff;

          text-align: center;

        }


        .actividad-cta::before {

          content: "";

          position: absolute;

          width: 500px;

          height: 500px;

          left: -250px;

          bottom: -300px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(
                229,
                161,
                26,
                0.25
              ),
              transparent 68%
            );

        }


        .cta-contenido {

          position: relative;

          z-index: 1;

        }


        .cta-contenido h2 {

          margin:
            12px 0 22px;

          font-size:
            clamp(
              48px,
              7vw,
              88px
            );

          line-height: 0.9;

          letter-spacing:
            -0.05em;

          color: #ffffff;

        }


        .cta-contenido p {

          max-width: 620px;

          margin:
            0 auto 35px;

          font-size: 18px;

          line-height: 1.7;

          color:
            rgba(
              255,
              255,
              255,
              0.72
            );

        }


        .cta-boton {

          display: inline-flex;

          align-items: center;

          gap: 20px;

          padding:
            17px 25px;

          border-radius: 50px;

          background:
            #e5a11a;

          color: #111111;

          text-decoration: none;

          font-size: 13px;

          font-weight: 900;

          letter-spacing:
            0.06em;

          transition:
            transform 0.2s ease;

        }


        .cta-boton:hover {

          transform:
            translateY(-3px);

        }


        .cta-boton span {

          font-size: 22px;

          line-height: 1;

        }


        /* =====================================================
           MÓVIL
        ====================================================== */

        @media (
          max-width: 850px
        ) {


          .actividad-hero {

            padding:
              25px 0
              65px;

          }


          .actividad-volver {

            margin-bottom: 45px;

          }


          .actividad-hero-grid {

            grid-template-columns: 1fr;

            gap: 50px;

          }


          .actividad-hero-imagen {

            max-width: 520px;

            margin: 0 auto;

          }


          .descripcion-contenido {

            grid-template-columns: 1fr;

            gap: 35px;

          }


          .actividad-descripcion {

            padding:
              70px 0;

          }


          .actividad-horarios {

            padding:
              70px 0;

          }


          .seccion-cabecera {

            display: block;

            margin-bottom: 35px;

          }


          .seccion-cabecera > p {

            margin-top: 20px;

          }


          .actividad-profesores {

            padding:
              70px 0;

          }


          .actividad-cta {

            padding:
              80px 0;

          }

        }


        @media (
          max-width: 520px
        ) {


          .actividad-container {

            width:
              calc(100% - 28px);

          }


          .actividad-hero h1 {

            font-size:
              clamp(
                48px,
                16vw,
                70px
              );

          }


          .actividad-hero-texto {

            font-size: 17px;

          }


          .horario-card {

            padding: 22px;

          }


          .horario-card-top {

            align-items:
              flex-start;

            flex-direction:
              column;

          }


          .horario-hora {

            font-size: 25px;

          }


          .actividad-hero-imagen {

            transform:
              rotate(0deg);

          }

        }

      `}</style>


    </main>

  );

}
