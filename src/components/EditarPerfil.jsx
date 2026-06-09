/**
 * EditarPerfil — componente reutilizable para todos los paneles
 * (Dashboard usuario, PanelPromotor, PanelDistribuidor)
 *
 * Props:
 *   perfil       — objeto con datos actuales del usuario (de GET /usuarios/perfil o /auth/me)
 *   onActualizado — callback(perfilActualizado) cuando se guarda correctamente
 */
import { useState } from 'react';
import api from '../services/api';

/* ─── Helpers de estilo ─────────────────────────────────────────────────────── */
const S = {
  section: {
    background: '#0d1520',
    border: '1px solid #1e2a3a',
    borderRadius: 12,
    padding: '24px 28px',
    marginBottom: 16,
  },
  titulo: {
    fontFamily: 'Oswald, sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: '#8dc63f',
    letterSpacing: '0.1em',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #1e2a3a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.05em' },
  input: {
    background: '#0a0e1a',
    border: '1px solid #1e2a3a',
    borderRadius: 6,
    padding: '9px 12px',
    color: '#c0cad8',
    fontFamily: 'Roboto, sans-serif',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
  },
  btn: {
    background: '#8dc63f',
    color: '#0a0d14',
    fontFamily: 'Oswald, sans-serif',
    fontSize: 13,
    fontWeight: 700,
    border: 'none',
    borderRadius: 6,
    padding: '11px 28px',
    cursor: 'pointer',
    letterSpacing: '0.07em',
    marginTop: 8,
  },
  btnSecundario: {
    background: 'transparent',
    color: '#6b7a8d',
    fontFamily: 'Oswald, sans-serif',
    fontSize: 13,
    fontWeight: 700,
    border: '1px solid #1e2a3a',
    borderRadius: 6,
    padding: '11px 20px',
    cursor: 'pointer',
    letterSpacing: '0.07em',
    marginTop: 8,
    marginLeft: 10,
  },
  ok:  { fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#8dc63f', marginTop: 8 },
  err: { fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#f87171', marginTop: 8 },
};

const TIPOS_DOC = ['CEDULA', 'PASAPORTE', 'RUT', 'DNI', 'CURP', 'OTRO'];

/* ─── Sección editar perfil ───────────────────────────────────────────────── */
export function SeccionEditarPerfil({ perfil, onActualizado }) {
  const [form, setForm] = useState({
    nombre_completo:  perfil?.nombre_completo  || '',
    telefono:         perfil?.telefono         || '',
    fecha_nacimiento: perfil?.fecha_nacimiento ? perfil.fecha_nacimiento.split('T')[0] : '',
    tipo_documento:   perfil?.tipo_documento   || '',
    numero_documento: perfil?.numero_documento || '',
    pais_codigo:      perfil?.pais_codigo      || '',
    moneda:           perfil?.moneda           || 'COP',
  });
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null); // { tipo: 'ok'|'err', texto }

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const guardar = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await api.patch('/usuarios/perfil', form);
      setMsg({ tipo: 'ok', texto: '✓ Perfil actualizado correctamente' });
      onActualizado?.(data);
    } catch (err) {
      setMsg({ tipo: 'err', texto: err.response?.data?.message || 'Error al guardar los cambios' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.section}>
      <div style={S.titulo}>DATOS PERSONALES</div>
      <form onSubmit={guardar}>
        <div style={S.grid}>
          <div style={S.field}>
            <label style={S.label}>NOMBRE COMPLETO</label>
            <input style={S.input} name="nombre_completo" value={form.nombre_completo}
              onChange={handle} placeholder="Tu nombre completo"
              onFocus={e => e.target.style.borderColor = '#8dc63f'}
              onBlur={e => e.target.style.borderColor = '#1e2a3a'} />
          </div>
          <div style={S.field}>
            <label style={S.label}>TELÉFONO / WHATSAPP</label>
            <input style={S.input} name="telefono" value={form.telefono}
              onChange={handle} placeholder="+57 300 123 4567"
              onFocus={e => e.target.style.borderColor = '#8dc63f'}
              onBlur={e => e.target.style.borderColor = '#1e2a3a'} />
          </div>
          <div style={S.field}>
            <label style={S.label}>FECHA DE NACIMIENTO</label>
            <input style={S.input} type="date" name="fecha_nacimiento"
              value={form.fecha_nacimiento} onChange={handle}
              onFocus={e => e.target.style.borderColor = '#8dc63f'}
              onBlur={e => e.target.style.borderColor = '#1e2a3a'} />
          </div>
          <div style={S.field}>
            <label style={S.label}>TIPO DE DOCUMENTO</label>
            <select style={{ ...S.input, cursor: 'pointer' }} name="tipo_documento"
              value={form.tipo_documento} onChange={handle}>
              <option value="">Seleccionar...</option>
              {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>NÚMERO DE DOCUMENTO</label>
            <input style={S.input} name="numero_documento" value={form.numero_documento}
              onChange={handle} placeholder="Ej: 1234567890"
              onFocus={e => e.target.style.borderColor = '#8dc63f'}
              onBlur={e => e.target.style.borderColor = '#1e2a3a'} />
          </div>
          <div style={S.field}>
            <label style={S.label}>CÓDIGO DE PAÍS</label>
            <input style={S.input} name="pais_codigo" value={form.pais_codigo}
              onChange={handle} placeholder="+57"
              onFocus={e => e.target.style.borderColor = '#8dc63f'}
              onBlur={e => e.target.style.borderColor = '#1e2a3a'} />
          </div>
        </div>

        {msg && <div style={msg.tipo === 'ok' ? S.ok : S.err}>{msg.texto}</div>}
        <div style={{ marginTop: 20 }}>
          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? 'Guardando...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Sección cambiar contraseña ─────────────────────────────────────────── */
export function SeccionCambiarClave() {
  const [form, setForm] = useState({
    password_actual: '',
    password_nuevo:  '',
    confirmar:       '',
  });
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);
  const [ver,     setVer]     = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const guardar = async e => {
    e.preventDefault();
    if (form.password_nuevo !== form.confirmar) {
      setMsg({ tipo: 'err', texto: 'Las contraseñas nuevas no coinciden' }); return;
    }
    if (form.password_nuevo.length < 6) {
      setMsg({ tipo: 'err', texto: 'La nueva contraseña debe tener al menos 6 caracteres' }); return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await api.patch('/auth/cambiar-clave', {
        password_actual: form.password_actual,
        password_nuevo:  form.password_nuevo,
      });
      setMsg({ tipo: 'ok', texto: '✓ Contraseña actualizada correctamente' });
      setForm({ password_actual: '', password_nuevo: '', confirmar: '' });
    } catch (err) {
      setMsg({ tipo: 'err', texto: err.response?.data?.message || 'Error al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  const inputPwd = (name, placeholder) => (
    <div style={{ position: 'relative' }}>
      <input
        style={{ ...S.input, paddingRight: 38 }}
        type={ver ? 'text' : 'password'}
        name={name} value={form[name]}
        onChange={handle} placeholder={placeholder}
        required
        onFocus={e => e.target.style.borderColor = '#8dc63f'}
        onBlur={e => e.target.style.borderColor = '#1e2a3a'}
      />
      <button type="button" onClick={() => setVer(v => !v)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: '#6b7a8d', fontSize: 15 }}>
        {ver ? '🙈' : '👁'}
      </button>
    </div>
  );

  return (
    <div style={S.section}>
      <div style={S.titulo}>CAMBIAR CONTRASEÑA</div>
      <form onSubmit={guardar}>
        <div style={{ ...S.grid, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          <div style={S.field}>
            <label style={S.label}>CONTRASEÑA ACTUAL</label>
            {inputPwd('password_actual', '••••••••')}
          </div>
          <div style={S.field}>
            <label style={S.label}>NUEVA CONTRASEÑA</label>
            {inputPwd('password_nuevo', 'Mínimo 6 caracteres')}
          </div>
          <div style={S.field}>
            <label style={S.label}>CONFIRMAR NUEVA CONTRASEÑA</label>
            {inputPwd('confirmar', 'Repite la nueva contraseña')}
          </div>
        </div>

        {form.confirmar && (
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 8 }}>
            {form.password_nuevo === form.confirmar
              ? <span style={{ color: '#8dc63f' }}>✓ Las contraseñas coinciden</span>
              : <span style={{ color: '#f87171' }}>✗ Las contraseñas no coinciden</span>}
          </div>
        )}

        {msg && <div style={msg.tipo === 'ok' ? S.ok : S.err}>{msg.texto}</div>}
        <div style={{ marginTop: 20 }}>
          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? 'Guardando...' : 'CAMBIAR CONTRASEÑA'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Export default: ambas secciones juntas ─────────────────────────────── */
export default function EditarPerfil({ perfil, onActualizado }) {
  return (
    <>
      <SeccionEditarPerfil perfil={perfil} onActualizado={onActualizado} />
      <SeccionCambiarClave />
    </>
  );
}
