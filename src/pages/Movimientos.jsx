import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TIPO_CONFIG = {
  RECARGA: { label: 'Recarga', color: '#8dc63f', sign: '+' },
  RETIRO: { label: 'Retiro', color: '#f87171', sign: '-' },
  PREDICCION: { label: 'Predicción', color: '#6b7a8d', sign: '-' },
  GANANCIA: { label: 'Ganancia', color: '#8dc63f', sign: '+' },
  BIENVENIDA: { label: 'Bienvenida', color: '#8dc63f', sign: '+' },
  APUESTA: { label: 'Apuesta', color: '#6b7a8d', sign: '-' },
  APUESTA_GANADA: { label: 'Apuesta ganada', color: '#8dc63f', sign: '+' },
  APUESTA_PERDIDA: { label: 'Apuesta perdida', color: '#f87171', sign: '-' },
  REFERIDO_GANADO: { label: 'Referido', color: '#8dc63f', sign: '+' },
  BONUS: { label: 'Bonus', color: '#8dc63f', sign: '+' },
  RECARGA_PIN: { label: 'Recarga PIN', color: '#8dc63f', sign: '+' },
  RECARGA_DIGITAL: { label: 'Recarga digital', color: '#8dc63f', sign: '+' },
};

export default function Movimientos() {
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/login'); return; }
    dataService.getMisMovimientos()
      .then(data => setMovs(Array.isArray(data) ? data : []))
      .catch(e => {
        if (e.response?.status === 401) { navigate('/login'); return; }
        setError(e.response?.data?.message || 'Error al cargar movimientos');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 8 }}>MI CUENTA</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>MOVIMIENTOS</h1>
          <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginTop: 8 }}>Historial completo de transacciones en tu cuenta.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '14px 18px', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ background: '#161e2e', borderRadius: 8, height: 64, opacity: 0.5 }} />)}
          </div>
        ) : movs.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 12, overflow: 'hidden' }}>
            {movs.map((m, i) => <MovRow key={m.id || i} m={m} isLast={i === movs.length - 1} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function MovRow({ m, isLast }) {
  const cfg = TIPO_CONFIG[m.tipo] || { label: m.tipo, color: '#6b7a8d', sign: '' };
  const fecha = m.creado_en ? new Date(m.creado_en).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
  const monto = Number(m.monto || 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: isLast ? 'none' : '1px solid #1e2a3a', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
          {cfg.sign === '+' ? '↑' : cfg.sign === '-' ? '↓' : '·'}
        </div>
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: '#fff', fontWeight: 600 }}>{cfg.label}</div>
          {m.descripcion && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>{m.descripcion}</div>}
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d40' }}>{fecha}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: cfg.color }}>
          {cfg.sign}{monto > 0 ? '$' + monto.toLocaleString('es-CO', { maximumFractionDigits: 0 }) : '—'}
        </div>
        {m.saldo_resultante != null && (
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>
            Saldo: ${Number(m.saldo_resultante).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: '#fff', fontWeight: 700, marginBottom: 8 }}>SIN MOVIMIENTOS</div>
      <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>Aún no hay transacciones registradas en tu cuenta.</p>
    </div>
  );
}
