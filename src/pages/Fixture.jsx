import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import Navbar from '../components/Navbar';

const FASE_TABS = ['TODOS', 'GRUPOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'];

const ESTADO_COLOR = {
  EN_VIVO: { color: '#8dc63f', label: '● EN VIVO' },
  PROGRAMADO: { color: '#00d4ff', label: 'PRÓXIMO' },
  FINALIZADO: { color: '#6b7a8d', label: 'FINALIZADO' },
  CANCELADO: { color: '#f87171', label: 'CANCELADO' },
};

function formatFecha(iso) {
  if (!iso) return { date: '—', time: '—' };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase(),
    time: d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
  };
}

function MatchRow({ match, index }) {
  const est = ESTADO_COLOR[match.estado] || ESTADO_COLOR.PROGRAMADO;
  const { date, time } = formatFecha(match.fecha);
  const tieneResultado = match.resultado_local != null && match.resultado_visitante != null;

  return (
    <div style={{
      background: 'rgba(15,20,32,0.95)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderLeft: `3px solid ${est.color}`,
      borderRadius: 8,
      padding: '12px 16px',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      gap: 12,
      marginBottom: 4,
      animation: `fadeIn 0.2s ease ${index * 0.02}s both`,
    }}>
      {/* Equipo local */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>
          {match.equipo_local}
        </div>
        {match.grupo && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', letterSpacing: 1, marginTop: 2 }}>GRUPO {match.grupo}</div>}
      </div>

      {/* Score / VS */}
      <div style={{ textAlign: 'center', minWidth: 80 }}>
        {tieneResultado ? (
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: est.color, letterSpacing: 2 }}>
            {match.resultado_local} – {match.resultado_visitante}
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#e2e8f0' }}>{date}</div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>{time}</div>
          </div>
        )}
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: est.color, letterSpacing: 1, marginTop: 3 }}>{est.label}</div>
      </div>

      {/* Equipo visitante */}
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>
          {match.equipo_visitante}
        </div>
        {match.fase && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', letterSpacing: 1, marginTop: 2 }}>{match.fase}</div>}
      </div>
    </div>
  );
}

export default function Fixture() {
  const [partidos, setPartidos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TODOS');
  const [activeEvento, setActiveEvento] = useState(null);

  useEffect(() => {
    dataService.getEventos(100).then(evs => {
      setEventos(evs);
      // Flatten all partidos from all eventos
      const all = evs.flatMap(e => (e.partidos || []).map(p => ({ ...p, evento_nombre: e.nombre, evento_id: e.id })));
      // Sort by date
      all.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setPartidos(all);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = partidos.filter(p => {
    const eventoMatch = activeEvento ? p.evento_id === activeEvento : true;
    if (!eventoMatch) return false;
    if (activeTab === 'TODOS') return true;
    return (p.fase || '').toUpperCase().includes(activeTab) || (p.fase || '').toUpperCase() === activeTab;
  });

  // Group by fase when showing all
  const grouped = filtered.reduce((acc, p) => {
    const key = p.fase || 'SIN FASE';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div style={{ background: '#07080f', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
        .fix-nav-btn { background:none; border:1px solid rgba(255,255,255,0.1); color:#6b7a8d; padding:6px 14px; font-family:'Oswald',sans-serif; font-size:11px; cursor:pointer; border-radius:3px; letter-spacing:1px; transition:all 0.2s; }
        .fix-nav-btn:hover, .fix-nav-btn.active { background:#8dc63f; color:#0a0d14; border-color:#8dc63f; }
        .evt-chip { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:#6b7a8d; padding:5px 12px; font-family:'Oswald',sans-serif; font-size:10px; cursor:pointer; border-radius:20px; letter-spacing:0.5px; transition:all 0.2s; white-space:nowrap; }
        .evt-chip:hover, .evt-chip.active { background:rgba(0,212,255,0.1); border-color:rgba(0,212,255,0.4); color:#00d4ff; }
      `}</style>

      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg,#0a1428 0%,#07080f 100%)', padding: '32px 20px 24px', textAlign: 'center' }}>
        <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: 4, marginBottom: 8 }}>◈ CALENDARIO DE PARTIDOS</div>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(22px,5vw,36px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>
          FIXTURE <span style={{ color: '#8dc63f' }}>MUNDIALISTA</span>
        </h1>
        <div style={{ width: 30, height: 2, background: '#8dc63f', margin: '12px auto 0' }} />
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 48px' }}>

        {/* Evento filter chips */}
        {eventos.length > 1 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 0', marginBottom: 4 }}>
            <button className={`evt-chip${!activeEvento ? ' active' : ''}`} onClick={() => setActiveEvento(null)}>
              TODOS
            </button>
            {eventos.map(e => (
              <button key={e.id} className={`evt-chip${activeEvento === e.id ? ' active' : ''}`} onClick={() => setActiveEvento(e.id)}>
                {e.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Phase tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, paddingTop: eventos.length > 1 ? 4 : 16 }}>
          {FASE_TABS.map(tab => (
            <button key={tab} className={`fix-nav-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 16 }}>
            Cargando fixture...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>No hay partidos para esta fase.</div>
          </div>
        )}

        {/* Render grouped by fase */}
        {!loading && Object.entries(grouped).map(([fase, matches]) => (
          <div key={fase} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ color: '#4a5568', fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: 3, whiteSpace: 'nowrap' }}>
                {fase}
              </div>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9 }}>{matches.length} partidos</div>
            </div>
            {matches.map((m, i) => <MatchRow key={m.id || i} match={m} index={i} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
