import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

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
function fechaCorta(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const FILTROS = [
  { key: 'hoy',  label: 'HOY'           },
  { key: 'ayer', label: 'AYER'          },
  { key: '3d',   label: 'ÚLTIMOS 3 DÍAS' },
  { key: '7d',   label: 'ÚLTIMOS 7 DÍAS' },
];

const ESTADO_LABEL = { FT: 'FT', AET: 'Prórroga', PEN: 'Penaltis' };
const ESTADO_COLOR = { FT: '#4a5568', AET: '#f59e0b', PEN: '#a78bfa' };

// ─── FilaPartido ──────────────────────────────────────────────────────────────

function FilaPartido({ p }) {
  const estLabel = ESTADO_LABEL[p.estado] || p.estado;
  const estColor = ESTADO_COLOR[p.estado] || '#4a5568';
  const localGana    = p.goles_local > p.goles_visitante;
  const visitanteGana = p.goles_visitante > p.goles_local;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 72px 1fr 80px',
      alignItems: 'center',
      gap: 0,
      padding: '9px 16px',
      borderBottom: '1px solid #0f1620',
      transition: 'background 0.1s',
      cursor: 'default',
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#0a0e1a'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      {/* Local */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 0, paddingRight: 8 }}>
        <span style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 13,
          color: localGana ? '#fff' : '#8b9bb4',
          fontWeight: localGana ? 600 : 400,
          textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {p.equipo_local}
        </span>
        {p.logo_local && (
          <img src={p.logo_local} alt="" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }}
            onError={e => e.target.style.display = 'none'} />
        )}
      </div>

      {/* Marcador */}
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
        <span style={{
          fontFamily: 'Oswald, sans-serif', fontSize: 8, fontWeight: 700,
          color: estColor, letterSpacing: '0.04em',
        }}>
          {estLabel}
        </span>
      </div>

      {/* Visitante */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, paddingLeft: 8 }}>
        {p.logo_visitante && (
          <img src={p.logo_visitante} alt="" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }}
            onError={e => e.target.style.display = 'none'} />
        )}
        <span style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 13,
          color: visitanteGana ? '#fff' : '#8b9bb4',
          fontWeight: visitanteGana ? 600 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {p.equipo_visitante}
        </span>
      </div>

      {/* Hora / acción */}
      <div style={{ textAlign: 'right' }}>
        {p.guru_evento_id ? (
          <a href={`/eventos/${p.guru_evento_id}`} style={{
            fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700,
            color: '#8dc63f', textDecoration: 'none', letterSpacing: '0.05em',
            border: '1px solid #8dc63f30', borderRadius: 4, padding: '2px 6px',
          }}>
            VER GURU
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

// ─── GrupoLiga ────────────────────────────────────────────────────────────────

function GrupoLiga({ liga, logo, pais, partidos }) {
  const [abierto, setAbierto] = useState(true);

  return (
    <div style={{
      background: '#0d1520', border: '1px solid #1a2535',
      borderRadius: 10, marginBottom: 8, overflow: 'hidden',
    }}>
      <button onClick={() => setAbierto(o => !o)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        borderBottom: abierto ? '1px solid #1a2535' : 'none',
      }}>
        {logo && (
          <img src={logo} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }}
            onError={e => e.target.style.display = 'none'} />
        )}
        <span style={{
          fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
          color: '#c0cad8', letterSpacing: '0.07em', flex: 1, textAlign: 'left',
        }}>
          {liga}
        </span>
        {pais && (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{pais}</span>
        )}
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginLeft: 8 }}>
          {partidos.length}
        </span>
        <span style={{ color: '#4a5568', fontSize: 9, marginLeft: 4 }}>{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && partidos.map(p => <FilaPartido key={p.api_id} p={p} />)}
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
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 1fr 80px', gap: 8, padding: '9px 16px', borderBottom: '1px solid #0f1620', alignItems: 'center' }}>
          <div style={{ height: 13, background: '#ffffff06', borderRadius: 3, width: '70%', marginLeft: 'auto' }} />
          <div style={{ height: 20, background: '#ffffff08', borderRadius: 4, margin: '0 auto', width: 50 }} />
          <div style={{ height: 13, background: '#ffffff06', borderRadius: 3, width: '70%' }} />
          <div style={{ height: 11, background: '#ffffff04', borderRadius: 3, width: 40, marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Resultados() {
  const [partidos, setPartidos] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [filtro,   setFiltro]   = useState('hoy');

  useEffect(() => {
    api.get('/sports/resultados')
      .then(r => setPartidos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // ── Filtrar por rango de fechas (client-side, 1 sola llamada al backend) ────
  const filtrados = useMemo(() => {
    const ahora = new Date();
    if (filtro === 'hoy') {
      const inicio = startOfDay(ahora);
      return partidos.filter(p => new Date(p.fecha_iso) >= inicio);
    }
    if (filtro === 'ayer') {
      const inicioAyer = daysAgo(1);
      const inicioHoy  = startOfDay(ahora);
      return partidos.filter(p => {
        const d = new Date(p.fecha_iso);
        return d >= inicioAyer && d < inicioHoy;
      });
    }
    if (filtro === '3d') return partidos.filter(p => new Date(p.fecha_iso) >= daysAgo(3));
    return partidos; // 7d = todo
  }, [partidos, filtro]);

  // ── Agrupar por liga, ordenar por número de partidos desc ────────────────────
  const grupos = useMemo(() => {
    const map = new Map();
    filtrados.forEach(p => {
      if (!map.has(p.liga)) {
        map.set(p.liga, { liga: p.liga, logo: p.liga_logo, pais: p.pais, partidos: [] });
      }
      map.get(p.liga).partidos.push(p);
    });
    return Array.from(map.values()).sort((a, b) => b.partidos.length - a.partidos.length);
  }, [filtrados]);

  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  // Fecha del rango para mostrar en el subtítulo
  const labelRango = () => {
    if (filtro === 'hoy')  return `Hoy · ${fechaHoy}`;
    if (filtro === 'ayer') return `Ayer y hoy`;
    if (filtro === '3d')   return `Últimos 3 días`;
    return `Últimos 7 días`;
  };

  return (
    <div style={{ background: '#08090f', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(180deg,#0d1520 0%,#08090f 100%)',
        borderBottom: '1px solid #1e2a3a',
        padding: '28px 20px 20px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>🏆</span>
            <h1 style={{
              fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 900,
              color: '#fff', margin: 0, letterSpacing: '0.06em',
            }}>
              RESULTADOS
            </h1>
            <span style={{
              background: 'rgba(141,198,63,0.1)', border: '1px solid rgba(141,198,63,0.3)',
              borderRadius: 20, padding: '2px 10px',
              fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#8dc63f',
              fontWeight: 700, letterSpacing: '0.1em',
            }}>
              LIGAS DESTACADAS
            </span>
          </div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', margin: '0 0 20px' }}>
            {labelRango()}
          </p>

          {/* Filtros de fecha */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTROS.map(f => (
              <button key={f.key} onClick={() => setFiltro(f.key)} style={{
                background: filtro === f.key ? '#8dc63f' : 'transparent',
                color: filtro === f.key ? '#0a0d14' : '#6b7a8d',
                fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 11,
                border: filtro === f.key ? 'none' : '1px solid #1e2a3a',
                borderRadius: 4, padding: '6px 16px', cursor: 'pointer',
                letterSpacing: '0.07em', transition: 'all 0.15s',
              }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 20px 40px' }}>
        {loading ? (
          [1, 2, 3, 4].map(i => <SkeletonGrupo key={i} />)
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d' }}>
              No se pudieron cargar los resultados en este momento.
            </p>
          </div>
        ) : grupos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', marginBottom: 8 }}>
              No hay resultados para este período.
            </p>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568' }}>
              Prueba con "ÚLTIMOS 3 DÍAS" o "ÚLTIMOS 7 DÍAS"
            </p>
          </div>
        ) : (
          <>
            {/* Contador */}
            <div style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568',
              marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ background: '#8dc63f20', color: '#8dc63f', fontFamily: 'Oswald, sans-serif',
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                {filtrados.length}
              </span>
              resultado{filtrados.length !== 1 ? 's' : ''} en {grupos.length} competición{grupos.length !== 1 ? 'es' : ''}
            </div>

            {grupos.map(g => (
              <GrupoLiga
                key={g.liga}
                liga={g.liga}
                logo={g.logo}
                pais={g.pais}
                partidos={g.partidos}
              />
            ))}

            <div style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#2d3748',
              marginTop: 20, textAlign: 'right',
            }}>
              Datos vía api-football · Actualización cada 15 min
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
