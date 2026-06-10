import { useState } from 'react';
import { authService } from '../services/authService';
import { validateRegisterForm, isStrongPassword, PASSWORD_HINT, isValidPhone } from '../utils/sanitize';

const PAISES = [
  { code: 'CO', label: '🇨🇴 Colombia', moneda: 'COP' },
  { code: 'MX', label: '🇲🇽 México', moneda: 'MXN' },
  { code: 'AR', label: '🇦🇷 Argentina', moneda: 'ARS' },
  { code: 'PE', label: '🇵🇪 Perú', moneda: 'PEN' },
  { code: 'CL', label: '🇨🇱 Chile', moneda: 'CLP' },
  { code: 'EC', label: '🇪🇨 Ecuador', moneda: 'USD' },
  { code: 'VE', label: '🇻🇪 Venezuela', moneda: 'USD' },
  { code: 'US', label: '🇺🇸 Estados Unidos', moneda: 'USD' },
  { code: 'ES', label: '🇪🇸 España', moneda: 'EUR' },
];

export default function Register() {
  // Pre-llenar código referido desde URL (?ref=LK-XXXX)
  const refFromUrl = new URLSearchParams(window.location.search).get('ref') || '';
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '', telefono: '', pais: 'CO', referido_por: refFromUrl, acepta_terminos: false });
  const [mostrarReferido, setMostrarReferido] = useState(!!refFromUrl);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const moneda = PAISES.find(p => p.code === form.pais)?.moneda || 'COP';

  const submit = async e => {
    e.preventDefault();
    setError('');

    // Validaciones de seguridad
    if (form.password !== form.confirmar) { setError('Las contraseñas no coinciden'); return; }
    if (!isStrongPassword(form.password)) { setError(PASSWORD_HINT); return; }
    if (form.telefono && !isValidPhone(form.telefono)) { setError('Teléfono inválido. Ejemplo: +57 3001234567'); return; }

    const { valid, errors: valErrors } = validateRegisterForm(form);
    if (!valid) { setError(Object.values(valErrors)[0]); return; }

    if (!form.acepta_terminos) { setError('Debes aceptar los términos y condiciones para continuar'); return; }
    setLoading(true);
    try {
      const payload = { nombre: form.nombre, email: form.email, password: form.password, pais: form.pais, moneda };
      if (form.telefono) payload.telefono = form.telefono;
      if (form.referido_por.trim()) payload.referido_por = form.referido_por.trim().toUpperCase();
      await authService.register(payload);
      // Token ya guardado en authService.register()
      setSuccess(true);
      setTimeout(() => { window.location.href = '/dashboard'; }, 2200);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="lk-auth-page">
      <div className="lk-auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h2 className="lk-auth-title" style={{ color: '#8dc63f' }}>¡Bienvenido!</h2>
        <p className="lk-auth-sub">Tu cuenta fue creada. Recibirás <strong style={{ color: '#8dc63f' }}>$10 de bienvenida</strong> en tu saldo.</p>
        <div style={{ marginTop: 20, color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>Redirigiendo a tu perfil...</div>
      </div>
    </div>
  );

  return (
    <div className="lk-auth-page">
      <div className="lk-auth-card">
        <a href="/" className="lk-auth-logo">
          <img src="/img/kicklast02.png" alt="Kick Last" style={{ height: 36 }} />
        </a>
        <h2 className="lk-auth-title">Crear cuenta gratis</h2>
        <p className="lk-auth-sub">Únete a miles de jugadores del Mundial 2026</p>

        <form onSubmit={submit} className="lk-auth-form">
          <div className="lk-field">
            <label>Nombre completo</label>
            <input name="nombre" type="text" value={form.nombre} onChange={handle} required placeholder="Tu nombre" autoComplete="name" />
          </div>
          <div className="lk-field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="tu@email.com" autoComplete="email" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="lk-field">
              <label>País</label>
              <select name="pais" value={form.pais} onChange={handle}
                style={{ width: '100%', background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 6, padding: '11px 12px', color: '#fff', fontFamily: 'Roboto, sans-serif', fontSize: 14, outline: 'none' }}>
                {PAISES.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
              </select>
            </div>
            <div className="lk-field">
              <label>Moneda</label>
              <input value={moneda} readOnly style={{ width: '100%', background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 6, padding: '11px 12px', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div className="lk-field">
            <label>Teléfono <span style={{ color: '#6b7a8d', fontSize: 11 }}>(opcional)</span></label>
            <input name="telefono" type="tel" value={form.telefono} onChange={handle} placeholder="+57 300 123 4567" autoComplete="tel" />
          </div>
          <div className="lk-field">
            <label>Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handle} required placeholder="Mínimo 8 car. + mayúsc. + número" minLength={8} maxLength={128} autoComplete="new-password" />
          </div>
          <div className="lk-field">
            <label>Confirmar contraseña</label>
            <input name="confirmar" type="password" value={form.confirmar} onChange={handle} required placeholder="Repite tu contraseña" autoComplete="new-password" />
          </div>

          {/* Términos y condiciones */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 4, marginBottom: 4 }}>
            <input
              name="acepta_terminos"
              type="checkbox"
              checked={form.acepta_terminos}
              onChange={handle}
              style={{ marginTop: 3, accentColor: '#8dc63f', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', lineHeight: 1.6 }}>
              He leído y acepto los{' '}
              <a href="/terminos" target="_blank" rel="noopener noreferrer" style={{ color: '#8dc63f', textDecoration: 'none' }}>
                Términos y Condiciones
              </a>{' '}
              y la{' '}
              <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={{ color: '#8dc63f', textDecoration: 'none' }}>
                Política de Privacidad y Tratamiento de Datos
              </a>
            </span>
          </label>

          {/* Código de referido — colapsable */}
          {!mostrarReferido ? (
            <button type="button" onClick={() => setMostrarReferido(true)}
              style={{ background: 'none', border: 'none', color: '#8dc63f', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', padding: '4px 0', textAlign: 'left', fontFamily: 'Roboto, sans-serif' }}>
              🎁 ¿Tienes un código de referido?
            </button>
          ) : (
            <div className="lk-field">
              <label>Código de referido <span style={{ color: '#6b7a8d', fontSize: 11 }}>(opcional)</span></label>
              <input name="referido_por" type="text" value={form.referido_por} onChange={handle}
                placeholder="Ej: LK-A3B7X2" autoComplete="off"
                style={{ textTransform: 'uppercase', letterSpacing: 2 }} />
            </div>
          )}

          {error && <div className="lk-auth-error">{error}</div>}

          <button type="submit" className="lk-btn-submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : '+ Crear cuenta gratis'}
          </button>
        </form>

        <p className="lk-auth-footer">¿Ya tienes cuenta? <a href="/login">Ingresar</a></p>
      </div>
    </div>
  );
}
