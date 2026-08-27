const activities = [
  { icon: "💃", title: "Salsa", text: "Ritmo, técnica y diversión para todos los niveles." },
  { icon: "🔥", title: "Bachata", text: "Aprende, mejora y disfruta bailando en pareja." },
  { icon: "🩰", title: "Ballet", text: "Clases pensadas para desarrollar técnica y expresión." },
  { icon: "⚡", title: "Urbano", text: "Energía, actitud y coreografías actuales." },
  { icon: "✨", title: "Heels", text: "Potencia tu estilo, seguridad y presencia." },
  { icon: "🎶", title: "Más estilos", text: "Descubre todas las disciplinas de la escuela." },
];

const schedule = [
  ["Lunes", "18:00", "Ballet", "Infantil"],
  ["Lunes", "19:00", "Bachata", "Inicial"],
  ["Martes", "18:30", "Urbano", "Juvenil"],
  ["Miércoles", "19:00", "Salsa", "Inicial"],
  ["Jueves", "20:00", "Bachata", "Intermedio"],
];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#inicio" aria-label="Lucena Baila">
          <span className="brand-mark">LB</span>
          <span>Lucena <strong>Baila</strong></span>
        </a>
        <nav>
          <a href="#clases">Clases</a>
          <a href="#horarios">Horarios</a>
          <a href="#escuela">La escuela</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <a className="nav-cta" href="#contacto">Prueba una clase</a>
      </header>

      <section id="inicio" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">ESCUELA DE BAILE · LUCENA</p>
          <h1>Baila.<br /><em>Disfruta.</em><br />Conecta.</h1>
          <p className="hero-text">
            Un espacio para aprender, compartir y vivir el baile. Encuentra tu estilo,
            conoce a tu gente y empieza a moverte.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#clases">Ver actividades</a>
            <a className="button secondary" href="#contacto">Quiero probar una clase</a>
          </div>
        </div>
        <div className="hero-art" aria-label="Espacio reservado para fotografía principal">
          <div className="hero-photo-note">TU FOTO PRINCIPAL AQUÍ</div>
          <div className="hero-sticker">BAILA<br /><span>CON NOSOTROS</span></div>
        </div>
      </section>

      <section id="clases" className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">ENCUENTRA TU ESTILO</p>
            <h2>Clases para <em>todos</em></h2>
          </div>
          <p>Desde tus primeros pasos hasta perfeccionar tu técnica. Aquí hay un lugar para ti.</p>
        </div>
        <div className="cards">
          {activities.map((item) => (
            <article className="card" key={item.title}>
              <span className="card-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <a href="#contacto">Más información →</a>
            </article>
          ))}
        </div>
      </section>

      <section id="horarios" className="section schedule-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">ORGANIZA TU SEMANA</p>
            <h2>Horarios</h2>
          </div>
          <a className="text-link" href="#contacto">Consultar todos →</a>
        </div>
        <div className="schedule">
          {schedule.map(([day, time, activity, level]) => (
            <div className="schedule-row" key={`${day}-${time}-${activity}`}>
              <strong>{day}</strong>
              <span className="time">{time}</span>
              <span>{activity}</span>
              <span className="level">{level}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="escuela" className="story">
        <div className="story-image"><span>FOTO DE LA ESCUELA</span></div>
        <div className="story-copy">
          <p className="eyebrow">MUCHO MÁS QUE UNA ESCUELA</p>
          <h2>Un lugar para <em>sentirte tú</em></h2>
          <p>
            Queremos que venir a clase sea uno de los mejores momentos de tu semana.
            Profesores, compañeros y un espacio pensado para que disfrutes del baile.
          </p>
          <p>
            Esta es la primera versión de nuestra nueva web. Iremos incorporando toda
            la información real de Lucena Baila y, después, un área privada para alumnos.
          </p>
          <a className="button primary" href="#contacto">Conoce la escuela</a>
        </div>
      </section>

      <section className="banner">
        <p className="eyebrow">¿EMPEZAMOS?</p>
        <h2>Tu próxima clase<br /><em>puede ser hoy.</em></h2>
        <a className="button light" href="#contacto">Quiero probar</a>
      </section>

      <section id="contacto" className="contact section">
        <div>
          <p className="eyebrow">DA EL PRIMER PASO</p>
          <h2>¿Quieres <em>bailar</em> con nosotros?</h2>
          <p>Déjanos tus datos y te contamos qué clase encaja mejor contigo.</p>
        </div>
        <form className="form" action="contacto">
          <input aria-label="Nombre" placeholder="Tu nombre" />
          <input aria-label="Teléfono" placeholder="Teléfono" />
          <select aria-label="Actividad">
            <option>¿Qué actividad te interesa?</option>
            <option>Salsa</option>
            <option>Bachata</option>
            <option>Ballet</option>
            <option>Urbano</option>
            <option>Heels</option>
            <option>Otra</option>
          </select>
          <button className="button primary" type="submit">Solicitar información</button>
        </form>
      </section>

      <footer>
        <div className="brand footer-brand"><span className="brand-mark">LB</span><span>Lucena <strong>Baila</strong></span></div>
        <p>Escuela de baile · Lucena</p>
        <p>© {new Date().getFullYear()} Lucena Baila</p>
      </footer>
    </main>
  );
}
