export default function PromoterCTA() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #0a1428 0%, #0d1f10 50%, #0a1428 100%)',
      borderTop: '1px solid rgba(141,198,63,0.12)',
      borderBottom: '1px solid rgba(141,198,63,0.12)',
      padding: '72px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(141,198,63,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>

          {/* Left — copy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ background: 'rgba(141,198,63,0.12)', border: '1px solid rgba(141,198,63,0.3)', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.1em' }}>
                ◈ ZONA DE PROMOTORES
              </span>
            </div>

            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, color: '#fff', margin: '0 0 14px', lineHeight: 1.1 }}>
              ¿Quieres ser parte de<br />
              <span style={{ color: '#8dc63f' }}>este gran equipo?</span>
            </h2>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#c0cad8', lineHeight: 1.7, margin: '0 0 20px', maxWidth: 500 }}>
              Conviértete en promotor y crea tus propios eventos de predicciones. Configura porcentajes, gestiona distribuidores y haz crecer tu red. <strong style={{ color: '#fff' }}>El negocio del fútbol en tus manos.</strong>
            </p>

            {/* Beneficios */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
              {[
                '✅ Crea eventos propios',
                '✅ Gestiona distribuidores',
                '✅ Configura comisiones',
                '✅ Vende pines de recarga',
                '✅ Panel de control completo',
                '✅ Soporte dedicado',
              ].map(b => (
                <span key={b} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8dc63f', background: 'rgba(141,198,63,0.06)', border: '1px solid rgba(141,198,63,0.15)', padding: '5px 12px', borderRadius: 20 }}>
                  {b}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="/registro-promotor" style={{
                background: '#8dc63f',
                color: '#0a0d14',
                fontFamily: 'Oswald, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                padding: '14px 32px',
                borderRadius: 6,
                textDecoration: 'none',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#a3d45a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#8dc63f'; e.currentTarget.style.transform = 'none'; }}
              >
                INSCRIBIRME COMO PROMOTOR →
              </a>
              <a href="/login" style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none' }}>
                Ya tengo cuenta →
              </a>
            </div>
          </div>

          {/* Right — stats card */}
          <div style={{ background: 'rgba(10,14,26,0.8)', border: '1px solid rgba(141,198,63,0.2)', borderRadius: 12, padding: '28px 24px', minWidth: 200, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 16 }}>PROMOTORES ACTIVOS</div>
            {[
              { val: '100%', label: 'Control de comisiones' },
              { val: '∞', label: 'Eventos por crear' },
              { val: '24/7', label: 'Panel disponible' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 900, color: '#8dc63f', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.06em', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
