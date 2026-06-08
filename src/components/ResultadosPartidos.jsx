/**
 * ResultadosPartidos — muestra scores en vivo y resultados finales
 * Consume GET /partidos?eventoId=X o GET /partidos/en-vivo desde el backend
 * (que a su vez usa api-football via cron jobs)
 */
import { useState, useEffect } from 'react';
import api from '../services/api';

const ESTADO_CONFIG = {
  EN_VIVO:    { label: '● EN VIVO', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', blink: true },
  FINALIZADO: { label: 'FIN',       color: '#8dc63f', bg: 'rgba(141,198,63,0.1)',  blink: false },
  PENDIENTE:  { label: 'PRÓXIMO',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  blink: false },
  SUSPENDIDO: { label: 'SUSP.',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  blink: false },
  CANCELADO:  { label: 'CANCEL.',   color: '#6b7a8d', bg: '#ffffff08',             blink: false },
};

export default function ResultadosPartidos({ eventoId, limit = 10, compact = false }) {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    load();
    // Refrescar cada 60s si hay partidos en vivo
    const interval = setInterval(() => {
      const hayVivos = partidos.some(p => p.estado === 'EN_VIVO');
      if (hayVivos) load();
    }, 60000);
    return () => clearInterval(interval);
  }, [eventoId]);

  async function load() {
    try {
      let url = eventoId ? `/partidos?eventoId=${eventoId}&limit=${limit}` : `/partidos/en-vivo?limit=${limit}`;
      const { data } = await api.get(url);
      const arr = Array.isArray(data) ? data : data?.data || data?.partidos || [];
      setPartidos(arr);
      setLastUpdate(new Date());
    } catch {
      // Silencioso — no romper el layout si falla
    }
    setLoading(false);
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: '#161e2e', borderRadius: 8, height: compact ? 48 : 64, opacity: 0.4 }} />
      ))}
    </div>
  );

  if (partidos.length === 0) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.12em' }}>
          RESULTADOS EN TIEMPO REAL
        </div>
        {lastUpdate && (
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>
            Act. {lastUpdate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            <button onClick={load} style={{ background: 'none', border: 'none', color: '#6b7a8d', cursor: 'pointer', fontSize: 10, padding: 0 }}>↻ Actualizar</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8 }}>
        {partidos.map(p => <PartidoCard key={p.id} p={p} compact={compact} />)}
      </div>
    </div>
  );
}

function PartidoCard({ p, compact }) {
  const cfg = ESTADO_CONFIG[p.estado] || ESTADO_CONFIG.PENDIENTE;
  const gL = p.goles_local ?? p.score_local ?? null;
  const gV = p.goles_visitante ?? p.score_visitante ?? null;
  const hayScore = gL !== null && gV !== null;
  const fecha = p.fecha ? new Date(p.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
  const minuto = p.minuto ? `${p.minuto}'` : '';

  if (compact) {
    return (
      <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ background: cfg.bg, color: cfg.color, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3, whiteSpace: 'nowrap' }}>
          {cfg.label}{minuto && ` ${minuto}`}
        </span>
        <span style={{ flex: 1, fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c0cad8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {p.equipo_local} vs {p.equipo_visitante}
        </span>
        {hayScore && (
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
            {gL} - {gV}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: cfg.bg, color: cfg.color, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 3, animation: cfg.blink ? 'pulse 1.5s ease-in-out infinite' : 'none' }}>
            {cfg.label}
          </span>
          {minuto && (
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#ef4444', fontWeight: 700 }}>{minuto}</span>
          )}
        </div>
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{fecha}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: hayScore && gL > gV ? '#8dc63f' : '#fff' }}>
            {p.equipo_local}
          </div>
          {p.liga && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 2 }}>{p.liga}</div>}
        </div>

        <div style={{ textAlign: 'center', minWidth: 70 }}>
          {hayScore ? (
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {gL}<span style={{ color: '#4a5568', margin: '0 4px' }}>-</span>{gV}
            </div>
          ) : (
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#4a5568' }}>VS</div>
          )}
          {p.tiempo_extra && (
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#f59e0b', marginTop: 2 }}>+{p.tiempo_extra}'</div>
          )}
        </div>

        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: hayScore && gV > gL ? '#8dc63f' : '#fff' }}>
            {p.equipo_visitante}
          </div>
        </div>
      </div>

      {/* Estadísticas extras si existen */}
      {(p.estadisticas || p.stats) && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1e2a3a', display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(p.estadisticas || p.stats || {}).slice(0, 4).map(([k, v]) => (
            <div key={k} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, color: '#c0cad8' }}>{v}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
