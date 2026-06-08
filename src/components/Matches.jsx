import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import PredictModal from './PredictModal';

const DEMO = [
  { id: 'd1', nombre: 'México vs USA', campeonato: { nombre: 'Mundial 2026' }, equipo_local: 'México', equipo_visitante: 'USA', cuota_local: '2.40', cuota_empate: null, cuota_visitante: '2.80', acumulado_actual: '10000000', fecha_evento: '2026-06-11T18:00:00Z', estado: 'ACTIVO' },
  { id: 'd2', nombre: 'Nacional vs Tolima', campeonato: { nombre: 'Primera A Colombia' }, equipo_local: 'Atlético Nacional', equipo_visitante: 'Deportes Tolima', cuota_local: '2.55', cuota_empate: '3.20', cuota_visitante: '3.00', acumulado_actual: '5000000', fecha_evento: null, estado: 'ACTIVO' },
  { id: 'd3', nombre: 'Man City vs Aston Villa', campeonato: { nombre: 'Premier League' }, equipo_local: 'Manchester City', equipo_visitante: 'Aston Villa', cuota_local: '1.25', cuota_empate: '6.50', cuota_visitante: '11.00', acumulado_actual: '8000000', fecha_evento: null, estado: 'ACTIVO' },
];

function fmtAcumulado(val) {
  const n = Number(val);
  if (!n) return null;
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(0) + 'M';
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n);
}

function fmtFecha(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((d - now) / 86400000);
  if (diffDays === 0) return 'Hoy ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Mañana ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase() + ' · ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function EventCard({ ev, onPredict }) {
  // Resolve team names — fallback to splitting the event name
  const parts = ev.nombre?.split(' vs ') || [];
  const local = ev.equipo_local || parts[0] || ev.nombre || 'Local';
  const visitante = ev.equipo_visitante || parts[1] || 'Visitante';
  const liga = ev.campeonato?.nombre || ev.nombre || 'Evento';
  const acum = fmtAcumulado(ev.acumulado_actual);
  const fecha = fmtFecha(ev.fecha_evento);
  const isLive = ev.estado === 'EN_VIVO';

  const odds = [
    ev.cuota_local && { l: '1', v: Number(ev.cuota_local).toFixed(2), sel: 'local' },
    ev.cuota_empate && { l: 'X', v: Number(ev.cuota_empate).toFixed(2), sel: 'empate' },
    ev.cuota_visitante && { l: '2', v: Number(ev.cuota_visitante).toFixed(2), sel: 'visitante' },
  ].filter(Boolean);

  return (
    <div className="lk-match-col">
      <div className="lk-match-header">
        <span className="lk-match-league">{liga}</span>
        {isLive ? (
          <span className="lk-live-pill">LIVE</span>
        ) : fecha ? (
          <span className="lk-match-time">{fecha}</span>
        ) : acum ? (
          <span className="lk-match-time" style={{ color: '#8dc63f', fontWeight: 700 }}>{acum}</span>
        ) : null}
      </div>
      <div className="lk-match-body">
        <div className="lk-match-team-row">
          <div className="lk-team-name">{local}</div>
          <span className="lk-match-score">—</span>
        </div>
        <div className="lk-match-team-row">
          <div className="lk-team-name">{visitante}</div>
          <span className="lk-match-score">—</span>
        </div>
      </div>
      {odds.length > 0 ? (
        <div className={`lk-odds-row ${odds.length === 2 ? 'two' : 'three'}`}>
          {odds.map(o => (
            <button key={o.l} className="lk-odd-btn" onClick={() => onPredict(ev, o.sel)}>
              <span className="lk-odd-l">{o.l}</span>
              <span className="lk-odd-v">{o.v}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="lk-match-no-odds">
          <button className="lk-match-cta-btn" onClick={() => onPredict(ev, 'local')}>Predecir ahora →</button>
        </div>
      )}
      {!ev.id?.startsWith('d') && (
        <div style={{ padding: '8px 12px 12px' }}>
          <a href={`/eventos/${ev.id}`} style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
            Ver detalle →
          </a>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="lk-match-col" style={{ opacity: 0.5 }}>
      <div className="lk-match-header">
        <span style={{ background: '#ffffff15', borderRadius: 3, width: 80, height: 10, display: 'block' }} />
        <span style={{ background: '#ffffff15', borderRadius: 3, width: 30, height: 10, display: 'block' }} />
      </div>
      <div className="lk-match-body">
        <div className="lk-match-team-row">
          <span style={{ background: '#ffffff15', borderRadius: 3, width: 100, height: 12, display: 'block' }} />
          <span style={{ background: '#ffffff15', borderRadius: 3, width: 16, height: 12, display: 'block' }} />
        </div>
        <div className="lk-match-team-row">
          <span style={{ background: '#ffffff15', borderRadius: 3, width: 80, height: 12, display: 'block' }} />
          <span style={{ background: '#ffffff15', borderRadius: 3, width: 16, height: 12, display: 'block' }} />
        </div>
      </div>
      <div className="lk-odds-row three">
        {[1,2,3].map(i => <div key={i} className="lk-odd-btn" style={{ background: '#ffffff08' }} />)}
      </div>
    </div>
  );
}

export default function Matches() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { ev, seleccion }

  useEffect(() => {
    dataService.getEventosActivos()
      .then(data => { setEvents(data?.length > 0 ? data : DEMO); })
      .catch(() => { setEvents(DEMO); })
      .finally(() => setLoading(false));
  }, []);

  const handlePredict = (ev, seleccion) => setModal({ ev, seleccion });

  return (
    <>
      <div className="lk-matches-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <div className="lk-matches-title" style={{ margin: 0 }}>EVENTOS DISPONIBLES</div>
          {!loading && (
            <span style={{ background: '#8dc63f', color: '#0a0d14', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.05em', fontFamily: 'Oswald, sans-serif' }}>
              {events.length} ACTIVOS
            </span>
          )}
        </div>
        <div className="lk-matches-scroll">
          {loading
            ? [1,2,3].map(i => <SkeletonCard key={i} />)
            : events.map(ev => <EventCard key={ev.id} ev={ev} onPredict={handlePredict} />)
          }
        </div>
      </div>
      {modal && (
        <PredictModal
          ev={modal.ev}
          seleccion={modal.seleccion}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
