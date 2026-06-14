/**
 * EventoPartidosManager
 * Modal overlay para configurar tipo, visibilidad y cuotas de cada partido de un evento.
 * Usado desde el panel Promotor y Admin al hacer clic en ⚙ PARTIDOS.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
  zIndex: 1000, display: 'flex', alignItems: 'flex-start',
  justifyContent: 'center', overflowY: 'auto', padding: '28px 12px 48px',
};
const BOX = {
  background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10,
  width: '100%', maxWidth: 860, padding: '28px 28px 32px',
};
const INPUT_S = {
  background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6,
  padding: '8px 12px', color: '#e2e8f0', fontFamily: 'Roboto, sans-serif',
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
};

// ── helpers ─────────────────────────────────────────────────────────────────

function fmtFecha(f) {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Muestra el nombre del equipo; abrevia con iniciales si es muy largo */
function fmtEquipo(nombre, maxLen = 13) {
  if (!nombre) return '?';
  if (nombre.length <= maxLen) return nombre;
  const words = nombre.trim().split(/\s+/);
  if (words.length >= 2) {
    const initials = words.map(w => w[0].toUpperCase()).join('.');
    if (initials.length <= 6) return initials + '.';
  }
  return nombre.slice(0, maxLen - 1) + '…';
}

const TIPO_OPS = [
  { val: 'GURU',    label: '🎯 PREDICCIÓN',    desc: 'Solo preguntas de Predicción', color: '#a78bfa' },
  { val: 'APUESTA', label: '🎲 APUESTA', desc: 'Solo apuestas 1 · X · 2',  color: '#f59e0b' },
  { val: 'AMBOS',   label: '⚡ AMBOS',   desc: 'Predicción + Apuestas',    color: '#8dc63f' },
];

const VIS_OPS = [
  { val: 'PUBLICO',  label: '🌐 PÚBLICO',  desc: 'Accesible para todos',      color: '#8dc63f' },
  { val: 'PRIVADO',  label: '🔒 PRIVADO',  desc: 'Solo con enlace/código',    color: '#f59e0b' },
  { val: 'VIP',      label: '👑 VIP',      desc: 'Solo membresía VIP',        color: '#a78bfa' },
];

const ESTADO_COLOR = {
  PROGRAMADO: { color: '#6b7a8d', bg: '#ffffff10' },
  EN_CURSO:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  FINALIZADO: { color: '#8dc63f', bg: 'rgba(141,198,63,0.12)' },
};

// ── Fila de un partido con config inline ─────────────────────────────────────

