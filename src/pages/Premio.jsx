import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function fmtCOP(val) {
  const n = Number(val);
  if (!n) return '$0';
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n);
}

export default function Premio() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/eventos/activos')
      .then(r => setEventos(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = eventos.reduce((s, e) => s + Number(e.acumulado_actual || 0), 0);
  const top = eventos.length > 0
    ? eventos.reduce((best, e) => Number(e.acumulado_actual) > Number(best.acumulado_actual) ? e : best, eventos[0])
    : null;

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar jackpotVal={total > 0 ? fmtCOP(total) : '$0'} />

      {/* Hero jackpot */}
      <div style={{ background: 'linear-gradient(180deg, #0f1420 0%, #0a0d14 100%)', padding: '60px 20px 48px', textAlign: 'center', borderBottom: '1px solid #1e2a3a' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.2em', fontWeight: 700, marginBottom: 12 }}>POZO ACUMULADO TOTAL</div>
        {loading ? (
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 56, fontWeight: 700, color: '#ffffff20' }}>Cargando...</div>
        ) : (
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 64, fontWeight: 700, color: '#8dc63f', lineHeight: 1, marginBottom: 8 }}>
            {fmtCOP(total)}
          </div>
        )}
        <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginTop: 12 }}>
          Distribuido entre {eventos.length} evento{eventos.length !== 1 ? 's' : ''} activo{eventos.length !== 1 ? 's' : ''}
        </p>
        {top && (
          <div style={{ marginTop: 24, display: 'inline-block', background: '#161e2e', border: '1px solid #8dc63f30', borderRadius: 8, padding: '12px 24px' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#6b7a8d', letterSpacing: '0.08em' }}>MAYOR PREMIO · </span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>{top.nombre}</span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#8dc63f', marginLeft: 10 }}>{fmtCOP(top.acumulado_actual)}</span>
          </div>
        )}
      </div>

      {/* Events breakdown */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 20 }}>DESGLOSE POR EVENTO</div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2].map(i => <div key={i} style={{ background: '#161e2e', borderRadius: 10, height: 90, opacity: 0.5 }} />)}
          </div>
        ) : eventos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7a8d', fontFamily: 'Roboto, sans-serif' }}>No hay eventos activos en este momento.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {eventos.sort((a, b) => Number(b.acumulado_actual) - Number(a.acumulado_actual)).map(ev => {
              const pct = total > 0 ? (Number(ev.acumulado_actual) / total) * 100 : 0;
              const local = ev.equipo_local || ev.nombre?.split(' vs ')?.[0] || ev.nombre;
              const visitante = ev.equipo_visitante || ev.nombre?.split(' vs ')?.[1] || '';
              return (
                <div key={ev.id} style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 10, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                        {visitante ? `${local} vs ${visitante}` : local}
                      </div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginTop: 2 }}>
                        {ev.campeonato?.nombre || '—'}
                        {ev.fecha_evento && ' · ' + new Date(ev.fecha_evento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, color: '#8dc63f' }}>{fmtCOP(ev.acumulado_actual)}</div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>{pct.toFixed(1)}% del total</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: '#0a0d14', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                    <div style={{ background: '#8dc63f', height: '100%', width: pct + '%', borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {ev.porcentaje_retiro && (
                        <div>
                          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', marginBottom: 2 }}>RETIRO GANADOR</div>
                          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff' }}>{ev.porcentaje_retiro}%</div>
                        </div>
                      )}
                      {ev.limite_prediccion && (
                        <div>
                          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', marginBottom: 2 }}>MÁX. JUGADORES</div>
                          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff' }}>{Number(ev.limite_prediccion).toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                    <a href="/" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 16px', borderRadius: 4, textDecoration: 'none', letterSpacing: '0.05em', alignSelf: 'flex-end' }}>
                      PREDECIR →
                    </a>
                  </div>
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
