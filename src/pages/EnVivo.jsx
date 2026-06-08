import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PredictModal from '../components/PredictModal';

export default function EnVivo() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    api.get('/eventos?limit=50')
      .then(r => {
        const all = Array.isArray(r.data) ? r.data : [];
        setEventos(all.filter(e => e.estado === 'EN_VIVO' || e.estado === 'ACTIVO'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const live = eventos.filter(e => e.estado === 'EN_VIVO');
  const activos = eventos.filter(e => e.estado === 'ACTIVO');

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 6px #ef4444' }} />
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#ef4444', letterSpacing: '0.15em', fontWeight: 700 }}>EN VIVO</div>
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>PARTIDOS EN DIRECTO</h1>
          <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginTop: 8 }}>Predicciones en tiempo real mientras se juega.</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} style={{ background: '#161e2e', borderRadius: 12, height: 160, opacity: 0.5 }} />)}
          </div>
        ) : live.length === 0 && activos.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {live.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#ef4444', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  AHORA EN VIVO — {live.length} PARTIDO{live.length !== 1 ? 'S' : ''}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {live.map(ev => <EventCard key={ev.id} ev={ev} onPredict={(ev, sel) => setModal({ ev, seleccion: sel })} isLive />)}
                </div>
              </div>
            )}
            {activos.length > 0 && (
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 16 }}>
                  PRÓXIMOS — {activos.length} EVENTO{activos.length !== 1 ? 'S' : ''}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {activos.map(ev => <EventCard key={ev.id} ev={ev} onPredict={(ev, sel) => setModal({ ev, seleccion: sel })} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modal && <PredictModal ev={modal.ev} seleccion={modal.seleccion} onClose={() => setModal(null)} />}
      <Footer />
    </div>
  );
}

function EventCard({ ev, onPredict, isLive }) {
  const local = ev.equipo_local || ev.nombre?.split(' vs ')?.[0] || ev.nombre;
  const visitante = ev.equipo_visitante || ev.nombre?.split(' vs ')?.[1] || 'Visitante';
  const odds = [
    ev.cuota_local && { l: '1', v: Number(ev.cuota_local).toFixed(2), sel: 'local' },
    ev.cuota_empate && { l: 'X', v: Number(ev.cuota_empate).toFixed(2), sel: 'empate' },
    ev.cuota_visitante && { l: '2', v: Number(ev.cuota_visitante).toFixed(2), sel: 'visitante' },
  ].filter(Boolean);

  return (
    <div style={{ background: '#161e2e', border: '1px solid ' + (isLive ? '#ef444430' : '#1e2a3a'), borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>{ev.campeonato?.nombre || 'Evento'}</span>
        {isLive
          ? <span style={{ background: '#ef4444', color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 3 }}>● LIVE</span>
          : ev.acumulado_actual > 0 && <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, color: '#8dc63f' }}>${(Number(ev.acumulado_actual)/1000000).toFixed(0)}M</span>
        }
      </div>
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{local}</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', marginBottom: 4 }}>vs</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>{visitante}</div>
        {odds.length > 0 ? (
          <div style={{ display: 'flex', gap: 6 }}>
            {odds.map(o => (
              <button key={o.l} onClick={() => onPredict(ev, o.sel)}
                style={{ flex: 1, background: '#0f1420', border: '1px solid #ffffff15', borderRadius: 6, padding: '8px 4px', cursor: 'pointer', color: '#fff' }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', marginBottom: 2 }}>{o.l}</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#8dc63f' }}>{o.v}</div>
              </button>
            ))}
          </div>
        ) : (
          <button onClick={() => onPredict(ev, 'local')}
            style={{ width: '100%', background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
            PREDECIR AHORA →
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, color: '#fff', fontWeight: 700, marginBottom: 8 }}>SIN PARTIDOS EN VIVO</div>
      <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginBottom: 28 }}>Actualmente no hay partidos en directo. Revisa los eventos disponibles en la página principal.</p>
      <a href="/" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em' }}>← VER EVENTOS</a>
    </div>
  );
}
