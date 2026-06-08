export default function NotFound() {
  return (
    <div className="lk-auth-page">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 96, fontWeight: 700, color: '#8dc63f', lineHeight: 1 }}>404</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, color: '#fff', margin: '12px 0 8px' }}>Página no encontrada</div>
        <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginBottom: 28 }}>La página que buscas no existe o fue movida.</div>
        <a href="/" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em' }}>
          ← VOLVER AL INICIO
        </a>
      </div>
    </div>
  );
}
