import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import api                     from '../services/api';
import { authService }         from '../services/authService';
import Navbar                  from '../components/Navbar';
import Footer                  from '../components/Footer';
import { TASAS, SIMBOLOS, PAIS_MONEDA } from '../utils/currency';

/* ── Países disponibles con método de pago ──────────────────────────────── */
const PAISES = [
  { code: 'CO', flag: '🇨🇴', label: 'Colombia',       moneda: 'COP' },
  { code: 'MX', flag: '🇲🇽', label: 'México',          moneda: 'MXN' },
  { code: 'AR', flag: '🇦🇷', label: 'Argentina',        moneda: 'ARS' },
  { code: 'PE', flag: '🇵🇪', label: 'Perú',             moneda: 'PEN' },
  { code: 'CL', flag: '🇨🇱', label: 'Chile',            moneda: 'CLP' },
  { code: 'EC', flag: '🇪🇨', label: 'Ecuador',          moneda: 'USD' },
  { code: 'US', flag: '🇺🇸', label: 'Estados Unidos',  moneda: 'USD' },
  { code: 'ES', flag: '🇪🇸', label: 'España',           moneda: 'EUR' },
  { code: 'VE', flag: '🇻🇪', label: 'Venezuela',        moneda: 'USD' },
];

const PAQUETES_FALLBACK = [
  { id: 'pack5',   creditos: 5,   precio_usd: 5,   nombre: 'Starter', popular: false },
  { id: 'pack10',  creditos: 10,  precio_usd: 10,  nombre: 'Básico',  popular: false },
  { id: 'pack25',  creditos: 25,  precio_usd: 25,  nombre: 'Pro',     popular: true  },
  { id: 'pack50',  creditos: 50,  precio_usd: 50,  nombre: 'Plus',    popular: false },
  { id: 'pack100', creditos: 100, precio_usd: 100, nombre: 'Elite',   popular: false },
];

function precioLocal(usd, moneda) {
  const tasa    = TASAS[moneda]  ?? 1;
  const simbolo = SIMBOLOS[moneda] ?? '$';
  const valor   = Math.round(usd * tasa);
  return `${simbolo}${valor.toLocaleString('es-CO')}`;
}

