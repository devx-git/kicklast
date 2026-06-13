import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}
function horaLocal(iso) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const FILTROS = [
  { key: 'hoy',  label: 'HOY'           },
  { key: 'ayer', label: 'AYER'          },
  { key: '7d',   label: 'ÚLTIMOS 7 DÍAS' },
  { key: '30d',  label: 'ÚLTIMOS 30 DÍAS'},
];

const ESTADO_LABEL = { FT: 'FT', AET: 'Prórroga', PEN: 'Penaltis' };
const ESTADO_COLOR = { FT: '#4a5568', AET: '#f59e0b', PEN: '#a78bfa' };

// Ligas con soporte de standings — id API-football → nombre display
const LIGAS_STANDINGS = [
  { id: 1,   label: '🌍 Mundial 2026',    temporada: 2026 },
  { id: 2,   label: '⭐ Champions League', temporada: 2025 },
  { id: 39,  label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',  temporada: 2024 },
  { id: 140, label: '🇪🇸 La Liga',         temporada: 2024 },
  { id: 135, label: '🇮🇹 Serie A',         temporada: 2024 },
  { id: 78,  label: '🇩🇪 Bundesliga',      temporada: 2024 },
  { id: 61,  label: '🇫🇷 Ligue 1',        temporada: 2024 },
  { id: 13,  label: '🏆 Copa Libertadores',temporada: 2025 },
  { id: 239, label: '🇨🇴 Liga BetPlay',    temporada: 2025 },
];

// ─── FilaPartido ──────────────────────────────────────────────────────────────

function FilaPartido({ p }) {
  const estLabel = ESTADO_LABEL[p.estado] || p.estado;
  const estColor = ESTADO_COLOR[p.estado] || '#4a5568';
  const localGana     = p.goles_local > p.goles_visitante;
  const visitanteGana = p.goles_visitante > p.goles_local;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 72px 1fr 80px',
      alignItems: 'center', gap: 0, padding: '9px 16px',
      borderBottom: '1px solid #0f1620', cursor: 'default',
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#0a0e1a'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingRight: 8 }}>
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13,
          color: localGana ? '#fff' : '#8b9bb4', fontWeight: localGana ? 600 : 400,
          textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.equipo_local}
        </span>
        {p.logo_local && (
          <img loading="lazy" src={p.logo_local} alt="" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }}
            onError={e => e.target.style.display = 'none'} />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 900,
            color: localGana ? '#fff' : '#6b7a8d', minWidth: 18, textAlign: 'right' }}>
            {p.goles_local ?? '—'}
          </span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#2d3748' }}>:</span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 900,
            color: visitanteGana ? '#fff' : '#6b7a8d', minWidth: 18, textAlign: 'left' }}>
            {p.goles_visitante ?? '—'}
          </span>
        </div>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 8, fontWeight: 700,
          color: estColor, letterSpacing: '0.04em' }}>{estLabel}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
        {p.logo_visitante && (
          <img loading="lazy" src={p.logo_visitante} alt="" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }}
            onError={e => e.target.style.display = 'none'} />
        )}
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13,
          color: visitanteGana ? '#fff' : '#8b9bb4', fontWeight: visitanteGana ? 600 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.equipo_visitante}
        </span>
      </div>

      <div style={{ textAlign: 'right' }}>
        {p.guru_evento_id ? (
          <a href={`/eventos/${p.guru_evento_id}`} style={{ fontFamily: 'Oswald, sans-serif',
            fontSize: 9, fontWeight: 700, color: '#8dc63f', textDecoration: 'none',
            letterSpacing: '0.05em', border: '1px solid #8dc63f30', borderRadius: 4, padding: '2px 6px' }}>
            VER EVENTO
          </a>
        ) : (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>
            {horaLocal(p.fecha_iso)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── GrupoLiga (resultados) ───────────────────────────────────────────────────

function GrupoLiga({ liga, logo, pais, partidos }) {
  const [abierto, setAbierto] = useState(true);
  return (
    <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
      <button onClick={() => setAbierto(o => !o)} style={{ width: '100%', background: 'none', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
        borderBottom: abierto ? '1px solid #1a2535' : 'none' }}>
        {logo && <img loading="lazy" src={logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }}
          onError={e => e.target.style.display = 'none'} />}
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
          color: '#c0cad8', letterSpacing: '0.07em', flex: 1, textAlign: 'left' }}>{liga}</span>
        {pais && <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{pais}</span>}
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginLeft: 8 }}>{partidos.length}</span>
        <span style={{ color: '#4a5568', fontSize: 9, marginLeft: 4 }}>{abierto ? '▲' : '▼'}</span>
      </button>
      {abierto && partidos.map(p => <FilaPartido key={p.api_id} p={p} />)}
    </div>
  );
}

