import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatCreditos } from '../utils/currency';

const ESTADO_BADGE = {
  PENDIENTE:        { label: 'PENDIENTE',      color: '#6b7a8d',  bg: '#ffffff10' },
  GANADORA_TOTAL:   { label: 'GANADORA TOTAL', color: '#8dc63f',  bg: 'rgba(141,198,63,0.12)' },
  GANADORA_PARCIAL: { label: 'PARCIAL',        color: '#f59e0b',  bg: 'rgba(245,158,11,0.12)' },
  GANADA:           { label: 'GANADA',         color: '#8dc63f',  bg: 'rgba(141,198,63,0.12)' },
  PERDIDA:          { label: 'PERDIDA',        color: '#f87171',  bg: 'rgba(239,68,68,0.1)'   },
  ANULADA:          { label: 'ANULADA',        color: '#6b7a8d',  bg: '#ffffff08'              },
};

export default function MisPredicciones() {
  const [preds, setPreds]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/login'); return; }
    dataService.getMisPredicciones()
      .then(data => setPreds(Array.isArray(data) ? data : []))
      .catch(e => {
        if (e.response?.status === 401) { navigate('/login'); return; }
        setError(e.response?.data?.message || 'Error al cargar predicciones');
      })
      .finally(() => setLoading(false));
  }, []);

  // Estadísticas globales
  const stats = {
    total:    preds.length,
    correctas: preds.reduce((a, p) => a + (p.aciertos || 0), 0),
    ganadas:  preds.filter(p => ['GANADORA_TOTAL','GANADA'].includes(p.estado)).length,
    ganancias: preds.reduce((a, p) => a + (p.ganancia || 0), 0),
  };

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 8 }}>MI HISTORIAL</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 32, fontWeight: 700, color: '#fff', margin: 0 }}>MIS PREDICCIONES</h1>
        </div>

        {/* Stats resumen */}
        {!loading && preds.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'TOTAL PRED.',       val: stats.total,                    color: '#6b7a8d' },
              { label: 'PRED. CORRECTAS',  val: stats.correctas,               color: '#8dc63f' },
              { label: 'PRED. GANADAS',    val: stats.ganadas,                  color: '#f59e0b' },
              { label: 'GANANCIAS CR',   val: formatCreditos(stats.ganancias), color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', fontWeight: 600, letterSpacing: '0.07em', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '14px 18px', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} style={{ background: '#161e2e', borderRadius: 10, height: 82, opacity: 0.5 }} />)}
          </div>
        ) : preds.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {preds.map(p => (
              <PredRow key={p.id} p={p}
                expanded={expanded === p.id}
                onToggle={() => setExpanded(x => x === p.id ? null : p.id)}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// ─── Fila de predicción ──────────────────────────────────────────────────────
function PredRow({ p, expanded, onToggle }) {
  const estado   = ESTADO_BADGE[p.estado] || ESTADO_BADGE.PENDIENTE;
  const detalles = p.detalles || [];
  const fecha    = p.creado_en
    ? new Date(p.creado_en).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const tipo     = p.tipo || (detalles.length > 0 ? 'PREDICCIÓN' : 'SIMPLE');
  const isGuru   = detalles.length > 0;
  const aciertos = detalles.filter(d => d.es_acierto).length;
  const total    = detalles.length;
  const pendientes = detalles.filter(d => d.es_acierto === false || d.es_acierto === null).length;

  return (
    <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 10, overflow: 'hidden' }}>
      {/* Cabecera clickeable */}
      <div
        onClick={isGuru ? onToggle : undefined}
        style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', cursor: isGuru ? 'pointer' : 'default' }}
      >
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
            {p.evento?.nombre || 'Evento'}
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
            {p.evento?.campeonato?.nombre || ''}{p.evento?.campeonato?.nombre ? ' · ' : ''}{fecha}
          </div>
        </div>

        {/* Tipo + aciertos */}
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <span style={{
            background: tipo === 'AUTOMATICA' ? '#3b82f620' : '#8dc63f15',
            color: tipo === 'AUTOMATICA' ? '#3b82f6' : '#8dc63f',
            fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 3
          }}>
            {tipo === 'AUTOMATICA' ? '⚡ AUTO' : '🧠 MANUAL'}
          </span>
          {isGuru && (
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c0cad8', marginTop: 6, fontWeight: 500 }}>
              <span style={{ color: '#8dc63f', fontWeight: 700 }}>{aciertos}</span>
              <span style={{ color: '#4a5568' }}>/{total}</span>
              <span style={{ color: '#6b7a8d', fontSize: 10 }}> aciertos</span>
            </div>
          )}
        </div>

        {/* Estado + ganancia */}
        <div style={{ minWidth: 110, textAlign: 'right' }}>
          <span style={{ background: estado.bg, color: estado.color, fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4 }}>
            {estado.label}
          </span>
          {p.ganancia > 0 && (
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#8dc63f', fontWeight: 700, marginTop: 4 }}>
              +{formatCreditos(p.ganancia)} CR
            </div>
          )}
          {isGuru && (
            <div style={{ color: '#4a5568', fontSize: 11, marginTop: 4 }}>
              {expanded ? '▲ cerrar' : '▼ ver detalle'}
            </div>
          )}
        </div>
      </div>

      {/* Panel expandido — consolidado */}
      {expanded && isGuru && (
        <DetalleGuru detalles={detalles} tipo={tipo} aciertos={aciertos} total={total} />
      )}
    </div>
  );
}

// ─── Panel de detalle ────────────────────────────────────────────────────────
function DetalleGuru({ detalles, tipo, aciertos, total }) {
  const pendientesN = detalles.filter(d => d.es_acierto === null || d.es_acierto === undefined || (d.es_acierto === false && !d.valor_correcto)).length;
  const correctas   = detalles.filter(d => d.es_acierto === true).length;
  const incorrectas = detalles.filter(d => d.es_acierto === false).length;

  return (
    <div style={{ borderTop: '1px solid #1e2a3a', background: '#0f1420' }}>
      {/* Mini-resumen */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e2a3a', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.1em' }}>
          CONSOLIDADO — {total} PREDICCIONES
        </span>
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>
          <span style={{ color: '#8dc63f', fontWeight: 700 }}>✅ {correctas} correctas</span>
        </span>
        {incorrectas > 0 && (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>
            <span style={{ color: '#f87171', fontWeight: 700 }}>❌ {incorrectas} incorrectas</span>
          </span>
        )}
        {pendientesN > 0 && (
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>
            <span style={{ color: '#6b7a8d' }}>⏳ {pendientesN} pendientes</span>
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontFamily: 'Oswald, sans-serif', fontSize: 11, color: tipo === 'AUTOMATICA' ? '#3b82f6' : '#8dc63f' }}>
          {tipo === 'AUTOMATICA' ? '⚡ Modo Automático' : '🧠 Modo Manual'}
        </span>
      </div>

      {/* Tabla de predicciones */}
      <div style={{ padding: '8px 0 16px' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, padding: '8px 20px', marginBottom: 4 }}>
          {['PARTIDO / PREGUNTA', 'TU PREDICCIÓN', 'RESULTADO CORRECTO', ''].map((h, i) => (
            <div key={i} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', fontWeight: 600, letterSpacing: '0.06em' }}>{h}</div>
          ))}
        </div>

        {detalles.map((d, i) => {
          const resuelto   = d.valor_correcto !== null && d.valor_correcto !== undefined;
          const acertada   = d.es_acierto === true;
          const fallada    = d.es_acierto === false;
          const rowBg      = acertada ? 'rgba(141,198,63,0.05)' : fallada ? 'rgba(239,68,68,0.04)' : 'transparent';
          const borderLeft = acertada ? '3px solid #8dc63f40' : fallada ? '3px solid #f8717130' : '3px solid transparent';

          return (
            <div key={d.id || i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: 8, padding: '10px 20px',
              background: rowBg, borderLeft: borderLeft,
              borderBottom: i < detalles.length - 1 ? '1px solid #1e2a3a18' : 'none',
            }}>
              {/* Partido / Pregunta */}
              <div>
                {d.partido && (
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 2 }}>
                    ⚽ {d.partido}
                  </div>
                )}
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c0cad8', lineHeight: 1.4 }}>
                  {d.descripcion}
                </div>
                {d.resultado_partido && (
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 2 }}>
                    Resultado: {d.resultado_partido}
                  </div>
                )}
              </div>

              {/* Tu predicción */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  background: acertada ? 'rgba(141,198,63,0.15)' : fallada ? 'rgba(239,68,68,0.12)' : '#1e2535',
                  color: acertada ? '#8dc63f' : fallada ? '#f87171' : '#c0cad8',
                  fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600,
                  padding: '4px 10px', borderRadius: 5,
                  border: `1px solid ${acertada ? '#8dc63f30' : fallada ? '#f8717130' : '#1e2a3a'}`,
                }}>
                  {d.valor_elegido || '—'}
                </span>
              </div>

              {/* Respuesta correcta */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {resuelto ? (
                  <span style={{
                    background: 'rgba(141,198,63,0.1)', color: '#8dc63f',
                    fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 5, border: '1px solid #8dc63f25',
                  }}>
                    {d.valor_correcto}
                  </span>
                ) : (
                  <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 11 }}>
                    Por definir
                  </span>
                )}
              </div>

              {/* Icono resultado */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {acertada ? '✅' : fallada ? '❌' : '⏳'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⚽</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: '#fff', fontWeight: 700, marginBottom: 8 }}>AÚN NO TIENES PREDICCIONES</div>
      <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginBottom: 24 }}>Vuelve al inicio y elige un evento para hacer tu primera predicción.</p>
      <a href="/" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em' }}>VER EVENTOS →</a>
    </div>
  );
}
