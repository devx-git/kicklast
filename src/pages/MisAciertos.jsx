import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ESTADO_PRED = {
  PENDIENTE:   { label: 'PENDIENTE',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  PROCESANDO:  { label: 'EN PROCESO',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  RESUELTA:    { label: 'RESUELTA',    color: '#8dc63f', bg: 'rgba(141,198,63,0.1)' },
  CANCELADA:   { label: 'CANCELADA',   color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
};

const ESTADO_APUESTA = {
  PENDIENTE:  { label: 'PENDIENTE',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  GANADA:     { label: 'GANADA ✓',  color: '#8dc63f', bg: 'rgba(141,198,63,0.1)' },
  PERDIDA:    { label: 'PERDIDA',   color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  CANCELADA:  { label: 'CANCELADA', color: '#6b7a8d', bg: 'rgba(107,122,141,0.1)' },
};

const SELECCION_LABEL = { '1': 'Local', X: 'Empate', '2': 'Visitante' };

function StatChip({ label, value, color }) {
  return (
    <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 8, padding: '12px 18px', textAlign: 'center', minWidth: 80 }}>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, color: color ?? '#fff' }}>{value}</div>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function PrediccionCard({ p }) {
  const est = ESTADO_PRED[p.estado] || ESTADO_PRED.PENDIENTE;
  const fecha = p.fecha ? new Date(p.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.evento || '—'}
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>
            {fecha} · Costo: {Number(p.costo ?? 0).toLocaleString('es-CO')} cr
          </div>
        </div>
        <span style={{ background: est.bg, color: est.color, fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 4, whiteSpace: 'nowrap' }}>
          {est.label}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
        <div>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>Aciertos: </span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#8dc63f' }}>{p.aciertos ?? 0}</span>
        </div>
        {Number(p.ganancia) > 0 && (
          <div>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>Ganancia: </span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#8dc63f' }}>+{Number(p.ganancia).toLocaleString('es-CO')} cr</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ApuestaCard({ a }) {
  const est = ESTADO_APUESTA[a.estado] || ESTADO_APUESTA.PENDIENTE;
  const fecha = a.fecha ? new Date(a.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {a.partido !== '—' ? a.partido : (a.evento || '—')}
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>
            {a.evento && a.partido !== '—' ? `${a.evento} · ` : ''}{fecha}
          </div>
        </div>
        <span style={{ background: est.bg, color: est.color, fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 4, whiteSpace: 'nowrap' }}>
          {est.label}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>Selección: </span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>{SELECCION_LABEL[a.seleccion] ?? a.seleccion}</span>
        </div>
        <div>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>Cuota: </span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#c0cad8' }}>{Number(a.cuota ?? 0).toFixed(2)}</span>
        </div>
        <div>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>Apostado: </span>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff' }}>{Number(a.monto ?? 0).toLocaleString('es-CO')} cr</span>
        </div>
        {Number(a.ganancia) > 0 && (
          <div>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>Ganancia: </span>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#8dc63f' }}>+{Number(a.ganancia).toLocaleString('es-CO')} cr</span>
          </div>
        )}
      </div>
    </div>
  );
}

const TABS = [
  { id: 'todos',        label: 'Todos' },
  { id: 'predicciones', label: 'Predicciones' },
  { id: 'apuestas',     label: 'Apuestas' },
];

export default function MisAciertos() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('todos');
  const navigate            = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/login'); return; }
    api.get('/retiros/historial-aciertos')
      .then(r => setData(r.data))
      .catch(e => { if (e.response?.status === 401) navigate('/login'); })
      .finally(() => setLoading(false));
  }, []);

  const preds   = data?.predicciones ?? [];
  const apuestas = data?.apuestas   ?? [];
  const todos   = [...preds.map(p => ({ ...p, _tipo: 'pred' })), ...apuestas.map(a => ({ ...a, _tipo: 'ap' }))]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const totalGanancia = [
    ...preds.filter(p => p.estado === 'RESUELTA').map(p => Number(p.ganancia ?? 0)),
    ...apuestas.filter(a => a.estado === 'GANADA').map(a => Number(a.ganancia ?? 0)),
  ].reduce((s, v) => s + v, 0);

  const items = tab === 'predicciones' ? preds.map(p => ({ ...p, _tipo: 'pred' }))
              : tab === 'apuestas'     ? apuestas.map(a => ({ ...a, _tipo: 'ap' }))
              : todos;

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 20px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 6 }}>MI CUENTA</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 34, fontWeight: 700, color: '#fff', margin: 0 }}>HISTORIAL DE ACIERTOS</h1>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', marginTop: 6 }}>
            Registro de todas tus predicciones y apuestas. Necesitas ≥2 predicciones y ≥3 apuestas para solicitar retiro.
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ background: '#161e2e', borderRadius: 10, height: 80, opacity: 0.5 }} />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
              <StatChip label="Predicciones"  value={preds.length}    color="#8dc63f" />
              <StatChip label="Apuestas"      value={apuestas.length} color="#a78bfa" />
              <StatChip label="Ganancia total (cr)" value={totalGanancia.toLocaleString('es-CO', { maximumFractionDigits: 0 })} color="#f59e0b" />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#161e2e', borderRadius: 8, padding: 4, width: 'fit-content' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  background: tab === t.id ? '#8dc63f' : 'transparent',
                  color: tab === t.id ? '#0a0d14' : '#6b7a8d',
                  border: 'none', borderRadius: 6, padding: '8px 18px',
                  fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.15s',
                }}>
                  {t.label} {t.id === 'predicciones' ? `(${preds.length})` : t.id === 'apuestas' ? `(${apuestas.length})` : `(${todos.length})`}
                </button>
              ))}
            </div>

            {/* Lista */}
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, color: '#6b7a8d' }}>
                  {tab === 'predicciones' ? 'Aún no has hecho predicciones' : tab === 'apuestas' ? 'Aún no has hecho apuestas' : 'Sin actividad registrada'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(item =>
                  item._tipo === 'pred'
                    ? <PrediccionCard key={`pred-${item.id}`} p={item} />
                    : <ApuestaCard    key={`ap-${item.id}`}   a={item} />
                )}
              </div>
            )}

            {/* Link a retiros */}
            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <a href="/retiros" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 8,
                padding: '12px 24px', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700,
                color: '#8dc63f', textDecoration: 'none', letterSpacing: '0.05em',
              }}>
                💸 IR A RETIROS
              </a>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
