import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ESTADO_BADGE = {
  PENDIENTE: { label: 'PENDIENTE', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  EN_REVISION: { label: 'EN REVISIÓN', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  APROBADO: { label: 'APROBADO', color: '#8dc63f', bg: 'rgba(141,198,63,0.12)' },
  RECHAZADO: { label: 'RECHAZADO', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  PAGADO: { label: 'PAGADO ✓', color: '#8dc63f', bg: 'rgba(141,198,63,0.15)' },
};

// ── Panel de requisitos ──────────────────────────────────────────────────────
function RequisitosPanel({ req, onSolicitar }) {
  if (!req) return null;

  const cumple = req.cumple_requisitos;

  const items = [
    {
      label: `${req.apuestas_requeridas ?? 3} apuestas realizadas`,
      ok: req.cumple_apuestas,
      detail: `${req.apuestas_realizadas ?? 0} / ${req.apuestas_requeridas ?? 3} apuestas`,
      color: '#a78bfa',
    },
    {
      label: `${req.predicciones_requeridas ?? 2} predicciones realizadas`,
      ok: req.cumple_predicciones,
      detail: `${req.predicciones_realizadas ?? 0} / ${req.predicciones_requeridas ?? 2} predicciones`,
      color: '#8dc63f',
    },
    {
      label: `Mínimo ${req.minimo_retiro ?? 150} créditos en wallet`,
      ok: req.cumple_minimo,
      detail: req.cumple_minimo
        ? `✓ Tienes ${Number(req.saldo_disponible ?? 0).toLocaleString('es-CO')} cr disponibles`
        : `Saldo: ${Number(req.saldo_disponible ?? 0).toLocaleString('es-CO')} cr — mínimo ${req.minimo_retiro ?? 150} cr`,
      color: '#f59e0b',
    },
  ];

  return (
    <div style={{ background: '#161e2e', border: `1px solid ${cumple ? '#8dc63f40' : '#1e2a3a'}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 28 }}>{cumple ? '✅' : '🔒'}</span>
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: cumple ? '#8dc63f' : '#f87171' }}>
            {cumple ? 'CUMPLES LOS REQUISITOS' : 'AÚN NO PUEDES RETIRAR'}
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginTop: 2 }}>
            {cumple
              ? 'Puedes solicitar tu retiro. Se aplicarán retenciones según la ley de tu país.'
              : req.razon_bloqueo || 'Debes cumplir los 3 requisitos para solicitar un retiro.'}
          </div>
        </div>
      </div>

      {/* Los 3 requisitos — AND logic */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.08em', marginBottom: 8 }}>
          REQUISITOS — todos deben cumplirse:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: '#0a0d14', borderRadius: 6, padding: '10px 14px',
              border: `1px solid ${item.ok ? item.color + '40' : '#1e2a3a'}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>{item.ok ? '✅' : '⭕'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: item.ok ? '#c0cad8' : '#6b7a8d' }}>{item.label}</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: item.ok ? item.color : '#4a5568', marginTop: 2 }}>{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link al historial */}
      <div style={{ marginBottom: 16 }}>
        <a href="/mis-aciertos" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#8dc63f',
          textDecoration: 'none',
        }}>
          📊 Ver mi historial de predicciones y apuestas →
        </a>
      </div>

      {/* Preview neto (sin mostrar tasas internas) */}
      {req.preview_fiscal && (
        <div style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#6b7a8d', letterSpacing: '0.08em', marginBottom: 10 }}>
            ESTIMADO SI RETIRAS TU SALDO ACTUAL
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
            <span style={{ color: '#c0cad8' }}>Créditos brutos</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{Number(req.preview_fiscal.monto_bruto ?? 0).toLocaleString('es-CO')} cr</span>
          </div>
          <div style={{ height: 1, background: '#1e2a3a', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700 }}>
            <span style={{ color: '#8dc63f' }}>RECIBIRÍAS</span>
            <span style={{ color: '#8dc63f' }}>{Number(req.preview_fiscal.monto_neto ?? 0).toFixed(2)} cr</span>
          </div>
          {req.preview_fiscal.pais_label && (
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 6 }}>
              Incluye retenciones fiscales aplicables en {req.preview_fiscal.pais_label}.
            </div>
          )}
        </div>
      )}

      {cumple && (
        <button onClick={onSolicitar} style={{ width: '100%', background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: 14, borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
          + SOLICITAR RETIRO
        </button>
      )}
    </div>
  );
}