function PartidoConfigRow({ partido, onSaved }) {
  const [open,        setOpen]        = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState('');
  const [livePool,    setLivePool]    = useState(null);
  const [loadingPool, setLoadingPool] = useState(false);

  // Valores editables
  const [tipo,    setTipo]    = useState(partido.tipo    || 'GURU');
  const [vis,     setVis]     = useState(partido.visibilidad || 'PUBLICO');
  const [cLocal,  setCLocal]  = useState(partido.cuota_local    ? String(partido.cuota_local)    : '');
  const [cEmpate, setCEmpate] = useState(partido.cuota_empate   ? String(partido.cuota_empate)   : '');
  const [cVisit,  setCVisit]  = useState(partido.cuota_visitante ? String(partido.cuota_visitante) : '');

  const estadoInfo = ESTADO_COLOR[partido.estado] || ESTADO_COLOR.PROGRAMADO;

  const fetchLivePool = useCallback((applyToInputs = false) => {
    setLoadingPool(true);
    api.get(`/partidos/${partido.id}/cuotas-live`)
      .then(r => {
        setLivePool(r.data);
        if (applyToInputs) {
          setCLocal(String(r.data.cuota_local));
          setCEmpate(r.data.cuota_empate ? String(r.data.cuota_empate) : '');
          setCVisit(String(r.data.cuota_visitante));
        } else {
          // Solo completar si están vacíos (no sobreescribir lo que el promotor ya ingresó)
          setCLocal(prev => prev || String(r.data.cuota_local));
          setCEmpate(prev => prev || (r.data.cuota_empate ? String(r.data.cuota_empate) : ''));
          setCVisit(prev => prev || String(r.data.cuota_visitante));
        }
      })
      .catch(() => null)
      .finally(() => setLoadingPool(false));
  }, [partido.id]);

  // Cargar pool al abrir el panel si tiene apuestas
  useEffect(() => {
    if (open && tipo !== 'GURU') fetchLivePool(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const guardar = async () => {
    setMsg('');
    // Validar cuotas cuando el tipo requiere apuestas
    if (tipo !== 'GURU') {
      if (!cLocal || parseFloat(cLocal) < 1.01) {
        setMsg('✗ Ingresa la cuota LOCAL (mínimo 1.01)');
        return;
      }
      if (!cVisit || parseFloat(cVisit) < 1.01) {
        setMsg('✗ Ingresa la cuota VISITANTE (mínimo 1.01)');
        return;
      }
    }
    setSaving(true);
    const payload = { tipo, visibilidad: vis };
    if (tipo !== 'GURU') {
      if (cLocal)  payload.cuota_local      = parseFloat(cLocal);
      if (cEmpate) payload.cuota_empate     = parseFloat(cEmpate);
      if (cVisit)  payload.cuota_visitante  = parseFloat(cVisit);
    }
    try {
      await api.patch(`/partidos/${partido.id}`, payload);
      setMsg('✓ Guardado');
      onSaved?.({ ...partido, ...payload });
      setTimeout(() => setOpen(false), 1400);
    } catch (e) {
      const m = e.response?.data?.message;
      setMsg('✗ ' + (Array.isArray(m) ? m.join(', ') : m || 'Error al guardar'));
    } finally { setSaving(false); }
  };

  const handleTipo = (v) => {
    setTipo(v);
    if (v === 'GURU') {
      setCLocal(''); setCEmpate(''); setCVisit('');
      setLivePool(null);
    } else {
      // Auto-popular desde el pool (BASE: 1.90/3.20/1.90 si no hay apuestas)
      fetchLivePool(false);
    }
  };

  const tipoLabel = TIPO_OPS.find(t => t.val === tipo)?.label || tipo;
  const visLabel  = VIS_OPS.find(v => v.val === vis)?.label  || vis;
  const tipoColor = TIPO_OPS.find(t => t.val === tipo)?.color || '#6b7a8d';
  const visColor  = VIS_OPS.find(v => v.val === vis)?.color  || '#6b7a8d';

  return (
    <div style={{
      background: '#0a0d14', border: `1px solid ${open ? '#a78bfa40' : '#1e2a3a'}`,
      borderRadius: 8, marginBottom: 8, overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* ── Cabecera del partido ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          {/* Badges de estado */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ background: estadoInfo.bg, color: estadoInfo.color, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3, letterSpacing: '0.06em' }}>
              {partido.estado}
            </span>
            {partido.fase && (
              <span style={{ background: '#ffffff08', color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9, padding: '2px 7px', borderRadius: 3 }}>
                {partido.fase.replace(/_/g, ' ')}
              </span>
            )}
            {partido.grupo && (
              <span style={{ background: '#ffffff08', color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9, padding: '2px 7px', borderRadius: 3 }}>
                GRP {partido.grupo}
              </span>
            )}
            {/* Badges de config actual */}
            <span style={{ background: `${tipoColor}18`, color: tipoColor, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3 }}>
              {tipoLabel}
            </span>
            <span style={{ background: `${visColor}18`, color: visColor, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3 }}>
              {visLabel}
            </span>
          </div>

          {/* Equipos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
              {partido.equipo_local || partido.descripcion_local || '?'}
            </span>
            <span style={{ color: '#4a5568', fontFamily: 'Oswald, sans-serif', fontSize: 12 }}>vs</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
              {partido.equipo_visitante || partido.descripcion_visitante || '?'}
            </span>
            {/* Cuotas actuales si aplica */}
            {tipo !== 'GURU' && partido.cuota_local && (
              <span style={{ background: '#f59e0b18', color: '#f59e0b', fontFamily: 'monospace', fontSize: 10, padding: '1px 6px', borderRadius: 3 }}>
                {partido.cuota_local} · {partido.cuota_empate ?? '—'} · {partido.cuota_visitante}
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 3 }}>
            {fmtFecha(partido.fecha)}{partido.sede ? ` · ${partido.sede}` : ''}
          </div>
        </div>

        {/* Botón configurar */}
        <button
          onClick={() => { setOpen(o => !o); setMsg(''); }}
          style={{
            background: open ? 'rgba(167,139,250,0.12)' : '#1e2535',
            color: open ? '#a78bfa' : '#8dc63f',
            fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700,
            padding: '8px 16px', borderRadius: 6,
            border: `1px solid ${open ? '#a78bfa40' : '#8dc63f25'}`,
            cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.04em',
          }}>
          {open ? '▲ CERRAR' : '⚙ CONFIGURAR'}
        </button>
      </div>

      {/* ── Panel de configuración inline ── */}
      {open && (
        <div style={{ borderTop: '1px solid #1e2a3a', padding: '18px 14px 16px', background: '#070a12' }}>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

            {/* ── TIPO ── */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#a78bfa', letterSpacing: '0.1em', marginBottom: 10 }}>
                TIPO DE PARTICIPACIÓN
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TIPO_OPS.map(op => (
                  <button
                    key={op.val}
                    onClick={() => handleTipo(op.val)}
                    style={{
                      background: tipo === op.val ? `${op.color}18` : '#1e2535',
                      color: tipo === op.val ? op.color : '#6b7a8d',
                      border: `1px solid ${tipo === op.val ? `${op.color}50` : '#1e2a3a'}`,
                      borderRadius: 6, padding: '9px 14px', cursor: 'pointer',
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>
                      {tipo === op.val ? '● ' : '○ '}{op.label}
                    </div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: tipo === op.val ? op.color : '#4a5568', marginTop: 2 }}>
                      {op.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── VISIBILIDAD ── */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#8dc63f', letterSpacing: '0.1em', marginBottom: 10 }}>
                VISIBILIDAD / ACCESO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {VIS_OPS.map(op => (
                  <button
                    key={op.val}
                    onClick={() => setVis(op.val)}
                    style={{
                      background: vis === op.val ? `${op.color}18` : '#1e2535',
                      color: vis === op.val ? op.color : '#6b7a8d',
                      border: `1px solid ${vis === op.val ? `${op.color}50` : '#1e2a3a'}`,
                      borderRadius: 6, padding: '9px 14px', cursor: 'pointer',
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>
                      {vis === op.val ? '● ' : '○ '}{op.label}
                    </div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: vis === op.val ? op.color : '#4a5568', marginTop: 2 }}>
                      {op.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── CUOTAS (solo si tipo !== GURU) ── */}
            {tipo !== 'GURU' && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#f59e0b', letterSpacing: '0.1em', marginBottom: 10 }}>
                  CUOTAS 1 · X · 2
                </div>
                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid #f59e0b25', borderRadius: 6, padding: '12px', marginBottom: 10 }}>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#f59e0b90', marginBottom: 8 }}>
                    Multiplica la apuesta ganadora. Mínimo 1.01. Ej: Local 2.10, Empate 3.40, Visitante 2.80
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* LOCAL */}
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 4 }}>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, color: '#00d4ff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          title={partido.equipo_local || partido.descripcion_local}>
                          🏠 {fmtEquipo(partido.equipo_local || partido.descripcion_local)}
                        </div>
                        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', letterSpacing: '0.05em' }}>1 LOCAL</div>
                      </div>
                      <input
                        type="number" step="0.01" min="1.01"
                        value={cLocal}
                        onChange={e => setCLocal(e.target.value)}
                        placeholder="2.10"
                        style={{ ...INPUT_S, fontFamily: 'monospace', textAlign: 'center', borderColor: '#00d4ff30' }}
                      />
                    </div>
                    {/* EMPATE */}
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 4 }}>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, color: '#6b7a8d', lineHeight: 1.2 }}>
                          ⚖ EMPATE
                        </div>
                        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', letterSpacing: '0.05em' }}>X</div>
                      </div>
                      <input
                        type="number" step="0.01" min="1.01"
                        value={cEmpate}
                        onChange={e => setCEmpate(e.target.value)}
                        placeholder="3.40"
                        style={{ ...INPUT_S, fontFamily: 'monospace', textAlign: 'center' }}
                      />
                    </div>
                    {/* VISITANTE */}
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 4 }}>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, color: '#f59e0b', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          title={partido.equipo_visitante || partido.descripcion_visitante}>
                          ✈ {fmtEquipo(partido.equipo_visitante || partido.descripcion_visitante)}
                        </div>
                        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', letterSpacing: '0.05em' }}>2 VISITANTE</div>
                      </div>
                      <input
                        type="number" step="0.01" min="1.01"
                        value={cVisit}
                        onChange={e => setCVisit(e.target.value)}
                        placeholder="2.80"
                        style={{ ...INPUT_S, fontFamily: 'monospace', textAlign: 'center', borderColor: '#f59e0b30' }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', lineHeight: 1.5 }}>
                  💡 Deja vacío una cuota si no aplica (ej: eliminatoria sin empate).
                </div>

                {/* Pool en vivo */}
                {livePool && (
                  <div style={{ background: '#0a0d1460', border: '1px solid #f59e0b20', borderRadius: 5, padding: '10px 12px', marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, color: '#6b7a8d', letterSpacing: '0.1em' }}>
                        POOL {livePool.tipo} — {Number(livePool.pool_total).toFixed(0)} cr · CASA {(livePool.margen * 100).toFixed(0)}%
                      </span>
                      <button
                        onClick={() => fetchLivePool(livePool.tipo === 'DINAMICA')}
                        disabled={loadingPool}
                        style={{ background: 'none', border: 'none', color: loadingPool ? '#4a5568' : '#f59e0b', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}
                        title="Actualizar cuotas desde el pool"
                      >
                        {loadingPool ? '⟳' : '↺'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { key: '1', label: 'LOCAL',     monto: livePool.distribucion?.local     ?? 0, cuota: livePool.cuota_local,     equipo: partido.equipo_local     || partido.descripcion_local,     color: '#00d4ff' },
                        { key: 'X', label: 'EMPATE',    monto: livePool.distribucion?.empate    ?? 0, cuota: livePool.cuota_empate,    equipo: null,                                                       color: '#6b7a8d' },
                        { key: '2', label: 'VISITANTE', monto: livePool.distribucion?.visitante ?? 0, cuota: livePool.cuota_visitante, equipo: partido.equipo_visitante || partido.descripcion_visitante, color: '#f59e0b' },
                      ].map(o => {
                        const pct = livePool.pool_total > 0
                          ? Math.round((Number(o.monto) / Number(livePool.pool_total)) * 100)
                          : 33;
                        return (
                          <div key={o.key} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 8, fontWeight: 700, color: o.color, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                              title={o.equipo}>
                              {o.equipo ? fmtEquipo(o.equipo, 9) : 'EMPATE'}
                            </div>
                            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 7, color: '#4a5568', marginBottom: 3 }}>{o.key} {o.label}</div>
                            <div style={{ background: '#1e2a3a', borderRadius: 2, height: 3, overflow: 'hidden', marginBottom: 3 }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', transition: 'width 0.4s' }} />
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#f59e0b' }}>{Number(o.monto).toFixed(0)} cr</div>
                            <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#8dc63f' }}>×{o.cuota ? Number(o.cuota).toFixed(2) : '—'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Acciones ── */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid #1e2a3a' }}>
            <button
              onClick={guardar}
              disabled={saving}
              style={{
                background: saving ? '#1e2535' : '#8dc63f',
                color: saving ? '#4a5568' : '#0a0d14',
                fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
                padding: '10px 24px', borderRadius: 6, border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '0.05em',
              }}
            >
              {saving ? 'GUARDANDO...' : '💾 GUARDAR CONFIGURACIÓN'}
            </button>
            <button
              onClick={() => { setOpen(false); setMsg(''); }}
              style={{
                background: 'transparent', color: '#6b7a8d',
                fontFamily: 'Oswald, sans-serif', fontSize: 12,
                padding: '10px 16px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: 'pointer',
              }}
            >
              CANCELAR
            </button>
            {msg && (
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: msg.startsWith('✓') ? '#8dc63f' : '#f87171' }}>
                {msg}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal (modal overlay) ─────────────────────────────────────

export default function EventoPartidosManager({ eventoId, eventoNombre, onClose }) {
  const [partidos, setPartidos] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtro,   setFiltro]   = useState('');
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(() => {
    setLoading(true);
    api.get(`/eventos/${eventoId}`)
      .then(r => setPartidos(r.data?.partidos || []))
      .catch(() => setPartidos([]))
      .finally(() => setLoading(false));
  }, [eventoId]);

  useEffect(() => { cargar(); }, [cargar]);

  // Actualizar un partido localmente cuando se guarda
  const handleSaved = (updated) => {
    setPartidos(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
  };

  const filtrados = partidos.filter(p => {
    const matchEstado = !filtro || p.estado === filtro;
    const q = busqueda.toLowerCase();
    const matchBusqueda = !q || (
      p.equipo_local?.toLowerCase().includes(q) ||
      p.equipo_visitante?.toLowerCase().includes(q) ||
      p.descripcion_local?.toLowerCase().includes(q) ||
      p.descripcion_visitante?.toLowerCase().includes(q)
    );
    return matchEstado && matchBusqueda;
  });

  // Resumen de configuración
  const resumen = {
    total:   partidos.length,
    guru:    partidos.filter(p => p.tipo === 'GURU' || !p.tipo).length,
    apuesta: partidos.filter(p => p.tipo === 'APUESTA').length,
    ambos:   partidos.filter(p => p.tipo === 'AMBOS').length,
    publicos: partidos.filter(p => p.visibilidad === 'PUBLICO' || !p.visibilidad).length,
    vip:      partidos.filter(p => p.visibilidad === 'VIP').length,
  };

  return (
    <div style={OVERLAY} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={BOX}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#8dc63f', letterSpacing: '0.12em', marginBottom: 4 }}>
              CONFIGURACIÓN DE PARTIDOS
            </div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: '#fff', margin: 0 }}>
              {eventoNombre || 'Evento'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #1e2a3a', borderRadius: 6, color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, padding: '8px 14px', cursor: 'pointer' }}>
            ✕ CERRAR
          </button>
        </div>

        {/* Resumen */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          {[
            { label: 'TOTAL',    val: resumen.total,   color: '#6b7a8d' },
            { label: 'PREDICCIÓN', val: resumen.guru,    color: '#a78bfa' },
            { label: 'APUESTA',  val: resumen.apuesta, color: '#f59e0b' },
            { label: 'AMBOS',    val: resumen.ambos,   color: '#8dc63f' },
            { label: 'PÚBLICOS', val: resumen.publicos, color: '#00d4ff' },
            { label: 'VIP',      val: resumen.vip,     color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar equipo..."
            style={{ ...INPUT_S, maxWidth: 220, fontSize: 12 }}
          />
          {['', 'PROGRAMADO', 'EN_CURSO', 'FINALIZADO'].map(e => (
            <button key={e} onClick={() => setFiltro(e)}
              style={{
                background: filtro === e ? '#8dc63f' : '#1e2535',
                color: filtro === e ? '#0a0d14' : '#6b7a8d',
                fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700,
                padding: '7px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', letterSpacing: '0.05em',
              }}>
              {e || `TODOS (${partidos.length})`}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>
            Cargando partidos...
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
            No hay partidos {filtro ? `con estado "${filtro}"` : 'en este evento'}.
          </div>
        ) : (
          <div>
            {filtrados.map(p => (
              <PartidoConfigRow key={p.id} partido={p} onSaved={handleSaved} />
            ))}
          </div>
        )}

        {/* Info */}
        <div style={{ marginTop: 20, background: 'rgba(141,198,63,0.05)', border: '1px solid #8dc63f20', borderRadius: 6, padding: '12px 14px', fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', lineHeight: 1.7 }}>
          <strong style={{ color: '#8dc63f' }}>⚡ AMBOS</strong> — El partido tiene preguntas de Predicción <em>y</em> apuestas 1·X·2. Las cuotas se multiplican por el monto apostado.<br />
          <strong style={{ color: '#a78bfa' }}>👑 VIP</strong> — Solo los usuarios con membresía activa pueden ver y participar en este partido.<br />
          <strong style={{ color: '#f59e0b' }}>🔒 PRIVADO</strong> — No aparece en el listado público; solo accesible con enlace directo.
        </div>
      </div>
    </div>
  );
}
