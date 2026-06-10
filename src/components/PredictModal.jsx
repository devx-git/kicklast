import { useState, useEffect } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';
import { creditosAMonedaLocal, creditosAVidas } from '../utils/currency';
import GuruManualQuiz from './GuruManualQuiz';

const S = {
  overlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal:    { background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 12, width: '100%', maxWidth: 720, maxHeight: '92vh', overflow: 'auto', position: 'relative' },
  header:   { padding: '18px 24px', borderBottom: '1px solid #1e2a3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  body:     { padding: '20px 24px' },
  tab:      (a) => ({ background: a ? '#8dc63f' : '#1e2535', color: a ? '#0a0d14' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }),
  btn:      (off) => ({ background: off ? '#1e2535' : '#8dc63f', color: off ? '#4a5568' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '14px 24px', borderRadius: 8, border: `1px solid ${off ? '#2a3545' : 'transparent'}`, cursor: off ? 'not-allowed' : 'pointer', letterSpacing: '0.05em', width: '100%', opacity: off ? 0.7 : 1 }),
  optCard:  (sel) => ({ background: sel ? 'rgba(141,198,63,0.1)' : '#161e2e', border: `1px solid ${sel ? '#8dc63f' : '#1e2a3a'}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', transition: 'all 0.15s' }),
  label:    { fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 10, display: 'block' },
  msgOk:    { background: 'rgba(141,198,63,0.1)', border: '1px solid rgba(141,198,63,0.3)', borderRadius: 8, padding: '12px 16px', color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13, marginBottom: 16 },
  msgErr:   { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13, marginBottom: 16 },
  msgWarn:  { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '12px 16px', color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 13, marginBottom: 16 },
};

/* Estado chip del partido */
const ESTADO_CHIP = {
  PENDIENTE:   { label: 'Pendiente',  bg: '#1e3a5f', color: '#60a5fa' },
  EN_CURSO:    { label: 'En vivo',    bg: '#3f1515', color: '#f87171' },
  FINALIZADO:  { label: 'Finalizado', bg: '#1a2e1a', color: '#8dc63f' },
  SUSPENDIDO:  { label: 'Suspendido', bg: '#3f2a00', color: '#f59e0b' },
};

function formatFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export default function PredictModal({ ev, seleccion, onClose, partidoId: partidoIdProp = null, partidoCuotas = null, partidoNombre = null }) {
  const hasOdds = !!(ev.cuota_local || ev.cuota_empate || ev.cuota_visitante);
  // seleccion puede ser: 'local'|'empate'|'visitante' (pre-selecciona equipo),
  // 'cuota' (abre en modo cuota sin pre-selección), o null (modo gurú)
  const [mode, setMode] = useState(hasOdds && seleccion ? 'cuota' : 'guru');

  // User balance
  const [saldo, setSaldo]   = useState(null);
  const [moneda, setMoneda] = useState('USD');

  // Guru data from backend
  const [partidos, setPartidos]             = useState([]);   // all partidos of the event
  const [partidoSel, setPartidoSel]         = useState(null); // selected partido object
  const [predicciones, setPredicciones]     = useState([]);   // filtered EventoPrediccion
  const [costoGuru, setCostoGuru]           = useState(Number(ev.costo_creditos) || 2);
  const [loadingData, setLoadingData]       = useState(true);

  // Guru form
  const [guruMode, setGuruMode]     = useState('AUTOMATICA');
  const [selections, setSelections] = useState({});
  const [cantidad, setCantidad]     = useState(1);

  // Cuota form — si seleccion es 'cuota' (abierto con HACER APUESTA) no pre-seleccionamos equipo
  const [apuestaSel, setApuestaSel] = useState(seleccion && seleccion !== 'cuota' ? seleccion : '');
  const [monto, setMonto]           = useState(2);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) { window.location.href = '/register'; return; }
    loadAll();
  }, [ev.id]);

  async function loadAll() {
    setLoadingData(true);
    setError('');
    try {
      const [perfRes, guruRes] = await Promise.allSettled([
        api.get('/usuarios/perfil'),
        api.get(`/eventos/${ev.id}/guru`),
      ]);

      // 1. Saldo del usuario
      if (perfRes.status === 'fulfilled') {
        const u = perfRes.value.data;
        setSaldo(Number(u?.creditos ?? u?.saldo ?? 0));
        setMoneda(u?.moneda || 'USD');
      }

      // 2. Partidos y predicciones del evento
      if (guruRes.status === 'fulfilled') {
        const gd = guruRes.value.data;
        if (gd?.costo_guru) setCostoGuru(Number(gd.costo_guru));

        const pts = gd?.partidos || [];
        setPartidos(pts);

        // Auto-seleccionar: si solo hay 1, o si se pasó partidoIdProp desde EventoDetalle
        if (pts.length === 1) {
          seleccionarPartido(pts[0]);
        } else if (partidoIdProp) {
          const ptMatch = pts.find(p => p.id === partidoIdProp);
          if (ptMatch) seleccionarPartido(ptMatch);
        }
      }
    } catch (_) {
      setError('Error al cargar los datos del evento.');
    }
    setLoadingData(false);
  }

  function seleccionarPartido(partido) {
    setPartidoSel(partido);
    // Solo predicciones que tienen opciones configuradas
    const preds = (partido.eventos_prediccion || []).filter(ep => ep.opciones?.length > 0);
    setPredicciones(preds);
    setSelections({});
    setGuruMode('AUTOMATICA');
  }

  function volverAPartidos() {
    setPartidoSel(null);
    setPredicciones([]);
    setSelections({});
  }

  const costoTotal         = costoGuru * (mode === 'guru' ? cantidad : 1);
  const montoApuesta       = mode === 'cuota' ? monto : 0;
  const costoActual        = mode === 'guru' ? costoTotal : montoApuesta;
  const saldoInsuficiente  = saldo !== null && saldo < costoActual;

  const local     = ev.equipo_local     || ev.nombre?.split(' vs ')?.[0] || 'Local';
  const visitante = ev.equipo_visitante || ev.nombre?.split(' vs ')?.[1] || 'Visitante';

  // ── Submit manual guru ────────────────────────────────────────────────────
  async function submitManualGuru(sels) {
    const selObj = sels || selections;
    const entries = Object.entries(selObj);
    if (entries.length < 10) {
      setError('Debes responder exactamente 10 predicciones');
      return;
    }
    if (saldo !== null && saldo < costoGuru) {
      setError('Saldo insuficiente para comprar la predicción.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      // Convertir { [epId]: opcionId } → { evento_prediccion_id, valor_elegido }
      const selecciones = entries.map(([epId, opcionId]) => {
        const pred   = predicciones.find(p => p.id === epId);
        const opcion = pred?.opciones?.find(o => o.id === opcionId);
        return {
          evento_prediccion_id: epId,
          valor_elegido: opcion?.valor || String(opcionId),
        };
      });
      await api.post('/predicciones', { eventoId: ev.id, selecciones });
      setSaldo(s => s !== null ? s - costoGuru : s);
      setResult('¡Predicción Manual comprada! Recibirás notificación al correo y en la campanita 🔔.');
    } catch (e) {
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al crear predicción');
    }
    setSubmitting(false);
  }

  // ── Submit auto guru ──────────────────────────────────────────────────────
  async function submitAutoGuru() {
    if (saldoInsuficiente) return;
    setSubmitting(true); setError('');
    try {
      const body = {
        eventoId: ev.id,
        ...(partidoSel && { partidoId: partidoSel.id }),
      };
      if (cantidad > 1) {
        await api.post('/predicciones/comprar', { ...body, cantidad });
      } else {
        await api.post('/predicciones/automatica', body);
      }
      setSaldo(s => s !== null ? s - costoTotal : s);
      setResult(`¡${cantidad > 1 ? cantidad + ' predicciones compradas' : 'Predicción comprada'}! Recibirás notificación al correo y en la campanita 🔔.`);
    } catch (e) {
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al comprar predicción');
    }
    setSubmitting(false);
  }

  // ── Submit apuesta ────────────────────────────────────────────────────────
  // Mapea la selección de UI ('local'/'empate'/'visitante') al código del backend ('1'/'X'/'2')
  const SEL_MAP = { local: '1', empate: 'X', visitante: '2' };

  async function submitApuesta() {
    if (!apuestaSel || saldoInsuficiente) return;
    const resultado_elegido = SEL_MAP[apuestaSel] || apuestaSel;
    setSubmitting(true); setError('');
    try {
      await api.post('/apuestas', {
        evento_id: ev.id,
        ...(partidoIdProp && { partido_id: partidoIdProp }),
        resultado_elegido,
        monto,
      });
      setSaldo(s => s !== null ? s - monto : s);
      setResult('¡Apuesta realizada! Recibirás notificación al correo y en la campanita 🔔.');
    } catch (e) {
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al realizar apuesta');
    }
    setSubmitting(false);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.12em', marginBottom: 4 }}>
              {ev.campeonato?.nombre || ev.nombre}
            </div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>
              {local} vs {visitante}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Balance chip */}
            <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 8, padding: '8px 14px', textAlign: 'right' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 2 }}>TU SALDO</div>
              {loadingData ? (
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: '#4a5568' }}>—</div>
              ) : (
                <>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: saldo > 0 ? '#8dc63f' : '#f87171' }}>
                    {saldo !== null ? saldo.toLocaleString('es-CO') : '—'} CR
                  </div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>
                    {creditosAVidas(saldo ?? 0)} vidas
                    {moneda !== 'USD' && ` · ${creditosAMonedaLocal(saldo ?? 0, moneda)}`}
                  </div>
                </>
              )}
            </div>
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#6b7a8d', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}>✕</button>
          </div>
        </div>

        <div style={S.body}>
          {/* Success */}
          {result && (
            <div style={S.msgOk}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>✅ {result}</div>
              <a href="/mis-predicciones" style={{ display: 'inline-block', marginTop: 8, marginRight: 10, color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                Ver mis predicciones →
              </a>
              <button onClick={onClose} style={{ ...S.btn(false), width: 'auto', padding: '10px 24px', display: 'inline-block', marginTop: 8 }}>
                CERRAR
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={error.toLowerCase().includes('recargar') ? S.msgWarn : S.msgErr}>
              {error.toLowerCase().includes('recargar') ? (
                <div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    💳 RECARGA REQUERIDA
                  </div>
                  <div style={{ marginBottom: 12, lineHeight: 1.5 }}>
                    Los <strong>10 créditos de bienvenida</strong> solo se pueden usar en el modo 🧠 <strong>Predicción</strong>.<br />
                    Para apostar en cuotas necesitas recargar al menos <strong>$1</strong>.
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a href="/recargar"
                      style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.04em' }}>
                      ⚡ RECARGAR AHORA
                    </a>
                    <button onClick={() => setMode('guru')}
                      style={{ background: '#1e2535', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 6, border: '1px solid #8dc63f30', cursor: 'pointer', letterSpacing: '0.04em' }}>
                      🧠 USAR CRÉDITOS EN PREDICCIÓN
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {error}
                  {error.toLowerCase().includes('saldo') && (
                    <div style={{ marginTop: 8 }}>
                      <a href="/recargar" style={{ color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>
                        ⚡ Recargar créditos →
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!result && (
            <>
              {/* Mode tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {hasOdds && (
                  <button style={S.tab(mode === 'cuota')} onClick={() => setMode('cuota')}>
                    CUOTAS 1-X-2
                  </button>
                )}
                <button style={S.tab(mode === 'guru')} onClick={() => setMode('guru')}>
                  COMPRAR PREDICCIÓN
                </button>
              </div>

              {mode === 'cuota' ? (
                <CuotaSection
                  ev={ev}
                  local={partidoNombre ? partidoNombre.split(' vs ')[0] : local}
                  visitante={partidoNombre ? partidoNombre.split(' vs ')[1] : visitante}
                  cuotasOverride={partidoCuotas}
                  sel={apuestaSel} setSel={setApuestaSel}
                  monto={monto} setMonto={setMonto}
                  saldo={saldo} saldoInsuficiente={monto > (saldo ?? 0)}
                  submitting={submitting} onSubmit={submitApuesta}
                />
              ) : loadingData ? (
                <LoadingGuruSkeleton />
              ) : (
                /* ── GURU mode ── */
                <>
                  {/* Si hay más de 1 partido y no se ha seleccionado → mostrar selector */}
                  {!partidoSel && partidos.length > 1 ? (
                    <PartidoSelector
                      partidos={partidos}
                      onSelect={seleccionarPartido}
                    />
                  ) : !partidoSel && partidos.length === 0 ? (
                    <div style={{ background: '#161e2e', borderRadius: 8, padding: 32, textAlign: 'center', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
                      Este evento no tiene partidos configurados aún.
                    </div>
                  ) : (
                    <GuruSection
                      partido={partidoSel}
                      partidos={partidos}
                      predicciones={predicciones}
                      costoGuru={costoGuru}
                      guruMode={guruMode} setGuruMode={setGuruMode}
                      selections={selections} setSelections={setSelections}
                      cantidad={cantidad} setCantidad={setCantidad}
                      saldo={saldo} costoTotal={costoTotal}
                      submitting={submitting}
                      onManual={submitManualGuru}
                      onAuto={submitAutoGuru}
                      onCambiarPartido={partidos.length > 1 ? volverAPartidos : null}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton de carga ─────────────────────────────────────────────────────── */
function LoadingGuruSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: '#161e2e', borderRadius: 8, height: 56, opacity: 0.5 }} />
      ))}
      <div style={{ textAlign: 'center', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12, marginTop: 4 }}>
        Cargando partidos del evento...
      </div>
    </div>
  );
}

/* ── Selector de partido ───────────────────────────────────────────────────── */
function PartidoSelector({ partidos, onSelect }) {
  return (
    <div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 16 }}>
        ELIGE EL PARTIDO PARA PREDECIR
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {partidos.map(p => {
          const chip = ESTADO_CHIP[p.estado] || ESTADO_CHIP.PENDIENTE;
          const numPreds = (p.eventos_prediccion || []).filter(ep => ep.opciones?.length > 0).length;
          return (
            <button key={p.id} onClick={() => onSelect(p)}
              style={{
                background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 10,
                padding: '16px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8dc63f50'; e.currentTarget.style.background = '#1a2535'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2a3a'; e.currentTarget.style.background = '#161e2e'; }}
            >
              {/* Teams + date */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    {p.equipo_local || 'Local'}
                  </span>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#4a5568' }}>vs</span>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    {p.equipo_visitante || 'Visitante'}
                  </span>
                </div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>
                  {formatFecha(p.fecha)}
                </div>
              </div>

              {/* Right: estado + prediction count + arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ background: chip.bg, color: chip.color, borderRadius: 4, padding: '3px 8px', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700 }}>
                  {chip.label}
                </span>
                {numPreds > 0 && (
                  <span style={{ background: '#0a1628', border: '1px solid #1e2a3a', borderRadius: 4, padding: '3px 8px', fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#8dc63f' }}>
                    {numPreds} preguntas
                  </span>
                )}
                <span style={{ color: '#8dc63f', fontSize: 18, lineHeight: 1 }}>›</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Sección Cuotas ────────────────────────────────────────────────────────── */
function CuotaSection({ ev, local, visitante, cuotasOverride, sel, setSel, monto, setMonto, saldo, saldoInsuficiente, submitting, onSubmit }) {
  // cuotasOverride viene cuando se apuesta por un partido específico
  const cl = cuotasOverride?.local     ?? ev.cuota_local;
  const ce = cuotasOverride?.empate    ?? ev.cuota_empate;
  const cv = cuotasOverride?.visitante ?? ev.cuota_visitante;

  const odds = [
    cl && { key: 'local',     label: `1 ${local}`,     cuota: Number(cl).toFixed(2) },
    ce && { key: 'empate',    label: 'X Empate',        cuota: Number(ce).toFixed(2) },
    cv && { key: 'visitante', label: `2 ${visitante}`,  cuota: Number(cv).toFixed(2) },
  ].filter(Boolean);

  const cuotaVal = odds.find(o => o.key === sel);
  const est      = cuotaVal ? (monto * Number(cuotaVal.cuota)).toFixed(2) : 0;
  const canSubmit = sel && !submitting && !saldoInsuficiente;

  return (
    <div>
      <span style={S.label}>SELECCIONA TU RESULTADO</span>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {odds.map(o => (
          <button key={o.key} onClick={() => setSel(o.key)}
            style={{ ...S.optCard(sel === o.key), flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 4 }}>{o.label}</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, color: sel === o.key ? '#8dc63f' : '#fff' }}>{o.cuota}</div>
          </button>
        ))}
      </div>

      <span style={S.label}>MONTO A APOSTAR (CRÉDITOS)</span>
      <input
        type="number" min={1} max={saldo ?? 9999} value={monto}
        onChange={e => setMonto(Math.max(1, Number(e.target.value)))}
        style={{ background: '#0a0d14', border: `1px solid ${saldoInsuficiente ? '#ef4444' : '#1e2a3a'}`, borderRadius: 6, padding: '10px 14px', color: '#fff', fontFamily: 'Roboto, sans-serif', fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', marginBottom: 4 }}
      />
      {saldoInsuficiente && (
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#f87171', marginBottom: 12 }}>
          Saldo insuficiente. Tienes {saldo ?? 0} CR disponibles.{' '}
          <a href="/recargar" style={{ color: '#f59e0b' }}>Recargar →</a>
        </div>
      )}

      {cuotaVal && !saldoInsuficiente && (
        <div style={{ background: '#161e2e', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>Ganancia estimada si ganas</span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 17, fontWeight: 700, color: '#8dc63f' }}>{est} CR</span>
        </div>
      )}

      <button onClick={onSubmit} disabled={!canSubmit} style={S.btn(!canSubmit)}>
        {submitting ? 'PROCESANDO...' : !sel ? 'ELIGE UN RESULTADO' : saldoInsuficiente ? 'SALDO INSUFICIENTE' : `APOSTAR ${monto} CR →`}
      </button>
    </div>
  );
}

/* ── Sección Gurú ──────────────────────────────────────────────────────────── */
function GuruSection({
  partido, partidos, predicciones, costoGuru,
  guruMode, setGuruMode, selections, setSelections,
  cantidad, setCantidad, saldo, costoTotal,
  submitting, onManual, onAuto, onCambiarPartido,
}) {
  const saldoInsuficiente = saldo !== null && saldo < costoTotal;
  const [quizActivo, setQuizActivo] = useState(false);

  function handleQuizFinish(sels) {
    setSelections(sels);
    setQuizActivo(false);
    onManual(sels);
  }

  const canAuto = !submitting && !saldoInsuficiente;

  return (
    <div>
      {/* Partido seleccionado + botón cambiar */}
      {partido && (
        <div style={{ background: '#0f1825', border: '1px solid #8dc63f30', borderRadius: 8, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 3 }}>PARTIDO SELECCIONADO</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#8dc63f' }}>
              {partido.equipo_local || 'Local'} <span style={{ color: '#4a5568' }}>vs</span> {partido.equipo_visitante || 'Visitante'}
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 2 }}>
              {formatFecha(partido.fecha)} · {predicciones.length} predicciones disponibles
            </div>
          </div>
          {onCambiarPartido && (
            <button onClick={onCambiarPartido}
              style={{ background: '#1e2535', border: '1px solid #2a3545', borderRadius: 6, color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, padding: '6px 12px', cursor: 'pointer' }}>
              ← Cambiar
            </button>
          )}
        </div>
      )}

      {/* Costo info */}
      <div style={{ background: '#161e2e', border: '1px solid #8dc63f30', borderRadius: 8, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 4 }}>COSTO POR PREDICCIÓN</div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 700, color: '#8dc63f' }}>{costoGuru} CR</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>= {costoGuru} vidas = ${costoGuru} USD · 10 predicciones</div>
        </div>
        {saldo !== null && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 4 }}>DISPONIBLES</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: saldo >= costoTotal ? '#8dc63f' : '#f87171' }}>
              {saldo.toLocaleString('es-CO')} CR
            </div>
            {saldo < costoTotal && (
              <a href="/recargar" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#f59e0b' }}>⚡ Recargar →</a>
            )}
          </div>
        )}
      </div>

      {saldoInsuficiente && (
        <div style={S.msgWarn}>
          <b>Saldo insuficiente.</b> Necesitas {costoTotal} CR pero tienes {saldo} CR.{' '}
          <a href="/recargar" style={{ color: '#f59e0b' }}>Recargar créditos →</a>
        </div>
      )}

      {/* Quiz activo */}
      {quizActivo ? (
        <GuruManualQuiz
          predicciones={predicciones.slice(0, 10)}
          costoGuru={costoGuru}
          onFinish={handleQuizFinish}
          onCancel={() => setQuizActivo(false)}
        />
      ) : (
        <>
          {/* Modo: Manual / Automática */}
          <span style={S.label}>TIPO DE PREDICCIÓN</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button style={S.tab(guruMode === 'AUTOMATICA')} onClick={() => setGuruMode('AUTOMATICA')}>
              ⚡ AUTOMÁTICA
            </button>
            <button style={S.tab(guruMode === 'MANUAL')} onClick={() => setGuruMode('MANUAL')}
              disabled={predicciones.length < 10}
              title={predicciones.length < 10 ? `Se necesitan ≥10 predicciones (hay ${predicciones.length})` : ''}>
              ✏ MANUAL {predicciones.length < 10 && `(${predicciones.length} disp.)`}
            </button>
          </div>

          {guruMode === 'AUTOMATICA' ? (
            /* ── AUTO ── */
            <>
              <span style={S.label}>CANTIDAD DE PREDICCIONES</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <button onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  style={{ background: '#1e2535', color: '#8dc63f', border: '1px solid #1e2a3a', borderRadius: 6, width: 38, height: 38, fontSize: 20, cursor: 'pointer', fontWeight: 700 }}>−</button>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 32, fontWeight: 700, color: '#fff', minWidth: 50, textAlign: 'center' }}>{cantidad}</span>
                <button onClick={() => setCantidad(c => c + 1)}
                  style={{ background: '#1e2535', color: '#8dc63f', border: '1px solid #1e2a3a', borderRadius: 6, width: 38, height: 38, fontSize: 20, cursor: 'pointer', fontWeight: 700 }}>+</button>
              </div>

              <div style={{ background: '#161e2e', borderRadius: 8, padding: '14px 18px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>{cantidad} × {costoGuru} CR</span>
                  <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: saldoInsuficiente ? '#f87171' : '#8dc63f' }}>{costoTotal} CR</span>
                </div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', textAlign: 'right' }}>
                  {cantidad * 10} predicciones aleatorias · = {costoTotal} vidas = ${costoTotal} USD
                </div>
              </div>

              <div style={{ background: 'rgba(141,198,63,0.05)', border: '1px solid #8dc63f18', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8dc63f80' }}>
                  Las predicciones se eligen aleatoriamente de las plantillas del partido.<br />
                  🏆 <b style={{ color: '#8dc63f' }}>10/10 aciertos</b> = compartes el pozo acumulado.<br />
                  ✅ <b style={{ color: '#f59e0b' }}>7-9 aciertos</b> = devolución de {costoGuru} CR.
                </div>
              </div>

              <button onClick={onAuto} disabled={!canAuto} style={S.btn(!canAuto)}>
                {submitting ? 'PROCESANDO...' : saldoInsuficiente ? 'SALDO INSUFICIENTE' : `COMPRAR ${cantidad > 1 ? cantidad + ' PREDICCIONES' : 'PREDICCIÓN'} (${costoTotal} CR) →`}
              </button>
            </>
          ) : (
            /* ── MANUAL ── */
            <>
              {predicciones.length < 10 ? (
                <div style={{ background: '#161e2e', borderRadius: 8, padding: 24, textAlign: 'center', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, marginBottom: 20 }}>
                  No hay suficientes predicciones manuales ({predicciones.length} disponibles, se necesitan 10).<br />
                  <span style={{ color: '#4a5568', fontSize: 11 }}>Usa el modo Automática o elige otro partido.</span>
                </div>
              ) : (
                <>
                  <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: '#fff', fontWeight: 700, marginBottom: 8 }}>
                      🧠 Modo Manual — {Math.min(predicciones.length, 10)} preguntas
                    </div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', lineHeight: 1.6, marginBottom: 14 }}>
                      Responde cada predicción dentro del tiempo asignado según su dificultad:
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                      {[['FÁCIL', '#8dc63f', '45 seg'], ['MEDIA', '#f59e0b', '25 seg'], ['DIFÍCIL', '#ef4444', '15 seg']].map(([label, color, tiempo]) => (
                        <div key={label} style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 6, padding: '8px 14px', flex: 1, minWidth: 90, textAlign: 'center' }}>
                          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>⏱ {tiempo}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>
                      Si el tiempo se acaba, la pregunta queda sin respuesta. Puedes saltar manualmente en cualquier momento.
                    </div>
                  </div>

                  <button onClick={() => { if (!saldoInsuficiente) setQuizActivo(true); }}
                    disabled={saldoInsuficiente}
                    style={S.btn(saldoInsuficiente)}>
                    {saldoInsuficiente ? 'SALDO INSUFICIENTE' : `INICIAR QUIZ — ${costoGuru} CR →`}
                  </button>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
