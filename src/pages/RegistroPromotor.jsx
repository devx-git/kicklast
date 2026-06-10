import { useState } from 'react';
import api from '../services/api';

const PAISES = [
  { code: 'CO', label: '🇨🇴 Colombia', moneda: 'COP', prefijo: '+57' },
  { code: 'MX', label: '🇲🇽 México', moneda: 'MXN', prefijo: '+52' },
  { code: 'AR', label: '🇦🇷 Argentina', moneda: 'ARS', prefijo: '+54' },
  { code: 'PE', label: '🇵🇪 Perú', moneda: 'PEN', prefijo: '+51' },
  { code: 'CL', label: '🇨🇱 Chile', moneda: 'CLP', prefijo: '+56' },
  { code: 'EC', label: '🇪🇨 Ecuador', moneda: 'USD', prefijo: '+593' },
  { code: 'VE', label: '🇻🇪 Venezuela', moneda: 'USD', prefijo: '+58' },
  { code: 'US', label: '🇺🇸 Estados Unidos', moneda: 'USD', prefijo: '+1' },
  { code: 'ES', label: '🇪🇸 España', moneda: 'EUR', prefijo: '+34' },
];

const INPUT = {
  width: '100%',
  background: '#0a0d14',
  border: '1px solid #1e2a3a',
  borderRadius: 6,
  padding: '11px 14px',
  color: '#e2e8f0',
  fontFamily: 'Roboto, sans-serif',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const LABEL = {
  display: 'block',
  color: '#6b7a8d',
  fontFamily: 'Roboto, sans-serif',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  marginBottom: 6,
};

export default function RegistroPromotor() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmar: '',
    pais: 'CO',
    subdominio: '',
    acepta_terminos: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const paisData = PAISES.find(p => p.code === form.pais) || PAISES[0];

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (!form.acepta_terminos) { setError('Debes aceptar los términos y condiciones'); return; }

    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        pais: paisData.label.replace(/[^\w\s]/gi, '').trim(),
        pais_codigo: paisData.prefijo,
        moneda: paisData.moneda,
        acepta_terminos: true,
      };
      if (form.subdominio.trim()) payload.subdominio = form.subdominio.trim().toLowerCase().replace(/\s+/g, '-');

      const { data } = await api.post('/auth/registro-promotor', payload);
      if (data.access_token) localStorage.setItem('token', data.access_token);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al registrar promotor');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0f1420', border: '1px solid #8dc63f30', borderRadius: 12, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, color: '#8dc63f', margin: '0 0 12px' }}>¡Cuenta de Promotor Creada!</h2>
        <p style={{ color: '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 14, lineHeight: 1.6 }}>
          Tu cuenta fue registrada exitosamente. Ahora puedes acceder a tu panel de promotor para crear eventos y gestionar distribuidores.
        </p>
        <a href="/promotor" style={{ display: 'inline-block', marginTop: 24, background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '13px 32px', borderRadius: 6, textDecoration: 'none' }}>
          IR A MI PANEL →
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a href="/"><img loading="eager" decoding="async" src="/img/kicklast02.webp" alt="Kick Last" style={{ height: 36, marginBottom: 20 }} /></a>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.15em', marginBottom: 8 }}>ZONA DE PROMOTORES</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, color: '#fff', margin: 0 }}>Registrar mi empresa</h1>
          <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, marginTop: 8 }}>Crea tu cuenta de promotor para gestionar eventos y distribuidores</p>
        </div>

        <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 12, padding: '32px 28px' }}>
          <form onSubmit={submit}>
            {/* Nombre empresa */}
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL}>NOMBRE DE LA EMPRESA / MARCA</label>
              <input name="nombre" value={form.nombre} onChange={handle} required placeholder="Ej: Predicciones Colombia" style={INPUT} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL}>EMAIL</label>
              <input name="email" type="email" value={form.email} onChange={handle} required placeholder="tu@empresa.com" style={INPUT} />
            </div>

            {/* País + Moneda */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={LABEL}>PAÍS</label>
                <select name="pais" value={form.pais} onChange={handle} style={{ ...INPUT, cursor: 'pointer' }}>
                  {PAISES.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL}>MONEDA</label>
                <input value={paisData.moneda} readOnly style={{ ...INPUT, color: '#6b7a8d' }} />
              </div>
            </div>

            {/* Subdominio */}
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL}>SUBDOMINIO <span style={{ color: '#4a5568', fontSize: 10 }}>(opcional)</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <input
                  name="subdominio"
                  value={form.subdominio}
                  onChange={handle}
                  placeholder="mi-empresa"
                  style={{ ...INPUT, borderRadius: '6px 0 0 6px', flex: 1 }}
                />
                <span style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderLeft: 'none', borderRadius: '0 6px 6px 0', padding: '11px 14px', color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 13, whiteSpace: 'nowrap' }}>
                  .kicklast.app
                </span>
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={LABEL}>CONTRASEÑA</label>
                <input name="password" type="password" value={form.password} onChange={handle} required minLength={6} placeholder="Mínimo 6 caracteres" style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>CONFIRMAR</label>
                <input name="confirmar" type="password" value={form.confirmar} onChange={handle} required placeholder="Repite la contraseña" style={INPUT} />
              </div>
            </div>

            {/* Términos */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
              <input name="acepta_terminos" type="checkbox" checked={form.acepta_terminos} onChange={handle} style={{ marginTop: 2, accentColor: '#8dc63f', width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', lineHeight: 1.5 }}>
                He leído y acepto los{' '}
                <a href="/terminos" target="_blank" rel="noopener noreferrer" style={{ color: '#8dc63f', textDecoration: 'none' }}>Términos y Condiciones</a>
                {' '}y la{' '}
                <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={{ color: '#8dc63f', textDecoration: 'none' }}>Política de Privacidad y Tratamiento de Datos</a>
              </span>
            </label>

            {error && (
              <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '12px 16px', marginBottom: 16, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#1e2535' : '#8dc63f', color: loading ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700, padding: '14px', borderRadius: 6, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}>
              {loading ? 'REGISTRANDO...' : 'CREAR CUENTA DE PROMOTOR'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>
          ¿Ya tienes cuenta? <a href="/login" style={{ color: '#8dc63f', textDecoration: 'none' }}>Ingresar</a>
          &nbsp;·&nbsp;
          <a href="/register" style={{ color: '#6b7a8d', textDecoration: 'none' }}>Cuenta de jugador</a>
        </p>
      </div>
    </div>
  );
}
