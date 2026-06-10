import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const NAV_LINKS = [
  { href: '/', label: 'Predicciones' },
  { href: '/mundial', label: 'Mundial' },
  { href: '/en-vivo', label: 'En Vivo' },
  { href: '/resultados', label: 'Resultados' },
  { href: '/fixture', label: 'Fixture' },
  { href: '/leaderboard', label: 'Ranking' },
  { href: '/champions', label: 'Champions' },
  { href: '/premio', label: 'Premio' },
];

const USER_MENU = [
  { href: '/dashboard', label: '👤 Mi Perfil' },
  { href: '/mis-predicciones', label: '⚽ Mis Predicciones' },
  { href: '/mis-apuestas', label: '🎰 Mis Apuestas' },
  { href: '/movimientos', label: '📊 Movimientos' },
  { href: '/retiros', label: '💸 Retiros' },
  { href: '/recargar', label: '⚡ Recargar' },
  { href: '/canjear-pin', label: '🔑 Canjear PIN' },
];

export default function Navbar({ jackpotVal = '$200.000' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState('');
  const dropRef = useRef(null);
  const bellRef = useRef(null);
  const [notifs, setNotifs] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.nombre || payload.email?.split('@')[0] || '');
      } catch {}
      api.get('/notificaciones').then(r => {
        const d = r.data;
        setNotifs(Array.isArray(d) ? d : d?.data || []);
      }).catch(() => {});
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const logout = () => { localStorage.removeItem('token'); window.location.href = '/'; };
  const isActive = (href) => href === '/' ? currentPath === '/' : currentPath.startsWith(href);

  return (
    <>
      <nav className="lk-nav">
        <div className="lk-nav-brand">
          <a href="/"><img loading="eager" decoding="async" src="/img/kicklast02.webp" alt="Kick Last" className="lk-nav-logo-img" /></a>
        </div>

        <div className="lk-nav-menu">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href}
              className={`lk-nav-link${isActive(l.href) ? ' active' : ''}`}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="lk-nav-right">
          <div className="lk-jackpot">
            <span className="lk-jackpot-label">ACUMULADO</span>
            <a href="/premio" style={{ textDecoration: 'none' }}>
              <span className="lk-jackpot-val" style={{ cursor: 'pointer' }}>{jackpotVal}</span>
            </a>
          </div>

          {isAuth && (
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button onClick={() => setBellOpen(o => !o)}
                style={{ background: 'none', border: 'none', color: '#c0cad8', fontSize: 18, cursor: 'pointer', position: 'relative', padding: '6px 8px' }}>
                🔔
                {notifs.filter(n => !n.leida).length > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {notifs.filter(n => !n.leida).length}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 8, width: 300, maxHeight: 360, overflowY: 'auto', zIndex: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e2a3a', fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#8dc63f', letterSpacing: '0.1em' }}>NOTIFICACIONES</div>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '20px 16px', textAlign: 'center', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>Sin notificaciones</div>
                  ) : notifs.slice(0, 20).map(n => (
                    <div key={n.id}
                      onClick={() => {
                        if (!n.leida) {
                          api.patch(`/notificaciones/${n.id}/leida`).catch(() => {});
                          setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, leida: true } : x));
                        }
                      }}
                      style={{ padding: '10px 16px', borderBottom: '1px solid #111827', cursor: 'pointer', background: n.leida ? 'transparent' : 'rgba(141,198,63,0.04)' }}>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: n.leida ? '#6b7a8d' : '#c0cad8', marginBottom: 2, fontWeight: n.leida ? 400 : 600 }}>
                        {n.titulo || n.message || ''}
                      </div>
                      {n.mensaje && (
                        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: n.leida ? '#4a5568' : '#8b9bb4', marginBottom: 3 }}>
                          {n.mensaje}
                        </div>
                      )}
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>
                        {(n.fecha_creacion || n.creado_en)
                          ? new Date(n.fecha_creacion || n.creado_en).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAuth ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropOpen(o => !o)}
                style={{ background: '#1e2535', border: '1px solid #8dc63f40', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {userName ? userName.toUpperCase() : 'MI CUENTA'} <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
              </button>
              {dropOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 8, minWidth: 200, zIndex: 500, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                  {USER_MENU.map(l => (
                    <a key={l.href} href={l.href} style={{ display: 'block', padding: '11px 18px', color: isActive(l.href) ? '#8dc63f' : '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none', borderBottom: '1px solid #1e2a3a' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1e2535'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {l.label}
                    </a>
                  ))}
                  <button onClick={logout} style={{ width: '100%', background: 'none', border: 'none', padding: '11px 18px', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1e2535'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/login"><button className="lk-btn-login">Acceder</button></a>
              <a href="/register"><button className="lk-btn-register">+ Crear cuenta</button></a>
            </>
          )}

          <button className="lk-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menú">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lk-mobile-menu" onClick={() => setMenuOpen(false)}>
          <div className="lk-mobile-menu-inner" onClick={e => e.stopPropagation()}>
            <div className="lk-mobile-menu-header">
              <img loading="eager" decoding="async" src="/img/kicklast02.webp" alt="Kick Last" style={{ height: 28 }} />
              <button className="lk-mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div className="lk-jackpot" style={{ margin: '12px 16px', justifyContent: 'center' }}>
              <span className="lk-jackpot-label">ACUMULADO</span>
              <a href="/premio" style={{ textDecoration: 'none' }}><span className="lk-jackpot-val">{jackpotVal}</span></a>
            </div>

            <div style={{ padding: '8px 0 4px', borderBottom: '1px solid #1e2a3a' }}>
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href}
                  className="lk-mobile-link"
                  style={{ color: isActive(l.href) ? '#8dc63f' : undefined, fontWeight: isActive(l.href) ? 700 : undefined }}>
                  {l.label}
                </a>
              ))}
            </div>

            {isAuth && (
              <div style={{ padding: '8px 0 4px' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.1em', padding: '8px 20px 4px' }}>MI CUENTA</div>
                {USER_MENU.map(l => (
                  <a key={l.href} href={l.href} className="lk-mobile-link"
                    style={{ color: isActive(l.href) ? '#8dc63f' : '#c0cad8', fontSize: 13 }}>
                    {l.label}
                  </a>
                ))}
              </div>
            )}

            <div className="lk-mobile-auth">
              {isAuth ? (
                <button className="lk-btn-login" style={{ width: '100%' }} onClick={logout}>🚪 Cerrar sesión</button>
              ) : (
                <>
                  <a href="/login" style={{ flex: 1 }}><button className="lk-btn-login" style={{ width: '100%' }}>Acceder</button></a>
                  <a href="/register" style={{ flex: 1 }}><button className="lk-btn-register" style={{ width: '100%' }}>+ Crear cuenta</button></a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
