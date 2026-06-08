import { useState, useEffect } from 'react';
import { useNavigate, Link }   from 'react-router-dom';
import api                     from '../services/api';
import { authService }         from '../services/authService';
import Navbar                  from '../components/Navbar';
import Footer                  from '../components/Footer';

/* ─── estilos ─────────────────────────────────────────────────────────────── */
const PAGE_BG  = { background: '#08090f', minHeight: '100vh', color: '#fff' };
const CARD_DEF = { background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 14, padding: '28px 24px', cursor: 'pointer', transition: 'all 0.18s', position: 'relative' };
const CARD_SEL = { ...CARD_DEF, background: 'linear-gradient(145deg,#132213,#0f1c0f)', border: '1.5px solid #8dc63f', boxShadow: '0 0 24px rgba(141,198,63,0.15)' };
const CARD_POP = { ...CARD_DEF, background: 'linear-gradient(145deg,#131c26,#0f1620)', border: '1px solid #a78bfa40' };
const CARD_POP_SEL = { ...CARD_POP, border: '1.5px solid #a78bfa', boxShadow: '0 0 24px rgba(167,139,250,0.18)' };

const METODOS_CO = [
  { id: 'nequi',     icon: '💚', label: 'Nequi',         desc: 'Pago instantáneo' },
  { id: 'pse',       icon: '🏦', label: 'PSE',           desc: 'Débito bancario' },
  { id: 'tarjeta',   icon: '💳', label: 'Tarjeta',       desc: 'Visa / Mastercard / Amex' },
  { id: 'efectivo',  icon: '🏪', label: 'Efectivo',      desc: 'Baloto / Éxito / Olímpica' },
];

