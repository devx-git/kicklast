import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import Navbar from '../components/Navbar';
import { creditosAVidas, creditosAMonedaLocal } from '../utils/currency';

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

const FIELD_STYLE = {
  width: '100%',
  background: '#0a0d14',
  border: '1px solid #1e2a3a',
  borderRadius: 6,
  padding: '10px 12px',
  color: '#e2e8f0',
  fontFamily: 'Roboto, sans-serif',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

function ReferidoCard({ codigo }) {
  const [copiado, setCopiado] = useState(false);
  const enlace = `${window.location.origin}/register?ref=${codigo}`;

  const copiar = () => {
    navigator.clipboard?.writeText(enlace).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    });
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #1a0f2e 0%, #0f1420 100%)', border: '1px solid #a78bfa30', borderRadius: 8, padding: '20px 24px', marginBottom: 24 }}>
      <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 12 }}>🎁 TU CÓDIGO DE REFERIDO</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ background: '#0a0d14', border: '1px solid #a78bfa40', borderRadius: 6, padding: '10px 20px', fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, color: '#a78bfa', letterSpacing: 4 }}>
          {codigo}
        </div>
        <button onClick={copiar}
          style={{ background: copiado ? '#8dc63f' : '#1e2535', color: copiado ? '#0a0d14' : '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 18px', borderRadius: 6, border: `1px solid ${copiado ? '#8dc63f' : '#a78bfa30'}`, cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.2s' }}>
          {copiado ? '✓ COPIADO' : '📋 COPIAR ENLACE'}
        </button>
      </div>
      <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 10 }}>
        Comparte este enlace y gana bonos cuando tus referidos se registren y recarguen.
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionError, setSessionError] = useState('');

  // Role-based redirect
  useEffect(() => {
    const payload = authService.getPayload();
    if (payload?.rol === 'ADMIN' || payload?.rol === 'SUPER_ADMIN') {
      window.location.replace('/admin');
      return;
    }
    if (payload?.rol === 'PROMOTOR') {
      window.location.replace('/promotor');
      return;
    }
    if (payload?.rol === 'DISTRIBUIDOR') {
      window.location.replace('/distribuidor');
      return;
    }
  }, []);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  const loadPerfil = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const data = await dataService.getPerfil();
      setUser(data);
      setSessionError('');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setSessionError('Tu sesión expiró. Vuelve a ingresar.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    loadPerfil(false);
  }, []);

  const startEdit = () => {
    setEditForm({
      nombre_completo: user?.nombre_completo || user?.nombre || '',
      telefono: user?.telefono || '',
      pais_codigo: user?.pais_codigo || user?.pais || 'CO',
      moneda: user?.moneda || 'COP',
      fecha_nacimiento: user?.fecha_nacimiento ? user.fecha_nacimiento.slice(0, 10) : '',
      tipo_documento: user?.tipo_documento || '',
      numero_documento: user?.numero_documento || '',
      avatar_url: user?.avatar_url || '',
    });
    setSaveMsg('');
    setSaveError('');
    setEditing(true);
  };

  const handleEdit = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submitEdit = async e => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      const payload = {};
      if (editForm.nombre_completo?.trim()) payload.nombre_completo = editForm.nombre_completo.trim();
      if (editForm.telefono?.trim()) payload.telefono = editForm.telefono.trim();
      if (editForm.pais_codigo?.trim()) payload.pais_codigo = editForm.pais_codigo.trim();
      if (editForm.moneda) payload.moneda = editForm.moneda;
      if (editForm.fecha_nacimiento) payload.fecha_nacimiento = editForm.fecha_nacimiento;
      if (editForm.tipo_documento) payload.tipo_documento = editForm.tipo_documento;
      if (editForm.numero_documento?.trim()) payload.numero_documento = editForm.numero_documento.trim();
      if (editForm.avatar_url?.trim()) payload.avatar_url = editForm.avatar_url.trim();

      await dataService.updatePerfil(payload);
      setSaveMsg('✓ Perfil actualizado');
      setEditing(false);
      await loadPerfil(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      setSaveError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 18 }}>Cargando perfil...</div>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 20, padding: 20 }}>
          <div style={{ fontSize: 48 }}>🔒</div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, color: '#fff', textAlign: 'center' }}>{sessionError}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/login" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em' }}>
              INGRESAR DE NUEVO
            </a>
            <a href="/" style={{ background: '#1e2535', color: '#c0cad8', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 6, textDecoration: 'none', border: '1px solid #ffffff12' }}>
              ← Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.12em', marginBottom: 4 }}>PANEL DE JUGADOR</div>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, color: '#fff', margin: 0 }}>
              {user?.nombre || user?.nombre_completo || user?.email || 'Mi Cuenta'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadPerfil(true)}
              disabled={refreshing}
              title="Actualizar datos"
              style={{ background: '#1e2535', color: refreshing ? '#6b7a8d' : '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 14px', borderRadius: 6, border: '1px solid #8dc63f30', cursor: refreshing ? 'not-allowed' : 'pointer' }}
            >
              {refreshing ? '↻ ...' : '↻ ACTUALIZAR'}
            </button>
            <button
              onClick={startEdit}
              style={{ background: '#1e2535', color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 14px', borderRadius: 6, border: '1px solid #00d4ff30', cursor: 'pointer', letterSpacing: '0.04em' }}
            >
              ✏ EDITAR PERFIL
            </button>
            <button
              onClick={() => authService.logout()}
              style={{ background: '#1e2535', color: '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 14px', borderRadius: 6, border: '1px solid #f8717130', cursor: 'pointer', letterSpacing: '0.04em' }}
            >
              SALIR
            </button>
          </div>
        </div>

        {/* Success message after save */}
        {saveMsg && !editing && (
          <div style={{ background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>
            {saveMsg}
          </div>
        )}

        {/* Inline edit form */}
        {editing && (
          <div style={{ background: '#0f1420', border: '1px solid #00d4ff30', borderRadius: 8, padding: 24, marginBottom: 24 }}>
            <div style={{ color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 20 }}>EDITAR PERFIL</div>
            <form onSubmit={submitEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>NOMBRE COMPLETO</label>
                  <input name="nombre_completo" value={editForm.nombre_completo} onChange={handleEdit} placeholder="Tu nombre completo" style={FIELD_STYLE} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>TELÉFONO</label>
                  <input name="telefono" value={editForm.telefono} onChange={handleEdit} placeholder="+57 300 123 4567" style={FIELD_STYLE} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>CÓDIGO DE PAÍS</label>
                  <select name="pais_codigo" value={editForm.pais_codigo} onChange={handleEdit} style={{ ...FIELD_STYLE, cursor: 'pointer' }}>
                    {PAISES.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>MONEDA</label>
                  <select name="moneda" value={editForm.moneda} onChange={handleEdit} style={{ ...FIELD_STYLE, cursor: 'pointer' }}>
                    {['COP','USD','EUR','MXN','ARS','PEN','CLP','BRL'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>FECHA DE NACIMIENTO</label>
                  <input name="fecha_nacimiento" type="date" value={editForm.fecha_nacimiento} onChange={handleEdit} style={FIELD_STYLE} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>TIPO DE DOCUMENTO</label>
                  <select name="tipo_documento" value={editForm.tipo_documento} onChange={handleEdit} style={{ ...FIELD_STYLE, cursor: 'pointer' }}>
                    <option value="">— Seleccionar —</option>
                    <option value="CEDULA">Cédula</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="RUT">RUT</option>
                    <option value="DNI">DNI</option>
                    <option value="CURP">CURP</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>NÚMERO DE DOCUMENTO</label>
                  <input name="numero_documento" value={editForm.numero_documento} onChange={handleEdit} placeholder="12345678" style={FIELD_STYLE} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>AVATAR URL <span style={{ color: '#4a5568', fontSize: 10 }}>(opcional)</span></label>
                  <input name="avatar_url" value={editForm.avatar_url} onChange={handleEdit} placeholder="https://..." style={FIELD_STYLE} />
                </div>
              </div>
              {saveError && (
                <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                  {saveError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ background: saving ? '#1e2535' : '#00d4ff', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '11px 24px', borderRadius: 6, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '0.04em' }}
                >
                  {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  style={{ background: 'transparent', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '11px 20px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: 'pointer' }}
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats cards — 1 crédito = 1 USD = 1 vida */}
        {(() => {
          const cr = Number(user?.creditos ?? user?.saldo ?? 0);
          const vidas = creditosAVidas(cr);
          const moneda = user?.moneda || 'USD';
          const localStr = moneda !== 'USD' ? creditosAMonedaLocal(cr, moneda) : '';
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '18px 16px' }}>
                <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{cr.toLocaleString('es-CO')} cr</div>
                <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginBottom: 4 }}>≈ ${cr.toLocaleString('es-CO')} USD{localStr ? ` · ${localStr}` : ''}</div>
                <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}>CRÉDITOS</div>
              </div>
              <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '18px 16px' }}>
                <div style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{vidas.toLocaleString('es-CO')}</div>
                <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginBottom: 4 }}>= {cr.toLocaleString('es-CO')} créditos</div>
                <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}>VIDAS</div>
              </div>
              <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '18px 16px' }}>
                <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{user?.racha ?? 0}</div>
                <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginBottom: 4 }}>mejor: {user?.mejor_racha ?? 0}</div>
                <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}>RACHA</div>
              </div>
              <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '18px 16px' }}>
                <div style={{ color: user?.estado_juego === 'VIVO' ? '#8dc63f' : user?.estado_juego === 'EN_COMA' ? '#f59e0b' : '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 2 }}>
                  {user?.estado_juego || 'VIVO'}
                </div>
                <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginBottom: 4 }}>
                  {user?.total_predicciones ?? 0} pred. · {user?.predicciones_correctas ?? 0} correctas
                </div>
                <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em' }}>ESTADO</div>
              </div>
            </div>
          );
        })()}

        {/* Rol + referido badge */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {user?.rol && (
            <span style={{ background: '#1e2535', color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 4, border: '1px solid #00d4ff25', letterSpacing: '0.08em' }}>
              ROL: {user.rol}
            </span>
          )}
          {user?.codigo_referido && (
            <span
              style={{ background: '#1e2535', color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 4, border: '1px solid #a78bfa25', letterSpacing: '0.08em', cursor: 'pointer' }}
              onClick={() => navigator.clipboard?.writeText(user.codigo_referido)}
              title="Click para copiar"
            >
              🔗 REFERIDO: {user.codigo_referido}
            </span>
          )}
          {user?.codigo_jugador && (
            <span style={{ background: '#1e2535', color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 4, border: '1px solid #f59e0b25', letterSpacing: '0.08em' }}>
              # {user.codigo_jugador}
            </span>
          )}
        </div>

        {/* Tarjeta de código de referido */}
        {user?.codigo_referido && (
          <ReferidoCard codigo={user.codigo_referido} />
        )}

        {/* Profile info */}
        <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 16 }}>INFORMACIÓN DE CUENTA</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 24px' }}>
            {[
              ['Email', user?.email],
              ['Nombre', user?.nombre || user?.nombre_completo],
              ['País', user?.pais_codigo || user?.pais],
              ['Moneda', user?.moneda],
              ['Teléfono', user?.telefono],
              ['Racha', user?.racha != null ? `${user.racha} días` : null],
              ['Predicciones', user?.total_predicciones != null ? `${user.total_predicciones} (${user.predicciones_correctas || 0} correctas)` : null],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k}>
                <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 3 }}>{k.toUpperCase()}</div>
                <div style={{ color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { href: '/mis-predicciones', label: '⚽ MIS PREDICCIONES', desc: 'Historial de apuestas' },
            { href: '/mis-apuestas', label: '🎰 MIS APUESTAS', desc: 'Apuestas 1-X-2' },
            { href: '/movimientos', label: '📊 MOVIMIENTOS', desc: 'Todas las transacciones' },
            { href: '/retiros', label: '💸 RETIROS', desc: 'Solicitar retiro' },
            { href: '/recargar', label: '⚡ RECARGAR', desc: 'Comprar créditos y vidas' },
            { href: '/canjear-pin', label: '🔑 CANJEAR PIN', desc: 'Activar código de recarga' },
          ].map(l => (
            <a key={l.href} href={l.href}
              style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '16px', textDecoration: 'none', display: 'block' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#8dc63f40'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2a3a'}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{l.label}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d' }}>{l.desc}</div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '13px 32px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em', display: 'inline-block' }}>
            VER EVENTOS DISPONIBLES →
          </a>
        </div>
      </div>
    </div>
  );
}
