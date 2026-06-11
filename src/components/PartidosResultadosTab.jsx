/**
 * PartidosResultadosTab
 * Gestión de resultados de partidos para Promotor y Admin.
 * - Lista eventos → selecciona uno → muestra sus partidos con resultados editables
 * - Permite ingresar resultado_local y resultado_visitante (score)
 * - Expande cada partido para ver y resolver preguntas Gurú (EventoPrediccion)
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CARD  = { background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '20px 24px' };
const INPUT = { background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '8px 12px', color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const LABEL = { display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 5 };

const ESTADO_COLOR = {
  PROGRAMADO:  { color: '#6b7a8d', bg: '#ffffff10',             label: 'Programado' },
  EN_CURSO:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'En curso'   },
  FINALIZADO:  { color: '#8dc63f', bg: 'rgba(141,198,63,0.12)', label: 'Finalizado' },
  SUSPENDIDO:  { color: '#f87171', bg: 'rgba(239,68,68,0.1)',   label: 'Suspendido' },
  CANCELADO:   { color: '#f87171', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelado'  },
};

function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Panel de preguntas Gurú de un partido ─────────────────────────────────────
function PreguntasGuruPanel({ partido, onResuelto }) {
  const [predicciones, setPredicciones] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [guardando, setGuardando]       = useState({});   // { [epId]: true }
  const [msgs, setMsgs]                 = useState({});   // { [epId]: msg }
  const [errs, setErrs]                 = useState({});   // { [epId]: err }
  const [vals, setVals]                 = useState({});   // { [epId]: valor elegido }

  const cargar = useCallback(() => {
    setLoading(true);
    api.get(`/partidos/${partido.id}/predicciones`)
      .then(r => {
        const preds = r.data?.predicciones || [];
        setPredicciones(preds);
        // Inicializar valores con valor_correcto actual si ya está resuelto
        const initVals = {};
        preds.forEach(ep => { if (ep.valor_correcto) initVals[ep.id] = ep.valor_correcto; });
        setVals(initVals);
      })
      .catch(() => setPredicciones([]))
      .finally(() => setLoading(false));
  }, [partido.id]);

  useEffect(() => { cargar(); }, [cargar]);

  const resolver = async (epId) => {
    const valor = vals[epId];
    if (!valor) return;
    setGuardando(g => ({ ...g, [epId]: true }));
    setMsgs(m  => ({ ...m, [epId]: '' }));
    setErrs(e  => ({ ...e, [epId]: '' }));
    try {
      await api.patch(`/partidos/${partido.id}/predicciones/${epId}`, { valor });
      setMsgs(m => ({ ...m, [epId]: '✓ Guardado' }));
      // Actualizar localmente sin recargar todo
      setPredicciones(prev => prev.map(ep =>
        ep.id === epId ? { ...ep, valor_correcto: valor, estado: 'RESUELTO' } : ep
      ));
      onResuelto?.();
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErrs(e => ({ ...e, [epId]: Array.isArray(m) ? m.join(', ') : m || 'Error al guardar' }));
    } finally {
      setGuardando(g => ({ ...g, [epId]: false }));
    }
  };

  if (loading) return (
    <div style={{ padding: '14px 0 4px', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12, textAlign: 'center' }}>
      Cargando predicciones...
    </div>
  );

  if (predicciones.length === 0) return (
    <div style={{ padding: '14px 0 4px', color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 12, textAlign: 'center' }}>
      Este partido no tiene predicciones asociadas.
    </div>
  );

  const resueltas  = predicciones.filter(ep => ep.estado === 'RESUELTO').length;
  const pendientes = predicciones.length - resueltas;

  return (
    <div style={{ borderTop: '1px solid #1e2a3a', paddingTop: 14, marginTop: 10 }}>
      {/* Header del panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em' }}>
          PREDICCIONES — {predicciones.length} total
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ background: 'rgba(141,198,63,0.1)', color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 10, padding: '3px 10px', borderRadius: 4 }}>
            ✓ {resueltas} resueltas
          </span>
          {pendientes > 0 && (
            <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 10, padding: '3px 10px', borderRadius: 4 }}>
              ⏳ {pendientes} pendientes
            </span>
          )}
        </div>
      </div>

      {/* Lista de preguntas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {predicciones.map(ep => {
          const resuelta  = ep.estado === 'RESUELTO';
          const selVal    = vals[ep.id] || '';
          const opciones  = ep.opciones?.map(o => o.valor) || [];
          const guardandoThis = !!guardando[ep.id];

          return (
            <div key={ep.id} style={{
              background: resuelta ? 'rgba(141,198,63,0.04)' : '#0a0d14',
              border: `1px solid ${resuelta ? '#8dc63f30' : '#1e2a3a'}`,
              borderRadius: 6,
              padding: '12px 14px',
            }}>
              {/* Pregunta y badge estado */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{resuelta ? '✅' : '⏳'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#c0cad8', lineHeight: 1.4 }}>
                    {ep.descripcion}
                  </div>
                  {resuelta && (
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', marginTop: 4, letterSpacing: '0.05em' }}>
                      RESPUESTA CORRECTA: {ep.valor_correcto}
                    </div>
                  )}
                </div>
              </div>

              {/* Selector de respuesta */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {opciones.length > 0 ? (
                  /* Opciones como botones */
                  opciones.map(op => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setVals(v => ({ ...v, [ep.id]: op }))}
                      style={{
                        background: selVal === op
                          ? (op === ep.valor_correcto ? '#8dc63f' : '#a78bfa')
                          : '#1e2535',
                        color: selVal === op ? '#0a0d14' : '#c0cad8',
                        border: `1px solid ${selVal === op ? 'transparent' : '#1e2a3a'}`,
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '7px 16px',
                        borderRadius: 5,
                        cursor: 'pointer',
                        letterSpacing: '0.05em',
                        transition: 'all 0.15s',
                      }}
                    >
                      {op}
                    </button>
                  ))
                ) : (
                  /* Input libre si no hay opciones predefinidas */
                  <input
                    value={selVal}
                    onChange={e => setVals(v => ({ ...v, [ep.id]: e.target.value }))}
                    placeholder="Escribe el resultado correcto..."
                    style={{ ...INPUT, maxWidth: 260 }}
                  />
                )}

                {/* Botón guardar */}
                <button
                  onClick={() => resolver(ep.id)}
                  disabled={!selVal || guardandoThis}
                  style={{
                    background: !selVal || guardandoThis ? '#1e2535' : '#8dc63f',
                    color: !selVal || guardandoThis ? '#4a5568' : '#0a0d14',
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '7px 18px',
                    borderRadius: 5,
                    border: 'none',
                    cursor: !selVal || guardandoThis ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {guardandoThis ? '...' : resuelta ? '↻ ACTUALIZAR' : 'CONFIRMAR'}
                </button>
              </div>

              {msgs[ep.id] && <div style={{ color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 6 }}>{msgs[ep.id]}</div>}
              {errs[ep.id] && <div style={{ color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 6 }}>{errs[ep.id]}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Fila de un partido ────────────────────────────────────────────────────────
function PartidoRow({ partido, onSaved }) {
  const [editando, setEditando]       = useState(false);
  const [showGuru, setShowGuru]       = useState(false);
  const [rl, setRl]                   = useState(partido.resultado_local      ?? '');
  const [rv, setRv]                   = useState(partido.resultado_visitante  ?? '');
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState('');
  const [err, setErr]                 = useState('');

  // Panel para asignar api_id a partidos MANUAL
  const [editApiId,   setEditApiId]   = useState(false);
  const [apiIdVal,    setApiIdVal]    = useState(partido.api_id || '');
  const [savingApiId, setSavingApiId] = useState(false);
  const [msgApiId,    setMsgApiId]    = useState('');

  // Motor automático desde DB
  const [resolviendo, setResolviendo] = useState(false);
  const [msgMotor,    setMsgMotor]    = useState('');

  const estadoInfo    = ESTADO_COLOR[partido.estado] || ESTADO_COLOR.PROGRAMADO;
  const tieneResultado = partido.resultado_local !== null && partido.resultado_local !== undefined;

  const guardar = async () => {
    if (rl === '' || rv === '') { setErr('Ingresa ambos resultados'); return; }
    const rln = Number(rl), rvn = Number(rv);
    if (isNaN(rln) || isNaN(rvn) || rln < 0 || rvn < 0) { setErr('Valores inválidos'); return; }
    setSaving(true); setErr(''); setMsg('');
    try {
      await api.patch(`/partidos/${partido.id}`, { resultado_local: rln, resultado_visitante: rvn });
      setMsg('✓ Marcador guardado');
      setEditando(false);
      onSaved?.();
    } catch (e) {
      const m = e.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const cancelar = () => {
    setRl(partido.resultado_local    ?? '');
    setRv(partido.resultado_visitante ?? '');
    setEditando(false);
    setErr(''); setMsg('');
  };

  // Guardar api_id para este partido
  const guardarApiId = async () => {
    if (!apiIdVal.trim()) return;
    setSavingApiId(true); setMsgApiId('');
    try {
      await api.patch(`/partidos/${partido.id}`, { api_id: apiIdVal.trim() });
      setMsgApiId('✓ API ID guardado — ahora usa SYNC API para sincronizar');
      setEditApiId(false);
      onSaved?.();
    } catch (e) {
      setMsgApiId('Error: ' + (e.response?.data?.message || 'No se pudo guardar'));
    } finally { setSavingApiId(false); }
  };

  // Ejecutar motor desde DB (para partidos MANUAL con resultado ya ingresado)
  const resolverConMotor = async () => {
    setResolviendo(true); setMsgMotor('');
    try {
      const { data } = await api.post(`/motor/partido/${partido.id}/resolver`);
      setMsgMotor('✓ Motor ejecutado — predicciones resueltas con los datos del DB');
      onSaved?.();
    } catch (e) {
      setMsgMotor('Error: ' + (e.response?.data?.message || 'No se pudo ejecutar el motor'));
    } finally { setResolviendo(false); }
  };

  const tieneResultadoYFinalizado = tieneResultado && partido.estado === 'FINALIZADO';

  return (
    <div style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 8, padding: '14px 18px', marginBottom: 8 }}>

      {/* ── Cabecera del partido ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ flex: 1 }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ background: estadoInfo.bg, color: estadoInfo.color, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.06em' }}>
              {estadoInfo.label.toUpperCase()}
            </span>
            {partido.api_id && (
              <span style={{ background: '#3b82f615', color: '#3b82f6', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
                🔄 API
              </span>
            )}
            {!partido.api_id && (
              <span style={{ background: '#a78bfa15', color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
                ✍ MANUAL
              </span>
            )}
            {partido.fase && (
              <span style={{ background: '#ffffff08', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, padding: '2px 8px', borderRadius: 3 }}>
                {partido.fase.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* Equipos y marcador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>
              {partido.equipo_local}
            </span>
            {tieneResultado ? (
              <span style={{ background: '#1e2535', border: '1px solid #1e2a3a', borderRadius: 6, padding: '4px 14px', fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: '#8dc63f' }}>
                {partido.resultado_local} – {partido.resultado_visitante}
              </span>
            ) : (
              <span style={{ color: '#4a5568', fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>vs</span>
            )}
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>
              {partido.equipo_visitante}
            </span>
          </div>

          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginTop: 6 }}>
            {fmtFecha(partido.fecha)}
            {partido.sede ? ` · ${partido.sede}` : ''}
          </div>
          {msg && <div style={{ color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 4 }}>{msg}</div>}
          {err && !editando && <div style={{ color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 4 }}>{err}</div>}
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {!editando && (
            <button onClick={() => { setEditando(true); setMsg(''); setErr(''); }}
              style={{ background: '#1e2535', color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 14px', borderRadius: 6, border: '1px solid #00d4ff25', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
              {tieneResultado ? '✏ MARCADOR' : '+ MARCADOR'}
            </button>
          )}

          {/* Botón asignar API ID — solo para partidos sin api_id */}
          {!partido.api_id && !editApiId && (
            <button onClick={() => setEditApiId(true)}
              style={{ background: '#1e2535', color: '#3b82f6', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 14px', borderRadius: 6, border: '1px solid #3b82f620', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
              🔗 ASIGNAR API ID
            </button>
          )}

          {/* Botón auto-resolver motor — solo para FINALIZADO con resultado */}
          {tieneResultadoYFinalizado && (
            <button onClick={resolverConMotor} disabled={resolviendo}
              style={{ background: resolviendo ? '#1e2535' : '#1e3020', color: resolviendo ? '#4a5568' : '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 14px', borderRadius: 6, border: '1px solid #8dc63f20', cursor: resolviendo ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
              {resolviendo ? '⚙ EJECUTANDO...' : '⚙ AUTO-RESOLVER'}
            </button>
          )}

          <button
            onClick={() => setShowGuru(s => !s)}
            style={{
              background: showGuru ? '#1e3a2a' : '#1e2535',
              color: showGuru ? '#a78bfa' : '#a78bfa',
              border: `1px solid ${showGuru ? '#a78bfa40' : '#a78bfa20'}`,
              fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700,
              padding: '8px 14px', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.04em',
            }}>
            {showGuru ? '▲ PREDICCIONES' : '▼ PREDICCIONES'}
          </button>
        </div>
      </div>

      {/* ── Panel asignar API ID ─────────────────────────────────────── */}
      {editApiId && (
        <div style={{ borderTop: '1px solid #1e2a3a', paddingTop: 12, marginTop: 10, background: '#0a0f1a', padding: '12px 14px', borderRadius: 6, marginTop: 8 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: 8 }}>
            FIXTURE ID DE API-FOOTBALL
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 10 }}>
            Busca el fixture en <a href="https://dashboard.api-football.com" target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>api-football.com</a> y pega el ID numérico aquí.
            Ejemplo: el partido Colombia vs Uruguay podría ser <code style={{ color: '#a78bfa' }}>1234567</code>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={apiIdVal}
              onChange={e => setApiIdVal(e.target.value)}
              placeholder="Ej: 1048395"
              style={{ ...INPUT, width: 160, fontFamily: 'monospace' }}
            />
            <button onClick={guardarApiId} disabled={savingApiId || !apiIdVal.trim()}
              style={{ background: savingApiId ? '#1e2535' : '#3b82f6', color: savingApiId ? '#4a5568' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '9px 16px', borderRadius: 6, border: 'none', cursor: !apiIdVal.trim() || savingApiId ? 'not-allowed' : 'pointer', letterSpacing: '0.04em' }}>
              {savingApiId ? 'GUARDANDO...' : 'GUARDAR'}
            </button>
            <button onClick={() => { setEditApiId(false); setMsgApiId(''); }}
              style={{ background: 'transparent', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, padding: '9px 12px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: 'pointer' }}>
              CANCELAR
            </button>
          </div>
          {msgApiId && <div style={{ color: msgApiId.startsWith('✓') ? '#8dc63f' : '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 8 }}>{msgApiId}</div>}
        </div>
      )}

      {/* Mensaje motor */}
      {msgMotor && (
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 6, color: msgMotor.startsWith('✓') ? '#8dc63f' : '#f87171' }}>
          {msgMotor}
        </div>
      )}

      {/* ── Formulario de marcador inline ───────────────────────────── */}
      {editando && (
        <div style={{ borderTop: '1px solid #1e2a3a', paddingTop: 14, marginTop: 12 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 12 }}>
            MARCADOR FINAL (GOLES)
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label style={LABEL}>{partido.equipo_local}</label>
              <input type="number" min="0" max="99" value={rl} onChange={e => setRl(e.target.value)} style={INPUT} placeholder="0" />
            </div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: '#4a5568', paddingBottom: 6 }}>–</div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label style={LABEL}>{partido.equipo_visitante}</label>
              <input type="number" min="0" max="99" value={rv} onChange={e => setRv(e.target.value)} style={INPUT} placeholder="0" />
            </div>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 2 }}>
              <button onClick={guardar} disabled={saving}
                style={{ background: saving ? '#1e2535' : '#8dc63f', color: saving ? '#4a5568' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 6, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '0.04em' }}>
                {saving ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
              <button onClick={cancelar}
                style={{ background: 'transparent', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, padding: '9px 14px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: 'pointer' }}>
                CANCELAR
              </button>
            </div>
          </div>
          {err && <div style={{ color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 12, marginTop: 8 }}>{err}</div>}
        </div>
      )}

      {/* ── Panel de preguntas Gurú expandible ──────────────────────── */}
      {showGuru && (
        <PreguntasGuruPanel
          partido={partido}
          onResuelto={onSaved}
        />
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PartidosResultadosTab({ isAdmin = false }) {
  const [eventos, setEventos]             = useState([]);
  const [eventoId, setEventoId]           = useState('');
  const [eventoInfo, setEventoInfo]       = useState(null);
  const [partidos, setPartidos]           = useState([]);
  const [loadingEv, setLoadingEv]         = useState(true);
  const [loadingPt, setLoadingPt]         = useState(false);
  const [syncMsg, setSyncMsg]             = useState('');
  const [syncing, setSyncing]             = useState(false);
  const [filtroEstado, setFiltroEstado]   = useState('TODOS');
  const [stats, setStats]                 = useState(null);
  const [apuestas, setApuestas]           = useState({ resumen: null, apuestas: [] });
  const [showApuestas, setShowApuestas]   = useState(false);
  const [loadingApuestas, setLoadingApuestas] = useState(false);
  const [showModal, setShowModal]         = useState('');
  const [modalData, setModalData]         = useState(null);
  const [flujomsg, setFlujomsg]           = useState('');
  const [flujoaccion, setFlujoaccion]     = useState('');

  const cargarEventos = useCallback(() => {
    setLoadingEv(true);
    const ep = isAdmin ? '/eventos' : '/eventos/disponibles';
    api.get(ep)
      .then(r => { const data = r.data?.eventos || r.data || []; setEventos(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoadingEv(false));
  }, [isAdmin]);

  useEffect(() => { cargarEventos(); }, [cargarEventos]);

  const cargarPartidos = useCallback((id) => {
    if (!id) return;
    setLoadingPt(true);
    api.get(`/eventos/${id}`)
      .then(r => { setPartidos(r.data?.partidos || []); setEventoInfo(r.data); })
      .catch(() => setPartidos([]))
      .finally(() => setLoadingPt(false));
  }, []);

  const cargarStats = useCallback((id) => {
    if (!id) return;
    api.get(`/motor/evento/${id}/estadisticas`)
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (eventoId) { cargarPartidos(eventoId); cargarStats(eventoId); }
    else { setPartidos([]); setEventoInfo(null); setStats(null); setApuestas({ resumen: null, apuestas: [] }); setShowApuestas(false); setFlujomsg(''); }
  }, [eventoId, cargarPartidos, cargarStats]);

  const cargarApuestas = async (id) => {
    setLoadingApuestas(true);
    try {
      const { data } = await api.get(`/apuestas/admin/evento/${id}`);
      setApuestas(data);
    } catch {}
    finally { setLoadingApuestas(false); }
  };

  const sincronizarApi = async (force = false) => {
    if (!eventoId) return;
    setSyncing(true); setSyncMsg('');
    try {
      const { data } = await api.post('/sports/sync-partidos', { evento_id: eventoId, force });
      setSyncMsg(data.mensaje || `✓ Sync completado — ${data.sincronizados ?? 0} partido(s) actualizados`);
      cargarPartidos(eventoId);
    } catch (e) {
      const m = e.response?.data?.message;
      setSyncMsg('⚠ ' + (Array.isArray(m) ? m.join(', ') : m || 'Error al sincronizar'));
    } finally { setSyncing(false); }
  };

  const accionFlujo = async (tipo) => {
    setFlujoaccion(tipo); setFlujomsg('');
    try {
      if (tipo === 'cerrar') {
        await api.post(`/eventos/${eventoId}/cerrar-inscripciones`);
        setFlujomsg('✓ Inscripciones cerradas. Ya no se aceptan nuevas predicciones.');
        cargarPartidos(eventoId);
      } else if (tipo === 'preview') {
        const { data } = await api.get(`/eventos/${eventoId}/liquidacion/preview`);
        setModalData(data); setShowModal('preview');
      } else if (tipo === 'liquidar') {
        if (!window.confirm('¿Liquidar el evento? Los créditos se distribuirán a los ganadores. Esta acción es irreversible.')) return;
        await api.post(`/eventos/${eventoId}/resolver`);
        setFlujomsg('✓ Evento liquidado. Los premios fueron acreditados en las wallets de los ganadores.');
        cargarPartidos(eventoId); cargarStats(eventoId);
      } else if (tipo === 'reporte') {
        const { data } = await api.get(`/eventos/${eventoId}/liquidacion/reporte`);
        setModalData(data); setShowModal('reporte');
      }
    } catch (e) { setFlujomsg('✗ ' + (e.response?.data?.message || 'Error')); }
    finally { setFlujoaccion(''); }
  };

  const partidosFiltrados = partidos.filter(p =>
    filtroEstado === 'TODOS' || p.estado === filtroEstado
  );

  const resumen = {
    total:  partidos.length,
    conRes: partidos.filter(p => p.resultado_local !== null && p.resultado_local !== undefined).length,
    sinRes: partidos.filter(p => p.resultado_local === null  || p.resultado_local === undefined).length,
    conApi: partidos.filter(p => p.api_id).length,
  };

  const todosMarcados = resumen.total > 0 && resumen.sinRes === 0;
  const esLiquidado   = eventoInfo?.estado === 'LIQUIDADO';
  const estaCerrado   = eventoInfo?.cerrado;

  return (
    <div>
      {/* Selector de evento */}
      <div style={{ ...CARD, marginBottom: 20 }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#8dc63f', letterSpacing: '0.1em', marginBottom: 14 }}>
          SELECCIONAR EVENTO
        </div>
        {loadingEv ? (
          <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>Cargando eventos...</div>
        ) : (
          <select value={eventoId} onChange={e => { setEventoId(e.target.value); setSyncMsg(''); }} style={{ ...INPUT, maxWidth: 500 }}>
            <option value="">— Selecciona un evento —</option>
            {eventos.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.nombre} {ev.estado ? `[${ev.estado}]` : ''}</option>
            ))}
          </select>
        )}
      </div>

      {/* Panel de partidos */}
      {eventoId && (
        <div style={CARD}>
          {/* Header con resumen y acciones */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#8dc63f', letterSpacing: '0.1em', marginBottom: 8 }}>
                RESULTADOS DE PARTIDOS
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total',         val: resumen.total,  color: '#6b7a8d' },
                  { label: 'Con marcador',  val: resumen.conRes, color: '#8dc63f' },
                  { label: 'Sin marcador',  val: resumen.sinRes, color: resumen.sinRes > 0 ? '#f59e0b' : '#4a5568' },
                  { label: 'Vía API',       val: resumen.conApi, color: '#3b82f6' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => sincronizarApi(false)} disabled={syncing || resumen.conApi === 0}
                style={{ background: syncing ? '#1e2535' : '#3b82f620', color: syncing ? '#4a5568' : '#3b82f6', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '9px 16px', borderRadius: 6, border: '1px solid #3b82f630', cursor: (syncing || resumen.conApi === 0) ? 'not-allowed' : 'pointer', letterSpacing: '0.04em' }}
                title="Sincroniza solo los partidos PROGRAMADO con api_id">
                {syncing ? '↻ SINCRONIZANDO...' : '🔄 SYNC API'}
              </button>
              <button onClick={() => sincronizarApi(true)} disabled={syncing || resumen.conApi === 0}
                style={{ background: syncing ? '#1e2535' : 'rgba(245,158,11,0.1)', color: syncing ? '#4a5568' : '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '9px 16px', borderRadius: 6, border: '1px solid #f59e0b30', cursor: (syncing || resumen.conApi === 0) ? 'not-allowed' : 'pointer', letterSpacing: '0.04em' }}
                title="Force: re-sincroniza todos los partidos con api_id, incluyendo FINALIZADO">
                {syncing ? '...' : '⚡ SYNC FORCE'}
              </button>
              <button onClick={() => cargarPartidos(eventoId)}
                style={{ background: '#1e2535', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '9px 16px', borderRadius: 6, border: '1px solid #8dc63f25', cursor: 'pointer', letterSpacing: '0.04em' }}>
                ↻ ACTUALIZAR
              </button>
            </div>
          </div>

          {syncMsg && (
            <div style={{ background: syncMsg.startsWith('✓') ? 'rgba(141,198,63,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${syncMsg.startsWith('✓') ? '#8dc63f30' : '#f59e0b30'}`, borderRadius: 6, padding: '10px 14px', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: syncMsg.startsWith('✓') ? '#8dc63f' : '#f59e0b', marginBottom: 14 }}>
              {syncMsg}
            </div>
          )}

          {/* Leyenda de la sección Gurú */}
          <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid #a78bfa20', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#a78bfa', lineHeight: 1.5 }}>
            💡 Haz clic en <strong>▼ PREDICCIONES</strong> en cada partido para ver y marcar las respuestas correctas de cada pregunta.
            Esto permite comparar con las predicciones de los usuarios y determinar aciertos.
          </div>

          {/* Filtro por estado */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {['TODOS', 'PROGRAMADO', 'EN_CURSO', 'FINALIZADO'].map(e => (
              <button key={e} onClick={() => setFiltroEstado(e)}
                style={{ background: filtroEstado === e ? '#8dc63f' : '#1e2535', color: filtroEstado === e ? '#0a0d14' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
                {e === 'TODOS' ? `TODOS (${partidos.length})` : e.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Lista de partidos */}
          {loadingPt ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} style={{ background: '#0a0d14', borderRadius: 8, height: 72, opacity: 0.5 }} />)}
            </div>
          ) : partidosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
              No hay partidos {filtroEstado !== 'TODOS' ? `con estado "${filtroEstado}"` : 'en este evento'}.
            </div>
          ) : (
            <div>
              {partidosFiltrados.map(p => (
                <PartidoRow key={p.id} partido={p} onSaved={() => cargarPartidos(eventoId)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Estadísticas del evento ─────────────────────────────── */}
      {eventoId && stats && (
        <div style={{ ...CARD, marginTop: 16 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#8dc63f', letterSpacing: '0.1em', marginBottom: 16 }}>
            📊 ESTADÍSTICAS DEL EVENTO
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Predicciones Gurú */}
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#a78bfa', letterSpacing: '0.08em', marginBottom: 10 }}>PREDICCIONES GURÚ</div>
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  { label: 'Usuarios',   val: stats.ranking_predicciones.length,                                          color: '#6b7a8d' },
                  { label: 'Resueltas',  val: stats.ranking_predicciones.filter(p => p.estado !== 'PENDIENTE').length,    color: '#8dc63f' },
                  { label: 'Pendientes', val: stats.ranking_predicciones.filter(p => p.estado === 'PENDIENTE').length,    color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: 1, background: '#1e2a3a', alignSelf: 'stretch' }} />

            {/* Apuestas 1-X-2 */}
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#f59e0b', letterSpacing: '0.08em', marginBottom: 10 }}>APUESTAS 1-X-2</div>
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  { label: 'Total',      val: stats.resumen_apuestas.total,      color: '#6b7a8d' },
                  { label: 'Pendientes', val: stats.resumen_apuestas.pendientes,  color: '#f59e0b' },
                  { label: 'Ganadas',    val: stats.resumen_apuestas.ganadoras,   color: '#8dc63f' },
                  { label: 'Perdidas',   val: stats.resumen_apuestas.perdedoras,  color: '#f87171' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                {[['1','Local','#3b82f6'],['X','Empate','#f59e0b'],['2','Visit.','#f87171']].map(([k,l,c]) => (
                  <span key={k} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>
                    {l}: <b style={{ color: c }}>{stats.resumen_apuestas.por_resultado[k] || 0}</b>
                  </span>
                ))}
              </div>
            </div>

            {stats.top_3.length > 0 && (
              <>
                <div style={{ width: 1, background: '#1e2a3a', alignSelf: 'stretch' }} />
                <div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#a78bfa', letterSpacing: '0.08em', marginBottom: 10 }}>TOP 3 PREDICTORES</div>
                  {stats.top_3.map((t, i) => (
                    <div key={t.posicion} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: ['#f59e0b','#9ca3af','#b45309'][i], minWidth: 20 }}>#{t.posicion}</span>
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#e2e8f0' }}>{t.usuario?.nombre || t.usuario?.email || '—'}</span>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f' }}>{t.aciertos} ✓</span>
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, padding: '2px 6px', borderRadius: 3, background: t.estado === 'PENDIENTE' ? 'rgba(245,158,11,0.15)' : 'rgba(141,198,63,0.12)', color: t.estado === 'PENDIENTE' ? '#f59e0b' : '#8dc63f' }}>{t.estado}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Apuestas del evento ─────────────────────────────────── */}
      {eventoId && (
        <div style={{ ...CARD, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#f59e0b', letterSpacing: '0.1em' }}>
              💰 APUESTAS DEL EVENTO
              {apuestas.resumen && <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginLeft: 10, fontWeight: 400 }}>({apuestas.resumen.total} total · {Number(apuestas.resumen.monto_total).toLocaleString('es-CO')} cr apostados)</span>}
            </div>
            <button
              onClick={() => {
                const next = !showApuestas;
                setShowApuestas(next);
                if (next && !apuestas.resumen) cargarApuestas(eventoId);
              }}
              style={{ background: showApuestas ? 'rgba(245,158,11,0.12)' : '#1e2535', color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '7px 14px', borderRadius: 6, border: '1px solid #f59e0b30', cursor: 'pointer' }}>
              {showApuestas ? '▲ OCULTAR' : '▼ VER APUESTAS'}
            </button>
          </div>

          {showApuestas && (
            <div style={{ marginTop: 16 }}>
              {loadingApuestas ? (
                <div style={{ textAlign: 'center', color: '#4a5568', padding: 20, fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>Cargando apuestas...</div>
              ) : apuestas.apuestas.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#4a5568', padding: 24, fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>No hay apuestas registradas en este evento.</div>
              ) : (
                <>
                  {apuestas.resumen && (
                    <div style={{ display: 'flex', gap: 20, marginBottom: 14, flexWrap: 'wrap', padding: '10px 14px', background: '#0a0d14', borderRadius: 6 }}>
                      {[['Local (1)', apuestas.resumen.por_resultado['1'], '#3b82f6'], ['Empate (X)', apuestas.resumen.por_resultado['X'], '#f59e0b'], ['Visitante (2)', apuestas.resumen.por_resultado['2'], '#f87171']].map(([l,v,c]) => (
                        <span key={l} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>{l}: <b style={{ color: c }}>{v}</b></span>
                      ))}
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>Ganancia potencial total: <b style={{ color: '#f59e0b' }}>{Number(apuestas.resumen.ganancia_potencial_total).toLocaleString('es-CO')} cr</b></span>
                    </div>
                  )}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
                          {['USUARIO','RESULTADO','CUOTA','MONTO','GANANCIA POT.','ESTADO'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: '#4a5568', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {apuestas.apuestas.map(a => (
                          <tr key={a.id} style={{ borderBottom: '1px solid #0a0d14' }}>
                            <td style={{ padding: '8px 10px', color: '#e2e8f0' }}>{a.usuario?.nombre || a.usuario?.email || '—'}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, color: a.resultado_elegido === '1' ? '#3b82f6' : a.resultado_elegido === 'X' ? '#f59e0b' : '#f87171' }}>
                                {a.resultado_elegido === '1' ? '🏠 Local' : a.resultado_elegido === 'X' ? '🤝 Empate' : '✈ Visit.'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 10px', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12 }}>{Number(a.cuota_al_apostar).toFixed(2)}x</td>
                            <td style={{ padding: '8px 10px', color: '#e2e8f0' }}>{Number(a.monto_creditos).toLocaleString('es-CO')} cr</td>
                            <td style={{ padding: '8px 10px', color: '#f59e0b' }}>{Number(a.ganancia_potencial).toLocaleString('es-CO')} cr</td>
                            <td style={{ padding: '8px 10px' }}>
                              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: {PENDIENTE:'rgba(245,158,11,0.15)',GANADA:'rgba(141,198,63,0.12)',PERDIDA:'rgba(248,113,113,0.1)',REEMBOLSADA:'rgba(107,122,141,0.15)'}[a.estado]||'#0a0d14', color: {PENDIENTE:'#f59e0b',GANADA:'#8dc63f',PERDIDA:'#f87171',REEMBOLSADA:'#6b7a8d'}[a.estado]||'#6b7a8d' }}>
                                {a.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Flujo de Cierre ─────────────────────────────────────── */}
      {eventoId && eventoInfo && (
        <div style={{ ...CARD, marginTop: 16 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#8dc63f', letterSpacing: '0.1em', marginBottom: 20 }}>
            ⚡ FLUJO DE CIERRE DEL EVENTO
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { n: 1, label: 'Todos los marcadores ingresados',   done: todosMarcados,  act: !todosMarcados && resumen.total > 0 },
              { n: 2, label: 'Inscripciones cerradas',            done: estaCerrado,    act: todosMarcados && !estaCerrado },
              { n: 3, label: 'Evento liquidado',                  done: esLiquidado,    act: estaCerrado && !esLiquidado },
              { n: 4, label: 'Listo para eliminar',               done: esLiquidado,    act: false },
            ].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, background: s.done ? 'rgba(141,198,63,0.15)' : s.act ? 'rgba(245,158,11,0.15)' : '#0a0d14', color: s.done ? '#8dc63f' : s.act ? '#f59e0b' : '#4a5568', border: `2px solid ${s.done ? '#8dc63f50' : s.act ? '#f59e0b50' : '#1e2a3a'}` }}>
                    {s.done ? '✓' : s.n}
                  </div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: s.done ? '#8dc63f' : s.act ? '#f59e0b' : '#4a5568', textAlign: 'center', marginTop: 6, maxWidth: 100, lineHeight: 1.3 }}>{s.label}</div>
                </div>
                {i < 3 && <div style={{ width: 40, height: 2, background: s.done ? '#8dc63f30' : '#1e2a3a', margin: '0 4px 28px' }} />}
              </div>
            ))}
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => accionFlujo('cerrar')}
              disabled={!!flujoaccion || estaCerrado || esLiquidado}
              title="Cierra inscripciones: los usuarios ya no pueden participar"
              style={{ background: estaCerrado ? '#0a0d14' : 'rgba(245,158,11,0.1)', color: estaCerrado ? '#4a5568' : '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '10px 18px', borderRadius: 6, border: `1px solid ${estaCerrado ? '#1e2a3a' : '#f59e0b40'}`, cursor: (estaCerrado || esLiquidado) ? 'not-allowed' : 'pointer' }}>
              {flujoaccion === 'cerrar' ? '...' : estaCerrado ? '✓ INSCRIPCIONES CERRADAS' : '🔒 CERRAR INSCRIPCIONES'}
            </button>

            <button
              onClick={() => accionFlujo('preview')}
              disabled={!!flujoaccion || !estaCerrado}
              title="Ver distribución de premios antes de ejecutar la liquidación"
              style={{ background: !estaCerrado ? '#0a0d14' : 'rgba(59,130,246,0.1)', color: !estaCerrado ? '#4a5568' : '#3b82f6', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '10px 18px', borderRadius: 6, border: `1px solid ${!estaCerrado ? '#1e2a3a' : '#3b82f640'}`, cursor: !estaCerrado ? 'not-allowed' : 'pointer' }}>
              {flujoaccion === 'preview' ? '...' : '👁 PREVIEW LIQUIDACIÓN'}
            </button>

            <button
              onClick={() => accionFlujo('liquidar')}
              disabled={!!flujoaccion || !estaCerrado || esLiquidado}
              title="Distribuye premios a los ganadores. Irreversible."
              style={{ background: (!estaCerrado || esLiquidado) ? '#0a0d14' : 'rgba(248,113,113,0.1)', color: (!estaCerrado || esLiquidado) ? '#4a5568' : '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '10px 18px', borderRadius: 6, border: `1px solid ${(!estaCerrado || esLiquidado) ? '#1e2a3a' : '#f8717140'}`, cursor: (!estaCerrado || esLiquidado) ? 'not-allowed' : 'pointer' }}>
              {flujoaccion === 'liquidar' ? 'LIQUIDANDO...' : esLiquidado ? '✓ EVENTO LIQUIDADO' : '💸 LIQUIDAR EVENTO'}
            </button>

            {estaCerrado && (
              <button
                onClick={() => accionFlujo('reporte')}
                disabled={!!flujoaccion}
                title="Ver reporte de la liquidación"
                style={{ background: 'rgba(141,198,63,0.08)', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '10px 18px', borderRadius: 6, border: '1px solid #8dc63f30', cursor: 'pointer' }}>
                {flujoaccion === 'reporte' ? '...' : '📊 VER REPORTE'}
              </button>
            )}
          </div>

          {flujomsg && (
            <div style={{ marginTop: 14, background: flujomsg.startsWith('✓') ? 'rgba(141,198,63,0.08)' : 'rgba(248,113,113,0.1)', border: `1px solid ${flujomsg.startsWith('✓') ? '#8dc63f30' : '#f8717130'}`, borderRadius: 6, padding: '10px 14px', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: flujomsg.startsWith('✓') ? '#8dc63f' : '#f87171', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{flujomsg}</span>
              <button onClick={() => setFlujomsg('')} style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          )}
        </div>
      )}

      {/* ── Modal Preview / Reporte ─────────────────────────────── */}
      {showModal && modalData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowModal('')}>
          <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 12, maxWidth: 640, width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: 28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: '#8dc63f', letterSpacing: '0.1em' }}>
                {showModal === 'preview' ? '👁 PREVIEW LIQUIDACIÓN' : '📊 REPORTE DE LIQUIDACIÓN'}
              </div>
              <button onClick={() => setShowModal('')} style={{ background: 'none', border: 'none', color: '#6b7a8d', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>
            <pre style={{ fontFamily: '"Roboto Mono", monospace', fontSize: 11, color: '#e2e8f0', overflowX: 'auto', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(modalData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!eventoId && !loadingEv && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
          ⬆ Selecciona un evento para ver y gestionar los resultados de sus partidos.
        </div>
      )}
    </div>
  );
}
