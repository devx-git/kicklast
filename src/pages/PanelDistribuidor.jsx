import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import api from '../services/api';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import EditarPerfil from '../components/EditarPerfil';
import ComprobanteTicket from '../components/ComprobanteTicket';
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
function RecargarTab({ eventos, distribuidorNombre }) {
  const [buscarPor, setBuscarPor] = useState('email_usuario');
  const [buscarVal, setBuscarVal] = useState('');
  const [eventoId,  setEventoId]  = useState('');
  const [creditos,  setCreditos]  = useState('');
  const [notas,     setNotas]     = useState('');

  const [buscando,      setBuscando]      = useState(false);
  const [usuario,       setUsuario]       = useState(null);
  const [modal,         setModal]         = useState(false);
  const [procesando,    setProcesando]    = useState(false);
  const [msg,           setMsg]           = useState('');
  const [err,           setErr]           = useState('');
  const [comprobante,   setComprobante]   = useState(null); // datos para el ticket

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
      const credAcreditados = data.creditos_recargados ?? Number(creditos);
      setMsg(`✓ ${credAcreditados} créditos (= ${creditosAVidas(credAcreditados)} vidas) acreditados a ${data.usuario_destino ?? usuario.nombre}`);

      // Mostrar comprobante imprimible
      setComprobante({
        tipo:               'RECARGA',
        recargaId:          data.recarga_id || '',
        usuarioNombre:      data.usuario_destino || usuario.nombre,
        usuarioEmail:       usuario.email || '',
        eventoNombre:       data.evento || eventoSeleccionado?.nombre || '',
        creditos:           credAcreditados,
        comision:           data.comision_ganada,
        distribuidorNombre: distribuidorNombre || 'Distribuidor',
        fecha:              new Date(),
      });

      // Reset formulario
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
      {/* Comprobante imprimible post-recarga */}
      {comprobante && (
        <ComprobanteTicket datos={comprobante} onClose={() => setComprobante(null)} />
      )}

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
  const [referencia, setReferencia] = useState('');
  const [comprobante, setComprobante] = useState(null); // { dataUrl, nombre }
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [verImg, setVerImg] = useState(null); // dataUrl para modal de comprobante

  const leerArchivo = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErr('El comprobante no puede superar 5 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => setComprobante({ dataUrl: e.target.result, nombre: file.name });
    reader.readAsDataURL(file);
  };

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
        paquete_id:      modo === 'paquete' ? paqueteSel.id : 'personalizado',
        cantidad,
        valor_unitario:  valor,
        notas:           nota       || undefined,
        referencia_pago: referencia || undefined,
        comprobante_url: comprobante?.dataUrl || undefined,
      });
      setMsg(`✓ Solicitud enviada — ${cantidad} pines × $${valor} = $${cantidad * valor} USD. Tu promotor recibirá la notificación con tu comprobante.`);
      setModo(null); setPaqueteSel(null); setCustom({ cantidad: '', valor: '1' });
      setNota(''); setReferencia(''); setComprobante(null);
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

      {/* Comprobante + Nota + Botón */}
      {modo && (
        <div style={{ ...CARD, marginBottom: 24 }}>
          {/* Resumen selección */}
          {modo === 'paquete' && paqueteSel && (
            <div style={{ marginBottom: 14, padding: '10px 14px', background: '#0a0d14', borderRadius: 6, fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d' }}>
              Solicitando: <strong style={{ color: paqueteSel.color }}>{paqueteSel.cantidad} pines</strong> × ${paqueteSel.valor} = <strong style={{ color: paqueteSel.color }}>${paqueteSel.cantidad * paqueteSel.valor} USD</strong>
            </div>
          )}

          {/* Referencia de pago */}
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>REFERENCIA / CÓDIGO DE TRANSFERENCIA <span style={{ color: '#f59e0b' }}>*</span></label>
            <input type="text" value={referencia} onChange={e => setReferencia(e.target.value)}
              placeholder="Ej: REF-2024-0012345 / código de la transacción..."
              style={{ ...INPUT, borderColor: referencia ? '#8dc63f50' : '#1e2a3a' }} />
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 4 }}>
              Número de referencia, código de confirmación o ID de la transferencia realizada
            </div>
          </div>

          {/* Comprobante imagen */}
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>COMPROBANTE DE PAGO (imagen) <span style={{ color: '#f59e0b' }}>*</span></label>
            {comprobante ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0a0e1a', border: '1px solid #8dc63f40', borderRadius: 8, padding: '10px 14px' }}>
                <img src={comprobante.dataUrl} alt="comprobante" onClick={() => setVerImg(comprobante.dataUrl)}
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '1px solid #8dc63f30' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600 }}>✓ {comprobante.nombre}</div>
                  <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginTop: 2 }}>Haz clic en la imagen para ampliar</div>
                </div>
                <button onClick={() => setComprobante(null)}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 16, padding: 4 }}>✕</button>
              </div>
            ) : (
              <label style={{ display: 'block', cursor: 'pointer' }}>
                <div style={{ background: '#0a0e1a', border: '2px dashed #1e2a3a', borderRadius: 8, padding: '20px', textAlign: 'center', transition: 'border-color 0.15s' }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#a78bfa'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = '#1e2a3a'; }}
                  onDrop={e => { e.preventDefault(); leerArchivo(e.dataTransfer.files[0]); e.currentTarget.style.borderColor = '#1e2a3a'; }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>📎</div>
                  <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700 }}>SUBIR COMPROBANTE</div>
                  <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginTop: 4 }}>JPG, PNG, PDF · máx. 5 MB · o arrastra aquí</div>
                </div>
                <input type="file" accept="image/*,.pdf" onChange={e => leerArchivo(e.target.files[0])} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Nota + botones */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={LABEL}>NOTA ADICIONAL (opcional)</label>
              <input type="text" value={nota} onChange={e => setNota(e.target.value)} placeholder="Ej: Para el evento del sábado..." style={INPUT} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2, gap: 8 }}>
              <button onClick={() => { setModo(null); setPaqueteSel(null); setErr(''); setComprobante(null); setReferencia(''); }}
                style={{ background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 18px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: 'pointer' }}>
                CANCELAR
              </button>
              <button onClick={enviar} disabled={enviando}
                style={{ background: enviando ? '#1e2535' : '#a78bfa', color: enviando ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '10px 24px', borderRadius: 6, border: 'none', cursor: enviando ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                {enviando ? 'ENVIANDO...' : '📨 ENVIAR SOLICITUD'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ver comprobante */}
      {verImg && (
        <div onClick={() => setVerImg(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}>
          <img src={verImg} alt="comprobante" style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 8, boxShadow: '0 0 40px #000' }} />
          <div style={{ position: 'absolute', top: 20, right: 24, color: '#fff', fontSize: 28, cursor: 'pointer' }}>✕</div>
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
              <div key={s.id} style={{ ...CARD, border: `1px solid ${s.estado === 'PENDIENTE' ? '#f59e0b20' : '#1e2a3a'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                        {s.cantidad} pines {pkg ? `· ${pkg.nombre}` : '· Personalizado'}
                      </span>
                      <span style={{ background: est.bg, color: est.color, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em' }}>{est.label}</span>
                    </div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>
                      ${Number(s.valor_unitario)} c/u · Total ${Number(s.valor_total)} USD · {new Date(s.created_at).toLocaleDateString('es-CO')}
                    </div>
                    {s.referencia_pago && (
                      <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: 11, color: '#8dc63f', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: '#4a5568' }}>Ref:</span> {s.referencia_pago}
                      </div>
                    )}
                    {s.notas && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginTop: 3 }}>Nota: {s.notas}</div>}
                    {s.notas_promotor && s.estado !== 'PENDIENTE' && (
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: s.estado === 'RECHAZADA' ? '#f87171' : '#6b7a8d', marginTop: 3 }}>
                        Promotor: {s.notas_promotor}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700 }}>
                      ${Number(s.valor_total)} USD
                    </div>
                    {s.revisado_en && (
                      <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>
                        Revisado {new Date(s.revisado_en).toLocaleDateString('es-CO')}
                      </div>
                    )}
                    {s.comprobante_url && (
                      <img src={s.comprobante_url} alt="comprobante" onClick={() => setVerImg(s.comprobante_url)}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 5, cursor: 'pointer', border: '1px solid #8dc63f40' }} title="Ver comprobante" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── MIS PINES (inventario distribuidor) ───────────────────────────────────
const ESTADO_PIN = {
  DISPONIBLE: { label: 'DISPONIBLE', color: '#8dc63f',  bg: 'rgba(141,198,63,0.1)'  },
  VENDIDO:    { label: 'VENDIDO',    color: '#f59e0b',  bg: 'rgba(245,158,11,0.1)'  },
  USADO:      { label: 'CANJEADO',   color: '#00d4ff',  bg: 'rgba(0,212,255,0.1)'   },
  EXPIRADO:   { label: 'EXPIRADO',   color: '#6b7a8d',  bg: 'rgba(107,122,141,0.1)' },
  ANULADO:    { label: 'ANULADO',    color: '#f87171',  bg: 'rgba(248,113,113,0.1)' },
};

function MisPinesTab({ distribuidorNombre }) {
  const [data, setData]               = useState({ resumen: {}, pines: [] });
  const [loading, setLoading]         = useState(true);
  const [filtro, setFiltro]           = useState('TODOS');
  const [filtroValor, setFiltroValor] = useState(0);
  const [verImg, setVerImg]           = useState(null);
  const [vendiendo, setVendiendo]     = useState(null);
  const [formVenta, setFormVenta]     = useState({});
  const [msg, setMsg]                 = useState('');
  const [err, setErr]                 = useState('');
  const [comprobante, setComprobante] = useState(null); // datos para el ticket

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/pines/distribuidor/mis-pines');
      setData(r.data || { resumen: {}, pines: [] });
    } catch { setData({ resumen: {}, pines: [] }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const registrarVenta = async (pinId) => {
    const f   = formVenta[pinId] || {};
    const pin = (data.pines || []).find(p => p.id === pinId);
    setVendiendo(pinId); setMsg(''); setErr('');
    try {
      const r = await api.post(`/pines/distribuidor/vender/${pinId}`, { vendido_a: f.vendido_a || undefined });
      setMsg(`✓ Venta registrada — ${r.data.codigo}. Cuando el cliente lo active en la app quedará como CANJEADO.`);
      setFormVenta(prev => ({ ...prev, [pinId]: { ...prev[pinId], open: false } }));

      // Mostrar comprobante imprimible
      setComprobante({
        tipo:               'PIN',
        codigo:             r.data.codigo || pin?.codigo || '—',
        creditos:           Number(pin?.creditos || 0),
        vendido_a:          f.vendido_a || '',
        distribuidorNombre: distribuidorNombre || 'Distribuidor',
        fecha:              r.data.vendido_en ? new Date(r.data.vendido_en) : new Date(),
      });

      cargar();
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al registrar venta');
    } finally { setVendiendo(null); }
  };

  const toggleForm = (id) => setFormVenta(prev => ({
    ...prev,
    [id]: { ...prev[id], open: !prev[id]?.open }
  }));

  const VALORES_FILTRO = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100];

  const { resumen, pines = [] } = data;
  const pinsFiltrados = pines.filter(p => {
    const estadoOk = filtro === 'TODOS' || p.estado === filtro;
    const valorOk  = filtroValor === 0  || Number(p.creditos) === filtroValor;
    return estadoOk && valorOk;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>Cargando pines...</div>;

  const stats = [
    { key: 'TODOS',      label: 'TOTAL',      val: resumen.total      || 0, color: '#c0cad8' },
    { key: 'DISPONIBLE', label: 'DISPONIBLES', val: resumen.disponible || 0, color: '#8dc63f' },
    { key: 'VENDIDO',    label: 'VENDIDOS',    val: resumen.vendido    || 0, color: '#f59e0b' },
    { key: 'USADO',      label: 'CANJEADOS',   val: resumen.usado      || 0, color: '#00d4ff' },
    { key: 'EXPIRADO',   label: 'EXPIRADOS',   val: resumen.expirado   || 0, color: '#6b7a8d' },
  ];

  return (
    <div>
      {/* Comprobante imprimible post-venta */}
      {comprobante && (
        <ComprobanteTicket datos={comprobante} onClose={() => setComprobante(null)} />
      )}

      {msg && <div style={{ background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{msg}</div>}
      {err && <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{err}</div>}

      {/* Stats + filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {stats.map(s => (
          <button key={s.key} onClick={() => setFiltro(s.key)} style={{
            background: filtro === s.key ? `${s.color}18` : '#0f1420',
            border: `1.5px solid ${filtro === s.key ? s.color : '#1e2a3a'}`,
            borderRadius: 8, padding: '12px 16px', cursor: 'pointer', textAlign: 'center', minWidth: 90,
          }}>
            <div style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{s.val}</div>
            <div style={{ color: filtro === s.key ? s.color : '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginTop: 3, letterSpacing: '0.05em' }}>{s.label}</div>
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <button onClick={cargar} style={{ background: 'transparent', border: '1px solid #2a3550', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>↻ ACTUALIZAR</button>
        </div>
      </div>

      {/* Filtro por valor de pin */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 20, padding: '10px 14px', background: '#0a0e1a', borderRadius: 8, border: '1px solid #1e2a3a' }}>
        <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.06em', marginRight: 4, whiteSpace: 'nowrap' }}>VALOR:</span>
        {[0, ...VALORES_FILTRO].map(v => {
          const active = filtroValor === v;
          return (
            <button key={v} onClick={() => setFiltroValor(v)} style={{
              background:  active ? 'rgba(141,198,63,0.15)' : 'transparent',
              border:      `1px solid ${active ? '#8dc63f' : '#1e2a3a'}`,
              color:       active ? '#8dc63f' : '#6b7a8d',
              fontFamily:  'Oswald, sans-serif',
              fontSize:    11,
              fontWeight:  active ? 700 : 400,
              padding:     '4px 10px',
              borderRadius: 5,
              cursor:      'pointer',
              whiteSpace:  'nowrap',
            }}>
              {v === 0 ? 'TODOS' : `$${v}`}
            </button>
          );
        })}
        {filtroValor !== 0 && (
          <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginLeft: 6 }}>
            — {pinsFiltrados.length} pin{pinsFiltrados.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {/* Lista de pines */}
      {pinsFiltrados.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📦</div>
          <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
            {filtro === 'TODOS' ? 'No tienes pines asignados todavía. Solicítalos a tu promotor.' : `Sin pines en estado ${filtro}.`}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pinsFiltrados.map(pin => {
            const est = ESTADO_PIN[pin.estado] || ESTADO_PIN.DISPONIBLE;
            const fv  = formVenta[pin.id] || {};
            const isVendiendo = vendiendo === pin.id;

            return (
              <div key={pin.id} style={{ ...CARD, border: `1px solid ${pin.estado === 'DISPONIBLE' ? '#1e2a3a' : `${est.color}30`}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>

                  {/* Código */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: est.bg, border: `1px solid ${est.color}40`, borderRadius: 6, padding: '6px 12px' }}>
                      <span style={{ fontFamily: 'Roboto Mono, monospace', fontSize: 14, fontWeight: 700, color: est.color, letterSpacing: 2 }}>
                        {pin.codigo}
                      </span>
                    </div>
                    {/* Copiar código */}
                    <button onClick={() => { navigator.clipboard?.writeText(pin.codigo); }}
                      title="Copiar código"
                      style={{ background: 'transparent', border: '1px solid #1e2a3a', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 10, padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>
                      📋
                    </button>
                  </div>

                  {/* Valor + estado */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700 }}>
                        {Number(pin.creditos || 0).toLocaleString('es-CO')} cr
                      </div>
                      <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>
                        {creditosAVidas(Number(pin.creditos || 0))} vidas
                      </div>
                    </div>
                    <span style={{ background: est.bg, color: est.color, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {est.label}
                    </span>
                  </div>
                </div>

                {/* Metadatos */}
                <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
                  {pin.asignado_en && (
                    <div>
                      <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>Asignado: </span>
                      <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>
                        {new Date(pin.asignado_en).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  )}
                  {pin.vendido_en && (
                    <div>
                      <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>Vendido: </span>
                      <span style={{ color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>
                        {new Date(pin.vendido_en).toLocaleDateString('es-CO')}
                        {pin.vendido_a && <> → <strong style={{ color: '#c0cad8' }}>{pin.vendido_a}</strong></>}
                      </span>
                    </div>
                  )}
                  {pin.usado_en && (
                    <div>
                      <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>Canjeado: </span>
                      <span style={{ color: '#00d4ff', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>
                        {new Date(pin.usado_en).toLocaleDateString('es-CO')}
                        {pin.usado_por && <> por <strong>{pin.usado_por.nombre || pin.usado_por.email}</strong></>}
                      </span>
                    </div>
                  )}
                  {pin.expira_en && pin.estado === 'DISPONIBLE' && (
                    <div>
                      <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>Expira: </span>
                      <span style={{ color: new Date(pin.expira_en) < new Date() ? '#f87171' : '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>
                        {new Date(pin.expira_en).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Acción: registrar venta (solo DISPONIBLE) */}
                {pin.estado === 'DISPONIBLE' && (
                  <div style={{ marginTop: 12 }}>
                    {!fv.open ? (
                      <button onClick={() => toggleForm(pin.id)}
                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '7px 16px', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.05em' }}>
                        💰 REGISTRAR VENTA
                      </button>
                    ) : (
                      <div style={{ background: '#0a0e1a', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.08em', marginBottom: 10 }}>REGISTRAR VENTA — {pin.codigo}</div>
                        <div style={{ marginBottom: 10 }}>
                          <label style={LABEL}>NOMBRE O REFERENCIA DEL COMPRADOR (opcional)</label>
                          <input
                            type="text"
                            value={fv.vendido_a || ''}
                            onChange={e => setFormVenta(prev => ({ ...prev, [pin.id]: { ...prev[pin.id], vendido_a: e.target.value } }))}
                            placeholder="Ej: Carlos Rodríguez / Tel: 3001234567..."
                            style={INPUT}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => registrarVenta(pin.id)} disabled={isVendiendo}
                            style={{ background: isVendiendo ? '#1e2535' : '#f59e0b', color: isVendiendo ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 18px', borderRadius: 6, border: 'none', cursor: isVendiendo ? 'not-allowed' : 'pointer' }}>
                            {isVendiendo ? 'REGISTRANDO...' : '✓ CONFIRMAR VENTA'}
                          </button>
                          <button onClick={() => toggleForm(pin.id)}
                            style={{ background: 'transparent', border: '1px solid #2a3550', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}>
                            CANCELAR
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ya vendido — estado visual */}
                {pin.estado === 'VENDIDO' && (
                  <div style={{ marginTop: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '8px 12px', fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#f59e0b' }}>
                    ⏳ Entregado al cliente — esperando que lo active en la app para quedar como CANJEADO
                  </div>
                )}

                {/* Canjeado */}
                {pin.estado === 'USADO' && (
                  <div style={{ marginTop: 10, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, padding: '8px 12px', fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#00d4ff' }}>
                    ✓ PIN canjeado exitosamente
                    {pin.usado_por && <span> por <strong>{pin.usado_por.nombre_completo || pin.usado_por.nombre || pin.usado_por.email}</strong></span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal imagen (no aplica aquí pero lo dejamos por consistencia) */}
      {verImg && (
        <div onClick={() => setVerImg(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={verImg} alt="vista" style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}

// ── CANJEAR PIN ASISTIDO ────────────────────────────────────────────────────
// Distribuidor busca/crea al cliente y canjea un PIN de su inventario.

function CanjearPinTab({ distribuidorNombre }) {
  // ── Estado general ────────────────────────────────────────────────────────
  const [paso, setPaso] = useState(1); // 1=PIN  2=USUARIO  3=CONFIRMAR  4=ÉXITO

  // Paso 1 — PIN
  const [modoPIN, setModoPIN]     = useState('inventario'); // 'inventario' | 'manual'
  const [pinesInv, setPinesInv]   = useState([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const [pinSel, setPinSel]       = useState(null);  // objeto pin del inventario
  const [codigoManual, setCodigoManual] = useState('');
  const [filtroCred, setFiltroCred]     = useState(0);

  // Paso 2 — Usuario
  const [buscarPor, setBuscarPor] = useState('email_usuario');
  const [buscarVal, setBuscarVal] = useState('');
  const [buscando, setBuscando]   = useState(false);
  const [usuario, setUsuario]     = useState(null);  // usuario encontrado
  const [usuarioNoEncontrado, setUsuarioNoEncontrado] = useState(false);
  // Sub-form crear usuario nuevo
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', telefono: '', pais: 'CO' });
  const [crearNuevo, setCrearNuevo]     = useState(false);

  // Paso 3 — Confirmar
  const [procesando, setProcesando]   = useState(false);

  // Paso 4 — Éxito
  const [resultado, setResultado]     = useState(null);
  const [comprobante, setComprobante] = useState(null);

  // Mensajes
  const [err, setErr] = useState('');

  // ── Cargar inventario DISPONIBLE y VENDIDO ────────────────────────────────
  useEffect(() => {
    api.get('/pines/distribuidor/mis-pines')
      .then(r => {
        const todos = r.data?.pines || [];
        setPinesInv(todos.filter(p => p.estado === 'DISPONIBLE' || p.estado === 'VENDIDO'));
      })
      .catch(() => {})
      .finally(() => setLoadingInv(false));
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const codigoPIN = modoPIN === 'inventario'
    ? (pinSel?.codigo || '')
    : codigoManual.trim().toUpperCase();

  const creditosPIN = modoPIN === 'inventario'
    ? Number(pinSel?.creditos || 0)
    : null; // no conocido aún si es manual

  const pinesFiltrados = pinesInv.filter(p =>
    filtroCred === 0 || Number(p.creditos) === filtroCred,
  );

  const VALS_FILTRO = [...new Set(pinesInv.map(p => Number(p.creditos)))].sort((a,b) => a - b);

  // ── PASO 1 → PASO 2: validar PIN seleccionado ────────────────────────────
  const avanzarDesdePIN = () => {
    setErr('');
    if (!codigoPIN) { setErr('Selecciona o ingresa un código PIN'); return; }
    if (modoPIN === 'manual' && codigoPIN.length < 8) {
      setErr('El código PIN parece demasiado corto'); return;
    }
    setPaso(2);
    setUsuario(null); setBuscarVal(''); setUsuarioNoEncontrado(false);
  };

  // ── PASO 2: buscar usuario ────────────────────────────────────────────────
  const buscarUsuario = async e => {
    e.preventDefault();
    if (!buscarVal.trim()) { setErr('Ingresa el dato del usuario'); return; }
    setBuscando(true); setErr(''); setUsuario(null); setUsuarioNoEncontrado(false);
    try {
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
      setErr('');
    } catch (ex) {
      const st = ex.response?.status;
      if (st === 404) {
        setUsuarioNoEncontrado(true);
      } else {
        const m = ex.response?.data?.message;
        setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al buscar usuario');
      }
    } finally { setBuscando(false); }
  };

  const avanzarDesdeUsuario = () => {
    setErr('');
    if (!usuario && !crearNuevo) {
      setErr('Busca un usuario o activa la opción de crear cuenta nueva'); return;
    }
    if (crearNuevo && !nuevoUsuario.nombre.trim()) {
      setErr('El nombre del nuevo usuario es requerido'); return;
    }
    if (crearNuevo && !nuevoUsuario.email.trim() && !nuevoUsuario.telefono.trim()) {
      setErr('El nuevo usuario debe tener al menos email o teléfono'); return;
    }
    setPaso(3);
  };

  // ── PASO 3: confirmar y ejecutar el canje ─────────────────────────────────
  const confirmarCanje = async () => {
    setProcesando(true); setErr('');
    try {
      const body = {
        codigo: codigoPIN,
        ...(crearNuevo || !usuario ? {
          crear_si_no_existe: true,
          nuevo_usuario: {
            nombre:   nuevoUsuario.nombre.trim(),
            email:    nuevoUsuario.email.trim()    || undefined,
            telefono: nuevoUsuario.telefono.trim() || undefined,
            pais:     nuevoUsuario.pais             || 'CO',
          },
        } : {
          usuario_id: usuario.id,
        }),
      };

      const { data } = await api.post('/pines/distribuidor/canjear-asistido', body);
      setResultado(data);

      // Armar comprobante
      setComprobante({
        tipo:               'PIN',
        codigo:             data.pin?.codigo || codigoPIN,
        creditos:           data.pin?.creditos || creditosPIN || 0,
        vendido_a:          data.usuario?.nombre || '',
        distribuidorNombre: distribuidorNombre || 'Distribuidor',
        fecha:              new Date(),
      });

      setPaso(4);
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al canjear el PIN');
    } finally { setProcesando(false); }
  };

  // ── Reset completo ────────────────────────────────────────────────────────
  const reiniciar = () => {
    setPaso(1); setPinSel(null); setCodigoManual('');
    setUsuario(null); setBuscarVal(''); setUsuarioNoEncontrado(false);
    setCrearNuevo(false); setNuevoUsuario({ nombre: '', email: '', telefono: '', pais: 'CO' });
    setResultado(null); setComprobante(null); setErr('');
  };

  const nombreDestinatario = usuario?.nombre
    || (crearNuevo && nuevoUsuario.nombre) || '—';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 640 }}>

      {/* Comprobante post-canje */}
      {comprobante && (
        <ComprobanteTicket datos={comprobante} onClose={() => setComprobante(null)} />
      )}

      {/* Breadcrumb de pasos */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: '#0a0e1a', borderRadius: 8, overflow: 'hidden', border: '1px solid #1e2a3a' }}>
        {[
          { n: 1, label: '🔑 PIN'      },
          { n: 2, label: '👤 USUARIO'  },
          { n: 3, label: '✔ CONFIRMAR' },
          { n: 4, label: '🎉 ÉXITO'   },
        ].map(({ n, label }) => (
          <div key={n} style={{
            flex: 1, padding: '12px 8px', textAlign: 'center',
            background: paso === n ? '#a78bfa18' : 'transparent',
            borderRight: n < 4 ? '1px solid #1e2a3a' : 'none',
            borderBottom: paso === n ? '2px solid #a78bfa' : '2px solid transparent',
            cursor: paso > n ? 'pointer' : 'default',
          }}
            onClick={() => paso > n && n !== 4 && setPaso(n)}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: paso >= n ? '#a78bfa' : '#4a5568', letterSpacing: '0.06em' }}>
              {n}. {label}
            </div>
          </div>
        ))}
      </div>

      {err && (
        <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '12px 14px', marginBottom: 18, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
          {err}
        </div>
      )}

      {/* ──────────────── PASO 1: SELECCIONAR PIN ──────────────────────────── */}
      {paso === 1 && (
        <div style={CARD}>
          <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid #1e2a3a' }}>
            PASO 1 — SELECCIONAR PIN A CANJEAR
          </div>

          {/* Toggle inventario / manual */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { val: 'inventario', label: '📋 DE MI INVENTARIO' },
              { val: 'manual',     label: '⌨ INGRESAR CÓDIGO'  },
            ].map(o => (
              <button key={o.val} type="button" onClick={() => { setModoPIN(o.val); setPinSel(null); setCodigoManual(''); setErr(''); }}
                style={{ flex: 1, background: modoPIN === o.val ? 'rgba(167,139,250,0.15)' : '#0a0d14', border: `1.5px solid ${modoPIN === o.val ? '#a78bfa' : '#1e2a3a'}`, borderRadius: 7, padding: '10px 8px', color: modoPIN === o.val ? '#a78bfa' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
                {o.label}
              </button>
            ))}
          </div>

          {/* Inventario */}
          {modoPIN === 'inventario' && (
            <>
              {/* Filtro por valor */}
              {VALS_FILTRO.length > 1 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
                  <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.06em' }}>VALOR:</span>
                  {[0, ...VALS_FILTRO].map(v => (
                    <button key={v} type="button" onClick={() => setFiltroCred(v)}
                      style={{ background: filtroCred === v ? 'rgba(141,198,63,0.15)' : 'transparent', border: `1px solid ${filtroCred === v ? '#8dc63f' : '#1e2a3a'}`, color: filtroCred === v ? '#8dc63f' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 10, padding: '4px 10px', borderRadius: 5, cursor: 'pointer' }}>
                      {v === 0 ? 'TODOS' : `${v} cr`}
                    </button>
                  ))}
                </div>
              )}

              {loadingInv ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>Cargando inventario...</div>
              ) : pinesFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 28, color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, background: '#0a0d14', borderRadius: 8 }}>
                  No tienes pines disponibles para canjear.<br/>
                  <span style={{ fontSize: 11, color: '#4a5568' }}>Solicita más pines a tu promotor en la pestaña "Solicitar Pines".</span>
                </div>
              ) : (
                <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pinesFiltrados.map(p => {
                    const sel = pinSel?.id === p.id;
                    return (
                      <div key={p.id} onClick={() => { setPinSel(p); setErr(''); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: sel ? 'rgba(167,139,250,0.12)' : '#0a0d14', border: `1.5px solid ${sel ? '#a78bfa' : '#1e2a3a'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.12s' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${sel ? '#a78bfa' : '#2a3550'}`, background: sel ? '#a78bfa' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0a0d14' }} />}
                        </div>
                        <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: 13, color: sel ? '#e2e8f0' : '#c0cad8', letterSpacing: '0.08em', flex: 1 }}>{p.codigo}</div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{Number(p.creditos)} cr</div>
                          {p.estado === 'VENDIDO' && <div style={{ color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 9, marginTop: 2 }}>ENTREGADO</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {pinSel && (
                <div style={{ marginTop: 14, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 7, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 11 }}>PIN SELECCIONADO:</span>
                  <span style={{ color: '#e2e8f0', fontFamily: 'Roboto Mono, monospace', fontSize: 13, letterSpacing: '0.08em' }}>{pinSel.codigo}</span>
                  <span style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700 }}>{Number(pinSel.creditos)} cr</span>
                </div>
              )}
            </>
          )}

          {/* Manual */}
          {modoPIN === 'manual' && (
            <div>
              <label style={LABEL}>CÓDIGO PIN</label>
              <input value={codigoManual} onChange={e => setCodigoManual(e.target.value.toUpperCase())} placeholder="GURU-XXXX-XXXX-XXXX-XXXX" maxLength={25}
                style={{ ...INPUT, fontFamily: 'Roboto Mono, monospace', fontSize: 15, letterSpacing: '0.06em', textAlign: 'center' }} />
              <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 6 }}>
                El código debe estar asignado a tu cuenta para poder canjearlo.
              </div>
            </div>
          )}

          <button type="button" onClick={avanzarDesdePIN}
            disabled={modoPIN === 'inventario' ? !pinSel : !codigoManual.trim()}
            style={{ width: '100%', marginTop: 20, background: (modoPIN === 'inventario' ? !pinSel : !codigoManual.trim()) ? '#1e2535' : '#a78bfa', color: (modoPIN === 'inventario' ? !pinSel : !codigoManual.trim()) ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '14px', borderRadius: 7, border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
            SIGUIENTE → BUSCAR USUARIO
          </button>
        </div>
      )}

      {/* ──────────────── PASO 2: BUSCAR / CREAR USUARIO ──────────────────── */}
      {paso === 2 && (
        <div style={CARD}>
          <div style={{ color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid #1e2a3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>PASO 2 — IDENTIFICAR AL BENEFICIARIO</span>
            <span style={{ color: '#a78bfa', fontFamily: 'Roboto Mono, monospace', fontSize: 11 }}>{codigoPIN}</span>
          </div>

          {/* Toggle: buscar existente vs crear nuevo */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button type="button"
              onClick={() => { setCrearNuevo(false); setUsuario(null); setUsuarioNoEncontrado(false); setBuscarVal(''); setErr(''); }}
              style={{ flex: 1, background: !crearNuevo ? 'rgba(0,212,255,0.12)' : '#0a0d14', border: `1.5px solid ${!crearNuevo ? '#00d4ff' : '#1e2a3a'}`, borderRadius: 7, padding: '11px 8px', color: !crearNuevo ? '#00d4ff' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
              🔍 BUSCAR USUARIO EXISTENTE
            </button>
            <button type="button"
              onClick={() => { setCrearNuevo(true); setUsuario(null); setUsuarioNoEncontrado(false); setBuscarVal(''); setErr(''); }}
              style={{ flex: 1, background: crearNuevo ? 'rgba(167,139,250,0.12)' : '#0a0d14', border: `1.5px solid ${crearNuevo ? '#a78bfa' : '#1e2a3a'}`, borderRadius: 7, padding: '11px 8px', color: crearNuevo ? '#a78bfa' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}>
              ➕ CREAR USUARIO NUEVO
            </button>
          </div>

          {/* ── Modo: BUSCAR USUARIO ── */}
          {!crearNuevo && (
            <>
              <form onSubmit={buscarUsuario}>
                <div style={{ marginBottom: 14 }}>
                  <label style={LABEL}>BUSCAR POR</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 12 }}>
                    {[
                      { val: 'email_usuario',     label: 'Email'     },
                      { val: 'telefono_usuario',  label: 'Teléfono'  },
                      { val: 'documento_usuario', label: 'Documento' },
                      { val: 'usuario_id',        label: 'UUID'      },
                    ].map(opt => (
                      <button key={opt.val} type="button" onClick={() => { setBuscarPor(opt.val); setBuscarVal(''); setUsuario(null); setUsuarioNoEncontrado(false); setErr(''); }}
                        style={{ background: buscarPor === opt.val ? '#1e3a2a' : '#0a0d14', border: `1px solid ${buscarPor === opt.val ? '#8dc63f' : '#1e2a3a'}`, borderRadius: 6, padding: '8px 4px', color: buscarPor === opt.val ? '#8dc63f' : '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, cursor: 'pointer' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <input value={buscarVal} onChange={e => { setBuscarVal(e.target.value); setUsuario(null); setUsuarioNoEncontrado(false); }}
                    placeholder={buscarPor === 'email_usuario' ? 'usuario@ejemplo.com' : buscarPor === 'telefono_usuario' ? '+57 300 123 4567' : buscarPor === 'documento_usuario' ? '12345678' : 'uuid del usuario'}
                    style={INPUT} />
                </div>
                <button type="submit" disabled={buscando || !buscarVal.trim()}
                  style={{ width: '100%', background: buscando || !buscarVal.trim() ? '#1e2535' : '#00d4ff', color: buscando || !buscarVal.trim() ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
                  {buscando ? 'BUSCANDO...' : '🔍 BUSCAR USUARIO'}
                </button>
              </form>

              {/* Usuario encontrado */}
              {usuario && (
                <div style={{ marginTop: 16, background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.1em', marginBottom: 10 }}>✓ USUARIO ENCONTRADO</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 26 }}>👤</span>
                    <div>
                      <div style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 17, fontWeight: 700 }}>{usuario.nombre}</div>
                      <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>{usuario.email}</div>
                      {usuario.telefono && <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 11 }}>{usuario.telefono}</div>}
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 13 }}>{Number(usuario.saldo || 0).toLocaleString('es-CO')} cr</div>
                      <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9 }}>saldo actual</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Usuario NO encontrado */}
              {usuarioNoEncontrado && (
                <div style={{ marginTop: 14, background: '#150a1a', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>⚠</span>
                  <div>
                    <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12 }}>Usuario no encontrado</div>
                    <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 2 }}>
                      Usa el botón <strong style={{ color: '#a78bfa' }}>CREAR USUARIO NUEVO</strong> de arriba para registrarlo ahora.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Modo: CREAR USUARIO NUEVO ── */}
          {crearNuevo && (
            <div style={{ background: '#0f0a1a', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, padding: '16px' }}>
              <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.08em', marginBottom: 14 }}>DATOS DEL NUEVO USUARIO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={LABEL}>NOMBRE COMPLETO *</label>
                  <input value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario(u => ({ ...u, nombre: e.target.value }))}
                    placeholder="Nombre del cliente" maxLength={80} style={INPUT} autoFocus />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={LABEL}>EMAIL <span style={{ color: '#4a5568' }}>(si tiene)</span></label>
                    <input type="email" value={nuevoUsuario.email} onChange={e => setNuevoUsuario(u => ({ ...u, email: e.target.value }))}
                      placeholder="cliente@email.com" maxLength={100} style={INPUT} />
                  </div>
                  <div>
                    <label style={LABEL}>TELÉFONO <span style={{ color: '#4a5568' }}>(si tiene)</span></label>
                    <input type="tel" value={nuevoUsuario.telefono} onChange={e => setNuevoUsuario(u => ({ ...u, telefono: e.target.value }))}
                      placeholder="+57 300..." maxLength={20} style={INPUT} />
                  </div>
                </div>
                <div>
                  <label style={LABEL}>PAÍS</label>
                  <select value={nuevoUsuario.pais} onChange={e => setNuevoUsuario(u => ({ ...u, pais: e.target.value }))}
                    style={{ ...INPUT, cursor: 'pointer' }}>
                    {[['CO','🇨🇴 Colombia'],['MX','🇲🇽 México'],['AR','🇦🇷 Argentina'],['PE','🇵🇪 Perú'],['VE','🇻🇪 Venezuela'],['EC','🇪🇨 Ecuador'],['US','🇺🇸 Estados Unidos'],['ES','🇪🇸 España']].map(([c,l]) => (
                      <option key={c} value={c}>{l}</option>
                    ))}
                  </select>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, padding: '10px 12px', color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: 1.5 }}>
                  ⚠ Se generará automáticamente una contraseña temporal que debes entregar al cliente.
                  El cliente puede cambiarla en Cuenta → Cambiar Contraseña.
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" onClick={() => { setPaso(1); setErr(''); }}
              style={{ background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '12px 20px', borderRadius: 6, border: '1px solid #2a3550', cursor: 'pointer' }}>
              ← VOLVER
            </button>
            <button type="button" onClick={avanzarDesdeUsuario} disabled={!usuario && !crearNuevo}
              style={{ flex: 1, background: !usuario && !crearNuevo ? '#1e2535' : '#a78bfa', color: !usuario && !crearNuevo ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
              SIGUIENTE → CONFIRMAR
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── PASO 3: CONFIRMAR ───────────────────────────────── */}
      {paso === 3 && (
        <div style={CARD}>
          <div style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid #1e2a3a' }}>
            PASO 3 — CONFIRMAR CANJE
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Resumen PIN */}
            <div style={{ background: '#0a0d14', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.1em', marginBottom: 8 }}>PIN A CANJEAR</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: 15, color: '#e2e8f0', letterSpacing: '0.1em' }}>{codigoPIN}</div>
                {creditosPIN && <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700 }}>{creditosPIN} cr</div>}
              </div>
            </div>

            {/* Resumen usuario */}
            <div style={{ background: '#0a0d14', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.1em', marginBottom: 8 }}>
                {crearNuevo ? 'NUEVO USUARIO A CREAR' : 'BENEFICIARIO'}
              </div>
              <div style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700 }}>{nombreDestinatario}</div>
              {!crearNuevo && usuario?.email && <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>{usuario.email}</div>}
              {crearNuevo && (
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {nuevoUsuario.email && <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>{nuevoUsuario.email}</div>}
                  {nuevoUsuario.telefono && <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>{nuevoUsuario.telefono}</div>}
                  <div style={{ color: '#f59e0b', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 4 }}>⚠ Se creará una cuenta nueva con contraseña temporal</div>
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(141,198,63,0.06)', border: '1px solid rgba(141,198,63,0.2)', borderRadius: 7, padding: '12px 14px', color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>
              Esta acción es inmediata e irreversible. El PIN quedará como CANJEADO.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" onClick={() => { setPaso(2); setErr(''); }} disabled={procesando}
              style={{ background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '13px 20px', borderRadius: 6, border: '1px solid #2a3550', cursor: 'pointer' }}>
              ← VOLVER
            </button>
            <button type="button" onClick={confirmarCanje} disabled={procesando}
              style={{ flex: 1, background: procesando ? '#1e2535' : '#8dc63f', color: procesando ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '13px', borderRadius: 6, border: 'none', cursor: procesando ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}>
              {procesando ? 'CANJEANDO...' : '✓ CONFIRMAR CANJE'}
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── PASO 4: ÉXITO ──────────────────────────────────── */}
      {paso === 4 && resultado && (
        <div style={CARD}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 22, color: '#8dc63f', fontWeight: 700 }}>
              ¡PIN CANJEADO!
            </div>
            <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, marginTop: 6 }}>
              {resultado.pin?.creditos} créditos acreditados a <strong style={{ color: '#fff' }}>{resultado.usuario?.nombre}</strong>
            </div>
          </div>

          {/* Credenciales temporales si se creó usuario */}
          {resultado.credenciales_temp && (
            <div style={{ background: '#1a0a0a', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 8, padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 12 }}>
                ⚠ CREDENCIALES DE ACCESO TEMPORALES — ENTREGAR AL CLIENTE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#0a0e1a', borderRadius: 6, padding: '10px 12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>Email / usuario:</span>
                  <span style={{ color: '#e2e8f0', fontFamily: 'Roboto Mono, monospace', fontSize: 13 }}>{resultado.credenciales_temp.email}</span>
                </div>
                <div style={{ background: '#0a0e1a', borderRadius: 6, padding: '10px 12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>Contraseña temporal:</span>
                  <span style={{ color: '#f59e0b', fontFamily: 'Roboto Mono, monospace', fontSize: 15, fontWeight: 700, letterSpacing: '0.1em' }}>{resultado.credenciales_temp.password}</span>
                </div>
              </div>
              <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 10, lineHeight: 1.5 }}>
                El cliente puede cambiar la contraseña en la app: Cuenta → Cambiar Contraseña
              </div>
            </div>
          )}

          <div style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>PIN canjeado</span>
              <span style={{ color: '#a78bfa', fontFamily: 'Roboto Mono, monospace', fontSize: 12 }}>{resultado.pin?.codigo}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>Créditos acreditados</span>
              <span style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700 }}>+{resultado.pin?.creditos} cr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>Saldo nuevo del usuario</span>
              <span style={{ color: '#c0cad8', fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>{Number(resultado.saldo_nuevo || 0).toLocaleString('es-CO')} cr</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setComprobante({
              tipo: 'PIN', codigo: resultado.pin?.codigo, creditos: resultado.pin?.creditos,
              vendido_a: resultado.usuario?.nombre, distribuidorNombre, fecha: new Date(),
            })}
              style={{ flex: 1, background: '#1e2535', color: '#c0cad8', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '13px', borderRadius: 6, border: '1px solid #2a3550', cursor: 'pointer' }}>
              🖨 VER COMPROBANTE
            </button>
            <button type="button" onClick={reiniciar}
              style={{ flex: 1, background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '13px', borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
              ✓ NUEVO CANJE
            </button>
          </div>
        </div>
      )}
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

  const saldoCr = Number(perfil?.saldo_actual || 0);

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
              { label: 'COMISIÓN (CR)', val: `${Number(perfil.comisiones_ganadas || 0).toLocaleString('es-CO')} cr`, sub: `≈ $${Number(perfil.comisiones_ganadas || 0).toLocaleString('es-CO')} USD`, color: '#f59e0b' },
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
          <TabBtn active={tab === 'mispines'}   onClick={() => setTab('mispines')}>MIS PINES</TabBtn>
          <TabBtn active={tab === 'pines'}      onClick={() => setTab('pines')}>SOLICITAR PINES</TabBtn>
          <TabBtn active={tab === 'pin'}        onClick={() => setTab('pin')}>CANJEAR PIN</TabBtn>
          <TabBtn active={tab === 'cuenta'}     onClick={() => setTab('cuenta')}>👤 MI CUENTA</TabBtn>
        </div>

        {tab === 'recargar'   && <RecargarTab eventos={eventos} distribuidorNombre={perfil?.nombre} />}
        {tab === 'historial'  && <MisRecargasTab eventos={eventos} />}
        {tab === 'comisiones' && <MisComisionesTab perfil={perfil} />}
        {tab === 'mispines'   && <MisPinesTab distribuidorNombre={perfil?.nombre} />}
        {tab === 'pines'      && <SolicitarPinesTab />}
        {tab === 'pin'        && <CanjearPinTab distribuidorNombre={perfil?.nombre} />}
        {tab === 'cuenta'     && <EditarPerfil perfil={perfil} />}
      </div>
    </div>
  );
}
