import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, { UPLOADS_BASE } from '../services/api';
import { authService }        from '../services/authService';
import Navbar          from '../components/Navbar';
import Footer          from '../components/Footer';

/* ── Métodos de pago con iconos ──────────────────────────────────────────── */
const ICONOS = {
  nequi:       { icon: '💚', color: '#00d4aa' },
  daviplata:   { icon: '🔴', color: '#e63946' },
  bancolombia: { icon: '🏦', color: '#f4b400' },
  transferencia: { icon: '🏦', color: '#4a90d9' },
  efectivo:    { icon: '💵', color: '#8dc63f'  },
  yape:        { icon: '💜', color: '#8b5cf6'  },
  pse:         { icon: '🏛️', color: '#4a90d9'  },
  spei:        { icon: '🏦', color: '#4a90d9'  },
  pix:         { icon: '🔵', color: '#00bcd4'  },
  zelle:       { icon: '💜', color: '#6c2fad'  },
  paypal:      { icon: '🅿️', color: '#003087'  },
  crypto:      { icon: '₿',  color: '#f59e0b'  },
  usdt:        { icon: '💲', color: '#26a17b'  },
  bizum:       { icon: '📱', color: '#0e3475'  },
};

function metodoIcono(clave) {
  const m = ICONOS[clave?.toLowerCase()] ?? { icon: '💳', color: '#8dc63f' };
  return m;
}

