import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import api, { UPLOADS_BASE } from '../services/api';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import PartidosResultadosTab from '../components/PartidosResultadosTab';
import { formatCreditos, creditosAVidas } from '../utils/currency';

const CARD = { background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '20px 24px' };

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#8dc63f' : '#1e2535', color: active ? '#0a0d14' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}

function Badge({ color, children }) {
  return <span style={{ background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{children}</span>;
}

function MsgBanner({ msg, onClear }) {
  if (!msg) return null;
  const ok = msg.startsWith('✓');
  return (
    <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 14, background: ok ? '#0f2818' : '#1a0a0a', border: `1px solid ${ok ? '#8dc63f40' : '#f8717140'}`, color: ok ? '#8dc63f' : '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {msg}
      {onClear && <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>✕</button>}
    </div>
  );
}

// ─── OVERVIEW ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [finanzas, setFinanzas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/dashboard'),
      api.get('/admin/finanzas/resumen'),
    ]).then(([s, f]) => {
      if (s.status === 'fulfilled') setStats(s.value.data);
      if (f.status === 'fulfilled') setFinanzas(f.value.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 14, padding: 40, textAlign: 'center' }}>Cargando estadísticas...</div>;

  const ingresos = stats?.ingresos ?? finanzas?.totalDineroMovido;
  const cards = [
    { label: 'USUARIOS TOTALES', val: stats?.usuarios ?? finanzas?.totalUsuarios ?? '—', color: '#00d4ff', icon: '👥' },
    { label: 'EVENTOS', val: stats?.eventos ?? '—', color: '#8dc63f', icon: '📋' },
    { label: 'PREDICCIONES', val: stats?.predicciones ?? finanzas?.totalPredicciones ?? '—', color: '#a78bfa', icon: '⚽' },
    { label: 'INGRESOS (CRÉDITOS)', val: ingresos != null ? `${Number(ingresos).toLocaleString('es-CO')} cr` : '—', sub: ingresos != null ? `≈ $${Number(ingresos).toLocaleString('es-CO')} USD` : '', color: '#f59e0b', icon: '💰' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} style={CARD}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ color: c.color, fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 2 }}>{c.val}</div>
            {c.sub && <div style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 10, marginBottom: 4 }}>{c.sub}</div>}
            <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.08em' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#0a0e1a', border: '1px solid #1e2a3a', borderRadius: 8, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 10 }}>SISTEMA DE CRÉDITOS</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c0cad8', lineHeight: 1.8 }}>
          <strong style={{ color: '#8dc63f' }}>1 crédito = 1 USD.</strong> Las vidas del jugador reflejan siempre el mismo valor que sus créditos.
          La conversión a moneda local se muestra automáticamente según el país del usuario.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={CARD}>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 12 }}>SISTEMA</div>
          {[
            { label: 'Base de datos', val: '● Online', color: '#8dc63f' },
            { label: 'API', val: '● Activa', color: '#8dc63f' },
            { label: 'Temporada', val: 'S06 · Mundial 2026', color: '#f59e0b' },
            { label: 'Moneda base', val: 'USD (créditos)', color: '#00d4ff' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>{s.label}</span>
              <span style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700 }}>{s.val}</span>
            </div>
          ))}
        </div>
        <div style={CARD}>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.1em', marginBottom: 12 }}>EQUIVALENCIA DE CRÉDITOS</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', lineHeight: 2 }}>
            {[
              ['1 cr', '$1 USD', '$4,200 COP'],
              ['5 cr', '$5 USD', '$21,000 COP'],
              ['10 cr', '$10 USD', '$42,000 COP'],
              ['50 cr', '$50 USD', '$210,000 COP'],
            ].map(([cr, usd, cop]) => (
              <div key={cr} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontWeight: 700 }}>{cr}</span>
                <span>{usd}</span>
                <span style={{ color: '#4a5568' }}>{cop}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── USUARIOS ──────────────────────────────────────────────────────────────
function UsuariosTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  const cargar = useCallback(() => {
    setLoading(true);
    api.get('/admin/usuarios').then(r => setUsers(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleUser = async (id, activo) => {
    setActioning(id);
    try {
      await api.patch(`/admin/usuarios/${id}/${activo ? 'bloquear' : 'activar'}`);
      cargar();
    } finally { setActioning(null); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif' }}>Cargando usuarios...</div>;

  const flat = users.map(u => ({
    ...u,
    _nombre: u.nombre_completo || u.nombre || 'Sin nombre',
    _email: u.email || '—',
    _rol: u.rol || 'USUARIO',
    _creditos: Number(u.creditos ?? u.saldo ?? 0),
    _vidas: creditosAVidas(Number(u.creditos ?? u.saldo ?? 0)),
    _moneda: u.moneda || 'USD',
    _estado: u.activo !== false ? 'ACTIVO' : 'BLOQUEADO',
    _pais: u.pais_codigo || '—',
    _fecha: u.creado_en ? new Date(u.creado_en).toLocaleDateString('es-CO') : '—',
  }));

  const columns = [
    { key: '_nombre', label: 'NOMBRE', sortable: true },
    { key: '_email', label: 'EMAIL', sortable: true },
    { key: '_rol', label: 'ROL', sortable: true, filterable: true, filterOptions: ['USUARIO', 'PROMOTOR', 'DISTRIBUIDOR', 'ADMIN'] },
    {
      key: '_creditos', label: 'CRÉDITOS / VIDAS', sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#8dc63f', fontWeight: 700 }}>{Number(val).toLocaleString('es-CO')} cr</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568' }}>{creditosAVidas(val)} vidas · {formatCreditos(val, row._moneda)}</div>
        </div>
      ),
    },
    { key: '_pais', label: 'PAÍS', sortable: true },
    {
      key: '_estado', label: 'ESTADO', sortable: true, filterable: true,
      filterOptions: [{ value: 'ACTIVO', label: 'Activo' }, { value: 'BLOQUEADO', label: 'Bloqueado' }],
      render: (val) => <Badge color={val === 'ACTIVO' ? '#8dc63f' : '#f87171'}>{val}</Badge>,
    },
    {
      key: '_acciones', label: 'ACCIONES', noSearch: true,
      render: (_, row) => (
        <button
          onClick={() => toggleUser(row.id, row.activo)}
          disabled={actioning === row.id}
          style={{ background: row.activo !== false ? '#1a0a0a' : '#0f2818', color: row.activo !== false ? '#f87171' : '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 4, border: `1px solid ${row.activo !== false ? '#f8717130' : '#8dc63f30'}`, cursor: 'pointer' }}>
          {actioning === row.id ? '...' : row.activo !== false ? 'BLOQUEAR' : 'ACTIVAR'}
        </button>
      ),
    },
  ];

  return <DataTable columns={columns} data={flat} pageSize={25} emptyMsg="No hay usuarios registrados" exportCsv />;
}

// ─── RETIROS ───────────────────────────────────────────────────────────────
function RetirosTab() {
  const [retiros, setRetiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [msg, setMsg] = useState('');

  const cargar = useCallback(() => {
    setLoading(true);
    api.get('/retiros').then(r => setRetiros(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const accion = async (id, acc, body = {}) => {
    setActioning(id + acc);
    try {
      await api.patch(`/retiros/${id}/${acc}`, body);
      setMsg(`✓ Retiro ${acc} correctamente`);
      cargar();
    } catch (ex) {
      setMsg(`✗ Error: ${ex.response?.data?.message || 'Error al procesar'}`);
    } finally { setActioning(null); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif' }}>Cargando retiros...</div>;

  const ESTADO_COLOR = { PENDIENTE: '#f59e0b', EN_REVISION: '#00d4ff', APROBADO: '#8dc63f', PAGADO: '#a78bfa', RECHAZADO: '#f87171' };

  const flat = retiros.map(r => ({
    ...r,
    _usuario: r.usuario?.nombre_completo || r.usuario?.nombre || r.usuario?.email || '—',
    _email: r.usuario?.email || '—',
    _monto_cr: Number(r.monto || 0),
    _moneda: r.usuario?.moneda || 'USD',
    _estado: r.estado || 'PENDIENTE',
    _metodo: r.metodo_pago || '—',
    _fecha: r.creado_en ? new Date(r.creado_en).toLocaleString('es-CO') : '—',
    _datos: r.datos_pago ? (typeof r.datos_pago === 'string' ? r.datos_pago : JSON.stringify(r.datos_pago)) : '',
  }));

  const columns = [
    { key: '_usuario', label: 'USUARIO', sortable: true },
    { key: '_email', label: 'EMAIL', sortable: true },
    {
      key: '_monto_cr', label: 'MONTO', sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, color: '#f59e0b', fontWeight: 700 }}>{Number(val).toLocaleString('es-CO')} cr</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568' }}>≈ ${Number(val).toLocaleString('es-CO')} USD</div>
        </div>
      ),
    },
    { key: '_metodo', label: 'MÉTODO', sortable: true },
    {
      key: '_estado', label: 'ESTADO', sortable: true, filterable: true,
      filterOptions: ['PENDIENTE', 'EN_REVISION', 'APROBADO', 'PAGADO', 'RECHAZADO'],
      render: (val) => <Badge color={ESTADO_COLOR[val] || '#6b7a8d'}>{val}</Badge>,
    },
    { key: '_fecha', label: 'FECHA', sortable: true },
    {
      key: '_acciones', label: 'ACCIONES', noSearch: true,
      render: (_, row) => {
        const btnS = (bg, fg) => ({ background: bg, color: fg, fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, border: `1px solid ${fg}30`, cursor: 'pointer', marginRight: 4 });
        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {row.estado === 'PENDIENTE' && (
              <>
                <button onClick={() => accion(row.id, 'revisar')} disabled={!!actioning} style={btnS('#1e2535', '#00d4ff')}>REVISAR</button>
                <button onClick={() => accion(row.id, 'aprobar')} disabled={!!actioning} style={btnS('#0f2818', '#8dc63f')}>APROBAR</button>
                <button onClick={() => accion(row.id, 'rechazar', { motivo: 'Revisado por administrador' })} disabled={!!actioning} style={btnS('#1a0a0a', '#f87171')}>RECHAZAR</button>
              </>
            )}
            {row.estado === 'EN_REVISION' && (
              <>
                <button onClick={() => accion(row.id, 'aprobar')} disabled={!!actioning} style={btnS('#0f2818', '#8dc63f')}>APROBAR</button>
                <button onClick={() => accion(row.id, 'rechazar', { motivo: 'Revisado por administrador' })} disabled={!!actioning} style={btnS('#1a0a0a', '#f87171')}>RECHAZAR</button>
              </>
            )}
            {row.estado === 'APROBADO' && (
              <button onClick={() => accion(row.id, 'pagar')} disabled={!!actioning} style={btnS('#1e1535', '#a78bfa')}>PAGADO</button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <MsgBanner msg={msg} onClear={() => setMsg('')} />
      <DataTable columns={columns} data={flat} pageSize={10} emptyMsg="No hay solicitudes de retiro" exportCsv />
    </div>
  );
}

// ─── PINES ADMIN ───────────────────────────────────────────────────────────
function PinesAdminTab() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [msg, setMsg] = useState('');

  const cargar = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      api.get('/pines/admin/solicitudes'),
      api.get('/pines/admin/reporte-global'),
    ]).then(([s, r]) => {
      if (s.status === 'fulfilled') setSolicitudes(Array.isArray(s.value.data) ? s.value.data : []);
      if (r.status === 'fulfilled') setReporte(r.value.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const aprobar = async (id) => {
    setActioning(id);
    try {
      await api.post(`/pines/admin/aprobar/${id}`, { dias_vigencia: 365 });
      setMsg('✓ Solicitud aprobada y pines generados');
      cargar();
    } catch (ex) { setMsg(`✗ ${ex.response?.data?.message || 'Error'}`); }
    finally { setActioning(null); }
  };

  const rechazar = async (id) => {
    setActioning(id);
    try {
      await api.post(`/pines/admin/rechazar/${id}`, { motivo: 'Rechazado por administrador' });
      setMsg('✓ Solicitud rechazada');
      cargar();
    } catch (ex) { setMsg(`✗ ${ex.response?.data?.message || 'Error'}`); }
    finally { setActioning(null); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif' }}>Cargando solicitudes de pines...</div>;

  const ESTADO_COLOR = { PENDIENTE: '#f59e0b', APROBADA: '#8dc63f', RECHAZADA: '#f87171', PAGADA: '#00d4ff' };

  const flat = solicitudes.map(s => ({
    ...s,
    _promotor: s.promotor?.usuario?.email || s.promotor?.nombre || '—',
    _cantidad: s.cantidad || 0,
    _valor: Number(s.valor_unitario || 0),
    _total_cr: (s.cantidad || 0) * Number(s.valor_unitario || 0),
    _estado: s.estado || 'PENDIENTE',
    _notas: s.notas_promotor || '—',
    _fecha: s.creado_en ? new Date(s.creado_en).toLocaleDateString('es-CO') : '—',
  }));

  const columns = [
    { key: '_promotor', label: 'PROMOTOR', sortable: true },
    { key: '_cantidad', label: 'CANTIDAD', sortable: true },
    {
      key: '_valor', label: 'VALOR UNIT.', sortable: true,
      render: (val) => <span style={{ fontFamily: 'Oswald, sans-serif', color: '#8dc63f' }}>{Number(val).toLocaleString('es-CO')} cr</span>,
    },
    {
      key: '_total_cr', label: 'TOTAL', sortable: true,
      render: (val) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568' }}>≈ ${Number(val).toLocaleString('es-CO')} USD</div>
        </div>
      ),
    },
    {
      key: '_estado', label: 'ESTADO', sortable: true, filterable: true,
      filterOptions: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'PAGADA'],
      render: (val) => <Badge color={ESTADO_COLOR[val] || '#6b7a8d'}>{val}</Badge>,
    },
    { key: '_notas', label: 'NOTAS', sortable: false },
    { key: '_fecha', label: 'FECHA', sortable: true },
    {
      key: '_acciones', label: 'ACCIONES', noSearch: true,
      render: (_, row) => row.estado === 'PENDIENTE' ? (
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => aprobar(row.id)} disabled={actioning === row.id} style={{ background: '#0f2818', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, border: '1px solid #8dc63f30', cursor: 'pointer' }}>APROBAR</button>
          <button onClick={() => rechazar(row.id)} disabled={actioning === row.id} style={{ background: '#1a0a0a', color: '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, border: '1px solid #f8717130', cursor: 'pointer' }}>RECHAZAR</button>
        </div>
      ) : '—',
    },
  ];

  return (
    <div>
      {/* Reporte global */}
      {reporte && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'PINES TOTALES', val: reporte.total_pines ?? '—', color: '#8dc63f' },
            { label: 'DISPONIBLES', val: reporte.disponibles ?? '—', color: '#00d4ff' },
            { label: 'USADOS', val: reporte.usados ?? '—', color: '#a78bfa' },
            { label: 'DEUDA (CR)', val: reporte.deuda_total != null ? `${Number(reporte.deuda_total).toLocaleString('es-CO')} cr` : '—', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={CARD}>
              <div style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{s.val}</div>
              <div style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 10, letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <MsgBanner msg={msg} onClear={() => setMsg('')} />
      <DataTable columns={columns} data={flat} pageSize={10} emptyMsg="No hay solicitudes de pines" exportCsv />
    </div>
  );
}

// ─── EVENTOS ADMIN ─────────────────────────────────────────────────────────
function EventosAdminTab() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);
  const [msg, setMsg] = useState('');

  const cargar = useCallback(() => {
    setLoading(true);
    api.get('/eventos?limit=200').then(r => setEventos(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const liquidar = async (id) => {
    if (!window.confirm('¿Liquidar este evento? Esta acción es irreversible.')) return;
    setActioning(id);
    try {
      await api.post(`/eventos/${id}/liquidar`);
      setMsg('✓ Evento liquidado');
      cargar();
    } catch (ex) { setMsg(`✗ ${ex.response?.data?.message || 'Error al liquidar'}`); }
    finally { setActioning(null); }
  };

  const cerrar = async (id) => {
    setActioning(id + 'c');
    try {
      await api.post(`/eventos/${id}/cerrar-inscripciones`);
      setMsg('✓ Inscripciones cerradas');
      cargar();
    } catch (ex) { setMsg(`✗ ${ex.response?.data?.message || 'Error'}`); }
    finally { setActioning(null); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif' }}>Cargando eventos...</div>;

  const ESTADO_COLOR = { ACTIVO: '#8dc63f', CERRADO: '#f59e0b', LIQUIDADO: '#a78bfa', CANCELADO: '#f87171' };

  const flat = eventos.map(ev => ({
    ...ev,
    _nombre: ev.nombre || '—',
    _pozo_cr: Number(ev.acumulado_actual || 0),
    _casa: `${ev.porcentaje_casa ?? 0}%`,
    _pozo_pct: `${ev.porcentaje_pozo ?? 0}%`,
    _impuesto: `${ev.porcentaje_impuesto ?? 0}%`,
    _estado: ev.estado || 'ACTIVO',
    _costo_vidas: ev.costo_vidas ?? '—',
    _fecha: ev.fecha_inicio ? new Date(ev.fecha_inicio).toLocaleDateString('es-CO') : '—',
  }));

  const columns = [
    { key: '_nombre', label: 'EVENTO', sortable: true },
    {
      key: '_pozo_cr', label: 'POZO (CR)', sortable: true,
      render: (val) => (
        <div>
          <span style={{ fontFamily: 'Oswald, sans-serif', color: '#f59e0b', fontWeight: 700 }}>{Number(val).toLocaleString('es-CO')} cr</span>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9, color: '#4a5568' }}>≈ ${Number(val).toLocaleString('es-CO')} USD</div>
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
    { key: '_fecha', label: 'INICIO', sortable: true },
    {
      key: '_acciones', label: 'ACCIONES', noSearch: true,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <a href={`/eventos/${row.id}`} style={{ background: '#1e2535', color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, textDecoration: 'none', border: '1px solid #00d4ff20' }}>VER</a>
          {!row.cerrado && row._estado !== 'LIQUIDADO' && (
            <button onClick={() => cerrar(row.id)} disabled={!!actioning} style={{ background: '#1e2535', color: '#f59e0b', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, border: '1px solid #f59e0b30', cursor: 'pointer' }}>CERRAR</button>
          )}
          {row.cerrado && row._estado !== 'LIQUIDADO' && (
            <button onClick={() => liquidar(row.id)} disabled={!!actioning} style={{ background: '#1a0a0a', color: '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 4, border: '1px solid #f8717130', cursor: 'pointer' }}>LIQUIDAR</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <a href="/promotor/crear-evento" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '8px 18px', borderRadius: 6, textDecoration: 'none' }}>+ CREAR EVENTO</a>
      </div>
      <MsgBanner msg={msg} onClear={() => setMsg('')} />
      <DataTable columns={columns} data={flat} pageSize={10} emptyMsg="No hay eventos registrados" exportCsv />
    </div>
  );
}

// ─── FINANZAS ──────────────────────────────────────────────────────────────
function FinanzasTab() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/finanzas/movimientos').then(r => setMovimientos(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#8dc63f', fontFamily: 'Oswald, sans-serif' }}>Cargando movimientos financieros...</div>;

  const TIPO_COLOR = {
    COMPRA_GURU: '#8dc63f', APUESTA: '#00d4ff', APUESTA_GANADA: '#a78bfa', APUESTA_PERDIDA: '#f87171',
    RECARGA_PIN: '#f59e0b', RECARGA_DIGITAL: '#f59e0b', REFERIDO_GANADO: '#e879f9', BONUS: '#34d399',
    PREMIO: '#fbbf24', RETIRO: '#f87171',
  };

  const flat = movimientos.map(m => ({
    ...m,
    _tipo: m.tipo || 'Movimiento',
    _usuario: m.usuario?.email || m.usuario_id || '—',
    _monto_cr: Number(m.monto || 0),
    _evento: m.evento?.nombre || '—',
    _fecha: m.creado_en ? new Date(m.creado_en).toLocaleString('es-CO') : '—',
  }));

  const tiposUnicos = [...new Set(flat.map(f => f._tipo))].sort();

  const columns = [
    {
      key: '_tipo', label: 'TIPO', sortable: true, filterable: true,
      filterOptions: tiposUnicos.map(t => ({ value: t, label: t })),
      render: (val) => <Badge color={TIPO_COLOR[val] || '#6b7a8d'}>{val}</Badge>,
    },
    { key: '_usuario', label: 'USUARIO', sortable: true },
    {
      key: '_monto_cr', label: 'MONTO (CR)', sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: val >= 0 ? '#8dc63f' : '#f87171' }}>
          {val >= 0 ? '+' : ''}{Number(val).toLocaleString('es-CO')} cr
        </span>
      ),
    },
    { key: '_evento', label: 'EVENTO', sortable: true },
    { key: '_fecha', label: 'FECHA', sortable: true },
  ];

  return <DataTable columns={columns} data={flat} pageSize={25} emptyMsg="Sin movimientos financieros" exportCsv />;
}

// ─── MEDIA TAB ─────────────────────────────────────────────────────────────
const CATEGORIAS_MEDIA = [
  { id: 'carrusel',       label: '🖼 CARRUSEL',      desc: 'Fondos del hero animado en la landing' },
  { id: 'patrocinadores', label: '🏷 PATROCINADORES', desc: 'Logos de los patrocinadores' },
];

function fmtBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaTab() {
  const [catActiva, setCatActiva]   = useState('carrusel');
  const [archivos,  setArchivos]    = useState([]);
  const [cargando,  setCargando]    = useState(false);
  const [subiendo,  setSubiendo]    = useState(false);
  const [progreso,  setProgreso]    = useState(0);
  const [msg,       setMsg]         = useState(null); // { tipo: 'ok'|'err', texto }
  const [preview,   setPreview]     = useState(null); // { file, dataUrl }
  const [confirmar, setConfirmar]   = useState(null); // archivo a eliminar
  const fileRef = useRef();

  const cargar = async (cat = catActiva) => {
    setCargando(true);
    try {
      const { data } = await api.get(`/admin/media?categoria=${cat}`);
      setArchivos(data.archivos || []);
    } catch {
      setMsg({ tipo: 'err', texto: 'Error al cargar imágenes' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(catActiva); setPreview(null); setMsg(null); }, [catActiva]);

  /* ── Selección de archivo ── */
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) { setMsg({ tipo: 'err', texto: 'El archivo supera los 5 MB' }); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview({ file, dataUrl: ev.target.result });
    reader.readAsDataURL(file);
    setMsg(null);
  };

  const cancelarPreview = () => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; };

  /* ── Upload ── */
  const subir = async () => {
    if (!preview?.file) return;
    setSubiendo(true);
    setProgreso(0);
    const form = new FormData();
    form.append('file', preview.file);
    try {
      await api.post(`/admin/media/upload?categoria=${catActiva}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgreso(Math.round((e.loaded / e.total) * 100)),
      });
      setMsg({ tipo: 'ok', texto: '✓ Imagen subida correctamente' });
      cancelarPreview();
      await cargar();
    } catch (err) {
      setMsg({ tipo: 'err', texto: err.response?.data?.message || 'Error al subir la imagen' });
    } finally {
      setSubiendo(false);
      setProgreso(0);
    }
  };

  /* ── Eliminar (tras confirmar) ── */
  const eliminar = async () => {
    if (!confirmar) return;
    try {
      await api.delete(`/admin/media/${catActiva}/${confirmar.nombre}`);
      setMsg({ tipo: 'ok', texto: `✓ "${confirmar.nombre}" eliminada` });
      setConfirmar(null);
      await cargar();
    } catch (err) {
      setMsg({ tipo: 'err', texto: err.response?.data?.message || 'Error al eliminar' });
      setConfirmar(null);
    }
  };

  const catInfo = CATEGORIAS_MEDIA.find(c => c.id === catActiva);

  return (
    <div>
      {/* ── Sub-tabs de categoría ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {CATEGORIAS_MEDIA.map(c => (
          <button key={c.id} onClick={() => setCatActiva(c.id)} style={{
            background: catActiva === c.id ? '#a78bfa' : '#1e2535',
            color:      catActiva === c.id ? '#0a0d14'  : '#6b7a8d',
            fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700,
            padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer',
            letterSpacing: '0.06em', transition: 'all 0.15s',
          }}>{c.label}</button>
        ))}
      </div>

      {/* Descripción */}
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginBottom: 20 }}>
        {catInfo?.desc} · {archivos.length} imagen{archivos.length !== 1 ? 'es' : ''} cargada{archivos.length !== 1 ? 's' : ''}
      </p>

      {/* ── Mensaje de feedback ── */}
      {msg && (
        <div style={{
          padding: '10px 14px', borderRadius: 6, marginBottom: 16,
          background: msg.tipo === 'ok' ? '#0f2818' : '#1a0a0a',
          border: `1px solid ${msg.tipo === 'ok' ? '#8dc63f40' : '#f8717140'}`,
          color: msg.tipo === 'ok' ? '#8dc63f' : '#f87171',
          fontFamily: 'Roboto, sans-serif', fontSize: 13,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {msg.texto}
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* ── Zona de subida ── */}
      <div style={{ ...CARD, marginBottom: 20 }}>
        <div style={{ color: '#a78bfa', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 16 }}>
          SUBIR NUEVA IMAGEN
        </div>

        {!preview ? (
          /* Drop zone */
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#a78bfa'; }}
            onDragLeave={e => { e.currentTarget.style.borderColor = '#1e2a3a'; }}
            onDrop={e => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#1e2a3a';
              const file = e.dataTransfer.files?.[0];
              if (file) { const input = fileRef.current; if (input) { const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; onFileChange({ target: input }); } }
            }}
            style={{
              border: '2px dashed #1e2a3a', borderRadius: 10, padding: '36px 20px',
              textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🖼</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#c0cad8', marginBottom: 6 }}>
              Arrastra una imagen aquí o <span style={{ color: '#a78bfa' }}>haz clic para seleccionar</span>
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>
              JPG · PNG · GIF · WEBP · SVG · Máx. 5 MB
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
          </div>
        ) : (
          /* Preview de imagen seleccionada */
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img src={preview.dataUrl} alt="preview" style={{
              width: 160, height: 110, objectFit: 'cover', borderRadius: 8,
              border: '1px solid #a78bfa40', flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#c0cad8', marginBottom: 4, wordBreak: 'break-all' }}>
                {preview.file.name}
              </div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 16 }}>
                {fmtBytes(preview.file.size)} · {preview.file.type}
              </div>

              {/* Barra de progreso */}
              {subiendo && (
                <div style={{ background: '#0a0d14', borderRadius: 4, height: 6, marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#a78bfa', width: `${progreso}%`, transition: 'width 0.2s', borderRadius: 4 }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={subir} disabled={subiendo} style={{
                  background: subiendo ? '#1e2535' : '#a78bfa',
                  color: subiendo ? '#6b7a8d' : '#0a0d14',
                  fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
                  padding: '10px 22px', borderRadius: 6, border: 'none',
                  cursor: subiendo ? 'not-allowed' : 'pointer', letterSpacing: '0.06em',
                }}>
                  {subiendo ? `SUBIENDO ${progreso}%...` : '⬆ SUBIR IMAGEN'}
                </button>
                <button onClick={cancelarPreview} disabled={subiendo} style={{
                  background: 'transparent', color: '#6b7a8d',
                  fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700,
                  padding: '10px 16px', borderRadius: 6, border: '1px solid #1e2a3a',
                  cursor: 'pointer',
                }}>CANCELAR</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Grid de imágenes actuales ── */}
      <div style={CARD}>
        <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 16 }}>
          IMÁGENES ACTUALES
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
            Cargando imágenes...
          </div>
        ) : archivos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#4a5568' }}>
              Sin imágenes. Sube la primera usando el formulario de arriba.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {archivos.map(arch => (
              <div key={arch.nombre} style={{
                background: '#0a0d14', border: '1px solid #1e2a3a',
                borderRadius: 8, overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#a78bfa40'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2a3a'}>
                {/* Imagen */}
                <div style={{ height: 110, overflow: 'hidden', position: 'relative', background: '#0f1420' }}>
                  <img
                    src={`${UPLOADS_BASE}${arch.url}`}
                    alt={arch.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                {/* Info + botón */}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{
                    fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#c0cad8',
                    marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }} title={arch.nombre}>{arch.nombre}</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginBottom: 10 }}>
                    {fmtBytes(arch.tamano)}
                  </div>
                  <button onClick={() => setConfirmar(arch)} style={{
                    width: '100%', background: 'transparent',
                    color: '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 10,
                    fontWeight: 700, padding: '6px 0', borderRadius: 4,
                    border: '1px solid #f8717130', cursor: 'pointer',
                    letterSpacing: '0.06em', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8717115'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    🗑 ELIMINAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de confirmación de borrado ── */}
      {confirmar && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
        onClick={e => { if (e.target === e.currentTarget) setConfirmar(null); }}>
          <div style={{
            background: '#0d1520', border: '1px solid #f8717140',
            borderRadius: 14, padding: '28px 32px', maxWidth: 420, width: '100%',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(248,113,113,0.1)',
          }}>
            {/* Icono de advertencia */}
            <div style={{ fontSize: 40, marginBottom: 14 }}>⚠️</div>

            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 900, color: '#f87171', marginBottom: 10 }}>
              ¿ELIMINAR IMAGEN?
            </div>

            {/* Preview de la imagen a borrar */}
            <div style={{ margin: '14px auto', width: 160, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #1e2a3a' }}>
              <img
                src={`${UPLOADS_BASE}${confirmar.url}`}
                alt={confirmar.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>

            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#c0cad8', marginBottom: 4, wordBreak: 'break-all' }}>
              {confirmar.nombre}
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 24 }}>
              Esta acción no se puede deshacer.
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setConfirmar(null)} style={{
                background: '#1e2535', color: '#c0cad8',
                fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700,
                padding: '12px 28px', borderRadius: 8, border: '1px solid #1e2a3a',
                cursor: 'pointer', letterSpacing: '0.06em',
              }}>CANCELAR</button>
              <button onClick={eliminar} style={{
                background: 'linear-gradient(135deg,#f87171,#dc2626)',
                color: '#fff', fontFamily: 'Oswald, sans-serif',
                fontSize: 13, fontWeight: 700,
                padding: '12px 28px', borderRadius: 8, border: 'none',
                cursor: 'pointer', letterSpacing: '0.06em',
                boxShadow: '0 4px 16px rgba(248,113,113,0.3)',
              }}>
                🗑 SÍ, ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!authService.isAuthenticated()) { window.location.href = '/login'; return; }
    const payload = authService.getPayload();
    if (payload?.rol !== 'ADMIN' && payload?.rol !== 'SUPER_ADMIN') {
      window.location.href = '/dashboard';
    }
  }, []);

  const payload = authService.getPayload();

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ color: '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.12em', marginBottom: 4 }}>PANEL DE ADMINISTRACIÓN</div>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, color: '#fff', margin: 0 }}>
              Control Total — <span style={{ color: '#f87171' }}>ADMIN</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ background: '#1a0a0a', color: '#f87171', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 6, border: '1px solid #f8717130' }}>
              {payload?.email || 'Admin'}
            </span>
            <button onClick={() => authService.logout()} style={{ background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '7px 14px', borderRadius: 6, border: '1px solid #1e2a3a', cursor: 'pointer' }}>SALIR</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap', overflowX: 'auto', padding: '2px 0' }}>
          <TabBtn active={tab === 'overview'} onClick={() => setTab('overview')}>OVERVIEW</TabBtn>
          <TabBtn active={tab === 'usuarios'} onClick={() => setTab('usuarios')}>USUARIOS</TabBtn>
          <TabBtn active={tab === 'retiros'} onClick={() => setTab('retiros')}>RETIROS</TabBtn>
          <TabBtn active={tab === 'pines'} onClick={() => setTab('pines')}>PINES</TabBtn>
          <TabBtn active={tab === 'eventos'} onClick={() => setTab('eventos')}>EVENTOS</TabBtn>
          <TabBtn active={tab === 'finanzas'} onClick={() => setTab('finanzas')}>FINANZAS</TabBtn>
          <TabBtn active={tab === 'partidos'} onClick={() => setTab('partidos')}>⚽ RESULTADOS</TabBtn>
          <TabBtn active={tab === 'medios'}   onClick={() => setTab('medios')}>🖼 MEDIOS</TabBtn>
        </div>

        {tab === 'overview'  && <OverviewTab />}
        {tab === 'usuarios'  && <UsuariosTab />}
        {tab === 'retiros'   && <RetirosTab />}
        {tab === 'pines'     && <PinesAdminTab />}
        {tab === 'eventos'   && <EventosAdminTab />}
        {tab === 'finanzas'  && <FinanzasTab />}
        {tab === 'partidos'  && <PartidosResultadosTab isAdmin={true} />}
        {tab === 'medios'    && <MediaTab />}
      </div>
    </div>
  );
}
