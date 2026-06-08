import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Recargar() {
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/login'); return; }
    dataService.getPaquetes()
      .then(data => setPaquetes(data))
      .catch(() => setPaquetes(DEMO_PAQUETES))
      .finally(() => setLoading(false));
  }, []);

  const comprar = async (pkg) => {
    setComprando(pkg.id);
    setError(''); setSuccess('');
    try {
      await api.post('/creditos/comprar', { paquete_id: pkg.id });
      setSuccess(`¡Recargaste ${pkg.creditos} créditos correctamente!`);
    } catch (e) {
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al procesar la compra');
    } finally { setComprando(null); }
  };

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 8 }}>RECARGAS Y VIDAS</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>PAQUETES DE CRÉDITOS</h1>
          <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginTop: 8 }}>Recarga tu cuenta y sigue jugando. Elige el paquete que mejor se adapte.</p>
        </div>

        {success && (
          <div style={{ background: 'rgba(141,198,63,0.1)', border: '1px solid rgba(141,198,63,0.3)', borderRadius: 8, padding: '14px 18px', color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginBottom: 24 }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '14px 18px', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: '#161e2e', borderRadius: 12, padding: 24, opacity: 0.5, height: 180 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {paquetes.map(pkg => (
              <PaqueteCard key={pkg.id} pkg={pkg} comprando={comprando} onComprar={comprar} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function PaqueteCard({ pkg, comprando, onComprar }) {
  const isPopular = pkg.destacado || pkg.popular;
  return (
    <div style={{
      background: isPopular ? 'linear-gradient(135deg, #1a2a1a, #162212)' : '#161e2e',
      border: isPopular ? '1px solid #8dc63f40' : '1px solid #1e2a3a',
      borderRadius: 12, padding: 24, position: 'relative',
      transition: 'transform 0.2s',
    }}>
      {isPopular && (
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: '0.1em' }}>
          POPULAR
        </div>
      )}
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#6b7a8d', letterSpacing: '0.08em', marginBottom: 8 }}>
        {pkg.nombre || `Paquete ${pkg.creditos}K`}
      </div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 40, fontWeight: 700, color: '#8dc63f', lineHeight: 1, marginBottom: 4 }}>
        {pkg.creditos?.toLocaleString() || '—'}
      </div>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginBottom: 16 }}>créditos</div>
      {pkg.vidas_bonus > 0 && (
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8dc63f', marginBottom: 12 }}>+ {pkg.vidas_bonus} vidas bonus</div>
      )}
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
        ${pkg.precio ? Number(pkg.precio).toLocaleString('es-CO') : '—'}
        <span style={{ fontSize: 12, color: '#6b7a8d', fontWeight: 400, marginLeft: 4 }}>{pkg.moneda || 'COP'}</span>
      </div>
      <button
        onClick={() => onComprar(pkg)}
        disabled={comprando === pkg.id}
        style={{ width: '100%', background: isPopular ? '#8dc63f' : '#1e2535', color: isPopular ? '#0a0d14' : '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 0', borderRadius: 6, border: isPopular ? 'none' : '1px solid #ffffff15', cursor: comprando === pkg.id ? 'not-allowed' : 'pointer', opacity: comprando === pkg.id ? 0.6 : 1, letterSpacing: '0.05em' }}
      >
        {comprando === pkg.id ? 'PROCESANDO...' : 'RECARGAR AHORA'}
      </button>
    </div>
  );
}

const DEMO_PAQUETES = [
  { id: 'd1', nombre: 'Básico', creditos: 1000, precio: 15000, moneda: 'COP', vidas_bonus: 0 },
  { id: 'd2', nombre: 'Pro', creditos: 5000, precio: 60000, moneda: 'COP', vidas_bonus: 2, destacado: true },
  { id: 'd3', nombre: 'Elite', creditos: 15000, precio: 150000, moneda: 'COP', vidas_bonus: 5 },
];