// ── Formulario de solicitud ──────────────────────────────────────────────────
function SolicitarForm({ onSuccess, onError, onCancel, previewFiscal }) {
  const [form, setForm] = useState({
    creditos: '', metodo: 'TRANSFERENCIA', numero_cuenta: '',
    banco: '', tipo_cuenta: 'AHORROS', nombre_beneficiario: '', numero_documento: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [montoInfo, setMontoInfo] = useState(null);

  // Calcular neto estimado usando la tasa efectiva del preview fiscal
  useEffect(() => {
    if (!previewFiscal || !form.creditos || isNaN(Number(form.creditos)) || Number(form.creditos) <= 0) {
      setMontoInfo(null); return;
    }
    const monto  = Number(form.creditos);
    const bruto  = Number(previewFiscal.monto_bruto ?? 1);
    const neto   = Number(previewFiscal.monto_neto  ?? bruto);
    const tasa   = bruto > 0 ? neto / bruto : 1;
    setMontoInfo({ neto: monto * tasa });
  }, [form.creditos, previewFiscal]);

  const submit = async (e) => {
    e.preventDefault();
    const creditos = Number(form.creditos);
    const minimo   = previewFiscal?.minimo ?? 150;
    if (creditos < minimo) {
      onError(`El monto mínimo de retiro es ${minimo} créditos`);
      return;
    }
    setLoading(true);
    try {
      await api.post('/retiros', {
        creditos_solicitados: creditos,
        moneda:               'USD',
        tasa_credito_usd:     1,
        metodo_pago:          form.metodo,
        numero_cuenta:        form.numero_cuenta,
        banco:                form.banco || undefined,
        tipo_cuenta:          form.tipo_cuenta || undefined,
        nombre_beneficiario:  form.nombre_beneficiario || undefined,
        numero_documento:     form.numero_documento    || undefined,
      });
      setSuccess('¡Solicitud de retiro enviada correctamente!');
      setTimeout(onSuccess, 1500);
    } catch (err) {
      const msg = err.response?.data?.message;
      onError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al solicitar retiro');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#161e2e', borderRadius: 12 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: '#8dc63f', fontWeight: 700 }}>{success}</div>
    </div>
  );

  const needsBankFields = ['TRANSFERENCIA', 'BANCOLOMBIA'].includes(form.metodo);

  return (
    <form onSubmit={submit} style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 12, padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>NUEVA SOLICITUD</div>
        <button type="button" onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#6b7a8d', fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Monto */}
        <div>
          <label style={labelStyle}>Créditos a retirar — mínimo {previewFiscal?.minimo ?? 150} cr</label>
          <input type="number" placeholder={`Ej: ${previewFiscal?.minimo ?? 150}`} value={form.creditos}
            min={previewFiscal?.minimo ?? 150}
            onChange={e => setForm(f => ({ ...f, creditos: e.target.value }))} required style={inputStyle} />

          {/* Estimado neto en tiempo real */}
          {montoInfo && (
            <div style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '10px 14px', marginTop: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Oswald, sans-serif', fontSize: 15, fontWeight: 700 }}>
                  <span style={{ color: '#8dc63f' }}>RECIBIRÍAS (estimado)</span>
                  <span style={{ color: '#8dc63f' }}>${montoInfo.neto.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Método */}
        <div>
          <label style={labelStyle}>Método de pago</label>
          <select value={form.metodo} onChange={e => setForm(f => ({ ...f, metodo: e.target.value }))} style={inputStyle}>
            <option value="TRANSFERENCIA">Transferencia bancaria</option>
            <option value="NEQUI">Nequi</option>
            <option value="DAVIPLATA">Daviplata</option>
            <option value="EFECTIVO">Efectivo en punto físico</option>
            <option value="PAYPAL">PayPal</option>
            <option value="BINANCE">Binance Pay</option>
          </select>
        </div>

        {/* Número de cuenta / wallet */}
        <div>
          <label style={labelStyle}>
            {needsBankFields ? 'Número de cuenta bancaria' : 'Número / dirección de wallet / cuenta'}
          </label>
          <input placeholder={needsBankFields ? 'Ej: 123456789012' : 'Ej: 300 123 4567 o wallet@paypal.com'}
            value={form.numero_cuenta} onChange={e => setForm(f => ({ ...f, numero_cuenta: e.target.value }))} required style={inputStyle} />
        </div>

        {/* Banco y tipo de cuenta (solo transferencia) */}
        {needsBankFields && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Banco</label>
              <input placeholder="Ej: Banco nacional, transferencia..." value={form.banco}
                onChange={e => setForm(f => ({ ...f, banco: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tipo de cuenta</label>
              <select value={form.tipo_cuenta} onChange={e => setForm(f => ({ ...f, tipo_cuenta: e.target.value }))} style={inputStyle}>
                <option value="AHORROS">Ahorros</option>
                <option value="CORRIENTE">Corriente</option>
              </select>
            </div>
          </div>
        )}

        {/* Datos de identidad (opcionales — se toman del perfil si no se envían) */}
        <div style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '12px 14px' }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 10 }}>
            DATOS DEL BENEFICIARIO <span style={{ color: '#4a5568' }}>(opcional — se toman de tu perfil si no los ingresas)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input placeholder="Como aparece en tu documento" value={form.nombre_beneficiario}
                onChange={e => setForm(f => ({ ...f, nombre_beneficiario: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Número de documento</label>
              <input placeholder="Cédula, pasaporte..." value={form.numero_documento}
                onChange={e => setForm(f => ({ ...f, numero_documento: e.target.value }))} style={inputStyle} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '10px 14px', marginTop: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#f59e0b', lineHeight: 1.5 }}>
          ⚠️ Al enviar la solicitud, los créditos se congelan de tu wallet hasta que el administrador procese el pago.
          Los impuestos y comisiones indicados son definitivos según la ley de tu país.
        </div>
      </div>

      <button type="submit" disabled={loading} style={{ width: '100%', background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: 14, borderRadius: 6, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, letterSpacing: '0.05em' }}>
        {loading ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
      </button>
    </form>
  );
}

// ── Fila de retiro en historial ──────────────────────────────────────────────
function RetiroRow({ r }) {
  const est = ESTADO_BADGE[r.estado] || ESTADO_BADGE.PENDIENTE;
  const fecha = r.creado_en ? new Date(r.creado_en).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ background: '#161e2e', border: '1px solid #1e2a3a', borderRadius: 10, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: r.monto_neto ? 10 : 0 }}>
        <div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>
            ${Number(r.creditos_solicitados || r.monto || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })} cr
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginTop: 2 }}>
            {r.metodo_pago || '—'} · {fecha}
          </div>
        </div>
        <span style={{ background: est.bg, color: est.color, fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 4, letterSpacing: '0.05em' }}>
          {est.label}
        </span>
      </div>
      {r.monto_neto != null && (
        <div style={{ display: 'flex', gap: 16, fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', flexWrap: 'wrap' }}>
          {r.impuesto_monto != null && <span>Impuesto: <span style={{ color: '#f87171' }}>-${Number(r.impuesto_monto).toFixed(2)}</span></span>}
          {r.comision_casa_monto != null && <span>Comisión: <span style={{ color: '#f59e0b' }}>-${Number(r.comision_casa_monto).toFixed(2)}</span></span>}
          <span>Neto: <span style={{ color: '#8dc63f', fontWeight: 700 }}>${Number(r.monto_neto).toFixed(2)} cr</span></span>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onSolicitar }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>💸</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: '#fff', fontWeight: 700, marginBottom: 8 }}>SIN RETIROS</div>
      <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginBottom: 24 }}>Aún no has solicitado ningún retiro.</p>
      <button onClick={onSolicitar} style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
        + SOLICITAR RETIRO
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Retiros() {
  const [retiros, setRetiros] = useState([]);
  const [requisitos, setRequisitos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReq, setLoadingReq] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchRetiros = () => {
    api.get('/retiros/mis-solicitudes')
      .then(r => setRetiros(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(e => {
        if (e.response?.status === 401) { navigate('/login'); return; }
        setError(e.response?.data?.message || 'Error al cargar retiros');
      })
      .finally(() => setLoading(false));
  };

  const fetchRequisitos = () => {
    setLoadingReq(true);
    api.get('/retiros/requisitos')
      .then(r => setRequisitos(r.data))
      .catch(() => setRequisitos(null))
      .finally(() => setLoadingReq(false));
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate('/login'); return; }
    fetchRetiros();
    fetchRequisitos();
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    setLoading(true);
    fetchRetiros();
    fetchRequisitos();
  };

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: '#8dc63f', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 8 }}>MI CUENTA</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>RETIROS</h1>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', marginTop: 6 }}>
            Para retirar debes: haber realizado ≥3 apuestas y ≥2 predicciones, y tener mínimo 150 créditos.
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '14px 18px', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Panel de requisitos */}
        {loadingReq ? (
          <div style={{ background: '#161e2e', borderRadius: 12, padding: 24, marginBottom: 24, textAlign: 'center', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 13 }}>
            Verificando requisitos...
          </div>
        ) : (
          !showForm && (
            <RequisitosPanel
              req={requisitos}
              onSolicitar={() => setShowForm(true)}
            />
          )
        )}

        {/* Formulario de solicitud */}
        {showForm && (
          <SolicitarForm
            onSuccess={handleSuccess}
            onError={setError}
            onCancel={() => setShowForm(false)}
            previewFiscal={requisitos?.preview_fiscal}
          />
        )}

        {/* Historial */}
        {!showForm && (
          <>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, color: '#6b7a8d', letterSpacing: '0.08em', marginBottom: 14, marginTop: 8 }}>
              HISTORIAL DE SOLICITUDES
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => <div key={i} style={{ background: '#161e2e', borderRadius: 10, height: 70, opacity: 0.5 }} />)}
              </div>
            ) : retiros.length === 0 ? (
              <EmptyState onSolicitar={() => setShowForm(true)} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {retiros.map(r => <RetiroRow key={r.id} r={r} />)}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

const labelStyle = { display: 'block', fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#6b7a8d', marginBottom: 6, letterSpacing: '0.03em' };
const inputStyle = { width: '100%', background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 6, padding: '11px 14px', color: '#fff', fontFamily: 'Roboto, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
