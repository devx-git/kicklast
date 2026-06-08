import Navbar from '../components/Navbar';

const G = '#8dc63f';
const R = '#f87171';

function Card({ icon, title, text, color = '#fff' }) {
  return (
    <div style={{ background: '#0d1520', border: '1px solid #1e2535', borderRadius: 12, padding: '24px 22px' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color, marginBottom: 8 }}>{title}</div>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', lineHeight: 1.75, margin: 0 }}>{text}</p>
    </div>
  );
}

const SENALES = [
  'Juegas con dinero que necesitas para gastos esenciales (comida, alquiler, servicios).',
  'Aumentas las apuestas para intentar recuperar pérdidas anteriores.',
  'Piensas constantemente en el juego, incluso cuando estás haciendo otras cosas.',
  'Te sientes ansioso, irritable o deprimido cuando no puedes jugar.',
  'Mientes a familiares o amigos sobre cuánto juegas o gastos.',
  'Has intentado controlar, reducir o dejar de jugar sin éxito.',
  'El juego afecta tu trabajo, estudios o relaciones personales.',
  'Juegas para escapar de problemas o sentimientos negativos.',
];

const HERRAMIENTAS = [
  { icon: '⏱️', title: 'Límites de tiempo', text: 'Puedes establecer sesiones máximas diarias o semanales desde la configuración de tu cuenta. Una vez alcanzado el límite la sesión se cierra automáticamente.' },
  { icon: '💰', title: 'Límites de gasto', text: 'Configura un tope de créditos que puedes gastar por día, semana o mes. El sistema bloquea nuevas apuestas automáticamente cuando alcanzas tu límite.' },
  { icon: '❄️', title: 'Autoexclusión temporal', text: 'Pausa tu cuenta por 24 horas, 7 días, 30 días o 90 días. Durante la exclusión no podrás iniciar sesión ni realizar ninguna actividad de juego.' },
  { icon: '🔒', title: 'Cierre permanente de cuenta', text: 'Si decides que el juego no es para ti, puedes solicitar el cierre permanente de tu cuenta. Esta acción es irreversible. Tu saldo será procesado según las políticas de retiro.' },
];

const RECURSOS = [
  { pais: '🇨🇴 Colombia', entidad: 'Ministerio de Salud - Línea de adicciones', contacto: '01 8000 113 113', web: 'www.minsalud.gov.co' },
  { pais: '🇲🇽 México', entidad: 'CONADIC - Línea de la Vida', contacto: '800 911 2000', web: 'www.gob.mx/salud/conadic' },
  { pais: '🇦🇷 Argentina', entidad: 'CPA - Centro de Prevención de Adicciones', contacto: '0800 222 1002', web: 'www.argentina.gob.ar' },
  { pais: '🇪🇨 Ecuador', entidad: 'CONSEP - Línea de ayuda', contacto: '1800 102 090', web: 'www.consep.gob.ec' },
  { pais: '🌎 Internacional', entidad: 'Gamblers Anonymous', contacto: '', web: 'www.gamblersanonymous.org' },
];

export default function JuegoResponsable() {
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1a0a0a 0%,#0a1428 50%,#0d1f10 100%)', padding: '56px 20px 48px', borderBottom: '1px solid rgba(248,113,113,0.1)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: R, letterSpacing: '0.22em', marginBottom: 10 }}>JUEGO RESPONSABLE</p>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, margin: '0 0 14px' }}>
          Juega con <span style={{ color: G }}>cabeza</span>,<br />no con el corazón
        </h1>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#6b7a8d', maxWidth: 520, margin: '0 auto 20px', lineHeight: 1.75 }}>
          En KickLast queremos que el juego sea una fuente de entretenimiento y emoción, nunca de estrés o daño. Aquí encontrarás herramientas y recursos para mantener el control.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 30, padding: '10px 20px' }}>
          <span style={{ background: R, color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 900, padding: '3px 9px', borderRadius: 4 }}>+18</span>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#fca5a5' }}>Servicio exclusivo para mayores de 18 años</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Nuestro compromiso */}
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 20, color: G, letterSpacing: '0.05em' }}>NUESTRO COMPROMISO</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 14, marginBottom: 48 }}>
          <Card icon="🛡️" title="Verificación de edad" text="Verificamos que todos nuestros usuarios sean mayores de 18 años. KickLast puede solicitar documentos de identidad en cualquier momento." color={G} />
          <Card icon="🔐" title="Datos seguros" text="Tu información financiera y personal se almacena con cifrado de nivel bancario. Nunca compartimos tus datos con terceros sin tu consentimiento." color={G} />
          <Card icon="⚖️" title="Juego justo" text="Nuestros algoritmos de resolución de predicciones son auditables. Los resultados se basan exclusivamente en datos oficiales de los partidos." color={G} />
          <Card icon="📊" title="Transparencia total" text="Publicamos estadísticas de participación y tasas de retorno. Creemos que la información es la mejor herramienta para jugar con responsabilidad." color={G} />
        </div>

        {/* Señales de alerta */}
        <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '28px 28px 24px', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: R, marginBottom: 6 }}>⚠️ SEÑALES DE ALERTA</h2>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', marginBottom: 20, lineHeight: 1.7 }}>
            El juego problemático puede desarrollarse gradualmente. Reconocer estas señales a tiempo marca la diferencia:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 8 }}>
            {SENALES.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', background: 'rgba(248,113,113,0.05)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.1)' }}>
                <span style={{ color: R, fontSize: 12, marginTop: 3, flexShrink: 0 }}>●</span>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#c0cad8', lineHeight: 1.6 }}>{s}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#fca5a5', marginTop: 18, padding: '12px 16px', background: 'rgba(248,113,113,0.08)', borderRadius: 8 }}>
            Si reconoces 3 o más de estas señales, <strong>busca ayuda</strong>. El juego problemático es un trastorno de salud tratable. No estás solo.
          </p>
        </div>

        {/* Herramientas de control */}
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '0.05em' }}>🛠️ HERRAMIENTAS DE CONTROL</h2>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', marginBottom: 20 }}>Disponibles en tu perfil → Configuración → Juego responsable</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 14, marginBottom: 48 }}>
          {HERRAMIENTAS.map((h, i) => (
            <Card key={i} icon={h.icon} title={h.title} text={h.text} />
          ))}
        </div>

        {/* Recursos de ayuda */}
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 20, letterSpacing: '0.05em' }}>📞 RECURSOS DE AYUDA PROFESIONAL</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
          {RECURSOS.map((r, i) => (
            <div key={i} style={{ background: '#0d1520', border: '1px solid #1e2535', borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{r.pais}</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>{r.entidad}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {r.contacto && <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: G }}>{r.contacto}</span>}
                <a href={`https://${r.web}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', textDecoration: 'none' }}>
                  {r.web} →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA autoexclusión */}
        <div style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '28px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>¿Necesitas un descanso?</div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.75 }}>
            Si sientes que el juego está afectando tu vida, no esperes. Puedes autoexcluirte de forma inmediata o contactar a nuestro equipo de soporte.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/dashboard" style={{ background: R, color: '#fff', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, padding: '12px 24px', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.05em' }}>
              PAUSAR MI CUENTA
            </a>
            <a href="mailto:soporte@kicklast.com" style={{ background: '#1e2535', color: '#c0cad8', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, padding: '12px 20px', borderRadius: 8, textDecoration: 'none', border: '1px solid #1e2a3a' }}>
              CONTACTAR SOPORTE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
