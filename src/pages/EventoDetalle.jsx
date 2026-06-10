import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PredictModal from '../components/PredictModal';
import ResultadosPartidos from '../components/ResultadosPartidos';

function fmtCOP(val) {
  const n = Number(val);
  if (!n) return '$0';
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n);
}

export default function EventoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!id) { navigate('/'); return; }
    api.get(`/eventos/${id}`)
      .then(r => setEvento(r.data))
      .catch(() => setError('Evento no encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 18 }}>Cargando...</div>
    </div>
  );

  if (error || !evento) return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, color: '#fff', marginBottom: 12 }}>{error || 'Evento no encontrado'}</div>
        <a href="/" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 6, textDecoration: 'none' }}>← VOLVER</a>
      </div>
      <Footer />
    </div>
  );

  const ev = evento;
  const local = ev.equipo_local || ev.nombre?.split(' vs ')?.[0] || ev.nombre;
  const visitante = ev.equipo_visitante || ev.nombre?.split(' vs ')?.[1] || 'Visitante';
  const odds = [
    ev.cuota_local && { l: '1', label: 'Local', v: Number(ev.cuota_local).toFixed(2), sel: 'local' },
    ev.cuota_empate && { l: 'X', label: 'Empate', v: Number(ev.cuota_empate).toFixed(2), sel: 'empate' },
    ev.cuota_visitante && { l: '2', label: 'Visitante', v: Number(ev.cuota_visitante).toFixed(2), sel: 'visitante' },
  ].filter(Boolean);

  const isActivo = ev.estado === 'ACTIVO' || ev.estado === 'EN_VIVO';
  const fechaEvento = ev.fecha_evento ? new Date(ev.fecha_evento).toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #0f1420 0%, #0a0d14 100%)', padding: '48px 20px 40px', borderBottom: '1px solid #1e2a3a' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <a href="/" style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>← Volver a eventos</a>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {ev.estado === 'EN_VIVO' && (
                  <span style={{ background: '#ef4444', color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 3 }}>● LIVE</span>
                )}
                {ev.campeonato?.nombre && (
                  <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>{ev.campeonato.nombre}</span>
                )}
                {ev.sede && <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>· {ev.sede}</span>}
              </div>

              {/* Teams display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 700, color: '#fff' }}>{local}</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, color: '#6b7a8d', fontWeight: 700 }}>VS</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 700, color: '#fff' }}>{visitante}</div>
              </div>

              {fechaEvento && (
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', marginBottom: 4 }}>📅 {fechaEvento}</div>
              )}
            </div>

            {/* Jackpot */}
            <div style={{ background: '#161e2e', border: '1px solid #8dc63f30', borderRadius: 10, padding: '16px 24px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 4 }}>POZO ACUMULADO</div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 30, fontWeight: 700, color: '#8dc63f' }}>{fmtCOP(ev.acumulado_actual)}</div>
              {ev.limite_prediccion && (
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginTop: 4 }}>Máx. {Number(ev.limite_prediccion).toLocaleString()} jugadores</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>

        {/* Prediction options */}
        {isActivo && (
          <>
            {/* ── Partidos individuales con cuotas propias ── */}
            {ev.partidos && ev.partidos.length > 0 ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 14 }}>
                  PARTIDOS DEL EVENTO
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ev.partidos.map(p => {
                    const pOdds = [
                      p.cuota_local    && { l: '1', label: 'Local',     v: Number(p.cuota_local).toFixed(2),    sel: 'local',     team: p.equipo_local },
                      p.cuota_empate   && { l: 'X', label: 'Empate',    v: Number(p.cuota_empate).toFixed(2),   sel: 'empate',    team: 'Empate' },
                      p.cuota_visitante && { l: '2', label: 'Visitante', v: Number(p.cuota_visitante).toFixed(2), sel: 'visitante', team: p.equipo_visitante },
                    ].filter(Boolean);
                    const fechaP = p.fecha ? new Date(p.fecha).toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
                    return (
                      <div key={p.id} style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 12, padding: '20px 24px' }}>
                        {/* Encabezado partido */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                          <div>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff' }}>
                              {p.equipo_local} <span style={{ color: '#4a5568', fontSize: 13, fontWeight: 400 }}>vs</span> {p.equipo_visitante}
                            </div>
                            {fechaP && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginTop: 3 }}>📅 {fechaP}{p.sede ? ` · ${p.sede}` : ''}</div>}
                          </div>
                          {/* Botón GURÚ por partido */}
                          <button onClick={() => setModal({ ev, seleccion: null, partidoId: p.id })}
                            style={{ background: '#1e2535', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '9px 16px', borderRadius: 6, border: '1px solid #8dc63f40', cursor: 'pointer', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                            🧠 PREDICCIÓN ({Number(ev.costo_creditos) || 2} CR)
                          </button>
                        </div>

                        {/* Cuotas del partido */}
                        {pOdds.length > 0 ? (
                          <>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                              {pOdds.map(o => (
                                <button key={o.l} onClick={() => setModal({ ev, seleccion: o.sel, partidoId: p.id, partidoCuotas: { local: p.cuota_local, empate: p.cuota_empate, visitante: p.cuota_visitante }, partidoNombre: `${p.equipo_local} vs ${p.equipo_visitante}` })}
                                  style={{ flex: 1, background: '#0f1420', border: '1px solid #ffffff15', borderRadius: 8, padding: '12px 6px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8dc63f60'; e.currentTarget.style.background = '#111927'; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#ffffff15'; e.currentTarget.style.background = '#0f1420'; }}>
                                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.05em', marginBottom: 2 }}>{o.l}</div>
                                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: '#8dc63f', lineHeight: 1.1, marginBottom: 3 }}>{o.v}</div>
                                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#c0cad8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.team}</div>
                                </button>
                              ))}
                            </div>
                            <button onClick={() => setModal({ ev, seleccion: 'cuota', partidoId: p.id, partidoCuotas: { local: p.cuota_local, empate: p.cuota_empate, visitante: p.cuota_visitante }, partidoNombre: `${p.equipo_local} vs ${p.equipo_visitante}` })}
                              style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px', borderRadius: 6, border: 'none', cursor: 'pointer', width: '100%', letterSpacing: '0.05em' }}>
                              HACER APUESTA →
                            </button>
                          </>
                        ) : (
                          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568', textAlign: 'center', padding: '8px 0' }}>
                            Sin cuotas configuradas — solo Predicción disponible
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Fallback: evento sin partidos → cuota única del evento */
              <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {odds.length > 0 && (
                  <div style={{ flex: 1, minWidth: 280, background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 12, padding: 24 }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#8dc63f', letterSpacing: '0.1em', marginBottom: 16 }}>CUOTAS 1-X-2</div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      {odds.map(o => {
                        const equipoNombre = o.sel === 'local' ? local : o.sel === 'visitante' ? visitante : 'Empate';
                        return (
                          <button key={o.l} onClick={() => setModal({ ev, seleccion: o.sel })}
                            style={{ flex: 1, background: '#0f1420', border: '1px solid #ffffff15', borderRadius: 8, padding: '12px 6px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8dc63f60'; e.currentTarget.style.background = '#111927'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#ffffff15'; e.currentTarget.style.background = '#0f1420'; }}>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.06em', marginBottom: 2 }}>{o.l}</div>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, color: '#8dc63f', lineHeight: 1.1, marginBottom: 4 }}>{o.v}</div>
                            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#c0cad8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{equipoNombre}</div>
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => setModal({ ev, seleccion: 'cuota' })}
                      style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '11px', borderRadius: 7, border: 'none', cursor: 'pointer', width: '100%', letterSpacing: '0.05em' }}>
                      HACER APUESTA →
                    </button>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 280, background: '#161e2e', border: '1px solid #8dc63f30', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#8dc63f', letterSpacing: '0.1em' }}>COMPRAR PREDICCIÓN</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', textAlign: 'center' }}>10 predicciones · Manual o Automático</div>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>{Number(ev.costo_creditos) || 2} CR</div>
                  <button onClick={() => setModal({ ev, seleccion: null })}
                    style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '14px 32px', borderRadius: 8, border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
                    COMPRAR PREDICCIÓN →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'ACUMULADO BASE', value: fmtCOP(ev.acumulado_base), color: '#fff' },
            { label: 'RETIRO GANADOR', value: ev.porcentaje_retiro + '%', color: '#8dc63f' },
            { label: 'COSTO ENTRADA', value: Number(ev.costo_creditos) > 0 ? ev.costo_creditos + ' créditos' : 'GRATIS', color: '#8dc63f' },
            { label: 'TIPO', value: ev.tipo_evento || '—', color: '#6b7a8d' },
          ].map(s => (
            <div key={s.label} style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 8, padding: '16px' }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Resultados en tiempo real */}
        <div style={{ marginBottom: 24 }}>
          <ResultadosPartidos eventoId={ev.id} limit={20} />
        </div>

        {/* Descripcion */}
        {ev.descripcion && (
          <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 10, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 10 }}>DESCRIPCIÓN</div>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#c0cad8', lineHeight: 1.7, margin: 0 }}>{ev.descripcion}</p>
          </div>
        )}
      </div>

      {modal && (
        <PredictModal
          ev={modal.ev}
          seleccion={modal.seleccion}
          onClose={() => setModal(null)}
          partidoId={modal.partidoId || null}
          partidoCuotas={modal.partidoCuotas || null}
          partidoNombre={modal.partidoNombre || null}
        />
      )}
      <Footer />
    </div>
  );
}
