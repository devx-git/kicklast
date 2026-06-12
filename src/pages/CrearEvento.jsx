import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';
import Navbar from '../components/Navbar';

const INPUT = { width: '100%', background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '10px 12px', color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const LABEL = { display: 'block', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 };
const CARD = { background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, padding: '20px 24px', marginBottom: 20 };
const SECTION = { color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: '0.1em', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #1e2a3a' };

function PctField({ label, name, value, onChange, desc }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input name={name} type="number" min="0" max="100" value={value} onChange={onChange} placeholder="0" style={{ ...INPUT, paddingRight: 32 }} />
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>%</span>
      </div>
      {desc && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#4a5568', marginTop: 4 }}>{desc}</div>}
    </div>
  );
}

export default function CrearEvento() {
  const [campeonatos, setCampeonatos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    campeonato_id: '',
    acumulado_base: '',
    fecha_inicio: '',
    descripcion: '',
    tipo_evento: 'PUBLICO',
    porcentaje_casa: '20',
    porcentaje_pozo: '80',
    porcentaje_retiro: '35',
    porcentaje_impuesto: '0',
    comision_recarga: '3',
    costo_vidas: '0',
    limite_prediccion: '10000',
    equipo_local: '',
    equipo_visitante: '',
    imagen_url: '',
  });
  const [partidos, setPartidos] = useState([
    { equipo_local: '', equipo_visitante: '', fecha: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) { window.location.href = '/login'; return; }
    api.get('/campeonatos').then(r => setCampeonatos(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePartido = (i, field, val) => {
    setPartidos(ps => ps.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  };
  const addPartido = () => setPartidos(ps => [...ps, { equipo_local: '', equipo_visitante: '', fecha: '' }]);
  const removePartido = i => setPartidos(ps => ps.filter((_, idx) => idx !== i));

  // Validate porcentajes sum
  const sumPct = Number(form.porcentaje_casa) + Number(form.porcentaje_pozo) + Number(form.porcentaje_impuesto);

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (sumPct > 100) { setError(`Los porcentajes suman ${sumPct}%. Deben sumar máximo 100%.`); return; }

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        campeonato_id: form.campeonato_id,
        acumulado_base: Number(form.acumulado_base),
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        porcentaje_casa: Number(form.porcentaje_casa),
        porcentaje_pozo: Number(form.porcentaje_pozo),
        porcentaje_retiro: Number(form.porcentaje_retiro),
        porcentaje_impuesto: Number(form.porcentaje_impuesto),
        tipo_evento: form.tipo_evento,
        partidos: partidos.filter(p => p.equipo_local && p.equipo_visitante && p.fecha).map(p => ({
          equipo_local: p.equipo_local,
          equipo_visitante: p.equipo_visitante,
          fecha: new Date(p.fecha).toISOString(),
        })),
      };
      if (form.descripcion) payload.descripcion = form.descripcion;
      if (form.imagen_url) payload.imagen_url = form.imagen_url;
      if (Number(form.costo_vidas) > 0) payload.costo_vidas = Number(form.costo_vidas);
      if (Number(form.limite_prediccion) > 0) payload.limite_prediccion = Number(form.limite_prediccion);

      const { data } = await api.post('/eventos/con-partidos', payload);
      setSuccess(data);
    } catch (ex) {
      const m = ex.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Error al crear el evento');
    } finally {
      setSaving(false);
    }
  };

  if (success) return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 24, color: '#8dc63f', margin: '0 0 12px' }}>¡Evento Creado!</h2>
        <p style={{ color: '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 14, lineHeight: 1.6 }}>
          <strong style={{ color: '#fff' }}>{success.nombre}</strong> fue creado exitosamente con {success.partidos?.length || partidos.length} partidos.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <a href={`/eventos/${success.id}`} style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 6, textDecoration: 'none' }}>VER EVENTO →</a>
          <a href="/promotor" style={{ background: '#1e2535', color: '#c0cad8', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 6, textDecoration: 'none', border: '1px solid #1e2a3a' }}>← MI PANEL</a>
          <button onClick={() => setSuccess(null)} style={{ background: '#1e2535', color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 6, border: '1px solid #00d4ff20', cursor: 'pointer' }}>+ OTRO EVENTO</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 48px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <a href="/promotor" style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none' }}>← Volver al panel</a>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, color: '#fff', margin: '10px 0 0' }}>Crear Nuevo Evento</h1>
        </div>

        <form onSubmit={submit}>

          {/* Info básica */}
          <div style={CARD}>
            <div style={SECTION}>INFORMACIÓN BÁSICA</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={LABEL}>NOMBRE DEL EVENTO *</label>
                <input name="nombre" value={form.nombre} onChange={handle} required placeholder="Ej: Mundial 2026 — Fase de Grupos" style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>CAMPEONATO *</label>
                <select name="campeonato_id" value={form.campeonato_id} onChange={handle} required style={{ ...INPUT, cursor: 'pointer' }}>
                  <option value="">— Seleccionar —</option>
                  {campeonatos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL}>TIPO DE EVENTO</label>
                <select name="tipo_evento" value={form.tipo_evento} onChange={handle} style={{ ...INPUT, cursor: 'pointer' }}>
                  <option value="PUBLICO">Público</option>
                  <option value="PRIVADO">Privado</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div>
                <label style={LABEL}>FECHA INICIO *</label>
                <input name="fecha_inicio" type="datetime-local" value={form.fecha_inicio} onChange={handle} required style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>POZO BASE (créditos) *</label>
                <input name="acumulado_base" type="number" min="0" value={form.acumulado_base} onChange={handle} required placeholder="10000000" style={INPUT} />
              </div>
            </div>
            <div>
              <label style={LABEL}>DESCRIPCIÓN</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handle} placeholder="Descripción del evento..." rows={3} style={{ ...INPUT, resize: 'vertical' }} />
            </div>
          </div>

          {/* Porcentajes */}
          <div style={CARD}>
            <div style={SECTION}>CONFIGURACIÓN FINANCIERA</div>
            <div style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>
              <span style={{ color: sumPct > 100 ? '#f87171' : sumPct === 100 ? '#8dc63f' : '#f59e0b', fontWeight: 700 }}>
                {sumPct > 100 ? '⚠ ' : sumPct === 100 ? '✓ ' : '○ '}
                Suma actual: {sumPct}%
              </span>
              <span style={{ color: '#6b7a8d', marginLeft: 12 }}>Casa + Pozo + Impuesto deben sumar ≤ 100%</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 16 }}>
              <PctField label="% CASA *" name="porcentaje_casa" value={form.porcentaje_casa} onChange={handle} desc="Comisión para el promotor" />
              <PctField label="% POZO *" name="porcentaje_pozo" value={form.porcentaje_pozo} onChange={handle} desc="Va al acumulado de ganadores" />
              <PctField label="% IMPUESTO" name="porcentaje_impuesto" value={form.porcentaje_impuesto} onChange={handle} desc="Impuesto sobre ganancias" />
              <PctField label="% RETIRO MÍNIMO" name="porcentaje_retiro" value={form.porcentaje_retiro} onChange={handle} desc="% mínimo para retirar" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
              <div>
                <label style={LABEL}>COMISIÓN RECARGA (%)</label>
                <input name="comision_recarga" type="number" min="0" max="100" value={form.comision_recarga} onChange={handle} placeholder="3" style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>COSTO EN VIDAS</label>
                <input name="costo_vidas" type="number" min="0" value={form.costo_vidas} onChange={handle} placeholder="0" style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>LÍMITE PREDICCIÓN</label>
                <input name="limite_prediccion" type="number" min="0" value={form.limite_prediccion} onChange={handle} placeholder="10000" style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>IMAGEN DEL EVENTO (URL)</label>
                <input name="imagen_url" value={form.imagen_url} onChange={handle} placeholder="https://..." style={INPUT} />
              </div>
            </div>
          </div>

          {/* Partidos */}
          <div style={CARD}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ ...SECTION, marginBottom: 0, paddingBottom: 0, border: 'none' }}>PARTIDOS DEL EVENTO</div>
              <button type="button" onClick={addPartido} style={{ background: '#1e2535', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '7px 14px', borderRadius: 5, border: '1px solid #8dc63f30', cursor: 'pointer' }}>
                + AGREGAR PARTIDO
              </button>
            </div>

            {partidos.map((p, i) => (
              <div key={i} style={{ background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: '0.1em' }}>PARTIDO {i + 1}</div>
                  {partidos.length > 1 && (
                    <button type="button" onClick={() => removePartido(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={LABEL}>EQUIPO LOCAL</label>
                    <input value={p.equipo_local} onChange={e => handlePartido(i, 'equipo_local', e.target.value)} required placeholder="Ej: Equipo local" style={INPUT} />
                  </div>
                  <div>
                    <label style={LABEL}>EQUIPO VISITANTE</label>
                    <input value={p.equipo_visitante} onChange={e => handlePartido(i, 'equipo_visitante', e.target.value)} required placeholder="Ej: Argentina" style={INPUT} />
                  </div>
                  <div>
                    <label style={LABEL}>FECHA Y HORA</label>
                    <input type="datetime-local" value={p.fecha} onChange={e => handlePartido(i, 'fecha', e.target.value)} required style={INPUT} />
                  </div>
                </div>
              </div>
            ))}
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', marginTop: 6 }}>
              {partidos.filter(p => p.equipo_local && p.equipo_visitante && p.fecha).length} de {partidos.length} partidos completos
            </div>
          </div>

          {error && (
            <div style={{ background: '#1a0a0a', border: '1px solid #f8717140', borderRadius: 6, padding: '12px 16px', marginBottom: 16, color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <a href="/promotor" style={{ background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 6, textDecoration: 'none', border: '1px solid #1e2a3a' }}>CANCELAR</a>
            <button type="submit" disabled={saving || sumPct > 100} style={{ background: (saving || sumPct > 100) ? '#1e2535' : '#8dc63f', color: (saving || sumPct > 100) ? '#6b7a8d' : '#0a0d14', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, padding: '12px 32px', borderRadius: 6, border: 'none', cursor: (saving || sumPct > 100) ? 'not-allowed' : 'pointer', letterSpacing: '0.04em' }}>
              {saving ? 'CREANDO EVENTO...' : 'CREAR EVENTO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
