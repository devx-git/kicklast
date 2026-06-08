import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import PartidosResultadosTab from '../components/PartidosResultadosTab';
import { formatCreditos, creditosAVidas } from '../utils/currency';

const CARD = { background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '20px 24px' };
const INPUT = { width: '100%', background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '10px 12px', color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const LABEL = { display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 };

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#8dc63f' : '#1e2535', color: active ? '#0a0d14' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.2s' }}>
      {children}
    </button>
  );
}

function Badge({ color, children }) {
  return <span style={{ background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{children}</span>;
}

// ── DISTRIBUIDORES TAB ─────────────────────────────────────────────────────
function PctInput({ label, name, value, onChange, max = 50, color = '#8dc63f' }) {
  return (
    <div>
      <label style={{ ...LABEL, color }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input type="range" name={name} min="0" max={max} step="0.5" value={value} onChange={onChange}
          style={{ flex: 1, accentColor: color }} />
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color, minWidth: 40, textAlign: 'right' }}>{value}%</span>
      </div>
    </div>
  );
}

function DistribuidoresTab() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', pais: 'Colombia', notas: '',
    comision_recarga_pct: 3, comision_pines_pct: 3,
    comision_retiros_pct: 0, comision_premios_pct: 0,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [fondeoId, setFondeoId] = useState(null);
  const [fondeoMonto, setFondeoMonto] = useState('');
  const [fondeoConcepto, setFondeoConcepto] = useState('');
  const [fondeando, setFondeando] = useState(false);
  // Editar comisiones de distribuidor existente
  const [editComId, setEditComId] = useState(null);
  const [editCom, setEditCom] = useState({ comision_recarga_pct: 3, comision_pines_pct: 3, comision_retiros_pct: 0, comision_premios_pct: 0 });
  const [editComSaving, setEditComSaving] = useState(false);

  const cargar = useCallback(() => {
    setLoading(true);
    api.get('/distribuidores').then(r => setList(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handle = e => {
    const val = e.target.type === 'range' ? Number(e.target.value) : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: val }));
  };

  const crearDistribuidor = async e => {
    e.preventDefault();
    setErr(''); setMsg('');
    setSaving(true);
    try {
      await api.post('/distribuidores', {
        ...form,
        comision_recarga_pct: Number(form.comision_recarga_pct),
        comision_pines_pct: Number(form.comision_pines_pct),
        comision_retiros_pct: Number(form.comision_retiros_pct),
        comision_premios_pct: Number(form.comision_premios_pct),
      });
      setMsg('✓ Distribuidor creado exitosamente');
      setShowForm(false);
      setForm({ nombre: '', email: '', password: '', pais: 'Colombia', notas: '', comision_recarga_pct: 3, comision_pines_pct: 3, comision_retiros_pct: 0, comision_premios_pct: 0 });
      cargar();
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al crear distribuidor');
    } finally { setSaving(false); }
  };

  const toggleEstado = async (id) => {
    try { await api.patch(`/distribuidores/${id}/estado`); cargar(); } catch {}
  };

  const fondear = async (id) => {
    if (!fondeoMonto || isNaN(Number(fondeoMonto))) return;
    setFondeando(true);
    try {
      await api.post(`/distribuidores/${id}/fondear`, { monto: Number(fondeoMonto), concepto: fondeoConcepto || 'Carga manual' });
      setMsg('✓ Créditos acreditados al distribuidor');
      setFondeoId(null); setFondeoMonto(''); setFondeoConcepto('');
      cargar();
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al fondear');
    } finally { setFondeando(false); }
  };

  const abrirEditCom = (row) => {
    if (editComId === row.id) { setEditComId(null); return; }
    setEditComId(row.id);
    setEditCom({
      comision_recarga_pct: Number(row.comision_recarga_pct ?? 3),
      comision_pines_pct:   Number(row.comision_pines_pct   ?? 3),
      comision_retiros_pct: Number(row.comision_retiros_pct  ?? 0),
      comision_premios_pct: Number(row.comision_premios_pct  ?? 0),
    });
  };

  const guardarCom = async (id) => {
    setEditComSaving(true);
    try {
      await api.patch(`/distribuidores/${id}/comisiones`, {
        comision_recarga_pct: Number(editCom.comision_recarga_pct),
        comision_pines_pct:   Number(editCom.comision_pines_pct),
        comision_retiros_pct: Number(editCom.comision_retiros_pct),
        comision_premios_pct: Number(editCom.comision_premios_pct),
      });
      setMsg('✓ Comisiones actualizadas');
      setEditComId(null);
      cargar();
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al actualizar comisiones');
    } finally { setEditComSaving(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>Cargando distribuidores...</div>;

  const flat = list.map(d => ({
    ...d,
    _nombre: d.nombre || d.usuario?.nombre || d.usuario?.email || '—',
    _email: d.email || d.usuario?.email || '—',
    _saldo_cr: Number(d.saldo_disponible || 0),
    _recargas: d.total_recargas ?? 0,
    _estado: d.activo !== false ? 'ACTIVO' : 'INACTIVO',
    comision_recarga_pct: Number(d.comision_recarga_pct ?? 3),
    comision_pines_pct:   Number(d.comision_pines_pct   ?? 3),
    comision_retiros_pct: Number(d.comision_retiros_pct  ?? 0),
    comision_premios_pct: Number(d.comision_premios_pct  ?? 0),
  }));

  const columns = [
    { key: '_nombre', label: 'NOMBRE', sortable: true },
    { key: '_email', label: 'EMAIL', sortable: true },
    {
      key: '_saldo_cr', label: 'SALDO (CR)', sortable: true,
      render: (val) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', color: '#8dc63f', fontWeight: 700 }}>{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568' }}>{creditosAVidas(val)} vidas</div>
        </div>
      ),
    },
    {
      key: 'comision_recarga_pct', label: 'COMISIONES', sortable: false,
      render: (_, row) => (
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', lineHeight: 1.6 }}>
          <span style={{ color: '#8dc63f' }}>Recarga {row.comision_recarga_pct}%</span> ·{' '}
          <span style={{ color: '#a78bfa' }}>Pines {row.comision_pines_pct}%</span> ·{' '}
          <span style={{ color: '#f59e0b' }}>Retiros {row.comision_retiros_pct}%</span> ·{' '}
          <span style={{ color: '#00d4ff' }}>Premios {row.comision_premios_pct}%</span>
        </div>
      ),
    },
    { key: '_recargas', label: 'RECARGAS', sortable: true },
    {
      key: '_estado', label: 'ESTADO', sortable: true, filterable: true,
      filterOptions: ['ACTIVO', 'INACTIVO'],
      render: (val) => <Badge color={val === 'ACTIVO' ? '#8dc63f' : '#f87171'}>{val}</Badge>,
    },
    {
      key: '_acciones', label: 'ACCIONES', noSearch: true,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button onClick={() => toggleEstado(row.id)} style={{ background: '#1e2535', color: '#c0cad8', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, border: '1px solid #1e2a3a', cursor: 'pointer' }}>
            {row.activo !== false ? 'DESACTIVAR' : 'ACTIVAR'}
          </button>
          <button onClick={() => { setFondeoId(fondeoId === row.id ? null : row.id); setFondeoMonto(''); setFondeoConcepto(''); setEditComId(null); }}
            style={{ background: '#1e2535', color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, border: '1px solid #f59e0b30', cursor: 'pointer' }}>
            FONDEAR
          </button>
          <button onClick={() => { abrirEditCom(row); setFondeoId(null); }}
            style={{ background: editComId === row.id ? '#1e3a2a' : '#1e2535', color: editComId === row.id ? '#8dc63f' : '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, border: `1px solid ${editComId === row.id ? '#8dc63f40' : '#a78bfa30'}`, cursor: 'pointer' }}>
            COMISIONES
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em' }}>MIS DISTRIBUIDORES</div>
        <button onClick={() => { setShowForm(s => !s); setEditComId(null); setFondeoId(null); }}
          style={{ background: showForm ? '#1e2535' : '#8dc63f', color: showForm ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
          {showForm ? '✕ CANCELAR' : '+ NUEVO DISTRIBUIDOR'}
        </button>
      </div>

      {msg && <div style={{ background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{msg}</div>}
      {err && <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{err}</div>}

      {showForm && (
        <div style={{ ...CARD, border: '1px solid #8dc63f30', marginBottom: 20 }}>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 16 }}>DATOS DEL DISTRIBUIDOR</div>
          <form onSubmit={crearDistribuidor}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 14 }}>
              <div><label style={LABEL}>NOMBRE</label><input name="nombre" value={form.nombre} onChange={handle} required placeholder="Nombre del distribuidor" style={INPUT} /></div>
              <div><label style={LABEL}>EMAIL</label><input name="email" type="email" value={form.email} onChange={handle} required placeholder="email@ejemplo.com" style={INPUT} /></div>
              <div><label style={LABEL}>CONTRASEÑA INICIAL</label><input name="password" type="password" value={form.password} onChange={handle} required minLength={6} placeholder="Mínimo 6 caracteres" style={INPUT} /></div>
              <div><label style={LABEL}>PAÍS</label><input name="pais" value={form.pais} onChange={handle} placeholder="Colombia" style={INPUT} /></div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={LABEL}>NOTAS INTERNAS <span style={{ color: '#4a5568', fontSize: 10 }}>(opcional)</span></label>
              <input name="notas" value={form.notas} onChange={handle} placeholder="Ciudad, zona de cobertura, etc." style={INPUT} />
            </div>

            {/* ── Comisiones ── */}
            <div style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.1em', marginBottom: 12 }}>COMISIONES DEL DISTRIBUIDOR</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
                <PctInput label="% RECARGA (máx 50%)" name="comision_recarga_pct" value={form.comision_recarga_pct} onChange={handle} max={50} color="#8dc63f" />
                <PctInput label="% VENTA DE PINES (máx 50%)" name="comision_pines_pct" value={form.comision_pines_pct} onChange={handle} max={50} color="#a78bfa" />
                <PctInput label="% RETIROS GESTIONADOS (máx 20%)" name="comision_retiros_pct" value={form.comision_retiros_pct} onChange={handle} max={20} color="#f59e0b" />
                <PctInput label="% PAGO DE PREMIOS (máx 20%)" name="comision_premios_pct" value={form.comision_premios_pct} onChange={handle} max={20} color="#00d4ff" />
              </div>
              <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginTop: 10 }}>
                Las comisiones se acreditan automáticamente al wallet del distribuidor cuando realiza operaciones.
              </div>
            </div>

            <button type="submit" disabled={saving} style={{ background: saving ? '#1e2535' : '#8dc63f', color: saving ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '11px 28px', borderRadius: 6, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'CREANDO...' : 'CREAR DISTRIBUIDOR'}
            </button>
          </form>
        </div>
      )}

      {/* Inline fondeo form */}
      {fondeoId && (
        <div style={{ background: '#0a0d14', border: '1px solid #f59e0b30', borderRadius: 8, padding: 16, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ ...LABEL, color: '#f59e0b' }}>CRÉDITOS A FONDEAR</label>
            <input value={fondeoMonto} onChange={e => setFondeoMonto(e.target.value)} type="number" min="1" placeholder="0" style={INPUT} />
            {fondeoMonto && Number(fondeoMonto) > 0 && (
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 4 }}>
                = {creditosAVidas(fondeoMonto)} vidas · ≈ ${Number(fondeoMonto).toLocaleString('es-CO')} USD
              </div>
            )}
          </div>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={LABEL}>CONCEPTO</label>
            <input value={fondeoConcepto} onChange={e => setFondeoConcepto(e.target.value)} placeholder="Carga manual, transferencia..." style={INPUT} />
          </div>
          <button onClick={() => fondear(fondeoId)} disabled={fondeando} style={{ background: '#f59e0b', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 20px', borderRadius: 6, border: 'none', cursor: fondeando ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
            {fondeando ? '...' : 'ACREDITAR'}
          </button>
          <button onClick={() => setFondeoId(null)} style={{ background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '10px 14px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: 'pointer' }}>CANCELAR</button>
        </div>
      )}

      {/* Inline editar comisiones */}
      {editComId && (
        <div style={{ background: '#0a0d14', border: '1px solid #a78bfa30', borderRadius: 8, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 14 }}>EDITAR COMISIONES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 16 }}>
            <PctInput label="% RECARGA" name="comision_recarga_pct" value={editCom.comision_recarga_pct}
              onChange={e => setEditCom(c => ({ ...c, comision_recarga_pct: Number(e.target.value) }))} max={50} color="#8dc63f" />
            <PctInput label="% VENTA PINES" name="comision_pines_pct" value={editCom.comision_pines_pct}
              onChange={e => setEditCom(c => ({ ...c, comision_pines_pct: Number(e.target.value) }))} max={50} color="#a78bfa" />
            <PctInput label="% RETIROS" name="comision_retiros_pct" value={editCom.comision_retiros_pct}
              onChange={e => setEditCom(c => ({ ...c, comision_retiros_pct: Number(e.target.value) }))} max={20} color="#f59e0b" />
            <PctInput label="% PREMIOS" name="comision_premios_pct" value={editCom.comision_premios_pct}
              onChange={e => setEditCom(c => ({ ...c, comision_premios_pct: Number(e.target.value) }))} max={20} color="#00d4ff" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => guardarCom(editComId)} disabled={editComSaving}
              style={{ background: editComSaving ? '#1e2535' : '#a78bfa', color: editComSaving ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '10px 22px', borderRadius: 6, border: 'none', cursor: editComSaving ? 'not-allowed' : 'pointer' }}>
              {editComSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </button>
            <button onClick={() => setEditComId(null)} style={{ background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '10px 16px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: 'pointer' }}>CANCELAR</button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={flat} pageSize={10} emptyMsg="No tienes distribuidores aún" exportCsv />
    </div>
  );
}

// ── PINES TAB ──────────────────────────────────────────────────────────────
const PINES_PAQUETES_NOMBRES = { starter: 'Starter', basico: 'Básico', estandar: 'Estándar', premium: 'Premium', full: 'Full', personalizado: 'Personalizado' };

function PinesTab() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [pines, setPines] = useState([]);
  const [loading, setLoading] = useState(true);
  // Solicitudes de distribuidores
  const [solDist, setSolDist]   = useState([]);
  const [loadingDist, setLoadingDist] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [msgDist, setMsgDist]   = useState('');
  const [errDist, setErrDist]   = useState('');
  const [subTab, setSubTab]     = useState('distribuidores'); // 'distribuidores' | 'mispines'
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cantidad: '', valor_unitario: '', notas_promotor: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    const [s, p] = await Promise.allSettled([
      api.get('/pines/mis-solicitudes'),
      api.get('/pines/mis-pines?estado=DISPONIBLE'),
    ]);
    if (s.status === 'fulfilled') {
      const sd = s.value.data;
      setSolicitudes(Array.isArray(sd) ? sd : sd?.solicitudes || sd?.data || []);
    }
    if (p.status === 'fulfilled') {
      const pd = p.value.data;
      setPines(Array.isArray(pd) ? pd : pd?.pines || pd?.data || []);
    }
    setLoading(false);
  }, []);

  const cargarDist = useCallback(async () => {
    setLoadingDist(true);
    try {
      const r = await api.get('/pines/promotor/solicitudes-distribuidores');
      const d = r.data;
      setSolDist(Array.isArray(d) ? d : d?.solicitudes || d?.data || []);
    } catch { setSolDist([]); }
    finally { setLoadingDist(false); }
  }, []);

  useEffect(() => { cargar(); cargarDist(); }, [cargar, cargarDist]);

  const aprobarDist = async (id) => {
    setActioning(id); setErrDist(''); setMsgDist('');
    try {
      await api.post(`/pines/promotor/aprobar-distribuidor/${id}`);
      setMsgDist('✓ Solicitud aprobada y pines asignados al distribuidor');
      cargarDist(); cargar();
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErrDist(Array.isArray(m) ? m.join(', ') : m || 'Error al aprobar');
    } finally { setActioning(null); }
  };

  const rechazarDist = async (id, motivo) => {
    setActioning(id); setErrDist(''); setMsgDist('');
    try {
      await api.post(`/pines/promotor/rechazar-distribuidor/${id}`, { motivo });
      setMsgDist('Solicitud rechazada');
      cargarDist();
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErrDist(Array.isArray(m) ? m.join(', ') : m || 'Error al rechazar');
    } finally { setActioning(null); }
  };

  const solicitar = async e => {
    e.preventDefault();
    setErr(''); setMsg('');
    setSaving(true);
    try {
      await api.post('/pines/solicitar', { cantidad: Number(form.cantidad), valor_unitario: Number(form.valor_unitario), notas_promotor: form.notas_promotor });
      setMsg('✓ Solicitud de pines enviada al administrador');
      setShowForm(false);
      setForm({ cantidad: '', valor_unitario: '', notas_promotor: '' });
      cargar();
    } catch (ex) {
      const m = ex.response?.data?.message;
      setErr(Array.isArray(m) ? m.join(', ') : m || 'Error al solicitar');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>Cargando pines...</div>;

  const ESTADO_COLOR = { PENDIENTE: '#f59e0b', APROBADA: '#8dc63f', RECHAZADA: '#f87171', PAGADA: '#00d4ff' };

  // Solicitudes as DataTable
  const solFlat = solicitudes.map(s => ({
    ...s,
    _cantidad: s.cantidad,
    _valor_cr: Number(s.valor_unitario || 0),
    _total_cr: (s.cantidad || 0) * Number(s.valor_unitario || 0),
    _estado: s.estado || 'PENDIENTE',
    _notas: s.notas_promotor || '—',
    _fecha: s.creado_en ? new Date(s.creado_en).toLocaleDateString('es-CO') : '—',
  }));

  const solCols = [
    { key: '_cantidad', label: 'CANTIDAD', sortable: true },
    {
      key: '_valor_cr', label: 'VALOR UNIT. (CR)', sortable: true,
      render: (val) => <span style={{ fontFamily: 'Oswald, sans-serif', color: '#8dc63f' }}>{Number(val).toLocaleString('es-CO')} cr</span>,
    },
    {
      key: '_total_cr', label: 'TOTAL (CR)', sortable: true,
      render: (val) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#f59e0b' }}>{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontSize: 9, color: '#4a5568' }}>≈ ${Number(val).toLocaleString('es-CO')} USD</div>
        </div>
      ),
    },
    {
      key: '_estado', label: 'ESTADO', sortable: true, filterable: true,
      filterOptions: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'PAGADA'],
      render: (val) => <Badge color={ESTADO_COLOR[val] || '#6b7a8d'}>{val}</Badge>,
    },
    { key: '_notas', label: 'NOTAS' },
    { key: '_fecha', label: 'FECHA', sortable: true },
  ];

  // Pines disponibles as DataTable
  const pinesFlat = pines.map(p => ({
    ...p,
    _codigo: p.codigo,
    _tipo: p.tipo_recarga || '—',
    _creditos: Number(p.creditos || 0),
    _vidas: creditosAVidas(Number(p.creditos || 0)),
    _expira: p.fecha_expiracion ? new Date(p.fecha_expiracion).toLocaleDateString('es-CO') : '—',
  }));

  const pinesCols = [
    {
      key: '_codigo', label: 'CÓDIGO', sortable: true,
      render: (val) => <span style={{ fontFamily: 'Roboto Mono, monospace', color: '#8dc63f', letterSpacing: 2, fontSize: 12 }}>{val}</span>,
    },
    { key: '_tipo', label: 'TIPO', sortable: true },
    {
      key: '_creditos', label: 'CRÉDITOS', sortable: true,
      render: (val, row) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', color: '#8dc63f', fontWeight: 700 }}>{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontSize: 9, color: '#4a5568' }}>{row._vidas} vidas</div>
        </div>
      ),
    },
    { key: '_expira', label: 'EXPIRA', sortable: true },
  ];

  const pendDist = solDist.filter(s => s.estado === 'PENDIENTE');

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid #1e2535', paddingBottom: 10, flexWrap: 'wrap' }}>
        {[
          { key: 'distribuidores', label: 'SOLICITUDES DE DISTRIBUIDORES', badge: pendDist.length, color: '#f59e0b' },
          { key: 'mispines', label: 'MIS PINES', badge: null, color: '#8dc63f' },
        ].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)} style={{
            background: subTab === t.key ? '#1e2535' : 'transparent',
            color: subTab === t.key ? t.color : '#6b7a8d',
            border: subTab === t.key ? `1px solid ${t.color}40` : '1px solid transparent',
            fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            {t.label}
            {t.badge > 0 && (
              <span style={{ background: '#f59e0b', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 7px', minWidth: 18, textAlign: 'center' }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── SOLICITUDES DE DISTRIBUIDORES ── */}
      {subTab === 'distribuidores' && (
        <DistSolicitudesSection
          solDist={solDist}
          pendDist={pendDist}
          loadingDist={loadingDist}
          actioning={actioning}
          msgDist={msgDist}
          errDist={errDist}
          onAprobar={aprobarDist}
          onRechazar={rechazarDist}
          onRefresh={cargarDist}
        />
      )}

      {/* ── MIS PINES ── */}
      {subTab === 'mispines' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em' }}>MIS PINES DE RECARGA</div>
            <button onClick={() => setShowForm(s => !s)} style={{ background: showForm ? '#1e2535' : '#a78bfa', color: showForm ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
              {showForm ? '✕ CANCELAR' : 'SOLICITAR PINES AL ADMIN'}
            </button>
          </div>

          {msg && <div style={{ background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{msg}</div>}
          {err && <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{err}</div>}

          {showForm && (
            <div style={{ ...CARD, border: '1px solid #a78bfa30', marginBottom: 20 }}>
              <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 16 }}>SOLICITUD DE LOTE DE PINES AL ADMINISTRADOR</div>
              <form onSubmit={solicitar}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={LABEL}>CANTIDAD</label>
                    <input value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} required type="number" min="1" placeholder="Ej: 100" style={INPUT} />
                  </div>
                  <div>
                    <label style={LABEL}>VALOR UNITARIO (CRÉDITOS = USD)</label>
                    <input value={form.valor_unitario} onChange={e => setForm(f => ({ ...f, valor_unitario: e.target.value }))} required type="number" min="1" placeholder="Ej: 5" style={INPUT} />
                    {form.valor_unitario && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 4 }}>= {form.valor_unitario} cr = ${form.valor_unitario} USD = {creditosAVidas(form.valor_unitario)} vidas</div>}
                  </div>
                </div>
                {form.cantidad && form.valor_unitario && (
                  <div style={{ background: '#0a0e1a', border: '1px solid #a78bfa20', borderRadius: 6, padding: '10px 14px', marginBottom: 14 }}>
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c0cad8' }}>Total: </span>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: '#f59e0b', fontWeight: 700 }}>
                      {(Number(form.cantidad) * Number(form.valor_unitario)).toLocaleString('es-CO')} cr
                    </span>
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}> ≈ ${(Number(form.cantidad) * Number(form.valor_unitario)).toLocaleString('es-CO')} USD</span>
                  </div>
                )}
                <div style={{ marginBottom: 14 }}>
                  <label style={LABEL}>NOTAS</label>
                  <input value={form.notas_promotor} onChange={e => setForm(f => ({ ...f, notas_promotor: e.target.value }))} placeholder="Para qué evento, zona de distribución..." style={INPUT} />
                </div>
                <button type="submit" disabled={saving} style={{ background: saving ? '#1e2535' : '#a78bfa', color: saving ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '11px 28px', borderRadius: 6, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'ENVIANDO...' : 'SOLICITAR LOTE'}
                </button>
              </form>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'PINES DISPONIBLES', val: pines.length, color: '#8dc63f' },
              { label: 'SOLICITUDES', val: solicitudes.length, color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} style={{ ...CARD, textAlign: 'center' }}>
                <div style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{s.val}</div>
                <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Solicitudes table */}
          {solicitudes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 10 }}>SOLICITUDES AL ADMIN</div>
              <DataTable columns={solCols} data={solFlat} pageSize={10} emptyMsg="Sin solicitudes" />
            </div>
          )}

          {/* Pines disponibles table */}
          <div>
            <div style={{ color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 10 }}>PINES DISPONIBLES ({pines.length})</div>
            <DataTable columns={pinesCols} data={pinesFlat} pageSize={25} emptyMsg="Sin pines disponibles" exportCsv />
          </div>
        </div>
      )}
    </div>
  );
}

// ── SOLICITUDES DE DISTRIBUIDORES SECTION ─────────────────────────────────
function DistSolicitudesSection({ solDist, pendDist, loadingDist, actioning, msgDist, errDist, onAprobar, onRechazar, onRefresh }) {
  const [motivoMap, setMotivoMap] = useState({});   // id -> string
  const [confirmReject, setConfirmReject] = useState(null); // id o null
  const ESTADO_COLOR_D = { PENDIENTE: '#f59e0b', APROBADA: '#8dc63f', RECHAZADA: '#f87171', CANCELADA: '#6b7a8d' };

  if (loadingDist) return <div style={{ textAlign: 'center', padding: 40, color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>Cargando solicitudes...</div>;

  return (
    <div>
      {/* Header + refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: '0.08em' }}>SOLICITUDES DE MIS DISTRIBUIDORES</div>
          <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, marginTop: 3 }}>
            {pendDist.length} pendiente{pendDist.length !== 1 ? 's' : ''} · {solDist.length} total
          </div>
        </div>
        <button onClick={onRefresh} style={{ background: 'transparent', border: '1px solid #2a3550', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, padding: '7px 14px', borderRadius: 6, cursor: 'pointer' }}>
          ↻ ACTUALIZAR
        </button>
      </div>

      {msgDist && <div style={{ background: '#0f2818', border: '1px solid #8dc63f40', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{msgDist}</div>}
      {errDist && <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '10px 14px', marginBottom: 14, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>{errDist}</div>}

      {solDist.length === 0 ? (
        <div style={{ ...CARD, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
          <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>Ningún distribuidor ha solicitado pines aún</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {solDist.map(sol => {
            const dist = sol.distribuidor || {};
            const nombre = dist.nombre_completo || dist.nombre || dist.email || sol.distribuidor_id?.slice(0, 8) + '...';
            const paquete = sol.paquete_id ? (PINES_PAQUETES_NOMBRES[sol.paquete_id] || sol.paquete_id) : 'Personalizado';
            const total = Number(sol.valor_total || 0) || (Number(sol.cantidad || 0) * Number(sol.valor_unitario || 0));
            const isPending = sol.estado === 'PENDIENTE';
            const isActioning = actioning === sol.id;
            const isRejecting = confirmReject === sol.id;

            return (
              <div key={sol.id} style={{ ...CARD, border: `1px solid ${isPending ? '#f59e0b30' : '#1e2535'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  {/* Info distribuidor */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e2535', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700 }}>
                        {nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600 }}>{nombre}</div>
                        <div style={{ color: '#6b7a8d', fontFamily: 'Roboto Mono, monospace', fontSize: 10 }}>{dist.email || '—'}</div>
                      </div>
                    </div>
                  </div>
                  {/* Estado badge */}
                  <Badge color={ESTADO_COLOR_D[sol.estado] || '#6b7a8d'}>{sol.estado || 'PENDIENTE'}</Badge>
                </div>

                {/* Detalles del paquete */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10, marginBottom: 12 }}>
                  {[
                    { label: 'PAQUETE', val: paquete, color: '#a78bfa' },
                    { label: 'CANTIDAD', val: `${Number(sol.cantidad || 0)} pines`, color: '#c0cad8' },
                    { label: 'VALOR UNIT.', val: `${Number(sol.valor_unitario || 0).toLocaleString('es-CO')} cr`, color: '#8dc63f' },
                    { label: 'TOTAL', val: `${total.toLocaleString('es-CO')} cr`, color: '#f59e0b' },
                  ].map(d => (
                    <div key={d.label} style={{ background: '#0a0e1a', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9, letterSpacing: '0.08em', marginBottom: 3 }}>{d.label}</div>
                      <div style={{ color: d.color, fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700 }}>{d.val}</div>
                    </div>
                  ))}
                </div>

                {/* Notas del distribuidor */}
                {sol.notas && (
                  <div style={{ background: '#0a0e1a', borderRadius: 6, padding: '8px 12px', marginBottom: 12, borderLeft: '2px solid #f59e0b50' }}>
                    <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginBottom: 2 }}>NOTA DEL DISTRIBUIDOR</div>
                    <div style={{ color: '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>{sol.notas}</div>
                  </div>
                )}

                {/* Fecha */}
                <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginBottom: isPending ? 14 : 0 }}>
                  Solicitado: {sol.created_at ? new Date(sol.created_at).toLocaleString('es-CO') : '—'}
                  {sol.revisado_en && <span> · Revisado: {new Date(sol.revisado_en).toLocaleString('es-CO')}</span>}
                </div>

                {/* Nota del promotor si fue rechazada */}
                {sol.notas_promotor && !isPending && (
                  <div style={{ background: '#1a0a0a', borderRadius: 6, padding: '8px 12px', marginTop: 10, borderLeft: '2px solid #f8717150' }}>
                    <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginBottom: 2 }}>MOTIVO</div>
                    <div style={{ color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>{sol.notas_promotor}</div>
                  </div>
                )}

                {/* Acciones (solo si PENDIENTE) */}
                {isPending && (
                  <div>
                    {isRejecting ? (
                      <div style={{ background: '#1a0a0a', border: '1px solid #f8717130', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ color: '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.08em', marginBottom: 10 }}>MOTIVO DEL RECHAZO (opcional)</div>
                        <textarea
                          rows={2}
                          value={motivoMap[sol.id] || ''}
                          onChange={e => setMotivoMap(m => ({ ...m, [sol.id]: e.target.value }))}
                          placeholder="Ej: No tienes suficiente stock, contacta tu promotor..."
                          style={{ ...INPUT, width: '100%', resize: 'vertical', marginBottom: 10 }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button disabled={isActioning} onClick={() => { onRechazar(sol.id, motivoMap[sol.id] || ''); setConfirmReject(null); }}
                            style={{ background: isActioning ? '#1e2535' : '#f87171', color: isActioning ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 6, border: 'none', cursor: isActioning ? 'not-allowed' : 'pointer' }}>
                            {isActioning ? 'RECHAZANDO...' : 'CONFIRMAR RECHAZO'}
                          </button>
                          <button onClick={() => setConfirmReject(null)}
                            style={{ background: 'transparent', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 12, padding: '8px 14px', borderRadius: 6, border: '1px solid #2a3550', cursor: 'pointer' }}>
                            CANCELAR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          disabled={isActioning}
                          onClick={() => onAprobar(sol.id)}
                          style={{ background: isActioning ? '#1e2535' : '#8dc63f', color: isActioning ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '9px 20px', borderRadius: 6, border: 'none', cursor: isActioning ? 'not-allowed' : 'pointer', flex: 1, minWidth: 120 }}>
                          {isActioning ? '...' : '✓ APROBAR Y ASIGNAR'}
                        </button>
                        <button
                          disabled={isActioning}
                          onClick={() => setConfirmReject(sol.id)}
                          style={{ background: 'transparent', color: '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, padding: '9px 20px', borderRadius: 6, border: '1px solid #f8717140', cursor: isActioning ? 'not-allowed' : 'pointer', flex: 1, minWidth: 100 }}>
                          ✕ RECHAZAR
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD PROMOTOR ────────────────────────────────────────────────────
function DashboardTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/promotor/dashboard').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif' }}>Cargando dashboard...</div>;
  if (!data) return <div style={{ ...CARD, textAlign: 'center', padding: 40 }}><div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>Sin datos disponibles.</div></div>;

  // El backend devuelve { resumen:{...}, eventos_activos:[...], distribuidores:[...], top_usuarios:[...] }
  const resumen = data.resumen || data;
  const recHoy = resumen.recargas_hoy != null ? Number(resumen.recargas_hoy) : null;
  const recSem = resumen.recargas_semana != null ? Number(resumen.recargas_semana) : null;
  const crHoy  = resumen.creditos_recargados_hoy != null ? Number(resumen.creditos_recargados_hoy) : null;
  const crSem  = resumen.creditos_recargados_semana != null ? Number(resumen.creditos_recargados_semana) : null;

  const resumenCards = [
    { label: 'EVENTOS ACTIVOS',  val: resumen.eventos_activos ?? data.eventos_activos?.length ?? 0,   color: '#8dc63f', icon: '📋' },
    { label: 'RECARGAS HOY',     val: recHoy != null ? `${recHoy} txn` : '—',
      sub: crHoy != null ? `${crHoy.toLocaleString('es-CO')} cr ≈ $${crHoy.toLocaleString('es-CO')} USD` : '', color: '#00d4ff', icon: '💳' },
    { label: 'RECARGAS SEMANA',  val: recSem != null ? `${recSem} txn` : '—',
      sub: crSem != null ? `${crSem.toLocaleString('es-CO')} cr` : '',                                  color: '#a78bfa', icon: '📈' },
    { label: 'DISTRIBUIDORES',   val: resumen.distribuidores_activos ?? (Array.isArray(data.distribuidores) ? data.distribuidores.length : '—'), color: '#f59e0b', icon: '👥' },
  ];

  // Eventos activos como tabla — ev.apuestas y ev.recargas son objetos {total,monto}
  const eventosActivos = Array.isArray(data.eventos_activos) ? data.eventos_activos : [];
  const eventosFlat = eventosActivos.map(ev => ({
    _nombre:   ev.nombre || '—',
    _gurus:    ev.gurus_vendidos ?? ev.participantes_unicos ?? '—',
    _apuestas: typeof ev.apuestas === 'object' ? (ev.apuestas?.total ?? 0) : (ev.apuestas ?? '—'),
    _recargas: typeof ev.recargas === 'object' ? (ev.recargas?.total ?? 0) : (ev.recargas ?? '—'),
    _pozo_cr:  Number(ev.pozo_actual ?? ev.acumulado_actual ?? 0),
    _id:       ev.id,
  }));

  const eventosCols = [
    { key: '_nombre',   label: 'EVENTO',    sortable: true },
    { key: '_gurus',    label: 'GURÚS',     sortable: true },
    { key: '_apuestas', label: 'APUESTAS',  sortable: true },
    { key: '_recargas', label: 'RECARGAS',  sortable: true },
    {
      key: '_pozo_cr', label: 'POZO (CR)', sortable: true,
      render: (val) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', color: '#f59e0b', fontWeight: 700 }}>{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontSize: 9, color: '#4a5568' }}>≈ ${Number(val).toLocaleString('es-CO')} USD</div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {resumenCards.map(c => (
          <div key={c.label} style={CARD}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ color: c.color, fontFamily: 'Oswald, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 2 }}>{c.val}</div>
            {c.sub && <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9, marginBottom: 4 }}>{c.sub}</div>}
            <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.08em' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {eventosFlat.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 12 }}>EVENTOS ACTIVOS — MÉTRICAS</div>
          <DataTable columns={eventosCols} data={eventosFlat} pageSize={10} emptyMsg="Sin eventos activos" />
        </div>
      )}

      {data.top_usuarios?.length > 0 && (
        <div>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 12 }}>TOP USUARIOS — ACIERTOS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.top_usuarios.map((u, i) => {
              // El backend devuelve { posicion, usuario:{id,nombre,email}, evento, aciertos, estado }
              const usr    = u.usuario || u;
              const nombre = usr.nombre_completo || usr.nombre || usr.email || '—';
              const email  = usr.email || u.email || '';
              const hits   = u.aciertos ?? u.predicciones ?? u.puntaje ?? '—';
              const evento = typeof u.evento === 'string' ? u.evento : u.evento?.nombre ?? '';
              return (
                <div key={usr.id || u.id || i} style={{ ...CARD, padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ color: ['#f59e0b', '#c0cad8', '#f97316'][i] || '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 900, minWidth: 24 }}>#{i + 1}</div>
                    <div>
                      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#fff' }}>{nombre}</div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d' }}>{email}{evento ? ` · ${evento}` : ''}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#8dc63f' }}>{hits}/10</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568' }}>aciertos</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── GANADORES TAB ─────────────────────────────────────────────────────────
function GanadoresTab() {
  const [ganadores, setGanadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/promotor/ganadores').then(r => setGanadores(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif' }}>Cargando ganadores...</div>;

  const flat = ganadores.map(g => ({
    ...g,
    _usuario: g.usuario?.nombre_completo || g.usuario?.email || '—',
    _email: g.usuario?.email || '—',
    _evento: g.evento?.nombre || '—',
    _posicion: g.posicion ?? '—',
    _premio_cr: Number(g.monto_ganado || g.premio || 0),
  }));

  const columns = [
    { key: '_usuario', label: 'USUARIO', sortable: true },
    { key: '_email', label: 'EMAIL', sortable: true },
    { key: '_evento', label: 'EVENTO', sortable: true },
    { key: '_posicion', label: 'POSICIÓN', sortable: true },
    {
      key: '_premio_cr', label: 'PREMIO (CR)', sortable: true,
      render: (val) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', color: '#f59e0b', fontWeight: 700 }}>{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontSize: 9, color: '#4a5568' }}>≈ ${Number(val).toLocaleString('es-CO')} USD</div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 14 }}>GANADORES DE MIS EVENTOS</div>
      <DataTable columns={columns} data={flat} pageSize={10} emptyMsg="Sin ganadores registrados aún" exportCsv />
    </div>
  );
}

// ── RECARGAS PROMOTOR ─────────────────────────────────────────────────────
function RecargasPromotorTab() {
  const [resumen, setResumen] = useState(null);
  const [recargas, setRecargas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/recargas/mi-promotor/resumen'),
      api.get('/recargas/mi-promotor'),
    ]).then(([r, l]) => {
      if (r.status === 'fulfilled') setResumen(r.value.data);
      if (l.status === 'fulfilled') setRecargas(Array.isArray(l.value.data) ? l.value.data : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif' }}>Cargando recargas...</div>;

  const flat = recargas.map(r => ({
    ...r,
    _usuario: r.usuario?.nombre_completo || r.usuario?.email || '—',
    _email: r.usuario?.email || '—',
    _evento: r.evento?.nombre || '—',
    _creditos: Number(r.creditos || r.monto || 0),
    _vidas: creditosAVidas(Number(r.creditos || r.monto || 0)),
    _fecha: r.creado_en ? new Date(r.creado_en).toLocaleString('es-CO') : '—',
  }));

  const columns = [
    { key: '_usuario', label: 'USUARIO', sortable: true },
    { key: '_evento', label: 'EVENTO', sortable: true },
    {
      key: '_creditos', label: 'CRÉDITOS', sortable: true,
      render: (val, row) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', color: '#8dc63f', fontWeight: 700 }}>+{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontSize: 9, color: '#4a5568' }}>{row._vidas} vidas</div>
        </div>
      ),
    },
    { key: '_fecha', label: 'FECHA', sortable: true },
  ];

  return (
    <div>
      {resumen && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
          {[
            // Soporta tanto { total_recargas, monto_total } como { total, monto }
            { label: 'TOTAL RECARGAS', val: resumen.total_recargas ?? resumen.total ?? '—', color: '#00d4ff' },
            { label: 'MONTO TOTAL (CR)', val: (() => { const v = resumen.monto_total ?? resumen.monto ?? resumen.creditos; return v != null ? `${Number(v).toLocaleString('es-CO')} cr` : '—'; })(), sub: (() => { const v = resumen.monto_total ?? resumen.monto ?? resumen.creditos; return v != null ? `≈ $${Number(v).toLocaleString('es-CO')} USD` : ''; })(), color: '#8dc63f' },
            { label: 'COMISIONES (CR)', val: (() => { const v = resumen.comisiones ?? resumen.comision_total ?? resumen.comision; return v != null ? `${Number(v).toLocaleString('es-CO')} cr` : '—'; })(), color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={CARD}>
              <div style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{s.val}</div>
              {s.sub && <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 9, marginBottom: 2 }}>{s.sub}</div>}
              <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <DataTable columns={columns} data={flat} pageSize={25} emptyMsg="Sin recargas registradas" exportCsv />
    </div>
  );
}

// ── EVENTOS TAB ───────────────────────────────────────────────────────────
function EventosTab({ eventos }) {
  const flat = eventos.map(ev => ({
    ...ev,
    _nombre: ev.nombre || '—',
    _pozo_cr: Number(ev.acumulado_actual || 0),
    _casa: `${ev.porcentaje_casa ?? 0}%`,
    _pozo_pct: `${ev.porcentaje_pozo ?? 0}%`,
    _estado: ev.estado || 'ACTIVO',
    _costo_vidas: ev.costo_vidas ?? '—',
  }));

  const ESTADO_COLOR = { ACTIVO: '#8dc63f', CERRADO: '#f59e0b', LIQUIDADO: '#a78bfa', CANCELADO: '#f87171' };

  const columns = [
    { key: '_nombre', label: 'EVENTO', sortable: true },
    {
      key: '_pozo_cr', label: 'POZO (CR)', sortable: true,
      render: (val) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', color: '#f59e0b', fontWeight: 700 }}>{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontSize: 9, color: '#4a5568' }}>≈ ${Number(val).toLocaleString('es-CO')} USD</div>
        </div>
      ),
    },
    { key: '_casa', label: 'CASA %' },
    { key: '_pozo_pct', label: 'POZO %' },
    { key: '_costo_vidas', label: 'COSTO VIDAS' },
    {
      key: '_estado', label: 'ESTADO', sortable: true, filterable: true,
      filterOptions: ['ACTIVO', 'CERRADO', 'LIQUIDADO', 'CANCELADO'],
      render: (val) => <Badge color={ESTADO_COLOR[val] || '#6b7a8d'}>{val}</Badge>,
    },
    {
      key: '_ver', label: '', noSearch: true,
      render: (_, row) => <a href={`/eventos/${row.id}`} style={{ background: '#1e2535', color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, textDecoration: 'none', border: '1px solid #00d4ff20' }}>VER</a>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em' }}>MIS EVENTOS</div>
        <a href="/promotor/crear-evento" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 18px', borderRadius: 6, textDecoration: 'none' }}>+ CREAR EVENTO</a>
      </div>
      <DataTable columns={columns} data={flat} pageSize={10} emptyMsg="No hay eventos. ¡Crea el primero!" exportCsv />
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function PanelPromotor() {
  const [tab, setTab] = useState('dashboard');
  const [perfil, setPerfil] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loadingPerfil, setLoadingPerfil] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) { window.location.href = '/login'; return; }
    Promise.allSettled([
      api.get('/auth/me'),
      api.get('/eventos?limit=50'),
    ]).then(([p, e]) => {
      if (p.status === 'fulfilled') setPerfil(p.value.data);
      if (e.status === 'fulfilled') setEventos(Array.isArray(e.value.data) ? e.value.data : []);
    }).finally(() => setLoadingPerfil(false));
  }, []);

  if (loadingPerfil) return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 18 }}>Cargando panel...</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.12em', marginBottom: 4 }}>PANEL ADMINISTRATIVO</div>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, color: '#fff', margin: 0 }}>
              {perfil?.nombre || 'Panel Promotor'}
            </h1>
            <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12, marginTop: 3 }}>{perfil?.email}</div>
          </div>
          <a href="/promotor/crear-evento" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.05em' }}>
            + CREAR EVENTO
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'EVENTOS', val: eventos.length, color: '#8dc63f' },
            { label: 'ACTIVOS', val: eventos.filter(e => e.estado === 'ACTIVO').length, color: '#00d4ff' },
            { label: 'CERRADOS', val: eventos.filter(e => e.cerrado).length, color: '#f87171' },
            { label: 'ROL', val: perfil?.rol || 'PROMOTOR', color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '16px' }}>
              <div style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{s.val}</div>
              <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <TabBtn active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>DASHBOARD</TabBtn>
          <TabBtn active={tab === 'distribuidores'} onClick={() => setTab('distribuidores')}>DISTRIBUIDORES</TabBtn>
          <TabBtn active={tab === 'pines'} onClick={() => setTab('pines')}>PINES</TabBtn>
          <TabBtn active={tab === 'eventos'} onClick={() => setTab('eventos')}>MIS EVENTOS</TabBtn>
          <TabBtn active={tab === 'ganadores'} onClick={() => setTab('ganadores')}>GANADORES</TabBtn>
          <TabBtn active={tab === 'recargas'} onClick={() => setTab('recargas')}>RECARGAS</TabBtn>
          <TabBtn active={tab === 'partidos'} onClick={() => setTab('partidos')}>⚽ RESULTADOS</TabBtn>
        </div>

        {/* Tab content */}
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'distribuidores' && <DistribuidoresTab />}
        {tab === 'pines' && <PinesTab />}
        {tab === 'ganadores' && <GanadoresTab />}
        {tab === 'recargas' && <RecargasPromotorTab />}
        {tab === 'eventos' && <EventosTab eventos={eventos} />}
        {tab === 'partidos' && <PartidosResultadosTab isAdmin={false} />}
      </div>
    </div>
  );
}
