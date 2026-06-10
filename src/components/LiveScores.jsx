import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ESTADOS_LIVE = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE']);

function esLive(estado) { return ESTADOS_LIVE.has(estado); }

function fmtFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((d - now) / 86400000);
  if (diffDays <= 0) return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Mañana ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()
    + ' · ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function etiquetaEstado(estado, minuto) {
  if (estado === 'HT')  return 'HT';
  if (estado === 'FT')  return 'FT';
  if (estado === 'AET') return 'AET';
  if (estado === 'PEN') return 'PEN';
  if (estado === 'PST') return 'PST';
  if (estado === 'CANC' || estado === 'ABD') return 'CANC';
  if (esLive(estado) && minuto) return `${minuto}'`;
  return null;
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function TabBtn({ label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      background: active ? '#8dc63f' : 'transparent',
      color: active ? '#0a0d14' : '#6b7a8d',
      fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11,
      border: active ? 'none' : '1px solid #1e2a3a',
      borderRadius: 4, padding: '5px 14px', cursor: 'pointer',
      letterSpacing: '0.07em', transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      {label}
      {badge != null && (
        <span style={{
          background: active ? 'rgba(0,0,0,0.2)' : '#8dc63f20',
          color: active ? '#0a0d14' : '#8dc63f',
          fontSize: 9, borderRadius: 10, padding: '1px 5px', fontWeight: 800,
        }}>{badge}</span>
      )}
    </button>
  );
}

function PartidoCard({ p, onPredict }) {
  const live   = esLive(p.estado);
  const ended  = p.estado === 'FT' || p.estado === 'AET' || p.estado === 'PEN';
  const etiq   = etiquetaEstado(p.estado, p.minuto);
  const tieneOdds = p.cuota_local || p.cuota_empate || p.cuota_visitante;

  return (
    <div style={{
      background: '#0d1520',
      border: `1px solid ${live ? '#8dc63f30' : '#1e2535'}`,
      borderRadius: 10, minWidth: 200, maxWidth: 240, flex: '0 0 auto',
      display: 'flex', flexDirection: 'column',
      boxShadow: live ? '0 0 0 1px #8dc63f18' : 'none',
      overflow: 'hidden',
    }}>
      {/* Header liga */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px 6px', borderBottom: '1px solid #1e2535',
        background: live ? '#0f1f0e' : 'transparent',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {p.liga_logo && (
            <img loading="lazy" decoding="async" src={p.liga_logo} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
          )}
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
            {p.liga}
          </span>
        </div>
        {live ? (
          <span style={{
            fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700,
            color: '#8dc63f', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', background: '#8dc63f',
              display: 'inline-block',
              animation: 'ls-pulse 1.2s ease-in-out infinite',
            }} />
            {etiq ?? 'LIVE'}
          </span>
        ) : etiq ? (
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 9, color: '#4a5568', fontWeight: 700 }}>{etiq}</span>
        ) : (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{fmtFecha(p.fecha_iso)}</span>
        )}
      </div>

      {/* Equipos + marcador */}
      <div style={{ padding: '10px 10px 6px', flex: 1 }}>
        {[
          { nombre: p.equipo_local,     logo: p.logo_local,     goles: p.goles_local },
          { nombre: p.equipo_visitante, logo: p.logo_visitante, goles: p.goles_visitante },
        ].map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: i === 0 ? 5 : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              {t.logo && (
                <img loading="lazy" decoding="async" src={t.logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }}
                  onError={e => e.target.style.display = 'none'} />
              )}
              <span style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500, color: '#c8d6e5',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{t.nombre}</span>
            </div>
            <span style={{
              fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700,
              color: (live || ended) && t.goles != null ? '#fff' : '#4a5568',
              minWidth: 16, textAlign: 'right', flexShrink: 0,
            }}>
              {(live || ended) && t.goles != null ? t.goles : '—'}
            </span>
          </div>
        ))}
      </div>

      {/* Cuotas o botón Guru */}
      {tieneOdds ? (
        <div style={{ display: 'flex', borderTop: '1px solid #1e2535' }}>
          {[
            { l: '1', v: p.cuota_local },
            p.cuota_empate && { l: 'X', v: p.cuota_empate },
            { l: '2', v: p.cuota_visitante },
          ].filter(Boolean).map(o => (
            <button key={o.l} onClick={() => onPredict?.(p)}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                borderRight: o.l !== '2' && o.l !== '1' || (o.l === '1' && p.cuota_empate) ? '1px solid #1e2535' : 'none',
                color: '#c8d6e5', cursor: 'pointer', padding: '7px 4px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#8dc63f15'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568' }}>{o.l}</span>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#8dc63f' }}>{Number(o.v).toFixed(2)}</span>
            </button>
          ))}
        </div>
      ) : p.guru_evento_id ? (
        <div style={{ padding: '6px 8px', borderTop: '1px solid #1e2535' }}>
          <a href={`/eventos/${p.guru_evento_id}`} style={{
            display: 'block', textAlign: 'center',
            fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700,
            color: '#8dc63f', letterSpacing: '0.05em', textDecoration: 'none',
          }}>
            PREDECIR AHORA →
          </a>
        </div>
      ) : null}
    </div>
  );
}

