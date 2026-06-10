import { useState } from 'react';
import api from '../services/api';

export default function RecuperarClave() {
  const [email,   setEmail]   = useState('');
  const [estado,  setEstado]  = useState('idle'); // idle | loading | ok | error
  const [errMsg,  setErrMsg]  = useState('');

  const submit = async e => {
    e.preventDefault();
    setEstado('loading');
    setErrMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setEstado('ok');
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Ocurrió un error. Intenta de nuevo.');
      setEstado('error');
    }
  };

  return (
    <div className="lk-auth-page">
      <div className="lk-auth-card">
        <a href="/" className="lk-auth-logo">
          <img loading="eager" decoding="async" src="/img/kicklast02.webp" alt="Kick Last" style={{ height: 36 }} />
        </a>

        {estado === 'ok' ? (
          /* ── Éxito ── */
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Revisa tu correo
            </h2>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', lineHeight: 1.7, marginBottom: 24 }}>
              Si el email <strong style={{ color: '#c0cad8' }}>{email}</strong> está registrado,
              recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568', marginBottom: 24 }}>
              ¿No llegó? Revisa la carpeta de spam o vuelve a intentarlo.
            </p>
            <a href="/login" style={{
              display: 'block', textAlign: 'center',
              fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700,
              color: '#8dc63f', textDecoration: 'none', letterSpacing: '0.06em',
            }}>
              ← Volver al inicio de sesión
            </a>
          </div>
        ) : (
          /* ── Formulario ── */
          <>
            <h2 className="lk-auth-title">¿Olvidaste tu contraseña?</h2>
            <p className="lk-auth-sub">
              Ingresa tu email y te enviaremos un enlace para restablecerla.
            </p>
            <form onSubmit={submit} className="lk-auth-form">
              <div className="lk-field">
                <label>Email registrado</label>
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={estado === 'loading'}
                />
              </div>
              {estado === 'error' && (
                <div className="lk-auth-error">{errMsg}</div>
              )}
              <button type="submit" className="lk-btn-submit" disabled={estado === 'loading'}>
                {estado === 'loading' ? 'Enviando...' : 'ENVIAR ENLACE'}
              </button>
            </form>
            <p className="lk-auth-footer">
              <a href="/login">← Volver al inicio de sesión</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
