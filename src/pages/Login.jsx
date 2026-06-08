import { useState } from 'react';
import { authService } from '../services/authService';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
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
          <img src="/img/kicklast02.png" alt="Kick Last" style={{ height: 36 }} />
        </a>
        <h2 className="lk-auth-title">Acceder</h2>
        <p className="lk-auth-sub">Ingresa a tu cuenta para continuar</p>
        <form onSubmit={submit} className="lk-auth-form">
          <div className="lk-field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="tu@email.com" />
          </div>
          <div className="lk-field">
            <label>Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••" />
          </div>
          {error && <div className="lk-auth-error">{error}</div>}
          <button type="submit" className="lk-btn-submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="lk-auth-footer">¿No tienes cuenta? <a href="/register">Crear cuenta gratis</a></p>
      </div>
    </div>
  );
}