export default function Recargar() {
  const [paquetes,   setPaquetes]   = useState([]);
  const [sel,        setSel]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error,      setError]      = useState('');
  const navigate = useNavigate();

  const autenticado = authService.isAuthenticated();

  useEffect(() => {
    api.get('/pagos/paquetes')
      .then(r => setPaquetes(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPaquetes(PAQUETES_DEMO))
      .finally(() => setLoading(false));
  }, []);

  const pagar = async () => {
    if (!autenticado) { navigate('/login?redirect=/recargar'); return; }
    if (!sel) return;
    setError('');
    setProcesando(true);
    try {
      const r = await api.post('/pagos/iniciar', { paquete_id: sel.id });
      const { checkout_url } = r.data;
      // Redirigir al checkout de Wompi
      window.location.href = checkout_url;
    } catch (ex) {
      const m = ex.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Error al iniciar el pago. Inténtalo de nuevo.');
      setProcesando(false);
    }
  };

  const fmtCOP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  return (
    <div style={PAGE_BG}>
      <Navbar />

      {/* Hero section */}
      <div style={{ background: 'linear-gradient(180deg,#0d1421 0%,#08090f 100%)', borderBottom: '1px solid #1e2a3a', padding: '56px 20px 40px' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(141,198,63,0.12)', border: '1px solid rgba(141,198,63,0.35)', borderRadius: 20, padding: '4px 16px', fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 16 }}>
            ⚡ RECARGA EN LÍNEA · CRÉDITOS INMEDIATOS
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 42, fontWeight: 900, color: '#fff', margin: '0 0 14px', lineHeight: 1.1 }}>
            RECARGA TUS CRÉDITOS<br /><span style={{ color: '#8dc63f' }}>DESDE LA COMODIDAD DE TU CASA</span>
          </h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#6b7a8d', maxWidth: 560, margin: '0 auto 28px' }}>
            Usa Nequi, PSE o tarjeta. Pago seguro procesado por Wompi (Bancolombia).
            Los créditos se acreditan automáticamente al instante.
          </p>
          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', label: 'Pago cifrado SSL' },
              { icon: '⚡', label: 'Créditos al instante' },
              { icon: '🏦', label: 'PSE + Nequi + Tarjeta' },
              { icon: '🇨🇴', label: 'Procesado en Colombia' },
            ].map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
                <span>{b.icon}</span><span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '40px 20px 60px' }}>

        {/* Paso 1 — elegir paquete */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#6b7a8d', letterSpacing: '0.12em', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 900, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
            ELIGE TU PAQUETE
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ ...CARD_DEF, height: 170, opacity: 0.3, animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
              {paquetes.map(pkg => {
                const isSelected = sel?.id === pkg.id;
                const isPopular  = pkg.popular;
                const cardStyle  = isSelected
                  ? (isPopular ? CARD_POP_SEL : CARD_SEL)
                  : (isPopular ? CARD_POP : CARD_DEF);
                return (
                  <div key={pkg.id} onClick={() => { setSel(pkg); setError(''); }} style={cardStyle}>
                    {isPopular && (
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#a78bfa', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 800, padding: '2px 12px', borderRadius: 20, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                        ⭐ MÁS POPULAR
                      </div>
                    )}
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: isPopular ? '#a78bfa' : '#8dc63f', color: '#0a0d14', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>✓</div>
                    )}
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#6b7a8d', letterSpacing: '0.06em', marginBottom: 6 }}>{pkg.nombre}</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 44, fontWeight: 900, color: isPopular ? '#a78bfa' : '#8dc63f', lineHeight: 1, marginBottom: 2 }}>{pkg.creditos}</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginBottom: 12 }}>créditos</div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>
                      ${pkg.precio_usd} <span style={{ fontSize: 11, color: '#4a5568', fontWeight: 400 }}>USD</span>
                    </div>
                    {pkg.precio_cop && (
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginTop: 2 }}>
                        {fmtCOP(pkg.precio_cop)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Paso 2 — métodos de pago (informativo, el checkout lo maneja Wompi) */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#6b7a8d', letterSpacing: '0.12em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: sel ? '#8dc63f' : '#1e2535', color: sel ? '#0a0d14' : '#4a5568', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 900, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
            MÉTODOS DE PAGO DISPONIBLES
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {METODOS_CO.map(m => (
              <div key={m.id} style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#c0cad8', fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginTop: 10 }}>
            Seleccionarás el método dentro del checkout seguro de Wompi (Bancolombia).
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '12px 16px', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13, marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Resumen + botón pagar */}
        {sel && (
          <div style={{ background: 'linear-gradient(145deg,#0d1520,#0f1c14)', border: '1px solid #8dc63f30', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginBottom: 4 }}>Resumen de compra</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>
                  {sel.creditos} créditos — {sel.nombre}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: '#8dc63f', fontWeight: 700 }}>${sel.precio_usd} USD</span>
                  {sel.precio_cop && <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>{fmtCOP(sel.precio_cop)}</span>}
                </div>
              </div>
              <button
                onClick={pagar}
                disabled={procesando}
                style={{
                  background: procesando ? '#1e2535' : 'linear-gradient(135deg,#8dc63f,#6ea832)',
                  color: procesando ? '#6b7a8d' : '#0a0d14',
                  fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 900,
                  padding: '14px 36px', borderRadius: 8, border: 'none',
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  boxShadow: procesando ? 'none' : '0 4px 20px rgba(141,198,63,0.3)',
                }}
              >
                {procesando ? '⏳ REDIRIGIENDO...' : autenticado ? '🔒 PAGAR CON WOMPI' : '🔒 INICIAR SESIÓN PARA PAGAR'}
              </button>
            </div>
            {!autenticado && (
              <div style={{ marginTop: 12, fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
                <Link to="/login?redirect=/recargar" style={{ color: '#8dc63f' }}>Inicia sesión</Link> o <Link to="/register" style={{ color: '#8dc63f' }}>crea tu cuenta gratis</Link> para completar el pago.
              </div>
            )}
          </div>
        )}

        {/* Garantías */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginTop: 32 }}>
          {[
            { icon: '🔒', title: 'Pago 100% seguro', desc: 'Procesado por Wompi (Bancolombia). Tu información bancaria nunca llega a nuestros servidores.' },
            { icon: '⚡', title: 'Créditos al instante', desc: 'Una vez aprobado el pago, los créditos se acreditan automáticamente en segundos.' },
            { icon: '🔄', title: 'Sin vencimiento', desc: 'Los créditos no expiran. Úsalos en cualquier evento en cualquier momento.' },
            { icon: '🌍', title: 'Próximamente más países', desc: 'PayU, Stripe y Kushki. Soporte para Ecuador, USA, Europa y más de LatAm muy pronto.' },
          ].map(g => (
            <div key={g.title} style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{g.icon}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#c0cad8', fontWeight: 700, marginBottom: 6 }}>{g.title}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568', lineHeight: 1.6 }}>{g.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* Paquetes demo (si la API falla) */
const PAQUETES_DEMO = [
  { id: 'pack5',   creditos: 5,   precio_usd: 5,   precio_cop: 20500,  nombre: 'Starter',  popular: false },
  { id: 'pack10',  creditos: 10,  precio_usd: 10,  precio_cop: 41000,  nombre: 'Básico',   popular: false },
  { id: 'pack25',  creditos: 25,  precio_usd: 25,  precio_cop: 102500, nombre: 'Pro',      popular: true  },
  { id: 'pack50',  creditos: 50,  precio_usd: 50,  precio_cop: 205000, nombre: 'Plus',     popular: false },
  { id: 'pack100', creditos: 100, precio_usd: 100, precio_cop: 410000, nombre: 'Elite',    popular: false },
];