function SkeletonCard() {
  const ph = (w, h) => (
    <div style={{ background: '#ffffff08', borderRadius: 3, width: w, height: h }} />
  );
  return (
    <div style={{
      background: '#0d1520', border: '1px solid #1e2535',
      borderRadius: 10, minWidth: 200, maxWidth: 240, flex: '0 0 auto',
      padding: 10, opacity: 0.6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        {ph(80, 8)} {ph(24, 8)}
      </div>
      {[0, 1].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {ph(100, 12)} {ph(14, 12)}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
        {[0,1,2].map(i => <div key={i} style={{ flex: 1, ...{ background: '#ffffff06', borderRadius: 4, height: 28 } }} />)}
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

const TABS = [
  { key: 'live',     label: 'EN VIVO'  },
  { key: 'hoy',      label: 'HOY'      },
  { key: 'proximos', label: 'PRÓXIMOS' },
];

export default function LiveScores() {
  const [tab,     setTab]     = useState('hoy');
  const [datos,   setDatos]   = useState({});   // { live: [], hoy: [], proximos: [] }
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const cargar = useCallback(async (tipo) => {
    if (datos[tipo]) return; // ya cargado
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get(`/sports/destacados?tipo=${tipo}`);
      setDatos(prev => ({ ...prev, [tipo]: Array.isArray(data) ? data : [] }));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [datos]);

  useEffect(() => { cargar(tab); }, [tab]);

  const partidos = datos[tab] ?? [];
  const liveCount = (datos['live'] ?? []).length;

  return (
    <div style={{ padding: '40px 0 48px', background: '#080c14' }}>
      {/* Keyframe para el punto pulsante */}
      <style>{`
        @keyframes ls-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {/* Título + tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{
              fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700,
              letterSpacing: '0.12em', color: '#fff', margin: 0,
            }}>PARTIDOS DESTACADOS</h2>
            <span style={{ width: 1, height: 18, background: '#1e2a3a', display: 'inline-block' }} />
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>
              Ligas y torneos seleccionados
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {TABS.map(t => (
              <TabBtn
                key={t.key}
                label={t.label}
                active={tab === t.key}
                onClick={() => setTab(t.key)}
                badge={t.key === 'live' && liveCount > 0 ? liveCount : undefined}
              />
            ))}
          </div>
        </div>

        {/* Scroll de cards */}
        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8,
          scrollbarWidth: 'thin', scrollbarColor: '#1e2535 transparent',
        }}>
          {loading
            ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
            : error
            ? (
              <div style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#4a5568',
                padding: '24px 0',
              }}>
                No se pudieron cargar los partidos ahora mismo.
              </div>
            )
            : partidos.length === 0
            ? (
              <div style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#4a5568',
                padding: '24px 0',
              }}>
                {tab === 'live'
                  ? 'No hay partidos en vivo en este momento.'
                  : tab === 'hoy'
                  ? 'No hay partidos hoy en las ligas seleccionadas.'
                  : 'No hay próximos partidos disponibles.'}
              </div>
            )
            : partidos.map(p => (
              <PartidoCard key={p.api_id} p={p} />
            ))
          }
        </div>

        {/* Nota de fuente */}
        {!loading && !error && partidos.length > 0 && (
          <div style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#2d3748',
            marginTop: 10, textAlign: 'right',
          }}>
            Datos vía api-football · Actualización automática cada 15 min
          </div>
        )}
      </div>
    </div>
  );
}