export default function Recargar() {
  const navigate = useNavigate();

  /* ── Estado ─────────────────────────────────────────────────────────────── */
  const user     = authService.getUser?.() ?? null;
  const defPais  = user?.pais_codigo ?? 'CO';

  const [pais,        setPais]        = useState(defPais);
  const [paquetes,    setPaquetes]    = useState(PAQUETES_FALLBACK);
  const [selPaquete,  setSelPaquete]  = useState(null);
  const [loadingPaq,  setLoadingPaq]  = useState(true);
  const [paisAbierto, setPaisAbierto] = useState(false);
  const [metodos,     setMetodos]     = useState([]);

  const paisObj  = PAISES.find(p => p.code === pais) ?? PAISES[0];
  const moneda   = paisObj.moneda;

  /* ── Cargar paquetes + métodos del promotor al cambiar país ─────────────── */
  useEffect(() => {
    setLoadingPaq(true);
    Promise.allSettled([
      api.get(`/recargas-manual/paquetes?pais=${pais}`),
      api.get(`/recargas-manual/metodos?pais=${pais}`),
    ]).then(([rPaq, rMet]) => {
      if (rPaq.status === 'fulfilled') {
        setPaquetes(Array.isArray(rPaq.value.data) ? rPaq.value.data : PAQUETES_FALLBACK);
      } else {
        const m = TASAS[moneda] ?? 1;
        setPaquetes(PAQUETES_FALLBACK.map(p => ({
          ...p, moneda,
          precio_local:     Math.round(p.precio_usd * m),
          precio_local_fmt: `${SIMBOLOS[moneda] ?? '$'}${Math.round(p.precio_usd * m).toLocaleString('es-CO')}`,
        })));
      }
      setMetodos(rMet.status === 'fulfilled' && Array.isArray(rMet.value.data) ? rMet.value.data : []);
    }).finally(() => setLoadingPaq(false));
  }, [pais]);

  /* ── Continuar al checkout ──────────────────────────────────────────────── */
  const continuar = () => {
    if (!authService.isAuthenticated()) {
      navigate('/login?redirect=/recargar'); return;
    }
    if (!selPaquete) return;
    const p = paquetes.find(pk => pk.id === selPaquete);
    navigate(`/checkout?paquete=${selPaquete}&pais=${pais}&val=${p.precio_local}&cur=${moneda}&px=${p.creditos}`);
  };

  const saldo    = Number(user?.creditos ?? 0);
  const monedaFmt = precioLocal.bind(null);

  return (
    <div style={{ background: '#08090f', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(180deg,#0b1220 0%,#08090f 100%)', borderBottom: '1px solid #1e2a3a', padding: '48px 20px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(141,198,63,0.1)', border: '1px solid rgba(141,198,63,0.3)', borderRadius: 20, padding: '4px 16px', fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 14 }}>
            ⚡ RECARGA — ACREDITACIÓN INMEDIATA
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 38, fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.1 }}>
            COMPRA TUS CRÉDITOS <span style={{ color: '#8dc63f' }}>PX</span>
          </h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', maxWidth: 460, margin: '0 auto' }}>
            Elige tu paquete, selecciona tu país y continúa al pago seguro
          </p>
        </div>
      </div>

      <style>{`
        .rg-grid{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:28px;align-items:start;max-width:980px;margin:0 auto;padding:32px 20px 60px}
        @media(max-width:720px){
          .rg-grid{grid-template-columns:1fr;padding:16px 14px 60px;gap:18px}
          .rg-sidebar{order:-1;position:static!important}
          .rg-pais-rate{display:none}
        }
      `}</style>

      {/* ── Contenido ────────────────────────────────────────────────────── */}
      <div className="rg-grid">

        {/* ── Columna izquierda ──────────────────────────────────────────── */}
        <div>

          {/* País selector */}
          <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 10 }}>TU PAÍS DE JUEGO</div>

            <div style={{ position: 'relative' }}>
              <button onClick={() => setPaisAbierto(v => !v)}
                style={{ width: '100%', background: '#161e2e', border: `1px solid ${paisAbierto ? '#8dc63f60' : '#1e2a3a'}`, borderRadius: 8, padding: '12px 16px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{paisObj.flag}</span>
                  <span style={{ fontWeight: 600 }}>{paisObj.label}</span>
                  <span style={{ background: '#1e2a3a', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#8dc63f', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{moneda}</span>
                  <span className="rg-pais-rate" style={{ color: '#6b7a8d', fontSize: 12 }}>1 PX = {precioLocal(1, moneda)}</span>
                </span>
                <span style={{ color: '#6b7a8d', fontSize: 12 }}>{paisAbierto ? '▲' : '▼'}</span>
              </button>

              {paisAbierto && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  {PAISES.map(p => (
                    <button key={p.code} onClick={() => { setPais(p.code); setPaisAbierto(false); setSelPaquete(null); }}
                      style={{ width: '100%', background: p.code === pais ? 'rgba(141,198,63,0.08)' : 'transparent', border: 'none', padding: '11px 16px', color: p.code === pais ? '#8dc63f' : '#c0cad8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'Roboto, sans-serif', fontSize: 13, transition: 'background 0.15s' }}>
                      <span style={{ fontSize: 18 }}>{p.flag}</span>
                      <span style={{ flex: 1, textAlign: 'left' }}>{p.label}</span>
                      <span style={{ fontSize: 11, color: '#6b7a8d' }}>{p.moneda} · 1 PX = {precioLocal(1, p.moneda)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Paquetes */}
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 12 }}>
            ELIGE CUÁNTOS PX RECARGAR
          </div>

          {loadingPaq ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>Cargando paquetes...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
              {paquetes.map(p => {
                const sel = selPaquete === p.id;
                return (
                  <button key={p.id} onClick={() => setSelPaquete(p.id)}
                    style={{ background: sel ? 'linear-gradient(145deg,#132213,#0f1c0f)' : p.popular ? 'linear-gradient(145deg,#131c26,#0f1620)' : '#0f1420', border: `${sel ? 2 : 1}px solid ${sel ? '#8dc63f' : p.popular ? '#a78bfa40' : '#1e2a3a'}`, borderRadius: 12, padding: '18px 14px', cursor: 'pointer', textAlign: 'center', position: 'relative', transition: 'all 0.18s', boxShadow: sel ? '0 0 20px rgba(141,198,63,0.15)' : 'none' }}>

                    {p.popular && !sel && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#a78bfa', borderRadius: '10px 10px 0 0', padding: '3px 0', fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: '0.1em', color: '#0a0d14', fontWeight: 700 }}>POPULAR</div>
                    )}
                    {sel && (
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#8dc63f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✓</div>
                      </div>
                    )}

                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 42, fontWeight: 900, color: sel ? '#8dc63f' : p.popular ? '#a78bfa' : '#fff', lineHeight: 1, marginTop: p.popular ? 8 : 0 }}>{p.creditos}</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', marginBottom: 8 }}>PX</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: sel ? '#8dc63f' : '#fff' }}>
                      {p.precio_local_fmt ?? precioLocal(p.precio_usd, moneda)}
                    </div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 2 }}>
                      1 PX = {precioLocal(1, moneda)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Métodos aceptados — solo los configurados por el promotor */}
          {metodos.length > 0 && (
          <div style={{ marginTop: 24, padding: '14px 16px', background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 10 }}>MÉTODOS DE PAGO ACEPTADOS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {metodos.map(m => (
                <span key={m.id} style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 6, padding: '4px 10px', fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#c0cad8' }}>{m.metodo_nombre}</span>
              ))}
            </div>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', margin: '10px 0 0' }}>
              ✓ Pagos procesados con verificación manual. Acreditación en máximo 2-4 horas hábiles.
            </p>
          </div>
          )}
        </div>

        {/* ── Columna derecha: resumen ───────────────────────────────────── */}
        <div className="rg-sidebar" style={{ position: 'sticky', top: 20 }}>

          {/* Card resumen */}
          <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 12, padding: '20px 18px', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 14 }}>RESUMEN DE COMPRA</div>

            {/* Usuario */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#161e2e', borderRadius: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#8dc63f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#0a0d14' }}>
                  {(user.nombre ?? 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#fff', fontWeight: 600 }}>{user.nombre}</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>{Number(user.creditos ?? 0).toFixed(0)} PX disponibles</div>
                </div>
              </div>
            )}

            {selPaquete ? (() => {
              const p = paquetes.find(pk => pk.id === selPaquete);
              if (!p) return null;
              return (
                <div>
                  <div style={{ background: '#161e2e', border: '1px solid #8dc63f30', borderRadius: 8, padding: '12px 14px', marginBottom: 14, position: 'relative' }}>
                    <button onClick={() => setSelPaquete(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#6b7a8d', cursor: 'pointer', fontSize: 14 }}>✕</button>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 4 }}>RECARGA SELECCIONADA</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 36, fontWeight: 900, color: '#8dc63f', lineHeight: 1 }}>{p.creditos} <span style={{ fontSize: 16 }}>PX</span></div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8dc63f', marginTop: 4 }}>= {p.precio_local_fmt ?? precioLocal(p.precio_usd, moneda)} {moneda}</div>
                  </div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>País</span><span style={{ color: '#fff' }}>{paisObj.flag} {paisObj.label}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Moneda</span><span style={{ color: '#fff' }}>{moneda}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tasa</span><span style={{ color: '#fff' }}>1 PX = {precioLocal(1, moneda)}</span></div>
                  </div>
                  <div style={{ borderTop: '1px solid #1e2a3a', margin: '14px 0' }} />
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 4 }}>TOTAL A PAGAR</div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900, color: '#fff' }}>{p.precio_local_fmt ?? precioLocal(p.precio_usd, moneda)}</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginTop: 2 }}>{moneda} · {paisObj.label}</div>
                </div>
              );
            })() : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                Selecciona un paquete
              </div>
            )}
          </div>

          <button onClick={continuar} disabled={!selPaquete}
            style={{ width: '100%', background: selPaquete ? 'linear-gradient(135deg,#8dc63f,#6fa32e)' : '#1e2535', color: selPaquete ? '#0a0d14' : '#4a5568', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', border: 'none', borderRadius: 8, padding: '14px 0', cursor: selPaquete ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
            → CONTINUAR AL PAGO
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 14 }}>
            {['🔒 SSL', '🔐 SEGURO', '🌎 GLOBAL'].map(b => (
              <span key={b} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{b}</span>
            ))}
          </div>

          {/* PIN */}
          <div style={{ marginTop: 14, background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => navigate('/canjear-pin')}>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#8dc63f', marginBottom: 2 }}>¿TIENES UN CÓDIGO PIN?</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>Canjéalo en tu panel de recargas</div>
            </div>
            <span style={{ color: '#8dc63f', fontSize: 16 }}>→</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
