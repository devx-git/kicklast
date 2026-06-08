import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import api from '../services/api';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import { formatCreditos, creditosAVidas } from '../utils/currency';

const INPUT = { width: '100%', background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '10px 12px', color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const LABEL = { display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 };
const CARD = { background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '20px 24px' };

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#8dc63f' : '#1e2535', color: active ? '#0a0d14' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}>
      {children}
    </button>
  );
}

// ── Modal de confirmación de recarga ──────────────────────────────────────
function ModalConfirmar({ usuario, evento, form, onConfirmar, onCancelar, procesando }) {
  const creditos = Number(form.creditos);
  const vidas    = creditosAVidas(creditos);

  return (
    /* Overlay */
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: 20,
    }}>
      <div style={{
        background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 12,
        padding: '28px 32px', maxWidth: 480, width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Título */}
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
          ¿CONFIRMAR RECARGA?
        </div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginBottom: 22 }}>
          Revisa los datos antes de acreditar. Esta acción es inmediata e irreversible.
        </div>

        {/* Datos del usuario */}
        <div style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 8, padding: '16px 18px', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 12 }}>DESTINATARIO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 28 }}>👤</span>
              <div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>{usuario.nombre}</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>{usuario.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
              {usuario.telefono && (
                <div style={{ background: '#1e2535', borderRadius: 5, padding: '8px 10px' }}>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', marginBottom: 2 }}>TELÉFONO</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c0cad8' }}>{usuario.telefono}</div>
                </div>
              )}
              {usuario.pais && (
                <div style={{ background: '#1e2535', borderRadius: 5, padding: '8px 10px' }}>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', marginBottom: 2 }}>PAÍS</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c0cad8' }}>{usuario.pais}</div>
                </div>
              )}
              <div style={{ background: '#1e2535', borderRadius: 5, padding: '8px 10px' }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', marginBottom: 2 }}>SALDO ACTUAL</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#8dc63f', fontWeight: 700 }}>{Number(usuario.saldo).toLocaleString('es-CO')} cr</div>
              </div>
              <div style={{ background: '#1e2535', borderRadius: 5, padding: '8px 10px' }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', marginBottom: 2 }}>SALDO DESPUÉS</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#8dc63f', fontWeight: 700 }}>{(Number(usuario.saldo) + creditos).toLocaleString('es-CO')} cr</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalle de la recarga */}
        <div style={{ background: '#0a0d14', border: '1px solid #8dc63f30', borderRadius: 8, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 12 }}>DETALLE DE LA RECARGA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>Evento</span>
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#c0cad8', textAlign: 'right', maxWidth: 220 }}>{evento?.nombre || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>Créditos</span>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: '#8dc63f' }}>+{creditos.toLocaleString('es-CO')} cr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>Vidas</span>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: '#f59e0b', fontWeight: 700 }}>+{vidas} vidas</span>
            </div>
            {form.notas && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>Notas</span>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c0cad8' }}>{form.notas}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancelar}
            disabled={procesando}
            style={{ flex: 1, background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '13px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: procesando ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}>
            CANCELAR
          </button>
          <button
            onClick={onConfirmar}
            disabled={procesando}
            style={{ flex: 2, background: procesando ? '#1e2535' : '#8dc63f', color: procesando ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '13px', borderRadius: 6, border: 'none', cursor: procesando ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}>
            {procesando ? 'ACREDITANDO...' : `✓ SÍ, ACREDITAR ${creditos} CRÉDITOS`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RECARGAR USUARIO ──────────────────────────────────────────────────────
function RecargarTab({ eventos }) {
  const [buscarPor, setBuscarPor] = useState('email_usuario');
  const [buscarVal, setBuscarVal] = useState('');
  const [eventoId,  setEventoId]  = useState('');
  const [creditos,  setCreditos]  = useState('');
  const [notas,     setNotas]     = useState('');

  const [buscando,   setBuscando]   = useState(false);
  const [usuario,    setUsuario]    = useState(null);   // datos encontrados
  const [modal,      setModal]      = useState(false);  // ¿mostrar confirmación?
  const [procesando, setProcesando] = useState(false);
  const [msg,        setMsg]        = useState('');
  const [err,        setErr]        = useState('');

  const eventoSeleccionado = eventos.find(e => e.id === eventoId);

  const buscar = async e => {
    e.preventDefault();
    if (!buscarVal.trim()) { setErr('Ingresa el identificador del usuario'); return; }
    if (!eventoId) { setErr('Selecciona un evento'); return; }
    if (!creditos || Number(creditos) <= 0) { setErr('Ingresa un monto válido de créditos'); return; }

    setBuscando(true); setErr(''); setMsg(''); setUsuario(null);

    try {
      // Mapear campo de búsqueda al query param correcto
      const paramMap = {
        email_usuario:    'email',
        telefono_usuario: 'telefono',
        documento_usuario:'documento',
        usuario_id:       'id',
      };
      const param = paramMap[buscarPor] || 'email';
      const { data } = await api.get('/distribuidores/buscar-usuario', {
        params: { [param]: buscarVal.trim() },
      });
      setUsuario(data);
      setModal(true);
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Usuario no encontrado');
    } finally { setBuscando(false); }
  };

  const confirmarRecarga = async () => {
    if (!usuario) return;
    setProcesando(true); setErr('');
    try {
      const payload = { evento_id: eventoId, creditos: Number(creditos) };
      // Mapear a los campos que espera el backend
      const fieldMap = {
        email_usuario:    'email_usuario',
        telefono_usuario: 'telefono_usuario',
        documento_usuario:'documento_usuario',
        usuario_id:       'usuario_id',
      };
      payload[fieldMap[buscarPor]] = buscarVal.trim();
      if (notas) payload.notas = notas;

      const { data } = await api.post('/distribuidores/recargar', payload);
      setMsg(`✓ ${data.creditos_recargados ?? creditos} créditos (= ${creditosAVidas(data.creditos_recargados ?? creditos)} vidas) acreditados a ${data.usuario_destino ?? usuario.nombre}`);
      // Reset
      setBuscarVal(''); setCreditos(''); setNotas('');
      setUsuario(null); setModal(false);
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al realizar la recarga');
      setModal(false);
    } finally { setProcesando(false); }
  };

  return (
    <div>
      {/* Modal de confirmación */}
      {modal && usuario && (
        <ModalConfirmar
          usuario={usuario}
          evento={eventoSeleccionado}
          form={{ creditos, notas }}
          onConfirmar={confirmarRecarga}
          onCancelar={() => setModal(false)}
          procesando={procesando}
        />
      )}

      <div style={{ ...CARD, maxWidth: 600 }}>
        <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid #1e2a3a' }}>
          RECARGAR CRÉDITOS A USUARIO
        </div>

        {msg && (
          <div style={{ background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 6, padding: '12px 14px', marginBottom: 16, color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
            {msg}
          </div>
        )}
        {err && (
          <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '12px 14px', marginBottom: 16, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
            {err}
          </div>
        )}

        <form onSubmit={buscar}>
          {/* ── Búsqueda por tipo ── */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL}>BUSCAR USUARIO POR</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {[
                { val: 'email_usuario',     label: 'Email'      },
                { val: 'telefono_usuario',  label: 'Teléfono'   },
                { val: 'documento_usuario', label: 'Documento'  },
                { val: 'usuario_id',        label: 'UUID'       },
              ].map(opt => (
                <button key={opt.val} type="button"
                  onClick={() => { setBuscarPor(opt.val); setBuscarVal(''); setUsuario(null); setErr(''); }}
                  style={{ background: buscarPor === opt.val ? '#1e3a2a' : '#0a0d14', border: `1px solid ${buscarPor === opt.val ? '#8dc63f' : '#1e2a3a'}`, borderRadius: 6, padding: '8px 4px', color: buscarPor === opt.val ? '#8dc63f' : '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, cursor: 'pointer', textAlign: 'center' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={LABEL}>
              {buscarPor === 'email_usuario'     ? 'EMAIL DEL USUARIO' :
               buscarPor === 'telefono_usuario'  ? 'TELÉFONO (+573001234567)' :
               buscarPor === 'documento_usuario' ? 'NÚMERO DE DOCUMENTO' : 'UUID DEL USUARIO'}
            </label>
            <input value={buscarVal} onChange={e => { setBuscarVal(e.target.value); setUsuario(null); }} required
              placeholder={buscarPor === 'email_usuario'     ? 'usuario@ejemplo.com' :
                           buscarPor === 'telefono_usuario'  ? '+57 300 123 4567' :
                           buscarPor === 'documento_usuario' ? '12345678' : 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}
              style={INPUT} />
          </div>

          {/* ── Evento ── */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL}>EVENTO *</label>
            <select value={eventoId} onChange={e => setEventoId(e.target.value)} required style={{ ...INPUT, cursor: 'pointer' }}>
              <option value="">— Seleccionar evento —</option>
              {eventos.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.nombre}{ev.estado === 'ACTIVO' ? ' ● ACTIVO' : ''}</option>
              ))}
            </select>
          </div>

          {/* ── Créditos ── */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL}>CRÉDITOS A ACREDITAR * (1 cr = 1 USD = 1 vida)</label>
            <input type="number" min="1" value={creditos} onChange={e => setCreditos(e.target.value)} required placeholder="Ej: 10" style={INPUT} />
            {creditos && Number(creditos) > 0 && (
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginTop: 6 }}>
                {creditos} créditos = {creditosAVidas(creditos)} vidas ≈ ${Number(creditos).toLocaleString('es-CO')} USD
              </div>
            )}
          </div>

          {/* ── Notas ── */}
          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>NOTAS <span style={{ color: '#4a5568', fontSize: 10 }}>(opcional)</span></label>
            <input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Referencia del pago, efectivo, transferencia..." style={INPUT} />
          </div>

          <button type="submit" disabled={buscando}
            style={{ width: '100%', background: buscando ? '#1e2535' : '#00d4ff', color: buscando ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '13px', borderRadius: 6, border: 'none', cursor: buscando ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}>
            {buscando ? 'BUSCANDO USUARIO...' : '🔍 BUSCAR Y VERIFICAR USUARIO'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── MIS RECARGAS ──────────────────────────────────────────────────────────
function MisRecargasTab({ eventos }) {
  const [recargas, setRecargas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/distribuidores/mis-recargas'),
      api.get('/distribuidores/mis-recargas/resumen'),
    ]).then(([r, s]) => {
      if (r.status === 'fulfilled') setRecargas(Array.isArray(r.value.data) ? r.value.data : []);
      if (s.status === 'fulfilled') setResumen(s.value.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>Cargando recargas...</div>;

  const flat = recargas.map(r => ({
    ...r,
    _usuario: r.usuario?.nombre_completo || r.usuario?.nombre || r.usuario?.email || '—',
    _email: r.usuario?.email || '—',
    _evento: r.evento?.nombre || '—',
    _creditos: Number(r.creditos || 0),
    _vidas: creditosAVidas(Number(r.creditos || 0)),
    _notas: r.notas || '—',
    _fecha: r.creado_en ? new Date(r.creado_en).toLocaleString('es-CO') : '—',
  }));

  const eventosFiltro = [...new Set(flat.map(f => f._evento).filter(e => e !== '—'))];

  const columns = [
    { key: '_usuario', label: 'USUARIO', sortable: true },
    { key: '_evento', label: 'EVENTO', sortable: true, filterable: eventosFiltro.length > 1, filterOptions: eventosFiltro },
    {
      key: '_creditos', label: 'CRÉDITOS', sortable: true,
      render: (val, row) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: '#8dc63f', fontWeight: 700 }}>+{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568' }}>{row._vidas} vidas · ≈ ${Number(val).toLocaleString('es-CO')} USD</div>
        </div>
      ),
    },
    { key: '_notas', label: 'NOTAS' },
    { key: '_fecha', label: 'FECHA', sortable: true },
  ];

  return (
    <div>
      {resumen && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'TOTAL RECARGAS', val: resumen.total_recargas ?? '—', color: '#8dc63f' },
            { label: 'CRÉDITOS DADOS', val: resumen.total_creditos_dados ? `${Number(resumen.total_creditos_dados).toLocaleString('es-CO')} cr` : '—', sub: resumen.total_creditos_dados ? `= ${creditosAVidas(resumen.total_creditos_dados)} vidas` : '', color: '#00d4ff' },
            { label: 'COMISIÓN (CR)', val: resumen.comision_total ? `${Number(resumen.comision_total).toLocaleString('es-CO')} cr` : '—', sub: resumen.comision_total ? `≈ $${Number(resumen.comision_total).toLocaleString('es-CO')} USD` : '', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={CARD}>
              <div style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{s.val}</div>
              {s.sub && <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9, marginBottom: 2 }}>{s.sub}</div>}
              <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <DataTable columns={columns} data={flat} pageSize={25} emptyMsg="No tienes recargas registradas aún" exportCsv />
    </div>
  );
}

// ── MIS COMISIONES ────────────────────────────────────────────────────────
function MisComisionesTab({ perfil }) {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/distribuidores/mis-recargas/resumen')
      .then(r => setResumen(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pct = (field) => Number(perfil?.[field] ?? 0);

  const comisiones = [
    { label: 'RECARGA DE CRÉDITOS', pct: pct('comision_recarga_pct'), color: '#8dc63f', icon: '💳', desc: 'Por cada recarga que realizas a un usuario, ganas este porcentaje del monto recargado.' },
    { label: 'VENTA DE PINES', pct: pct('comision_pines_pct'), color: '#a78bfa', icon: '🔑', desc: 'Por cada PIN vendido a un usuario, ganas este porcentaje del valor del PIN.' },
    { label: 'RETIROS GESTIONADOS', pct: pct('comision_retiros_pct'), color: '#f59e0b', icon: '💸', desc: 'Por cada retiro que gestionas en punto físico, ganas este porcentaje del monto retirado.' },
    { label: 'PAGO DE PREMIOS', pct: pct('comision_premios_pct'), color: '#00d4ff', icon: '🏆', desc: 'Por cada premio que pagas en punto físico, ganas este porcentaje del monto.' },
  ];

  return (
    <div>
      {/* Tasas configuradas por el promotor */}
      <div style={{ ...CARD, marginBottom: 20 }}>
        <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid #1e2a3a' }}>
          MIS TASAS DE COMISIÓN
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
          {comisiones.map(c => (
            <div key={c.label} style={{ background: '#0a0d14', border: `1px solid ${c.color}20`, borderRadius: 8, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, color: c.color }}>{c.pct}%</span>
              </div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#c0cad8', letterSpacing: '0.08em', marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', lineHeight: 1.4 }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 14 }}>
          * Las tasas son configuradas por tu promotor y pueden cambiar en cualquier momento.
        </div>
      </div>

      {/* Resumen de ganancias */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 13 }}>Cargando ganancias...</div>
      ) : resumen ? (
        <>
          <div style={{ ...CARD, marginBottom: 20 }}>
            <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #1e2a3a' }}>
              GANANCIAS TOTALES (RECARGAS)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
              {[
                { label: 'OPERACIONES', val: resumen.total_recargas ?? 0, color: '#c0cad8' },
                { label: 'CRÉDITOS RECARGADOS', val: `${Number(resumen.creditos_recargados ?? 0).toLocaleString('es-CO')} cr`, color: '#00d4ff' },
                { label: 'COMISIÓN GANADA', val: `${Number(resumen.comisiones_ganadas ?? 0).toLocaleString('es-CO')} cr`, sub: `≈ $${Number(resumen.comisiones_ganadas ?? 0).toLocaleString('es-CO')} USD`, color: '#f59e0b' },
                { label: 'SALDO ACTUAL', val: `${Number(resumen.saldo_actual ?? 0).toLocaleString('es-CO')} cr`, color: '#8dc63f' },
              ].map(s => (
                <div key={s.label} style={{ background: '#0a0d14', borderRadius: 6, padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.val}</div>
                  {s.sub && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568', marginBottom: 2 }}>{s.sub}</div>}
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#6b7a8d', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Por evento */}
          {resumen.por_evento?.length > 0 && (
            <div style={CARD}>
              <div style={{ color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 14 }}>DESGLOSE POR EVENTO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resumen.por_evento.map(e => (
                  <div key={e.evento_id} style={{ background: '#0a0d14', borderRadius: 6, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#c0cad8' }}>{e.evento_nombre}</div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568' }}>{e.recargas} recargas · {e.creditos} cr recargados</div>
                    </div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: '#f59e0b', fontWeight: 700 }}>+{e.comision} cr</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

// ── SOLICITAR PINES ────────────────────────────────────────────────────────
const PAQUETES = [
  { id: 'starter',      nombre: 'Starter',       cantidad: 10,  valor: 1, badge: null,          color: '#4a5568' },
  { id: 'basico',       nombre: 'Básico',         cantidad: 25,  valor: 1, badge: null,          color: '#60a5fa' },
  { id: 'estandar',     nombre: 'Estándar',       cantidad: 50,  valor: 1, badge: '⭐ POPULAR',   color: '#8dc63f' },
  { id: 'premium',      nombre: 'Premium',        cantidad: 100, valor: 1, badge: null,          color: '#a78bfa' },
  { id: 'full',         nombre: 'Full',           cantidad: 250, valor: 1, badge: '🔥 PRO',      color: '#f59e0b' },
];

const ESTADO_COLOR_DIST = {
  PENDIENTE: { label: 'PENDIENTE',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  APROBADA:  { label: 'APROBADA',   color: '#8dc63f', bg: 'rgba(141,198,63,0.12)' },
  RECHAZADA: { label: 'RECHAZADA',  color: '#f87171', bg: 'rgba(239,68,68,0.1)'   },
};

function SolicitarPinesTab() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState(null); // null | paquete | personalizado
  const [paqueteSel, setPaqueteSel] = useState(null);
  const [custom, setCustom] = useState({ cantidad: '', valor: '1' });
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const cargar = () => {
    api.get('/pines/distribuidor/mis-solicitudes')
      .then(r => setSolicitudes(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  const enviar = async () => {
    setErr(''); setMsg('');
    let cantidad, valor;
    if (modo === 'paquete' && paqueteSel) {
      cantidad = paqueteSel.cantidad;
      valor    = paqueteSel.valor;
    } else if (modo === 'personalizado') {
      cantidad = Number(custom.cantidad);
      valor    = Number(custom.valor);
      if (!cantidad || cantidad < 1 || !valor || valor < 1) {
        setErr('Ingresa una cantidad y valor unitario válidos (mínimo 1).');
        return;
      }
    } else { setErr('Selecciona un paquete o configura uno personalizado.'); return; }

    setEnviando(true);
    try {
      await api.post('/pines/distribuidor/solicitar', {
        paquete_id:     modo === 'paquete' ? paqueteSel.id : 'personalizado',
        cantidad,
        valor_unitario: valor,
        notas:          nota || undefined,
      });
      setMsg(`✓ Solicitud enviada — ${cantidad} pines × $${valor} = $${cantidad * valor} USD. Tu promotor recibirá una notificación.`);
      setModo(null); setPaqueteSel(null); setCustom({ cantidad: '', valor: '1' }); setNota('');
      cargar();
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al enviar la solicitud');
    } finally { setEnviando(false); }
  };

  const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE').length;

  return (
    <div>
      {msg && <div style={{ background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{msg}</div>}
      {err && <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{err}</div>}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 4 }}>SOLICITAR PINES A MI PROMOTOR</div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', margin: 0 }}>
            Elige un paquete predefinido o crea una solicitud personalizada. Tu promotor recibirá la solicitud y te asignará los pines.
          </p>
        </div>
        {pendientes > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700 }}>{pendientes}</div>
            <div style={{ color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>pendiente{pendientes > 1 ? 's' : ''}</div>
          </div>
        )}
      </div>

      {/* Paquetes */}
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 12 }}>PAQUETES PREDEFINIDOS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginBottom: 16 }}>
        {PAQUETES.map(p => {
          const sel = modo === 'paquete' && paqueteSel?.id === p.id;
          return (
            <div key={p.id} onClick={() => { setModo('paquete'); setPaqueteSel(p); setErr(''); }}
              style={{ background: sel ? `${p.color}18` : '#0f1420', border: `1.5px solid ${sel ? p.color : '#1e2a3a'}`, borderRadius: 10, padding: '16px 14px', cursor: 'pointer', position: 'relative', transition: 'all 0.15s' }}>
              {p.badge && (
                <span style={{ position: 'absolute', top: 8, right: 8, background: sel ? p.color : 'rgba(255,255,255,0.06)', color: sel ? '#0a0d14' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, letterSpacing: '0.05em' }}>
                  {p.badge}
                </span>
              )}
              <div style={{ color: p.color, fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 900, lineHeight: 1, marginBottom: 2 }}>{p.cantidad}</div>
              <div style={{ color: '#c0cad8', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{p.nombre}</div>
              <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginBottom: 6 }}>pines × ${p.valor} c/u</div>
              <div style={{ color: p.color, fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700 }}>${p.cantidad * p.valor} USD</div>
            </div>
          );
        })}

        {/* Personalizado */}
        <div onClick={() => { setModo('personalizado'); setPaqueteSel(null); setErr(''); }}
          style={{ background: modo === 'personalizado' ? 'rgba(167,139,250,0.08)' : '#0f1420', border: `1.5px solid ${modo === 'personalizado' ? '#a78bfa' : '#1e2a3a'}`, borderRadius: 10, padding: '16px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 110 }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>✏️</div>
          <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700 }}>Personalizado</div>
          <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginTop: 4 }}>Define cantidad y valor</div>
        </div>
      </div>

      {/* Form personalizado */}
      {modo === 'personalizado' && (
        <div style={{ ...CARD, marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={LABEL}>CANTIDAD DE PINES</label>
            <input type="number" min="1" value={custom.cantidad} onChange={e => setCustom(c => ({ ...c, cantidad: e.target.value }))}
              placeholder="Ej: 50" style={INPUT} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={LABEL}>VALOR POR PIN (USD / créditos)</label>
            <input type="number" min="1" value={custom.valor} onChange={e => setCustom(c => ({ ...c, valor: e.target.value }))}
              placeholder="Ej: 1" style={INPUT} />
          </div>
          {custom.cantidad && custom.valor && (
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700 }}>${Number(custom.cantidad) * Number(custom.valor)} USD</div>
                <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>total estimado</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nota + botón */}
      {modo && (
        <div style={{ ...CARD, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={LABEL}>NOTA PARA TU PROMOTOR (opcional)</label>
              <input type="text" value={nota} onChange={e => setNota(e.target.value)} placeholder="Ej: Para el evento del sábado..." style={INPUT} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2, gap: 8 }}>
              <button onClick={() => { setModo(null); setPaqueteSel(null); setErr(''); }}
                style={{ background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 18px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: 'pointer' }}>
                CANCELAR
              </button>
              <button onClick={enviar} disabled={enviando}
                style={{ background: enviando ? '#1e2535' : '#a78bfa', color: enviando ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '10px 24px', borderRadius: 6, border: 'none', cursor: enviando ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                {enviando ? 'ENVIANDO...' : '📨 ENVIAR SOLICITUD'}
              </button>
            </div>
          </div>
          {/* Resumen selección */}
          {modo === 'paquete' && paqueteSel && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#0a0d14', borderRadius: 6, fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
              Solicitando: <strong style={{ color: paqueteSel.color }}>{paqueteSel.cantidad} pines</strong> × ${paqueteSel.valor} = <strong style={{ color: paqueteSel.color }}>${paqueteSel.cantidad * paqueteSel.valor} USD</strong>
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#6b7a8d', letterSpacing: '0.1em', marginBottom: 12 }}>MIS SOLICITUDES</div>
      {loading ? (
        <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, padding: '20px 0' }}>Cargando historial...</div>
      ) : solicitudes.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: '28px', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
          Aún no tienes solicitudes. ¡Elige un paquete arriba para comenzar!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {solicitudes.map(s => {
            const est = ESTADO_COLOR_DIST[s.estado] || ESTADO_COLOR_DIST.PENDIENTE;
            const pkg = PAQUETES.find(p => p.id === s.paquete_id);
            return (
              <div key={s.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                      {s.cantidad} pines {pkg ? `· ${pkg.nombre}` : '· Personalizado'}
                    </span>
                    <span style={{ background: est.bg, color: est.color, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em' }}>{est.label}</span>
                  </div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>
                    ${Number(s.valor_unitario)} c/u · Total ${Number(s.valor_total)} USD · {new Date(s.created_at).toLocaleDateString('es-CO')}
                  </div>
                  {s.notas && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginTop: 3 }}>Nota: {s.notas}</div>}
                  {s.notas_promotor && s.estado !== 'PENDIENTE' && (
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: s.estado === 'RECHAZADA' ? '#f87171' : '#6b7a8d', marginTop: 3 }}>
                      Promotor: {s.notas_promotor}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700 }}>
                    ${Number(s.valor_total)} USD
                  </div>
                  {s.revisado_en && (
                    <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>
                      Revisado {new Date(s.revisado_en).toLocaleDateString('es-CO')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── CANJEAR PIN ────────────────────────────────────────────────────────────
function CanjearPinTab() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);

  const canjear = async e => {
    e.preventDefault();
    if (!codigo.trim()) return;
    setLoading(true); setMsg(''); setErr(''); setResult(null);
    try {
      const { data } = await api.post('/pines/canjear', { codigo: codigo.trim().toUpperCase() });
      setResult(data);
      setMsg('✓ PIN canjeado exitosamente');
      setCodigo('');
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Código inválido o ya utilizado');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={CARD}>
        <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid #1e2a3a' }}>
          CANJEAR PIN DE RECARGA
        </div>

        {msg && <div style={{ background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 6, padding: '12px 14px', marginBottom: 16, color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{msg}</div>}
        {err && <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '12px 14px', marginBottom: 16, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{err}</div>}

        {result && (
          <div style={{ background: '#0f1a28', border: '1px solid #00d4ff30', borderRadius: 6, padding: '14px 16px', marginBottom: 16 }}>
            {result.vidas_acreditadas != null && <div style={{ color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>+{result.vidas_acreditadas} vidas acreditadas</div>}
            {result.creditos_acreditados != null && <div style={{ color: '#a78bfa', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>+{result.creditos_acreditados} créditos acreditados</div>}
            <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 4 }}>Créditos = Vidas (1:1)</div>
            {result.mensaje && <div style={{ color: '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 12, marginTop: 6 }}>{result.mensaje}</div>}
          </div>
        )}

        <form onSubmit={canjear}>
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL}>CÓDIGO PIN</label>
            <input value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} placeholder="GURU-XXXX-XXXX-XXXX" maxLength={24}
              style={{ ...INPUT, fontFamily: 'Roboto Mono, monospace', fontSize: 16, letterSpacing: '0.1em', textAlign: 'center' }} />
          </div>
          <button type="submit" disabled={loading || !codigo.trim()} style={{ width: '100%', background: (loading || !codigo.trim()) ? '#1e2535' : '#a78bfa', color: (loading || !codigo.trim()) ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '13px', borderRadius: 6, border: 'none', cursor: (loading || !codigo.trim()) ? 'not-allowed' : 'pointer' }}>
            {loading ? 'CANJEANDO...' : 'CANJEAR PIN'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function PanelDistribuidor() {
  const [tab, setTab] = useState('recargar');
  const [perfil, setPerfil] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) { window.location.href = '/login'; return; }
    Promise.allSettled([
      api.get('/distribuidores/mi-perfil'),
      dataService.getEventos(50),
    ]).then(([p, e]) => {
      if (p.status === 'fulfilled') setPerfil(p.value.data);
      if (e.status === 'fulfilled') setEventos(e.value || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 18 }}>Cargando panel...</div>
      </div>
    </div>
  );

  const saldoCr = Number(perfil?.saldo_disponible || 0);

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px 48px' }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.12em', marginBottom: 4 }}>PANEL DE OPERACIONES</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, color: '#fff', margin: 0 }}>
            {perfil?.nombre || perfil?.usuario?.nombre || 'Panel Distribuidor'}
          </h1>
        </div>

        {perfil && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'SALDO (CRÉDITOS)', val: `${saldoCr.toLocaleString('es-CO')} cr`, sub: `= ${creditosAVidas(saldoCr)} vidas ≈ $${saldoCr.toLocaleString('es-CO')} USD`, color: '#8dc63f' },
              { label: 'TOTAL RECARGAS', val: perfil.total_recargas ?? '0', color: '#00d4ff' },
              { label: 'COMISIÓN (CR)', val: `${Number(perfil.comision_total || 0).toLocaleString('es-CO')} cr`, sub: `≈ $${Number(perfil.comision_total || 0).toLocaleString('es-CO')} USD`, color: '#f59e0b' },
              { label: 'ESTADO', val: perfil.activo ? 'ACTIVO' : 'INACTIVO', color: perfil.activo ? '#8dc63f' : '#f87171' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '16px' }}>
                <div style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{s.val}</div>
                {s.sub && <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9, marginBottom: 2 }}>{s.sub}</div>}
                <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <TabBtn active={tab === 'recargar'}   onClick={() => setTab('recargar')}>RECARGAR USUARIO</TabBtn>
          <TabBtn active={tab === 'historial'}  onClick={() => setTab('historial')}>MIS RECARGAS</TabBtn>
          <TabBtn active={tab === 'comisiones'} onClick={() => setTab('comisiones')}>MIS COMISIONES</TabBtn>
          <TabBtn active={tab === 'pines'}      onClick={() => setTab('pines')}>SOLICITAR PINES</TabBtn>
          <TabBtn active={tab === 'pin'}        onClick={() => setTab('pin')}>CANJEAR PIN</TabBtn>
        </div>

        {tab === 'recargar'   && <RecargarTab eventos={eventos} />}
        {tab === 'historial'  && <MisRecargasTab eventos={eventos} />}
        {tab === 'comisiones' && <MisComisionesTab perfil={perfil} />}
        {tab === 'pines'      && <SolicitarPinesTab />}
        {tab === 'pin'        && <CanjearPinTab />}
      </div>
    </div>
  );
}
