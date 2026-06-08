import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import Navbar from '../components/Navbar';

const ESTADO_COLOR = {
  PENDIENTE: '#f59e0b',
  GANADA: '#8dc63f',
  PERDIDA: '#f87171',
  ANULADA: '#6b7a8d',
};

const RESULTADO_LABEL = { LOCAL: '1', EMPATE: 'X', VISITANTE: '2' };

export default function MisApuestas() {
  const [apuestas, setApuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) { window.location.href = '/login'; return; }
    dataService.getMisApuestas()
      .then(setApuestas)
      .catch(err => {
        if (err.response?.status === 401) { window.location.href = '/login'; return; }
        setError('No se pudieron cargar tus apuestas.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 40px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.12em', marginBottom: 4 }}>MI CUENTA</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, color: '#fff', margin: 0 }}>Mis Apuestas 1-X-2</h1>
        </div>

        {loading && <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 16 }}>Cargando apuestas...</div>}
        {error && <div style={{ color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 14, background: '#1a0a0a', border: '1px solid #f8717130', borderRadius: 8, padding: 16 }}>{error}</div>}

        {!loading && !error && apuestas.length === 0 && (
          <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎰</div>
            <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>No tienes apuestas registradas.</div>
            <a href="/" style={{ display: 'inline-block', marginTop: 16, background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 24px', borderRadius: 6, textDecoration: 'none' }}>
              VER EVENTOS
            </a>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {apuestas.map((a, i) => {
            const color = ESTADO_COLOR[a.estado] || '#6b7a8d';
            const selLabel = RESULTADO_LABEL[a.seleccion] || a.seleccion || '?';
            return (
              <div key={a.id || i} style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, color: '#fff', marginBottom: 4 }}>
                    {a.evento?.nombre || a.evento?.equipo_local ? `${a.evento.equipo_local} vs ${a.evento.equipo_visitante}` : `Apuesta #${a.id?.slice(0, 8) || i + 1}`}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
                      Selección: <strong style={{ color: '#e2e8f0' }}>{selLabel}</strong>
                    </span>
                    {a.cuota && (
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
                        Cuota: <strong style={{ color: '#f59e0b' }}>×{Number(a.cuota).toFixed(2)}</strong>
                      </span>
                    )}
                    {a.monto && (
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
                        Apostado: <strong style={{ color: '#e2e8f0' }}>${Number(a.monto).toLocaleString('es-CO')}</strong>
                      </span>
                    )}
                    {a.ganancia_potencial && (
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
                        Potencial: <strong style={{ color: '#8dc63f' }}>${Number(a.ganancia_potencial).toLocaleString('es-CO')}</strong>
                      </span>
                    )}
                  </div>
                  {a.creado_en && (
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginTop: 4 }}>
                      {new Date(a.creado_en).toLocaleString('es-CO')}
                    </div>
                  )}
                </div>
                <span style={{ background: `${color}18`, color, fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 4, border: `1px solid ${color}30`, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {a.estado || 'PENDIENTE'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <a href="/dashboard" style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none' }}>← Volver al panel</a>
        </div>
      </div>
    </div>
  );
}
