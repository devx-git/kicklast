import { useState, useEffect } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Campeonatos() {
  const [campeonatos, setCampeonatos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const isLoggedIn = authService.isAuthenticated();
  const predecirHref = isLoggedIn ? '/hub' : '/login';

  useEffect(() => {
    Promise.all([
      api.get('/campeonatos'),
      api.get('/eventos?limit=100&estado=ACTIVO'),
    ])
      .then(([c, e]) => {
        setCampeonatos(Array.isArray(c.data) ? c.data : []);
        const evData = Array.isArray(e.data) ? e.data : (Array.isArray(e.data?.data) ? e.data.data : []);
        setEventos(evData.filter(ev => ev.estado === 'ACTIVO' || ev.activo));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const eventosDeCamp = (campId) => eventos.filter(e => e.campeonato_id === campId);

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 8 }}>TORNEOS</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>CAMPEONATOS</h1>
          <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginTop: 8 }}>Todos los torneos activos con sus eventos disponibles.</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} style={{ background: '#161e2e', borderRadius: 12, height: 160, opacity: 0.5 }} />)}
          </div>
        ) : campeonatos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7a8d', fontFamily: 'Roboto, sans-serif' }}>Sin campeonatos disponibles.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {campeonatos.map(c => {
              const evs = eventosDeCamp(c.id);
              const isOpen = selected === c.id;
              return (
                <div key={c.id} style={{ background: '#161e2e', border: '1px solid ' + (isOpen ? '#8dc63f40' : '#1e2a3a'), borderRadius: 12, overflow: 'hidden' }}>
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

                  {/* Events list */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #1e2a3a' }}>
                      {evs.length === 0 ? (
                        <div style={{ padding: '16px 24px', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>Sin eventos registrados.</div>
                      ) : evs.map((ev, i) => (
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
                            {ev.acumulado_actual > 0 && (
                              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#8dc63f' }}>
                                ${(Number(ev.acumulado_actual) / 1000000).toFixed(0)}M
                              </span>
                            )}
                            <a href={predecirHref} style={{ background: '#1e2535', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 14px', borderRadius: 4, textDecoration: 'none', border: '1px solid #8dc63f30', letterSpacing: '0.05em' }}>
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
      </div>
      <Footer />
    </div>
  );
}
