import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link }        from 'react-router-dom';
import api                              from '../services/api';
import { authService }                  from '../services/authService';
import Navbar                           from '../components/Navbar';
import Footer                           from '../components/Footer';

/* Wompi redirige a:
   /pago/retorno?ref={pagoId}&id={wompi_tx_id}&...
   Consultamos nuestro backend para obtener el estado real (el webhook puede
   llegar antes o después del redirect).
*/

const ESTADOS = {
  APROBADO:   { icon: '✅', color: '#8dc63f', titulo: '¡Pago aprobado!',    sub: 'Tus créditos ya están en tu cuenta. ¡A jugar!' },
  PENDIENTE:  { icon: '⏳', color: '#f59e0b', titulo: 'Pago en proceso',     sub: 'El banco está confirmando tu pago. Recibirás una notificación cuando esté listo.' },
  RECHAZADO:  { icon: '❌', color: '#f87171', titulo: 'Pago rechazado',       sub: 'El pago no pudo procesarse. Intenta con otro método de pago.' },
  ERROR:      { icon: '⚠️', color: '#f87171', titulo: 'Error en el pago',    sub: 'Ocurrió un error técnico. Contacta soporte si ya se descontó el dinero.' },
  CADUCADO:   { icon: '🕐', color: '#6b7a8d', titulo: 'Pago caducado',        sub: 'La sesión de pago expiró. Inicia una nueva recarga.' },
  CARGANDO:   { icon: '🔄', color: '#a78bfa', titulo: 'Verificando pago...',  sub: 'Consultando el estado de tu transacción.' },
};

export default function PagoRetorno() {
  const [searchParams]  = useSearchParams();
  const [estado, setEstado]   = useState('CARGANDO');
  const [pago,   setPago]     = useState(null);
  const [intentos, setIntentos] = useState(0);
  const pollRef = useRef(null);

  const ref = searchParams.get('ref');   // nuestro pagoId

  useEffect(() => {
    if (!ref || !authService.isAuthenticated()) { setEstado('ERROR'); return; }
    verificar();
    // Polling hasta 30 seg para capturar webhook tardío
    pollRef.current = setInterval(() => {
      setIntentos(n => n + 1);
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [ref]);

  // Re-consultar cada vez que sube el contador de intentos (máx 10 = 30 s)
  useEffect(() => {
    if (intentos > 0 && intentos <= 10) verificar();
    if (intentos > 10) clearInterval(pollRef.current);
  }, [intentos]);

  const verificar = async () => {
    try {
      const r = await api.get(`/pagos/estado/${ref}`);
      const d = r.data;
      setPago(d);
      setEstado(d.estado || 'PENDIENTE');
      // Si ya está resuelto, parar el polling
      if (['APROBADO', 'RECHAZADO', 'ERROR', 'CADUCADO'].includes(d.estado)) {
        clearInterval(pollRef.current);
      }
    } catch {
      setEstado('ERROR');
      clearInterval(pollRef.current);
    }
  };

  const info = ESTADOS[estado] || ESTADOS.CARGANDO;

  const fmtCOP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ background: '#08090f', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ background: '#0f1420', border: `1px solid ${info.color}40`, borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          {/* Icono */}
          <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1,
            animation: estado === 'CARGANDO' ? 'spin 1.5s linear infinite' : 'none' }}>
            {info.icon}
          </div>

          {/* Título */}
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900, color: info.color, margin: '0 0 10px' }}>
            {info.titulo}
          </h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', margin: '0 0 28px', lineHeight: 1.7 }}>
            {info.sub}
          </p>

          {/* Detalles del pago */}
          {pago && estado !== 'CARGANDO' && (
            <div style={{ background: '#0a0e1a', borderRadius: 10, padding: '18px 20px', marginBottom: 28, textAlign: 'left' }}>
              {[
                { label: 'Paquete',   val: pago.paquete_id?.replace('pack', '') + ' créditos' },
                { label: 'Monto USD', val: `$${pago.monto_usd} USD` },
                pago.moneda === 'COP' && { label: 'Monto COP', val: fmtCOP(pago.monto_local) },
                { label: 'Créditos',  val: `+${pago.creditos} cr`, color: '#8dc63f' },
                { label: 'Gateway',   val: pago.gateway },
                { label: 'Fecha',     val: pago.created_at ? new Date(pago.created_at).toLocaleString('es-CO') : '—' },
              ].filter(Boolean).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1e2a3a' }}>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>{row.label}</span>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: row.color || '#c0cad8' }}>{row.val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Indicador de polling */}
          {estado === 'PENDIENTE' && intentos <= 10 && (
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568', marginBottom: 20 }}>
              Verificando automáticamente... ({intentos}/10)
            </div>
          )}

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {estado === 'APROBADO' && (
              <Link to="/dashboard" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.06em' }}>
                IR AL DASHBOARD
              </Link>
            )}
            {['RECHAZADO', 'ERROR', 'CADUCADO'].includes(estado) && (
              <Link to="/recargar" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.06em' }}>
                INTENTAR DE NUEVO
              </Link>
            )}
            <Link to="/dashboard" style={{ background: 'transparent', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 13, padding: '12px 20px', borderRadius: 8, textDecoration: 'none', border: '1px solid #1e2a3a' }}>
              VOLVER AL INICIO
            </Link>
          </div>
        </div>

        {/* Nota de soporte */}
        <div style={{ marginTop: 20, textAlign: 'center', fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568' }}>
          ¿Problemas con tu pago? <Link to="/contacto" style={{ color: '#8dc63f' }}>Contacta soporte</Link> con tu referencia: <code style={{ color: '#a78bfa', fontSize: 10 }}>{ref}</code>
        </div>
      </div>
      <Footer />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