/* ── Paso indicator ──────────────────────────────────────────────────────── */
function Pasos({ actual }) {
  const pasos = ['Método', 'Instrucciones', 'Comprobante'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {pasos.map((p, i) => {
        const num  = i + 1;
        const done = num < actual;
        const curr = num === actual;
        return (
          <div key={p} style={{ display: 'flex', alignItems: 'center', flex: i < pasos.length - 1 ? '1 1 auto' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#8dc63f' : curr ? '#8dc63f' : '#1e2535', border: `2px solid ${done || curr ? '#8dc63f' : '#1e2a3a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, color: done || curr ? '#0a0d14' : '#4a5568', transition: 'all 0.3s' }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, color: curr ? '#8dc63f' : done ? '#8dc63f' : '#4a5568', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{p.toUpperCase()}</span>
            </div>
            {i < pasos.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? '#8dc63f' : '#1e2a3a', margin: '0 12px', transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Checkout() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();

  const paqueteId = params.get('paquete') ?? 'pack10';
  const pais      = (params.get('pais')  ?? 'CO').toUpperCase();
  const valLocal  = params.get('val')  ?? '0';
  const moneda    = params.get('cur')  ?? 'COP';
  const px        = params.get('px')   ?? '0';

  const [paso,        setPaso]        = useState(1);
  const [metodos,     setMetodos]     = useState([]);
  const [selMetodo,   setSelMetodo]   = useState(null);
  const [loading,     setLoading]     = useState(true);

  const [solicitudId, setSolicitudId] = useState(null);
  const [referencia,  setReferencia]  = useState('');
  const [notas,       setNotas]       = useState('');
  const [enviando,    setEnviando]    = useState(false);

  const [comprobante, setComprobante] = useState(null);  // File
  const [preview,     setPreview]     = useState(null);  // URL preview
  const [subiendo,    setSubiendo]    = useState(false);
  const [exito,       setExito]       = useState(false);
  const [error,       setError]       = useState('');
  const fileRef = useRef();

  /* ── Verificar sesión ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login?redirect=/recargar');
    }
  }, []);

  /* ── Cargar métodos disponibles ─────────────────────────────────────────── */
  useEffect(() => {
    api.get(`/recargas-manual/metodos?pais=${pais}`)
      .then(r => setMetodos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setMetodos([]))
      .finally(() => setLoading(false));
  }, [pais]);

  /* ── Paso 1: crear solicitud al seleccionar método ──────────────────────── */
  const elegirMetodo = async (metodo) => {
    setSelMetodo(metodo);
    setError('');
    setEnviando(true);
    try {
      const res = await api.post('/recargas-manual/solicitudes', {
        paquete_id:  paqueteId,
        metodo:      metodo.metodo_clave,
        pais_codigo: pais,
        cuenta_id:   metodo.id,
      });
      setSolicitudId(res.data.id);
      setPaso(2);
    } catch (e) {
      setError(e.response?.data?.message || 'Error al registrar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  /* ── Paso 2: confirmar referencia ───────────────────────────────────────── */
  const irAlComprobante = () => {
    setPaso(3);
  };

  /* ── Paso 3: subir comprobante ──────────────────────────────────────────── */
  const onArchivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setComprobante(file);
    setPreview(URL.createObjectURL(file));
  };

  const enviarComprobante = async () => {
    if (!comprobante || !solicitudId) return;
    setError('');
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('file', comprobante);
      await api.post(`/recargas-manual/solicitudes/${solicitudId}/comprobante`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Actualizar referencia si el usuario la escribió
      if (referencia.trim()) {
        await api.patch?.(`/recargas-manual/solicitudes/${solicitudId}`, {
          referencia_pago: referencia,
          notas_usuario:   notas,
        }).catch(() => {});
      }

      setExito(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Error al subir el comprobante');
    } finally {
      setSubiendo(false);
    }
  };

  /* ── Pantalla de éxito ──────────────────────────────────────────────────── */
  if (exito) return (
    <div style={{ background: '#08090f', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900, color: '#8dc63f', marginBottom: 12 }}>¡Comprobante enviado!</h2>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', lineHeight: 1.7, marginBottom: 24 }}>
          Tu solicitud de recarga está en revisión. Recibirás una notificación cuando tus <strong style={{ color: '#fff' }}>{px} PX</strong> sean acreditados.<br />
          Tiempo estimado: <strong style={{ color: '#8dc63f' }}>2-4 horas hábiles</strong>.
        </p>
        <button onClick={() => navigate('/hub')}
          style={{ background: 'linear-gradient(135deg,#8dc63f,#6fa32e)', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', border: 'none', borderRadius: 8, padding: '13px 32px', cursor: 'pointer' }}>
          IR AL HUB
        </button>
      </div>
    </div>
  );

  /* ── Layout principal ───────────────────────────────────────────────────── */
  return (
    <div style={{ background: '#08090f', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#0b1220', borderBottom: '1px solid #1e2a3a', padding: '14px 20px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/recargar')} style={{ background: 'none', border: 'none', color: '#6b7a8d', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Volver
          </button>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>KICKLAST · CHECKOUT SEGURO</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#4a5568', background: '#1e2535', borderRadius: 4, padding: '4px 10px' }}>🔒 SSL 256-BIT</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 60px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: 28, alignItems: 'start' }}>

        {/* ── Panel central ──────────────────────────────────────────────── */}
        <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 14, padding: '28px 24px' }}>

          {/* Barra de progreso */}
          <Pasos actual={paso} />

          {/* ── PASO 1: ELEGIR MÉTODO ── */}
          {paso === 1 && (
            <>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Selecciona tu método de pago
              </h3>
              <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', marginBottom: 20 }}>
                Métodos disponibles para <strong style={{ color: '#c0cad8' }}>{pais}</strong>
              </p>

              {loading && (
                <div style={{ textAlign: 'center', padding: 40, color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                  Cargando métodos...
                </div>
              )}

              {!loading && metodos.length === 0 && (
                <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 8, padding: '20px 16px', textAlign: 'center', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                  No hay métodos configurados para este país aún.<br />
                  <span style={{ color: '#4a5568', fontSize: 12 }}>Contacta al soporte por WhatsApp para coordinar tu pago.</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {metodos.map(m => {
                  const ic = metodoIcono(m.metodo_clave);
                  return (
                    <button key={m.id} onClick={() => elegirMetodo(m)} disabled={enviando}
                      style={{ background: '#161e2e', border: `1px solid #1e2a3a`, borderRadius: 10, padding: '16px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', opacity: enviando ? 0.6 : 1 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = ic.color + '80'; e.currentTarget.style.background = '#1a2435'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2a3a'; e.currentTarget.style.background = '#161e2e'; }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{ic.icon}</div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{m.metodo_nombre}</div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>Transferencia · hasta 4h</div>
                      {m.numero_cuenta && (
                        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: ic.color, marginTop: 6 }}>{m.numero_cuenta}</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {error && <div style={{ marginTop: 16, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13, background: '#1a0808', border: '1px solid #f8717140', borderRadius: 6, padding: '10px 14px' }}>{error}</div>}
            </>
          )}

          {/* ── PASO 2: INSTRUCCIONES ── */}
          {paso === 2 && selMetodo && (() => {
            const ic = metodoIcono(selMetodo.metodo_clave);
            return (
              <>
                <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  Instrucciones de pago
                </h3>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', marginBottom: 20 }}>
                  Realiza la transferencia exacta y guarda tu comprobante
                </p>

                {/* Datos de pago */}
                <div style={{ background: '#161e2e', border: `1px solid ${ic.color}30`, borderRadius: 10, padding: '18px 16px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>{ic.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: ic.color }}>{selMetodo.metodo_nombre}</div>
                      {selMetodo.banco && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>{selMetodo.banco}</div>}
                    </div>
                  </div>

                  {selMetodo.nombre_titular && (
                    <CampoInfo label="Titular" value={selMetodo.nombre_titular} />
                  )}
                  {selMetodo.numero_cuenta && (
                    <CampoInfo label="Número / Celular" value={selMetodo.numero_cuenta} copiable />
                  )}
                  <CampoInfo label="Monto exacto" value={`${Number(valLocal).toLocaleString('es-CO')} ${moneda}`} highlight copiable />

                  {selMetodo.instrucciones && (
                    <div style={{ marginTop: 12, background: '#0f1420', borderRadius: 6, padding: '10px 12px' }}>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginBottom: 4 }}>Instrucciones adicionales</div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#c0cad8', lineHeight: 1.6 }}>{selMetodo.instrucciones}</div>
                    </div>
                  )}

                  {selMetodo.qr_url && (
                    <div style={{ marginTop: 14, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 10 }}>QR DE PAGO</div>
                      {/* Fondo blanco obligatorio — los lectores QR necesitan contraste alto */}
                      <div style={{ display: 'inline-block', background: '#fff', padding: 12, borderRadius: 8 }}>
                        <img
                          src={`${UPLOADS_BASE}${selMetodo.qr_url}`}
                          alt="QR pago"
                          style={{ display: 'block', width: 220, height: 220, objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginTop: 8 }}>
                        Escanea con la cámara de tu celular
                      </div>
                    </div>
                  )}
                </div>

                {/* Referencia opcional */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginBottom: 6 }}>
                    Número de referencia del pago <span style={{ color: '#4a5568' }}>(opcional)</span>
                  </label>
                  <input value={referencia} onChange={e => setReferencia(e.target.value)}
                    placeholder="Ej: 123456789" maxLength={60}
                    style={{ width: '100%', background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 6, padding: '10px 12px', color: '#fff', fontFamily: 'Roboto, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ background: '#0f1a0f', border: '1px solid #8dc63f20', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
                  {['Envía el monto exacto indicado, sin redondear', 'Incluye tu código de jugador en el concepto', 'Guarda siempre el comprobante de tu transacción'].map(tip => (
                    <div key={tip} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8dc63f', display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                      <span style={{ marginTop: 2 }}>✓</span><span>{tip}</span>
                    </div>
                  ))}
                </div>

                <button onClick={irAlComprobante}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#8dc63f,#6fa32e)', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', border: 'none', borderRadius: 8, padding: '13px 0', cursor: 'pointer' }}>
                  → YA PAGUÉ — SUBIR COMPROBANTE
                </button>
              </>
            );
          })()}

          {/* ── PASO 3: COMPROBANTE ── */}
          {paso === 3 && (
            <>
              <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                Sube tu comprobante de pago
              </h3>
              <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', marginBottom: 24 }}>
                Adjunta la captura o foto del pago para que podamos verificarlo
              </p>

              {/* Drop area */}
              <div onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${comprobante ? '#8dc63f' : '#1e2a3a'}`, borderRadius: 10, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: comprobante ? 'rgba(141,198,63,0.04)' : '#161e2e', transition: 'all 0.2s', marginBottom: 16 }}>
                {preview ? (
                  <div>
                    <img src={preview} alt="Comprobante" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, marginBottom: 10 }} />
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8dc63f' }}>✓ {comprobante.name}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#c0cad8', marginBottom: 4 }}>Haz clic para seleccionar tu comprobante</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>JPG, PNG, PDF · Máx. 8 MB</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={onArchivo} style={{ display: 'none' }} />

              {/* Notas */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginBottom: 6 }}>
                  Notas adicionales <span style={{ color: '#4a5568' }}>(opcional)</span>
                </label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2} maxLength={200}
                  placeholder="Ej: Pagué desde cuenta personal, saldo cargado con tarjeta..."
                  style={{ width: '100%', background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 6, padding: '10px 12px', color: '#fff', fontFamily: 'Roboto, sans-serif', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              {error && <div style={{ marginBottom: 14, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13, background: '#1a0808', border: '1px solid #f8717140', borderRadius: 6, padding: '10px 14px' }}>{error}</div>}

              <button onClick={enviarComprobante} disabled={!comprobante || subiendo}
                style={{ width: '100%', background: comprobante ? 'linear-gradient(135deg,#8dc63f,#6fa32e)' : '#1e2535', color: comprobante ? '#0a0d14' : '#4a5568', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', border: 'none', borderRadius: 8, padding: '13px 0', cursor: comprobante ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                {subiendo ? 'Enviando...' : '✓ CONFIRMAR Y ENVIAR'}
              </button>
            </>
          )}
        </div>

        {/* ── Sidebar resumen ───────────────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 12, padding: '18px 16px', marginBottom: 14 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 14 }}>CONFIRMACIÓN DE COMPRA</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{px}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#8dc63f' }}>CRÉDITOS PX</div>
            </div>

            <div style={{ borderTop: '1px solid #1e2a3a', margin: '14px 0' }} />

            {[
              { l: 'País', v: pais },
              { l: 'Moneda', v: moneda },
              { l: 'Método', v: selMetodo?.metodo_nombre ?? '—' },
            ].map(({ l, v }) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Roboto, sans-serif', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#6b7a8d' }}>{l}</span>
                <span style={{ color: '#fff' }}>{v}</span>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #1e2a3a', margin: '14px 0' }} />
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 4 }}>TOTAL A PAGAR</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 900, color: '#fff' }}>
              {Number(valLocal).toLocaleString('es-CO')}
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginTop: 2 }}>{moneda} · {pais}</div>
          </div>

          {/* Tips */}
          <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 10 }}>TIPO DE PAGO</div>
            {[
              'Guarde siempre el comprobante de su transacción',
              'Acreditación en máximo 2-4 horas hábiles',
              'Envíe el monto exacto indicado, sin redondear',
              'Incluya su código de jugador en el concepto',
            ].map(t => (
              <div key={t} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', display: 'flex', gap: 8, marginBottom: 6, lineHeight: 1.5 }}>
                <span style={{ color: '#8dc63f', flexShrink: 0 }}>✓</span><span>{t}</span>
              </div>
            ))}

            <div style={{ marginTop: 12, borderTop: '1px solid #1e2a3a', paddingTop: 12 }}>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginBottom: 6 }}>¿TIENES DUDAS?</div>
              <a href="https://wa.me/" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#8dc63f', textDecoration: 'none', fontWeight: 700 }}>Soporte 24/7 por WhatsApp →</a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ── Campo de información copiable ───────────────────────────────────────── */
function CampoInfo({ label, value, copiable, highlight }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    if (!copiable) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: highlight ? '#8dc63f' : '#fff', letterSpacing: '0.04em' }}>{value}</span>
        {copiable && (
          <button onClick={copiar}
            style={{ background: copiado ? '#8dc63f20' : '#0f1420', border: `1px solid ${copiado ? '#8dc63f' : '#1e2a3a'}`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: 10, color: copiado ? '#8dc63f' : '#6b7a8d', transition: 'all 0.2s' }}>
            {copiado ? '✓' : '📋'}
          </button>
        )}
      </div>
    </div>
  );
}
