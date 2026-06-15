import { useState, useEffect } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ── Mundial 2026: liga_id en api-football ─────────────────────────────────────
const MUNDIAL_LIGA_ID = 1;
const MUNDIAL_TEMPORADA = 2026;

// Grupos A–L hardcodeados como fallback si la API no tiene datos aún
const GRUPOS_LETRAS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

// ── Puntos de forma (W/D/L) ───────────────────────────────────────────────────
function FormaChip({ forma }) {
  if (!forma) return <span style={{ color: '#2a3550', fontFamily: 'monospace', fontSize: 10 }}>—</span>;
  return (
    <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
      {forma.slice(-5).split('').map((f, i) => (
        <span key={i} title={f === 'W' ? 'Victoria' : f === 'D' ? 'Empate' : 'Derrota'} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: f === 'W' ? '#8dc63f' : f === 'D' ? '#f59e0b' : '#f87171',
          display: 'inline-block', flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

// ── Tabla de un grupo ─────────────────────────────────────────────────────────
function TablaGrupo({ letra, equipos }) {
  const hayPartidos = equipos.some(e => e.pj > 0);

  return (
    <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10, overflow: 'hidden' }}>
      {/* Encabezado del grupo */}
      <div style={{ background: '#161e2e', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#8dc63f', letterSpacing: '0.1em' }}>
          GRUPO {letra}
        </div>
        {!hayPartidos && (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', background: '#1e2535', borderRadius: 4, padding: '2px 8px' }}>
            Sin partidos jugados aún
          </span>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
              {['#', 'EQUIPO', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'PTS', 'FORMA'].map(h => (
                <th key={h} style={{
                  color: '#4a5568', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.08em', padding: '7px 10px',
                  textAlign: h === 'EQUIPO' ? 'left' : 'center', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipos.map((e, i) => {
              const pos = i + 1;
              const isTop2  = pos <= 2;
              const isTer   = pos === 3;
              const rowBg   = isTop2 ? 'rgba(141,198,63,0.06)' : isTer ? 'rgba(245,158,11,0.05)' : 'rgba(248,113,113,0.03)';
              const border  = isTop2 ? '#8dc63f' : isTer ? '#f59e0b' : '#f87171';
              const ptsCol  = isTop2 ? '#8dc63f' : isTer ? '#f59e0b' : '#6b7a8d';

              return (
                <tr key={e.equipo + i} style={{ borderBottom: '1px solid #1e2a3a20', background: rowBg, borderLeft: `3px solid ${border}` }}>
                  {/* Posición */}
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, color: ptsCol }}>{pos}</td>
                  {/* Equipo */}
                  <td style={{ padding: '9px 10px', textAlign: 'left', minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {e.logo
                        ? <img src={e.logo} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} onError={ev => { ev.target.style.display = 'none'; }} />
                        : <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#1e2535', flexShrink: 0 }} />
                      }
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                        {e.equipo}
                      </span>
                    </div>
                  </td>
                  {/* Stats */}
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: '#6b7a8d' }}>{e.pj}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: '#8dc63f' }}>{e.g}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: '#6b7a8d' }}>{e.e_}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: '#f87171' }}>{e.p}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: '#6b7a8d' }}>{e.gf}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: '#6b7a8d' }}>{e.gc}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: e.dg > 0 ? '#8dc63f' : e.dg < 0 ? '#f87171' : '#6b7a8d' }}>
                    {e.dg > 0 ? `+${e.dg}` : e.dg}
                  </td>
                  {/* PTS */}
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: ptsCol }}>{e.pts}</span>
                  </td>
                  {/* Forma */}
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <FormaChip forma={e.forma} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Campeonatos() {
  const [campeonatos,     setCampeonatos]     = useState([]);
  const [eventos,         setEventos]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selected,        setSelected]        = useState(null);
  const [gruposMap,       setGruposMap]       = useState({});   // { 'A': [{...},...], ... }
  const [grupoActivo,     setGrupoActivo]     = useState('A');
  const [loadingStandings, setLoadingStandings] = useState(true);

  const isLoggedIn  = authService.isAuthenticated();
  const predecirHref = isLoggedIn ? '/hub' : '/login';

  useEffect(() => {
    // Fase 1: campeonatos + eventos (necesitamos el evento_id del Mundial para el fallback DB)
    Promise.all([
      api.get('/campeonatos'),
      api.get('/eventos?limit=100&estado=ACTIVO'),
    ]).then(([c, e]) => {
      const camps  = Array.isArray(c.data) ? c.data : [];
      const evData = Array.isArray(e.data) ? e.data : (Array.isArray(e.data?.data) ? e.data.data : []);
      const evs    = evData.filter(ev => ev.estado === 'ACTIVO' || ev.activo);
      setCampeonatos(camps);
      setEventos(evs);
      setLoading(false);

      // Busca el evento del Mundial para pasarlo como evento_id al standings
      const mundialCamp = camps.find(c => /mundial/i.test(c.nombre));
      const mundialEv   = mundialCamp ? evs.find(ev => ev.campeonato_id === mundialCamp.id) : null;

      // Fase 2: standings — pasa evento_id si lo encontró (habilita fallback DB preciso)
      const params = new URLSearchParams({
        liga_id:   String(MUNDIAL_LIGA_ID),
        temporada: String(MUNDIAL_TEMPORADA),
      });
      if (mundialEv?.id) params.set('evento_id', mundialEv.id);

      return api.get(`/sports/standings?${params}`);
    }).then(r => {
      const data = Array.isArray(r.data) ? r.data : [];
      const map  = {};
      data.forEach(grupo => {
        if (!Array.isArray(grupo) || grupo.length === 0) return;
        const raw   = grupo[0]?.grupo || '';
        const letra = raw.replace(/group\s*/i, '').trim().toUpperCase() || null;
        if (letra) map[letra] = grupo;
      });
      setGruposMap(map);
      const primera = Object.keys(map).sort()[0];
      if (primera) setGrupoActivo(primera);
    }).catch(() => {}).finally(() => setLoadingStandings(false));
  }, []);

  const eventosDeCamp = (campId) => eventos.filter(e => e.campeonato_id === campId);

  // Solo campeonatos que tienen al menos 1 evento activo
  const campsConEventos = campeonatos.filter(c => eventosDeCamp(c.id).length > 0);

  // Letras de grupos disponibles (A–L)
  const letrasDisponibles = Object.keys(gruposMap).sort();
  // Grupos activos del selector
  const equiposActivos = gruposMap[grupoActivo] || [];

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px 64px' }}>

        {/* ── Título ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 8 }}>TORNEOS</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>CAMPEONATOS</h1>
          <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginTop: 8 }}>
            Torneos activos con eventos disponibles para predecir.
          </p>
        </div>

        {/* ── Lista de campeonatos con eventos ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2].map(i => <div key={i} style={{ background: '#161e2e', borderRadius: 12, height: 80, opacity: 0.4 }} />)}
          </div>
        ) : campsConEventos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
            No hay campeonatos con eventos activos en este momento.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {campsConEventos.map(c => {
              const evs    = eventosDeCamp(c.id);
              const isOpen = selected === c.id;
              return (
                <div key={c.id} style={{ background: '#161e2e', border: `1px solid ${isOpen ? '#8dc63f40' : '#1e2a3a'}`, borderRadius: 12, overflow: 'hidden' }}>
                  {/* Header */}
                  <button
                    onClick={() => setSelected(isOpen ? null : c.id)}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        {c.activo && <span style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.08em' }}>ACTIVO</span>}
                        <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11 }}>{c.deporte?.nombre || 'Fútbol'}</span>
                      </div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff' }}>{c.nombre}</div>
                      {c.promotor?.nombre && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginTop: 2 }}>{c.promotor.nombre}</div>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 700, color: '#8dc63f' }}>{evs.length}</div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>eventos</div>
                      <div style={{ color: '#8dc63f', fontSize: 16, marginTop: 6 }}>{isOpen ? '▲' : '▼'}</div>
                    </div>
                  </button>

                  {/* Eventos expandidos */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #1e2a3a' }}>
                      {evs.map((ev, i) => (
                        <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: i < evs.length - 1 ? '1px solid #1e2a3a' : 'none', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 600, color: '#fff' }}>
                              {ev.equipo_local && ev.equipo_visitante ? `${ev.equipo_local} vs ${ev.equipo_visitante}` : ev.nombre}
                            </div>
                            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginTop: 2 }}>
                              {ev.estado || 'ACTIVO'}
                              {ev.fecha_evento && ' · ' + new Date(ev.fecha_evento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {Number(ev.acumulado_base) > 0 && (
                              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>
                                {Number(ev.acumulado_base).toLocaleString('es-CO')} cr
                              </span>
                            )}
                            <a href={`/eventos/${ev.id}`} style={{ background: '#1e2535', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 14px', borderRadius: 4, textDecoration: 'none', border: '1px solid #8dc63f30', letterSpacing: '0.05em' }}>
                              PREDECIR →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Sección: Tabla de posiciones Mundial 2026 ── */}
        <div style={{ marginTop: 56 }}>
          {/* Título sección */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 6 }}>
                FASE DE GRUPOS
              </div>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>
                TABLA DE POSICIONES
              </h2>
              <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                Mundial 2026 · 12 grupos (A–L) · Clasifican: 1°, 2° directo + 8 mejores 3°
              </p>
            </div>
            {/* Leyenda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
              {[
                { color: '#8dc63f', label: '1° y 2° — Clasifican directo' },
                { color: '#f59e0b', label: '3° — Mejor de 12 grupos (×8)' },
                { color: '#f87171', label: '4° — Eliminado' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs de grupo A–L ── */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20 }}>
            {(letrasDisponibles.length > 0 ? letrasDisponibles : GRUPOS_LETRAS).map(letra => (
              <button
                key={letra}
                onClick={() => setGrupoActivo(letra)}
                style={{
                  background: grupoActivo === letra ? '#8dc63f' : '#161e2e',
                  color: grupoActivo === letra ? '#0a0d14' : '#6b7a8d',
                  fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700,
                  padding: '7px 14px', borderRadius: 5,
                  border: `1px solid ${grupoActivo === letra ? '#8dc63f' : '#1e2a3a'}`,
                  cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.15s',
                  opacity: gruposMap[letra] ? 1 : 0.4,
                }}
              >
                {letra}
              </button>
            ))}
          </div>

          {/* ── Tabla del grupo activo ── */}
          {loadingStandings ? (
            <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10, padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#8dc63f', letterSpacing: '0.1em' }}>Cargando tabla...</div>
            </div>
          ) : equiposActivos.length > 0 ? (
            <TablaGrupo letra={grupoActivo} equipos={equiposActivos} />
          ) : (
            <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10, padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: '#6b7a8d', marginBottom: 8 }}>
                GRUPO {grupoActivo}
              </div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#4a5568' }}>
                Sin datos disponibles para este grupo aún.
              </div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#2a3550', marginTop: 8 }}>
                Los resultados aparecerán aquí una vez que comiencen los partidos.
              </div>
            </div>
          )}

          {/* Nota de desempate */}
          <div style={{ marginTop: 16, background: 'rgba(141,198,63,0.04)', border: '1px solid #8dc63f15', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#8dc63f', letterSpacing: '0.08em', marginBottom: 6 }}>
              CRITERIOS DE DESEMPATE (en caso de igual puntos)
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', lineHeight: 1.7 }}>
              1. Puntos entre sí &nbsp;·&nbsp; 2. Diferencia de goles entre sí &nbsp;·&nbsp; 3. Goles a favor entre sí &nbsp;·&nbsp;
              4. Diferencia de goles general &nbsp;·&nbsp; 5. Goles a favor general &nbsp;·&nbsp;
              6. Juego limpio (tarjetas) &nbsp;·&nbsp; 7. Ranking FIFA
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
