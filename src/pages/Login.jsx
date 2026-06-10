import { useState } from 'react';
import { authService } from '../services/authService';
import { validateLoginForm } from '../utils/sanitize';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    // Limpiar error del campo al editar
    setFieldErrors(fe => ({ ...fe, [e.target.name]: undefined }));
  };

  const submit = async e => {
    e.preventDefault();
    setError('');

    // Validación de formato en el cliente antes de enviar
    const { valid, errors } = validateLoginForm(form);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await authService.login(form);
      // Token ya guardado en authService.login()
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lk-auth-page">
      <div className="lk-auth-card">
        <a href="/" className="lk-auth-logo">
          <img loading="eager" decoding="async" src="/img/kicklast02.webp" alt="Kick Last" style={{ height: 36 }} />
        </a>
        <h2 className="lk-auth-title">Acceder</h2>
        <p className="lk-auth-sub">Ingresa a tu cuenta para continuar</p>
        <form onSubmit={submit} className="lk-auth-form">
          <div className="lk-field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="tu@email.com" autoComplete="email" maxLength={120} />
            {fieldErrors.email && <span style={{ color: '#e74c3c', fontSize: 11 }}>{fieldErrors.email}</span>}
          </div>
          <div className="lk-field">
            <label>Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••" autoComplete="current-password" maxLength={128} />
            {fieldErrors.password && <span style={{ color: '#e74c3c', fontSize: 11 }}>{fieldErrors.password}</span>}
          </div>
          {error && <div className="lk-auth-error">{error}</div>}
          <div style={{ textAlign: 'right', marginBottom: 8 }}>
            <a href="/recuperar-clave" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#8dc63f'}
              onMouseLeave={e => e.target.style.color = '#6b7a8d'}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <button type="submit" className="lk-btn-submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="lk-auth-footer">¿No tienes cuenta? <a href="/register">Crear cuenta gratis</a></p>
      </div>
    </div>
  );
}