// ─── TablaGrupo (posiciones) ──────────────────────────────────────────────────

function TablaGrupo({ equipos }) {
  if (!equipos?.length) return null;
  const nombreGrupo = equipos[0]?.grupo || '';

  return (
    <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      {/* Cabecera del grupo */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1a2535',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
          color: '#8dc63f', letterSpacing: '0.1em' }}>{nombreGrupo.toUpperCase()}</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {['PJ','G','E','P','GF','GC','DG','PTS'].map(h => (
            <span key={h} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568',
              fontWeight: 600, width: h === 'PTS' ? 32 : 24, textAlign: 'center', letterSpacing: '0.04em' }}>
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Filas de equipos */}
      {equipos.map((eq, i) => {
        const clasificado = eq.descripcion?.toLowerCase().includes('qualif') ||
                            eq.descripcion?.toLowerCase().includes('clasif') ||
                            eq.descripcion?.toLowerCase().includes('round of');
        const rowBg = i % 2 === 0 ? 'transparent' : '#0a0e1a';
        const ptColor = clasificado ? '#8dc63f' : '#fff';

        return (
          <div key={eq.equipo || i}
            style={{ display: 'flex', alignItems: 'center', padding: '8px 16px',
              background: rowBg, borderBottom: i < equipos.length - 1 ? '1px solid #0f1620' : 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#141c2a'}
            onMouseLeave={e => e.currentTarget.style.background = rowBg}>

            {/* Posición */}
            <div style={{ width: 22, flexShrink: 0 }}>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700,
                color: clasificado ? '#8dc63f' : '#6b7a8d' }}>{eq.pos}</span>
            </div>

            {/* Logo + nombre */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, paddingRight: 8 }}>
              {eq.logo ? (
                <img loading="lazy" src={eq.logo} alt="" style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <div style={{ width: 20, height: 20, background: '#1e2a3a', borderRadius: '50%', flexShrink: 0 }} />
              )}
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#e2e8f0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {eq.equipo}
              </span>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 2 }}>
              {[eq.pj, eq.g, eq.e_, eq.p, eq.gf, eq.gc,
                (eq.dg > 0 ? `+${eq.dg}` : eq.dg)].map((v, ci) => (
                <span key={ci} style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13,
                  color: ci === 6 && eq.dg > 0 ? '#8dc63f' : ci === 6 && eq.dg < 0 ? '#f87171' : '#8b9bb4',
                  width: 24, textAlign: 'center' }}>
                  {v}
                </span>
              ))}
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 800,
                color: ptColor, width: 32, textAlign: 'center' }}>
                {eq.pts}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonGrupo() {
  return (
    <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: 10, marginBottom: 8, overflow: 'hidden', opacity: 0.5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #1a2535' }}>
        <div style={{ width: 18, height: 18, background: '#ffffff10', borderRadius: '50%' }} />
        <div style={{ height: 12, background: '#ffffff08', borderRadius: 3, width: 160, flex: 1 }} />
        <div style={{ height: 10, background: '#ffffff06', borderRadius: 3, width: 24 }} />
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '1px solid #0f1620' }}>
          <div style={{ width: 20, height: 20, background: '#ffffff08', borderRadius: '50%' }} />
          <div style={{ height: 13, background: '#ffffff06', borderRadius: 3, flex: 1 }} />
          <div style={{ height: 13, background: '#ffffff06', borderRadius: 3, width: 160 }} />
        </div>
      ))}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Resultados() {
  const [vista, setVista]       = useState('resultados');

  // — Resultados —
  const [partidos, setPartidos] = useState([]);
  const [loadingR, setLoadingR] = useState(true);
  const [errorR,   setErrorR]   = useState(false);
  const [filtro,   setFiltro]   = useState('hoy');

  // — Posiciones —
  const [ligaSel,      setLigaSel]      = useState(LIGAS_STANDINGS[0]);
  const [standings,    setStandings]    = useState([]);
  const [loadingS,     setLoadingS]     = useState(false);
  const [errorS,       setErrorS]       = useState(false);
  const [standingsCache, setStandingsCache] = useState({});

  useEffect(() => {
    api.get('/sports/resultados')
      .then(r => setPartidos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setErrorR(true))
      .finally(() => setLoadingR(false));
  }, []);

  // Cargar standings cuando se cambia de liga o se activa la pestaña
  useEffect(() => {
    if (vista !== 'posiciones') return;
    const cacheKey = `${ligaSel.id}_${ligaSel.temporada}`;
    if (standingsCache[cacheKey]) {
      setStandings(standingsCache[cacheKey]);
      return;
    }
    setLoadingS(true);
    setErrorS(false);
    api.get(`/sports/standings?liga_id=${ligaSel.id}&temporada=${ligaSel.temporada}`)
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : [];
        setStandings(data);
        setStandingsCache(prev => ({ ...prev, [cacheKey]: data }));
      })
      .catch(() => setErrorS(true))
      .finally(() => setLoadingS(false));
  }, [vista, ligaSel]);

  // Filtrado client-side de resultados
  const filtrados = useMemo(() => {
    const ahora = new Date();
    if (filtro === 'hoy')  return partidos.filter(p => new Date(p.fecha_iso) >= startOfDay(ahora));
    if (filtro === 'ayer') {
      const ia = daysAgo(1), ih = startOfDay(ahora);
      return partidos.filter(p => { const d = new Date(p.fecha_iso); return d >= ia && d < ih; });
    }
    if (filtro === '7d') return partidos.filter(p => new Date(p.fecha_iso) >= daysAgo(7));
    return partidos;
  }, [partidos, filtro]);

  const grupos = useMemo(() => {
    const map = new Map();
    filtrados.forEach(p => {
      if (!map.has(p.liga)) map.set(p.liga, { liga: p.liga, logo: p.liga_logo, pais: p.pais, partidos: [] });
      map.get(p.liga).partidos.push(p);
    });
    return Array.from(map.values()).sort((a, b) => b.partidos.length - a.partidos.length);
  }, [filtrados]);

  const labelRango = () => {
    if (filtro === 'hoy')  return `Hoy · ${new Date().toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long' })}`;
    if (filtro === 'ayer') return 'Ayer';
    if (filtro === '7d')   return 'Últimos 7 días';
    return 'Últimos 30 días';
  };

  return (
    <div style={{ background: '#08090f', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(180deg,#0d1520 0%,#08090f 100%)',
        borderBottom: '1px solid #1e2a3a', padding: '28px 20px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>🏆</span>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900,
              color: '#fff', margin: 0, letterSpacing: '0.06em' }}>RESULTADOS & POSICIONES</h1>
          </div>

          {/* Tabs principales */}
          <div style={{ display: 'flex', gap: 0, marginTop: 20, borderBottom: '1px solid #1e2a3a' }}>
            {[
              { key: 'resultados', label: '📅 RESULTADOS' },
              { key: 'posiciones', label: '📊 POSICIONES' },
            ].map(t => (
              <button key={t.key} onClick={() => setVista(t.key)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700,
                color: vista === t.key ? '#8dc63f' : '#4a5568',
                padding: '10px 20px', letterSpacing: '0.08em',
                borderBottom: vista === t.key ? '2px solid #8dc63f' : '2px solid transparent',
                transition: 'all 0.15s', marginBottom: -1,
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 20px 40px' }}>

        {/* ── PESTAÑA RESULTADOS ── */}
        {vista === 'resultados' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', margin: '0 0 12px' }}>
                {labelRango()}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FILTROS.map(f => (
                  <button key={f.key} onClick={() => setFiltro(f.key)} style={{
                    background: filtro === f.key ? '#8dc63f' : 'transparent',
                    color: filtro === f.key ? '#0a0d14' : '#6b7a8d',
                    fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11,
                    border: filtro === f.key ? 'none' : '1px solid #1e2a3a',
                    borderRadius: 4, padding: '6px 16px', cursor: 'pointer', letterSpacing: '0.07em',
                  }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingR ? (
              [1,2,3,4].map(i => <SkeletonGrupo key={i} />)
            ) : errorR ? (
              <EmptyMsg icon="⚠️" msg="No se pudieron cargar los resultados." />
            ) : grupos.length === 0 ? (
              <EmptyMsg icon="🔍"
                msg="Sin partidos en este período."
                sub={filtro !== '30d' ? 'Prueba con ÚLTIMOS 30 DÍAS.' : undefined}
                action={filtro !== '30d' ? { label: 'VER ÚLTIMOS 30 DÍAS', onClick: () => setFiltro('30d') } : undefined}
              />
            ) : (
              <>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568',
                  marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#8dc63f20', color: '#8dc63f', fontFamily: 'Oswald, sans-serif',
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                    {filtrados.length}
                  </span>
                  resultado{filtrados.length !== 1 ? 's' : ''} en {grupos.length} competición{grupos.length !== 1 ? 'es' : ''}
                </div>
                {grupos.map(g => (
                  <GrupoLiga key={g.liga} liga={g.liga} logo={g.logo} pais={g.pais} partidos={g.partidos} />
                ))}
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#2d3748',
                  marginTop: 20, textAlign: 'right' }}>
                  Datos vía api-football · Actualización cada 15 min
                </div>
              </>
            )}
          </>
        )}

        {/* ── PESTAÑA POSICIONES ── */}
        {vista === 'posiciones' && (
          <>
            {/* Selector de liga */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {LIGAS_STANDINGS.map(l => (
                <button key={l.id} onClick={() => setLigaSel(l)} style={{
                  background: ligaSel.id === l.id ? '#8dc63f' : 'transparent',
                  color: ligaSel.id === l.id ? '#0a0d14' : '#6b7a8d',
                  fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11,
                  border: ligaSel.id === l.id ? 'none' : '1px solid #1e2a3a',
                  borderRadius: 4, padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}>
                  {l.label}
                </button>
              ))}
            </div>

            {loadingS ? (
              [1,2,3,4].map(i => <SkeletonGrupo key={i} />)
            ) : errorS ? (
              <EmptyMsg icon="⚠️" msg="No se pudieron cargar las posiciones." sub="Puede que la liga no tenga datos disponibles para esta temporada." />
            ) : standings.length === 0 ? (
              <EmptyMsg icon="📊" msg="Sin datos de posiciones disponibles." sub="La temporada puede no haber iniciado o la liga no soporta standings." />
            ) : (
              <>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568',
                  marginBottom: 14 }}>
                  {standings.length} grupo{standings.length !== 1 ? 's' : ''} · {ligaSel.label} {ligaSel.temporada}
                </div>
                {standings.map((grupo, i) => (
                  <TablaGrupo key={i} equipos={grupo} />
                ))}
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#2d3748',
                  marginTop: 20, textAlign: 'right' }}>
                  Datos vía api-football · Actualización cada 15 min
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

function EmptyMsg({ icon, msg, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>{icon}</div>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', marginBottom: sub ? 8 : 0 }}>{msg}</p>
      {sub && <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568', marginBottom: action ? 20 : 0 }}>{sub}</p>}
      {action && (
        <button onClick={action.onClick} style={{ background: '#8dc63f', color: '#0a0d14',
          fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
          border: 'none', borderRadius: 6, padding: '10px 24px', cursor: 'pointer', letterSpacing: '0.07em' }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
