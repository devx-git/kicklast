const TEAM_LOGOS = [
  { src: '/img/realmadrid1.webp', alt: 'Real Madrid' }, { src: '/img/barcelona1.webp', alt: 'Barcelona' },
  { src: '/img/mancity1.webp', alt: 'Man City' }, { src: '/img/psg7.webp', alt: 'PSG' },
  { src: '/img/bayern1.webp', alt: 'Bayern' }, { src: '/img/liverpool1.webp', alt: 'Liverpool' },
  { src: '/img/inter1.webp', alt: 'Inter Milan' }, { src: '/img/atletico1.webp', alt: 'Atlético' },
  { src: '/img/boca1.webp', alt: 'Boca Juniors' }, { src: '/img/river1.webp', alt: 'River Plate' },
  { src: '/img/flamengo1.webp', alt: 'Flamengo' }, { src: '/img/america1.webp', alt: 'América' },
  { src: '/img/fifa1.webp', alt: 'FIFA World Cup' }, { src: '/img/wefa1.webp', alt: 'UEFA Champions' },
  { src: '/img/premier1.webp', alt: 'Premier League' }, { src: '/img/laliga1.webp', alt: 'La Liga' },
  { src: '/img/seriea1.webp', alt: 'Serie A' }, { src: '/img/bundesliga1.webp', alt: 'Bundesliga' },
  { src: '/img/ligue-1.0.webp', alt: 'Ligue 1' }, { src: '/img/mls1.webp', alt: 'MLS' },
];
const LOGOS_DOUBLED = [...TEAM_LOGOS, ...TEAM_LOGOS];

export default function Footer() {
  return (
    <footer className="lk-footer">
      <div className="lk-footer-statement">
        <div className="lk-stmt-inner">
          <div className="lk-stmt-left">
            <div className="lk-stmt-accent-line" />
            <div className="lk-stmt-text-wrap">
              <div className="lk-stmt-eyebrow">⚽ El juego dentro del juego</div>
              <div className="lk-stmt-title">Cada <span className="lk-accent">predicción</span> cuenta. Cada <span className="lk-accent">vida</span> <span className="lk-dim">importa.</span></div>
            </div>
          </div>
          <div className="lk-stmt-right">
            <p className="lk-stmt-sub">No es suerte. Es intuición y pasión por el fútbol convertidos en un juego.</p>
            <a className="lk-stmt-btn" href="/register">Predecir ahora ›</a>
          </div>
        </div>
      </div>

      <div className="lk-logos-section">
        <div className="lk-logos-track">
          {LOGOS_DOUBLED.map((l, i) => (
            <div key={i} className="lk-logo-item" title={l.alt}>
              <img loading="lazy" decoding="async" src={l.src} alt={l.alt} className="lk-logo-img-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="lk-footer-container">
        <div className="lk-footer-brand">
          <img loading="eager" decoding="async" src="/img/kicklast02.webp" alt="Kick Last" className="lk-brand-logo" />
          <div className="lk-brand-tagline">El juego dentro del juego</div>
          <p className="lk-brand-desc">Sistema de predicciones futbolísticas para el Mundial 2026. Donde la intuición vale más que la suerte.</p>
          <div className="lk-live-pill">
            <div className="lk-live-dot" />
            <span className="lk-live-txt">Sistema activo · Mundial 2026</span>
          </div>
          <div className="lk-socials">
            <a href="https://instagram.com" className="lk-social-btn" aria-label="Instagram" target="_blank" rel="noopener noreferrer">IG</a>
            <a href="https://tiktok.com" className="lk-social-btn" aria-label="TikTok" target="_blank" rel="noopener noreferrer">TT</a>
            <a href="https://youtube.com" className="lk-social-btn" aria-label="YouTube" target="_blank" rel="noopener noreferrer">YT</a>
            <a href="https://x.com" className="lk-social-btn" aria-label="Twitter/X" target="_blank" rel="noopener noreferrer">𝕏</a>
          </div>
        </div>

        <div>
          <h4 className="lk-col-title">Navegación</h4>
          <a className="lk-footer-link" href="/registro-promotor" style={{ color: '#8dc63f', fontWeight: 700 }}>🏆 Ser Promotor</a>
          <a className="lk-footer-link" href="/fixture">Fixture Mundial</a>
          <a className="lk-footer-link" href="/ranking">Trono de Privilegio<span className="lk-link-badge">VIP</span></a>
          <a className="lk-footer-link" href="/jackpot">Premio Acumulado</a>
          <a className="lk-footer-link" href="/recargar">Recargar Vidas</a>
          <a className="lk-footer-link" href="/reglas">Reglamento</a>
          <a className="lk-footer-link" href="/ayuda">Ayuda</a>
        </div>

        <div>
          <h4 className="lk-col-title">Legal</h4>
          <a className="lk-footer-link" href="/terminos">Términos y condiciones</a>
          <a className="lk-footer-link" href="/privacidad">Política de privacidad</a>
          <a className="lk-footer-link" href="/juego-responsable">Juego responsable</a>
          <a className="lk-footer-link" href="/contacto">Contacto</a>
          <a className="lk-footer-link" href="/patrocinadores">Patrocinadores</a>
        </div>

        <div>
          <h4 className="lk-col-title">Alertas del Decano</h4>
          <p className="lk-newsletter-desc">Recibe coordenadas tácticas antes de cada partido directamente en tu correo.</p>
          <form className="lk-newsletter-form" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="tu@correo.com" required autoComplete="off" aria-label="Correo electrónico" />
            <button type="submit">Unirse al equipo</button>
          </form>
          <p className="lk-newsletter-note">Sin spam. Solo lo importante. Date de baja cuando quieras.</p>
        </div>
      </div>

      <div className="lk-footer-divider" />
      <div className="lk-responsibility-bar">
        <div className="lk-resp-inner">
          <span className="lk-resp-badge">+18</span>
          <span className="lk-resp-text">Servicio exclusivo para mayores de 18 años · Juega con responsabilidad</span>
        </div>
      </div>
      <div className="lk-footer-bottom">
        <div className="lk-bottom-brand">
          <span className="lk-bottom-logo-txt">Kick <span>Last</span></span>
          <span className="lk-bottom-year">© 2026 · Todos los derechos reservados</span>
        </div>
        <div className="lk-bottom-links">
          <a className="lk-bottom-link" href="/terminos">Términos</a>
          <div className="lk-bottom-sep" />
          <a className="lk-bottom-link" href="/privacidad">Privacidad</a>
          <div className="lk-bottom-sep" />
          <a className="lk-bottom-link" href="/contacto">Contacto</a>
          <div className="lk-bottom-sep" />
          <span className="lk-bottom-link">Colombia · Mundial 2026</span>
        </div>
      </div>
    </footer>
  );
}
