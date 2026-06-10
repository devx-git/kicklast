import Navbar from '../components/Navbar';

const G = '#8dc63f';

const SPONSORS_ACTUALES = [
  { img: '/img/logoims1.webp',    nombre: 'Consorcio IMS',    tipo: 'Patrocinador Principal', desc: 'Líderes en gestión deportiva y desarrollo empresarial global. Más de 30 países y dos décadas conectando marcas con el deporte de alto impacto.', badge: '⭐ PRINCIPAL' },
  { img: '/img/surebets11.webp',  nombre: 'SureBets24/P',     tipo: 'Patrocinador',           desc: 'Plataforma líder en análisis de apuestas deportivas con presencia en más de 20 mercados internacionales.', badge: null },
  { img: '/img/gosports1.webp',   nombre: 'GO! Sports',       tipo: 'Patrocinador',           desc: 'Marketing deportivo de alto impacto conectando marcas con los eventos más importantes del mundo.', badge: null },
  { img: '/img/logodevx1.webp',   nombre: 'DeVx Studio',      tipo: 'Desarrollador oficial',  desc: 'Equipo técnico detrás de la arquitectura y desarrollo integral de la plataforma KickLast.', badge: null },
];

const BENEFICIOS = [
  { icon: '👁️', title: 'Visibilidad masiva', text: 'Exposición frente a millones de aficionados apasionados en más de 15 países de LATAM y España.' },
  { icon: '🎯', title: 'Audiencia segmentada', text: 'Hombres y mujeres 18-45 años, apasionados por el fútbol, digitalmente activos y con capacidad de gasto.' },
  { icon: '📊', title: 'Métricas en tiempo real', text: 'Dashboard con impresiones, clics, conversiones y alcance demográfico actualizados cada hora.' },
  { icon: '🏆', title: 'Asociación con el Mundial', text: 'Tu marca ligada al evento deportivo más visto del planeta: el Mundial de Fútbol 2026.' },
  { icon: '📲', title: 'Presencia multi-canal', text: 'Logo, banners, naming de eventos, push notifications, emails y más. Construimos el paquete a tu medida.' },
  { icon: '🤝', title: 'Equipo dedicado', text: 'Un account manager asignado a tu marca durante toda la vigencia del patrocinio.' },
];

const PAQUETES = [
  { nombre: 'Starter', precio: 'Desde $500 USD', color: '#4a5568', features: ['Logo en la plataforma', 'Mención en 1 evento', 'Reporte mensual'] },
  { nombre: 'Growth', precio: 'Desde $2,000 USD', color: G, features: ['Logo + banner en eventos', 'Mención en comunicaciones', 'Naming de 1 torneo', 'Reporte semanal', 'Account manager'] },
  { nombre: 'Elite', precio: 'Desde $10,000 USD', color: '#f59e0b', features: ['Presencia completa en plataforma', 'Naming de torneos exclusivos', 'Patrocinio de premios', 'Push notifications', 'Reporte en tiempo real', 'Account manager dedicado', 'Reuniones mensuales'] },
];

export default function PaginaPatrocinadores() {
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0a1428 0%,#0d1f10 60%,#0a1428 100%)', padding: '60px 20px 52px', borderBottom: '1px solid rgba(141,198,63,0.1)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: G, letterSpacing: '0.22em', marginBottom: 10 }}>PATROCINADORES OFICIALES</p>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, margin: '0 0 14px', lineHeight: 1.05 }}>
          Marcas que confían en<br /><span style={{ color: G }}>KICK LAST</span>
        </h1>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#6b7a8d', maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.75 }}>
          Empresas líderes que eligieron KickLast para conectar con millones de aficionados apasionados durante los eventos deportivos más importantes del planeta.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['3.5B+', 'Espectadores mundiales'], ['15+', 'Países LATAM'], ['+18', 'Audiencia verificada'], ['100%', 'Métricas transparentes']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900, color: G, lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', letterSpacing: '0.06em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '52px 20px 80px' }}>

        {/* Sponsors actuales */}
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: G, letterSpacing: '0.14em', marginBottom: 24 }}>NUESTROS PATROCINADORES</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 16, marginBottom: 56 }}>
          {SPONSORS_ACTUALES.map((s, i) => (
            <div key={i} style={{ background: '#0d1520', border: `1px solid ${s.badge === '⭐ PRINCIPAL' ? 'rgba(141,198,63,0.3)' : '#1e2535'}`, borderRadius: 14, padding: '24px 22px', position: 'relative' }}>
              {s.badge && (
                <span style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(141,198,63,0.15)', color: G, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.08em' }}>{s.badge}</span>
              )}
              <div style={{ width: 72, height: 52, marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                <img loading="lazy" decoding="async" src={s.img} alt={s.nombre} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} onError={e => e.target.style.display = 'none'} />
              </div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.nombre}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: G, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10 }}>{s.tipo.toUpperCase()}</div>
              <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </div>
          ))}

          {/* Slot disponible */}
          <div style={{ background: 'rgba(141,198,63,0.03)', border: '1.5px dashed rgba(141,198,63,0.25)', borderRadius: 14, padding: '24px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 180 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>+</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: G, marginBottom: 6 }}>Tu marca aquí</div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568', marginBottom: 16 }}>Slot disponible · Mundial 2026</div>
            <a href="/patrocinador" style={{ background: G, color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11, padding: '8px 18px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.06em' }}>POSTULARME →</a>
          </div>
        </div>

        {/* Beneficios */}
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: G, letterSpacing: '0.14em', marginBottom: 24 }}>¿POR QUÉ PATROCINAR KICKLAST?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 14, marginBottom: 56 }}>
          {BENEFICIOS.map((b, i) => (
            <div key={i} style={{ background: '#0d1520', border: '1px solid #1e2535', borderRadius: 12, padding: '22px 20px' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{b.title}</div>
              <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', lineHeight: 1.7, margin: 0 }}>{b.text}</p>
            </div>
          ))}
        </div>

        {/* Paquetes */}
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: G, letterSpacing: '0.14em', marginBottom: 24 }}>PAQUETES DE PATROCINIO</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 16, marginBottom: 52 }}>
          {PAQUETES.map((p, i) => (
            <div key={i} style={{ background: '#0d1520', border: `1px solid ${p.color === G ? 'rgba(141,198,63,0.4)' : '#1e2535'}`, borderRadius: 14, padding: '24px 22px', position: 'relative', overflow: 'hidden' }}>
              {p.color === G && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: G }} />}
              {p.color === '#f59e0b' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#f59e0b' }} />}
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 900, color: p.color, marginBottom: 4 }}>{p.nombre}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', marginBottom: 18 }}>{p.precio}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: G, fontSize: 10, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#c0cad8' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg,#0a1428,#0d1f10)', border: '1px solid rgba(141,198,63,0.2)', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 900, marginBottom: 12 }}>
            ¿Listo para ser parte del <span style={{ color: G }}>equipo?</span>
          </div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#6b7a8d', maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.75 }}>
            Los slots son limitados para el Mundial 2026. Completa la solicitud y nuestro equipo te enviará una propuesta personalizada en 48 horas.
          </p>
          <a href="/patrocinador" style={{ background: G, color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 15, padding: '15px 40px', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.06em', display: 'inline-block', boxShadow: '0 0 40px rgba(141,198,63,0.25)' }}>
            🤝 QUIERO SER PATROCINADOR →
          </a>
        </div>
      </div>
    </div>
  );
}
