import { useState } from 'react';
import Navbar from '../components/Navbar';

const FASES = {
  'SEMIFINALES': [
    { id: 1, tipo: 'IDA', fecha: '2026-04-28T21:00:00', equipo_local: 'PARIS SG', equipo_visitante: 'BAYERN MÚNICH', estadio: 'Parc des Princes', ciudad: 'París, Francia', marcador: null },
    { id: 2, tipo: 'IDA', fecha: '2026-04-29T21:00:00', equipo_local: 'ATLÉTICO MADRID', equipo_visitante: 'ARSENAL', estadio: 'Cívitas Metropolitano', ciudad: 'Madrid, España', marcador: null },
    { id: 3, tipo: 'VUELTA', fecha: '2026-05-05T21:00:00', equipo_local: 'ARSENAL', equipo_visitante: 'ATLÉTICO MADRID', estadio: 'Emirates Stadium', ciudad: 'Londres, Inglaterra', marcador: null },
    { id: 4, tipo: 'VUELTA', fecha: '2026-05-06T21:00:00', equipo_local: 'BAYERN MÚNICH', equipo_visitante: 'PARIS SG', estadio: 'Allianz Arena', ciudad: 'Múnich, Alemania', marcador: null },
  ],
  'LA GRAN FINAL': [
    { id: 5, tipo: 'FINAL', fecha: '2026-05-30T21:00:00', equipo_local: 'TBD', equipo_visitante: 'TBD', estadio: 'Puskás Aréna', ciudad: 'Budapest, Hungría', marcador: null },
  ],
};

const TIPO_COLOR = {
  IDA: '#60A5FA',
  VUELTA: '#a78bfa',
  FINAL: '#F59E0B',
};

function MatchCard({ match }) {
  const color = TIPO_COLOR[match.tipo] || '#8dc63f';
  const fecha = new Date(match.fecha);
  const dateStr = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const timeStr = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ background: 'rgba(10,14,26,0.95)', border: `1px solid rgba(255,255,255,0.06)`, borderTop: `2px solid ${color}`, borderRadius: 10, padding: '16px 20px', marginBottom: 8 }}>
      {/* Meta */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
        <span style={{ background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'Oswald, sans-serif', fontSize: 9, padding: '3px 10px', borderRadius: 4, letterSpacing: 1.5 }}>{match.tipo}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>{dateStr} · {timeStr}</span>
      </div>

      {/* Teams */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>{match.equipo_local}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          {match.marcador ? (
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, color, fontWeight: 700 }}>{match.marcador}</div>
          ) : (
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: '#4a5568', fontWeight: 700 }}>VS</div>
          )}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>{match.equipo_visitante}</div>
        </div>
      </div>

      {/* Venue */}
      <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>
        {match.estadio} · {match.ciudad}
      </div>
    </div>
  );
}

export default function Champions() {
  const [activePhase, setActivePhase] = useState('SEMIFINALES');
  const matches = FASES[activePhase] || [];

  return (
    <div style={{ background: '#07080f', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        .ch-tab { background:none; border:1px solid rgba(255,255,255,0.1); color:#6b7a8d; padding:7px 16px; font-family:'Oswald',sans-serif; font-size:10px; cursor:pointer; border-radius:3px; letter-spacing:1.5px; transition:all 0.2s; }
        .ch-tab:hover, .ch-tab.active { background:rgba(245,158,11,0.15); color:#F59E0B; border-color:rgba(245,158,11,0.4); }
      `}</style>

      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg,#0a0e1a 0%,#07080f 100%)', padding: '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ color: '#F59E0B', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: 4, marginBottom: 8 }}>★ UEFA CHAMPIONS LEAGUE 2025/26</div>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(22px,5vw,36px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>
          INTELLIGENCE <span style={{ color: '#F59E0B' }}>CENTER</span>
        </h1>
        <p style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 12, marginTop: 8 }}>Bracket de Champions League 2025/26</p>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px 48px' }}>

        {/* Phase tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24, paddingTop: 16 }}>
          {Object.keys(FASES).map(fase => (
            <button key={fase} className={`ch-tab${activePhase === fase ? ' active' : ''}`} onClick={() => setActivePhase(fase)}>
              {fase}
            </button>
          ))}
        </div>

        {/* Section label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ color: '#F59E0B', fontFamily: 'Oswald, sans-serif', fontSize: 9, letterSpacing: 3 }}>★ {activePhase}</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9 }}>{matches.length} partidos</span>
        </div>

        {matches.map(m => <MatchCard key={m.id} match={m} />)}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', marginBottom: 14 }}>
            ¿Quieres predecir los resultados y ganar premios?
          </div>
          <a href="/" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 6, textDecoration: 'none', display: 'inline-block' }}>
            VER EVENTOS DISPONIBLES →
          </a>
        </div>
      </div>
    </div>
  );
}
