import { useLocation } from 'react-router-dom';

const PAGE_LABELS = {
  '/mundial': { title: 'Mundial 2026', desc: 'Predicciones y resultados del Mundial FIFA 2026. Próximamente.' },
  '/en-vivo': { title: 'En Vivo', desc: 'Partidos en tiempo real con predicciones en directo. Próximamente.' },
  '/crown': { title: 'Crown League', desc: 'La liga de los mejores predictores. Próximamente.' },
  '/premio': { title: 'Premio Acumulado', desc: 'Consulta el pozo acumulado de todos los torneos activos.' },
  '/promociones': { title: 'Promociones', desc: 'Descuentos, bonos y ofertas especiales para jugadores.' },
  '/recargar': { title: 'Recargas y Vidas', desc: 'Recarga tus vidas con pines o métodos digitales.' },
};

export default function ComingSoon() {
  const { pathname } = useLocation();
  const page = PAGE_LABELS[pathname] || { title: 'Próximamente', desc: 'Esta sección estará disponible muy pronto.' };

  return (
    <div className="lk-auth-page" style={{ flexDirection: 'column', gap: 0 }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 16 }}>KICK LAST</div>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 40, fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.1 }}>
          {page.title}
        </h1>
        <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          {page.desc}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em' }}>
            ← VOLVER
          </a>
          <a href="/register" style={{ background: '#1e2535', color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em', border: '1px solid #ffffff15' }}>
            + CREAR CUENTA
          </a>
        </div>
      </div>
    </div>
  );
}
