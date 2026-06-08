import { useState } from 'react';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import Navbar from '../components/Navbar';

export default function CanjearPin() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!authService.isAuthenticated()) {
    window.location.href = '/login';
    return null;
  }

  const submit = async e => {
    e.preventDefault();
    if (!codigo.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const data = await dataService.canjearPin(codigo.trim().toUpperCase());
      setResult(data);
      setCodigo('');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Código inválido o ya utilizado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '48px 20px 60px' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.12em', marginBottom: 6 }}>RECARGA</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, color: '#fff', margin: 0 }}>Canjear PIN</h1>
          <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginTop: 8 }}>
            Ingresa tu código de recarga para acreditar vidas o créditos a tu cuenta.
          </p>
        </div>

        <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 10, padding: 28 }}>
          <form onSubmit={submit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8 }}>CÓDIGO PIN</label>
              <input
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
                maxLength={20}
                style={{
                  width: '100%',
                  background: '#0a0d14',
                  border: '1px solid #1e2a3a',
                  borderRadius: 6,
                  padding: '14px 16px',
                  color: '#e2e8f0',
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: 18,
                  letterSpacing: '0.1em',
                  outline: 'none',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '12px 16px', marginBottom: 16, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !codigo.trim()}
              style={{
                width: '100%',
                background: loading || !codigo.trim() ? '#1e2535' : '#8dc63f',
                color: loading || !codigo.trim() ? '#6b7a8d' : '#0a0d14',
                fontFamily: 'Oswald, sans-serif',
                fontSize: 15,
                fontWeight: 700,
                padding: '14px',
                borderRadius: 6,
                border: 'none',
                cursor: loading || !codigo.trim() ? 'not-allowed' : 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              {loading ? 'CANJEANDO...' : 'CANJEAR PIN'}
            </button>
          </form>
        </div>

        {result && (
          <div style={{ background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 10, padding: 24, marginTop: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: '#8dc63f', marginBottom: 8 }}>¡PIN Canjeado!</div>
            {result.vidas_acreditadas && (
              <div style={{ color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 15, marginBottom: 4 }}>
                +{result.vidas_acreditadas} vidas acreditadas
              </div>
            )}
            {result.creditos_acreditados && (
              <div style={{ color: '#a78bfa', fontFamily: 'Roboto, sans-serif', fontSize: 15, marginBottom: 4 }}>
                +{result.creditos_acreditados} créditos acreditados
              </div>
            )}
            {result.mensaje && (
              <div style={{ color: '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 13, marginTop: 8 }}>{result.mensaje}</div>
            )}
            <a href="/dashboard"
              style={{ display: 'inline-block', marginTop: 16, background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 24px', borderRadius: 6, textDecoration: 'none' }}>
              IR A MI PANEL
            </a>
          </div>
        )}

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <a href="/dashboard" style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none' }}>← Volver al panel</a>
        </div>
      </div>
    </div>
  );
}
