import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function NuevaClave() {
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get('token') || '';

  const [form,   setForm]   = useState({ password: '', confirmar: '' });
  const [estado, setEstado] = useState(token ? 'idle' : 'sin-token'); // idle|loading|ok|error|sin-token
  const [errMsg, setErrMsg] = useState('');
  const [ver,    setVer]    = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmar) {
      setErrMsg('Las contraseñas no coinciden'); return;
    }
    if (form.password.length < 6) {
      setErrMsg('La contraseña debe tener al menos 6 caracteres'); return;
    }
    setEstado('loading');
    setErrMsg('');
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setEstado('ok');
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'El enlace expiró o ya fue usado.');
      setEstado('error');
    }
  };

  /* ── Sin token ── */
  if (estado === 'sin-token') return (
    <div className="lk-auth-page">
      <div className="lk-auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: '#fff', marginBottom: 12 }}>
          Enlace inválido
        </h2>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', marginBottom: 24 }}>
          Este enlace no es válido o ya expiró. Solicita uno nuevo.
        </p>
        <a href="/recuperar-clave" className="lk-btn-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          SOLICITAR NUEVO ENLACE
        </a>
      </div>
    </div>
  );

  /* ── Éxito ── */
  if (estado === 'ok') return (
    <div className="lk-auth-page">
      <div className="lk-auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, color: '#fff', marginBottom: 12 }}>
          ¡Contraseña actualizada!
        </h2>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', marginBottom: 24, lineHeight: 1.7 }}>
          Tu contraseña fue restablecida correctamente.<br />Ya puedes iniciar sesión con tu nueva clave.
        </p>
        <a href="/login" className="lk-btn-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          IR AL INICIO DE SESIÓN
        </a>
      </div>
    </div>
  );

  /* ── Formulario ── */
  return (
    <div className="lk-auth-page">
      <div className="lk-auth-card">
        <a href="/" className="lk-auth-logo">
          <img loading="eager" decoding="async" src="/img/kicklast02.webp" alt="Kick Last" style={{ height: 36 }} />
        </a>
        <h2 className="lk-auth-title">Nueva contraseña</h2>
        <p className="lk-auth-sub">Escoge una contraseña segura de al menos 6 caracteres.</p>

        <form onSubmit={submit} className="lk-auth-form">
          <div className="lk-field">
            <label>Nueva contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                name="password" required
                type={ver ? 'text' : 'password'}
                value={form.password} onChange={handle}
                placeholder="Mínimo 6 caracteres"
                disabled={estado === 'loading'}
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setVer(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6b7a8d', fontSize: 16 }}>
                {ver ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="lk-field">
            <label>Confirmar contraseña</label>
            <input
              name="confirmar" required
              type={ver ? 'text' : 'password'}
              value={form.confirmar} onChange={handle}
              placeholder="Repite la contraseña"
              disabled={estado === 'loading'}
            />
          </div>

          {/* Indicador de fuerza */}
          {form.password && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(n => {
                  const fuerza = form.password.length >= 12 ? 4
                    : form.password.length >= 9 ? 3
                    : form.password.length >= 6 ? 2 : 1;
                  const color = fuerza >= 4 ? '#8dc63f' : fuerza >= 3 ? '#f59e0b' : fuerza >= 2 ? '#f59e0b' : '#f87171';
                  return <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= fuerza ? color : '#1e2a3a' }} />;
                })}
              </div>
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>
                {form.password.length >= 12 ? '💪 Muy segura' : form.password.length >= 9 ? '✅ Segura' : form.password.length >= 6 ? '⚠️ Aceptable' : '❌ Muy corta'}
              </span>
            </div>
          )}

          {/* Coincidencia */}
          {form.confirmar && (
            <div style={{ marginBottom: 12, fontFamily: 'Roboto, sans-serif', fontSize: 11 }}>
              {form.password === form.confirmar
                ? <span style={{ color: '#8dc63f' }}>✓ Las contraseñas coinciden</span>
                : <span style={{ color: '#f87171' }}>✗ Las contraseñas no coinciden</span>}
            </div>
          )}

          {(estado === 'error') && (
            <div className="lk-auth-error">{errMsg}</div>
          )}

          <button type="submit" className="lk-btn-submit"
            disabled={estado === 'loading' || form.password !== form.confirmar || form.password.length < 6}>
            {estado === 'loading' ? 'Guardando...' : 'GUARDAR NUEVA CONTRASEÑA'}
          </button>
        </form>
      </div>
    </div>
  );
}
