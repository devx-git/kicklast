import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';

const TIER_MAP = {
  1: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', label: 'S' },
  2: { color: '#94A3B8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', label: 'A' },
  3: { color: '#CD7C3B', bg: 'rgba(205,124,59,0.15)', border: 'rgba(205,124,59,0.3)', label: 'B' },
};

function getTier(rank) {
  if (rank <= 3) return TIER_MAP[rank];
  if (rank <= 10) return { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', label: 'A' };
  if (rank <= 30) return { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.15)', label: 'B' };
  return { color: '#6b7a8d', bg: 'rgba(107,122,141,0.06)', border: 'rgba(107,122,141,0.12)', label: 'C' };
}

function getInitials(nombre) {
  if (!nombre) return '??';
  return nombre.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase() || '??';
}

export default function Leaderboard() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const payload = authService.getPayload();

  useEffect(() => {
    dataService.getEventos(50).then(evs => {
      // Sort events by acumulado_actual desc — use as "leaderboard" of active events
      const sorted = [...evs].sort((a, b) => Number(b.acumulado_actual || 0) - Number(a.acumulado_actual || 0));
      setEventos(sorted);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Build player-like rows from events (each event shows as a "battle zone")
  const rows = eventos.map((e, i) => ({
    rank: i + 1,
    nombre: e.nombre,
    acumulado: Number(e.acumulado_actual || 0),
    estado: e.estado,
    costo_vidas: e.costo_vidas,
    id: e.id,
  }));

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div style={{ background: '#07080f', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        .lb-row-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); margin-bottom:4px; background:rgba(10,14,26,0.7); cursor:pointer; transition:all 0.2s; text-decoration:none; }
        .lb-row-item:hover { background:rgba(20,28,48,0.9); border-color:rgba(0,212,255,0.2); }
      `}</style>

      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg,#0a1428 0%,#07080f 100%)', padding: '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: 4, marginBottom: 8 }}>◈ RANKING GLOBAL · TEMPORADA S06</div>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(22px,5vw,36px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>
          BLACK<span style={{ color: '#00d4ff' }}>LIST</span>
        </h1>
        <p style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 12, marginTop: 8 }}>Los eventos más disputados del Mundial 2026</p>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px 60px' }}>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 20 }}>
          {[
            { label: 'EVENTOS', val: eventos.length, color: '#60A5FA' },
            { label: 'POZO TOTAL', val: `$${(eventos.reduce((s,e)=>s+Number(e.acumulado_actual||0),0)/1e6).toFixed(1)}M`, color: '#F59E0B' },
            { label: 'TEMPORADA', val: 'S06', color: '#f87171' },
            { label: 'EN VIVO', val: '●', color: '#34D399' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(10,14,26,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 7, letterSpacing: 1, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#8dc63f', fontFamily: 'Oswald, sans-serif' }}>CARGANDO RANKING...</div>
        )}

        {!loading && (
          <>
            {/* Podium top 3 */}
            {top3.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ color: '#F59E0B', fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: 3 }}>🏆 PODIO DE ÉLITE</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {[top3[1], top3[0], top3[2]].filter(Boolean).map((row) => {
                    const cfg = row.rank === 1
                      ? { color: '#F59E0B', label: 'MOST WANTED', num: '#1' }
                      : row.rank === 2
                      ? { color: '#94A3B8', label: '2ND PLACE', num: '#2' }
                      : { color: '#CD7C3B', label: '3RD PLACE', num: '#3' };
                    return (
                      <a key={row.id} href={`/eventos/${row.id}`} style={{ flex: 1, background: 'rgba(10,14,26,0.95)', border: `1px solid ${cfg.color}33`, borderTop: `2px solid ${cfg.color}`, borderRadius: 10, padding: '14px 12px', cursor: 'pointer', textDecoration: 'none', display: 'block' }}>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 900, color: cfg.color, display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span>{cfg.num}</span>
                          <span style={{ fontSize: 7, letterSpacing: 1.5, padding: '3px 7px', background: `${cfg.color}18`, border: `1px solid ${cfg.color}33`, color: cfg.color, borderRadius: 4 }}>{cfg.label}</span>
                        </div>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#fff', fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>{row.nombre}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '7px 8px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 2 }}>POZO</div>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, color: cfg.color }}>${Number(row.acumulado).toLocaleString('es-CO')}</div>
                          </div>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '7px 8px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 2 }}>ESTADO</div>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, color: '#fff' }}>{row.estado || '—'}</div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </>
            )}

            {/* Rest of events */}
            {rest.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ color: '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: 3 }}>⚔ RANKING 4 — {rows.length}</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
                {rest.map((row, i) => {
                  const tier = getTier(row.rank);
                  return (
                    <a key={row.id} href={`/eventos/${row.id}`} className="lb-row-item" style={{ animation: `fadeIn 0.2s ease ${i * 0.02}s both` }}>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.2)', width: 28, flexShrink: 0, textAlign: 'center' }}>
                        {String(row.rank).padStart(2, '0')}
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${tier.color}`, background: `${tier.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 900, color: tier.color, flexShrink: 0 }}>
                        {getInitials(row.nombre)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.nombre}</div>
                        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 1, marginTop: 1 }}>{row.estado || 'ACTIVO'}</div>
                      </div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, color: '#F59E0B', flexShrink: 0, textAlign: 'right' }}>
                        ${(row.acumulado / 1e6).toFixed(1)}M
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 4, fontSize: 9, fontWeight: 900, fontFamily: 'Oswald, sans-serif', background: tier.bg, color: tier.color, border: `1px solid ${tier.border}`, flexShrink: 0 }}>
                        {tier.label}
                      </span>
                    </a>
                  );
                })}
              </>
            )}

            {/* Player leaderboard teaser */}
            <div style={{ marginTop: 32, background: 'rgba(10,14,26,0.9)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🏅</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: '#00d4ff', marginBottom: 6 }}>RANKING DE JUGADORES</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>El ranking global de jugadores estará disponible cuando el torneo avance.<br />¡Haz tus predicciones para aparecer aquí!</div>
              <a href="/" style={{ display: 'inline-block', marginTop: 16, background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 24px', borderRadius: 6, textDecoration: 'none' }}>
                PREDECIR AHORA
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
