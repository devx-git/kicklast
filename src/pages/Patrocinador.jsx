import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ─── Opciones del formulario ─────────────────────────────────────────────────

const INDUSTRIAS = [
  'Tecnología / Software', 'Bebidas y Alimentos', 'Servicios Financieros / Fintech',
  'Moda / Indumentaria', 'Telecomunicaciones', 'Medios / Entretenimiento',
  'Deportes / Fitness', 'Turismo / Hospitalidad', 'Automotriz', 'Salud / Farmacéutica',
  'Educación', 'Retail / E-commerce', 'Criptomonedas / Web3', 'Otro',
];

const PAISES = [
  'Colombia', 'México', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Venezuela',
  'Brasil', 'España', 'Estados Unidos', 'Panamá', 'Costa Rica', 'Uruguay', 'Otro',
];

const TIPOS_TORNEO = [
  { val: 'OFICIALES',  label: 'Torneos oficiales', sub: 'Mundiales, Champions, ligas nacionales' },
  { val: 'LOCALES',    label: 'Torneos locales',   sub: 'Liga Colombia, regionales, amistosos' },
  { val: 'AMBOS',      label: 'Ambos',             sub: 'Cobertura completa en toda la plataforma' },
  { val: 'PLATAFORMA', label: 'Plataforma entera', sub: 'Presencia global sin distinción de torneo' },
];

const MODALIDADES = [
  { val: 'logo',            label: '🏷️ Logo en la plataforma' },
  { val: 'banner',          label: '🖼️ Banner en eventos' },
  { val: 'naming',          label: '🏆 Naming de evento ("Copa Sponsor")' },
  { val: 'premios',         label: '🎁 Patrocinio de premios' },
  { val: 'notificaciones',  label: '📲 Mención en push notifications' },
  { val: 'comunicaciones',  label: '📧 Mención en comunicaciones' },
  { val: 'contenido',       label: '📹 Contenido co-creado' },
  { val: 'paquete',         label: '💎 Paquete completo (todo lo anterior)' },
];

const PRESUPUESTOS = [
  { val: 'MENOS_500',  label: 'Menos de $500 USD' },
  { val: '500_2K',     label: '$500 – $2,000 USD' },
  { val: '2K_10K',     label: '$2,000 – $10,000 USD' },
  { val: '10K_50K',    label: '$10,000 – $50,000 USD' },
  { val: 'MAS_50K',    label: 'Más de $50,000 USD' },
  { val: 'A_NEGOCIAR', label: 'A negociar' },
];

const DURACIONES = [
  'Por evento puntual', 'Por torneo / temporada', 'Semestral', 'Anual', 'A definir',
];

const EXPECTATIVAS = [
  { val: 'visibilidad',  label: '👁️ Visibilidad de marca' },
  { val: 'clientes',     label: '🎯 Captación de nuevos clientes' },
  { val: 'engagement',   label: '🔥 Engagement con aficionados' },
  { val: 'latam',        label: '🌎 Presencia en LATAM' },
  { val: 'global',       label: '🌐 Presencia global' },
  { val: 'roi',          label: '📈 Retorno de inversión medible' },
  { val: 'asociacion',   label: '⚽ Asociación de marca con el fútbol' },
  { val: 'b2b',          label: '🤝 Alianzas B2B con la plataforma' },
];

const COMO_ENCONTRO = [
  'Redes sociales', 'Recomendación de un conocido', 'Búsqueda en Google',
  'Noticia / artículo', 'Evento deportivo', 'Otro',
];

// ─── Componentes de UI ────────────────────────────────────────────────────────

const DARK = '#0d1520';
const BORDER = '#1e2535';
const GREEN = '#8dc63f';

function Label({ children, req }) {
  return (
    <label style={{ display: 'block', fontFamily: 'Roboto, sans-serif', fontSize: 12,
      color: '#8b9ab0', fontWeight: 500, marginBottom: 6, letterSpacing: '0.03em' }}>
      {children} {req && <span style={{ color: GREEN }}>*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      style={{
        width: '100%', background: '#080c14', border: `1px solid ${BORDER}`,
        borderRadius: 7, color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 14,
        padding: '11px 14px', outline: 'none', transition: 'border .15s',
        boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = GREEN}
      onBlur={e => e.target.style.borderColor = BORDER}
    />
  );
}

function Select({ value, onChange, children, disabled }) {
  return (
    <select value={value} onChange={onChange} disabled={disabled}
      style={{
        width: '100%', background: '#080c14', border: `1px solid ${BORDER}`,
        borderRadius: 7, color: value ? '#e2e8f0' : '#6b7a8d',
        fontFamily: 'Roboto, sans-serif', fontSize: 14, padding: '11px 14px',
        outline: 'none', appearance: 'none', cursor: 'pointer',
        boxSizing: 'border-box',
      }}>
      {children}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, disabled }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled}
      style={{
        width: '100%', background: '#080c14', border: `1px solid ${BORDER}`,
        borderRadius: 7, color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 14,
        padding: '11px 14px', outline: 'none', resize: 'vertical', transition: 'border .15s',
        boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = GREEN}
      onBlur={e => e.target.style.borderColor = BORDER}
    />
  );
}

function CheckGrid({ options, selected, onToggle, disabled }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 8 }}>
      {options.map(o => {
        const active = selected.includes(o.val);
        return (
          <button key={o.val} type="button" onClick={() => !disabled && onToggle(o.val)}
            style={{
              background: active ? 'rgba(141,198,63,0.1)' : '#080c14',
              border: `1px solid ${active ? GREEN : BORDER}`,
              borderRadius: 8, padding: '10px 14px', cursor: disabled ? 'default' : 'pointer',
              color: active ? '#c8f080' : '#6b7a8d',
              fontFamily: 'Roboto, sans-serif', fontSize: 13, textAlign: 'left',
              transition: 'all .15s',
            }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function RadioCard({ options, value, onChange, disabled }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 10 }}>
      {options.map(o => {
        const active = value === o.val;
        return (
          <button key={o.val} type="button" onClick={() => !disabled && onChange(o.val)}
            style={{
              background: active ? 'rgba(141,198,63,0.08)' : DARK,
              border: `1.5px solid ${active ? GREEN : BORDER}`,
              borderRadius: 10, padding: '14px 16px', cursor: disabled ? 'default' : 'pointer',
              textAlign: 'left', transition: 'all .15s',
            }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700,
              color: active ? GREEN : '#c0cad8', marginBottom: 3 }}>{o.label}</div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>{o.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

function SectionTitle({ num, title, sub }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 24 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: 'rgba(141,198,63,0.12)',
        border: `1px solid rgba(141,198,63,0.3)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: GREEN, flexShrink: 0,
      }}>{num}</div>
      <div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>{title}</div>
        {sub && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Field({ children, style }) {
  return <div style={{ marginBottom: 20, ...style }}>{children}</div>;
}

function Grid2({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
      {children}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

const INIT = {
  marca: '', industria: '', pais: '', sitio_web: '',
  tipo_torneo: '', modalidades: [],
  que_ofrece: '', presupuesto: '', duracion: '',
  expectativas: [], kpis: '', comentarios: '',
  contacto_nombre: '', contacto_cargo: '', contacto_email: '',
  contacto_telefono: '', como_nos_encontro: '',
};

export default function Patrocinador() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [paso, setPaso]   = useState(1);   // 1-5
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleArr = (k) => (val) => setForm(f => ({
    ...f, [k]: f[k].includes(val) ? f[k].filter(x => x !== val) : [...f[k], val],
  }));

  const validarPaso = () => {
    if (paso === 1 && (!form.marca || !form.industria || !form.pais)) return 'Completa los campos obligatorios de empresa.';
    if (paso === 2 && !form.tipo_torneo) return 'Selecciona el tipo de torneo de interés.';
    if (paso === 3 && (!form.que_ofrece || !form.presupuesto || !form.duracion)) return 'Describe tu oferta, presupuesto y duración.';
    if (paso === 5 && (!form.contacto_nombre || !form.contacto_cargo || !form.contacto_email)) return 'Completa los datos de contacto.';
    return '';
  };

  const siguiente = () => {
    const err = validarPaso();
    if (err) { setError(err); return; }
    setError('');
    setPaso(p => Math.min(p + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const anterior = () => { setError(''); setPaso(p => Math.max(p - 1, 1)); };

  const enviar = async () => {
    const err = validarPaso();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/patrocinadores/solicitud', {
        ...form,
        modalidades:  form.modalidades.length  ? form.modalidades  : undefined,
        expectativas: form.expectativas.length ? form.expectativas : undefined,
        kpis:         form.kpis        || undefined,
        comentarios:  form.comentarios || undefined,
        sitio_web:    form.sitio_web   || undefined,
        contacto_telefono:   form.contacto_telefono   || undefined,
        como_nos_encontro:   form.como_nos_encontro   || undefined,
      });
      setEnviado(true);
    } catch (e) {
      setError('Ocurrió un error al enviar. Intenta de nuevo o escríbenos a soporte@kicklast.com');
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading;

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (enviado) return (
    <div style={PAGE}>
      <div style={{ maxWidth: 500, textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 16, lineHeight: 1 }}>🤝</div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: GREEN, letterSpacing: '0.2em', marginBottom: 10 }}>SOLICITUD ENVIADA</p>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 38, fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1 }}>
          ¡Gracias, <span style={{ color: GREEN }}>{form.contacto_nombre.split(' ')[0]}!</span>
        </h1>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#6b7a8d', lineHeight: 1.75, marginBottom: 32 }}>
          Recibimos la solicitud de <strong style={{ color: '#fff' }}>{form.marca}</strong>.<br />
          Nuestro equipo te contactará en las próximas <strong style={{ color: '#fff' }}>48 horas</strong> con una propuesta personalizada.<br />
          También recibirás un correo de confirmación en <strong style={{ color: GREEN }}>{form.contacto_email}</strong>.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')} style={{ ...BTN_PRIMARY, padding: '13px 32px', fontSize: 14 }}>
            IR AL INICIO
          </button>
          <button onClick={() => { setEnviado(false); setForm(INIT); setPaso(1); }}
            style={{ ...BTN_GHOST, padding: '13px 20px', fontSize: 13 }}>
            NUEVA SOLICITUD
          </button>
        </div>
      </div>
    </div>
  );

  // ── Progress bar ───────────────────────────────────────────────────────────
  const PASOS = ['Empresa', 'Patrocinio', 'Oferta', 'Expectativas', 'Contacto'];

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
      {/* Header */}
      <div style={{ background: '#0a0d14', borderBottom: '1px solid #1e2535', padding: '18px 20px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6b7a8d',
            cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: '0.05em' }}>
            ← VOLVER
          </button>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: '#fff', letterSpacing: '0.1em', fontWeight: 700 }}>
            ⚽ <span style={{ color: GREEN }}>KICKLAST</span> · PATROCINADORES
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#4a5568' }}>
            Paso {paso} de 5
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ background: '#0a0d14', borderBottom: '1px solid #1e2535', padding: '12px 20px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', gap: 4, alignItems: 'center' }}>
          {PASOS.map((p, i) => {
            const n = i + 1;
            const done = n < paso;
            const active = n === paso;
            return (
              <div key={p} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: done ? GREEN : active ? 'rgba(141,198,63,0.15)' : '#1e2535',
                    border: `2px solid ${done || active ? GREEN : '#2d3748'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700,
                    color: done ? '#0a0d14' : active ? GREEN : '#4a5568',
                  }}>
                    {done ? '✓' : n}
                  </div>
                  <span style={{
                    fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : done ? GREEN : '#4a5568',
                    display: 'none',
                    '@media (min-width: 500px)': { display: 'block' },
                    whiteSpace: 'nowrap',
                  }}>{p}</span>
                </div>
                {i < PASOS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? GREEN : '#1e2535', margin: '0 6px', minWidth: 8 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero del formulario */}
      <div style={{
        background: 'linear-gradient(135deg,#0a1428 0%,#0d1f10 60%,#0a1428 100%)',
        borderBottom: '1px solid rgba(141,198,63,0.1)', padding: '36px 20px 32px',
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: GREEN, letterSpacing: '0.22em', marginBottom: 10 }}>
            PROGRAMA DE PATROCINIOS · MUNDIAL 2026
          </div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(24px,5vw,40px)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.05 }}>
            Posiciona tu marca donde<br />
            <span style={{ color: GREEN }}>el fútbol late más fuerte</span>
          </h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Slots limitados para el Mundial 2026. Completa el formulario y nuestro equipo te contactará con una propuesta a la medida de tu marca.
          </p>
          {/* Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            {['🌍 3.5B+ espectadores', '🎯 Audiencia segmentada', '📊 Métricas en tiempo real', '🤝 Respuesta en 48 h'].map(b => (
              <span key={b} style={{
                background: 'rgba(141,198,63,0.07)', border: '1px solid rgba(141,198,63,0.2)',
                color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 11,
                padding: '5px 12px', borderRadius: 20,
              }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ background: DARK, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '32px 28px' }}>

          {/* ── PASO 1: Empresa ─────────────────────────────────────────────── */}
          {paso === 1 && (
            <>
              <SectionTitle num="1" title="Tu empresa o marca" sub="Cuéntanos quién eres para preparar la mejor propuesta" />
              <Grid2>
                <Field>
                  <Label req>Nombre de la marca / empresa</Label>
                  <Input value={form.marca} onChange={set('marca')} placeholder="Ej: Acme Sports Co." disabled={disabled} />
                </Field>
                <Field>
                  <Label req>Industria / sector</Label>
                  <Select value={form.industria} onChange={set('industria')} disabled={disabled}>
                    <option value="">Selecciona tu industria…</option>
                    {INDUSTRIAS.map(i => <option key={i} value={i}>{i}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label req>País de la empresa</Label>
                  <Select value={form.pais} onChange={set('pais')} disabled={disabled}>
                    <option value="">Selecciona un país…</option>
                    {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label>Sitio web</Label>
                  <Input value={form.sitio_web} onChange={set('sitio_web')} placeholder="https://tumarca.com" disabled={disabled} />
                </Field>
              </Grid2>
            </>
          )}

          {/* ── PASO 2: Tipo de patrocinio ──────────────────────────────────── */}
          {paso === 2 && (
            <>
              <SectionTitle num="2" title="Tipo de patrocinio" sub="¿Dónde quieres que aparezca tu marca?" />
              <Field>
                <Label req>Torneos de interés</Label>
                <RadioCard options={TIPOS_TORNEO} value={form.tipo_torneo}
                  onChange={v => setForm(f => ({ ...f, tipo_torneo: v }))} disabled={disabled} />
              </Field>
              <Field>
                <Label>Modalidades de presencia (puedes elegir varias)</Label>
                <CheckGrid options={MODALIDADES} selected={form.modalidades}
                  onToggle={toggleArr('modalidades')} disabled={disabled} />
              </Field>
            </>
          )}

          {/* ── PASO 3: Oferta ──────────────────────────────────────────────── */}
          {paso === 3 && (
            <>
              <SectionTitle num="3" title="Tu oferta" sub="¿Qué propones y en qué términos?" />
              <Field>
                <Label req>¿Qué ofrece tu marca a la plataforma?</Label>
                <Textarea value={form.que_ofrece} onChange={set('que_ofrece')} disabled={disabled} rows={5}
                  placeholder="Describe tu propuesta: aporte económico, productos, servicios, experiencias, visibilidad cruzada, etc." />
              </Field>
              <Grid2>
                <Field>
                  <Label req>Presupuesto aproximado</Label>
                  <Select value={form.presupuesto} onChange={set('presupuesto')} disabled={disabled}>
                    <option value="">Selecciona un rango…</option>
                    {PRESUPUESTOS.map(p => <option key={p.val} value={p.val}>{p.label}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label req>Duración esperada</Label>
                  <Select value={form.duracion} onChange={set('duracion')} disabled={disabled}>
                    <option value="">Selecciona duración…</option>
                    {DURACIONES.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </Field>
              </Grid2>
            </>
          )}

          {/* ── PASO 4: Expectativas ────────────────────────────────────────── */}
          {paso === 4 && (
            <>
              <SectionTitle num="4" title="Objetivos y expectativas" sub="Opcional — nos ayuda a personalizar mejor la propuesta" />
              <Field>
                <Label>¿Qué espera obtener tu marca? (puedes elegir varias)</Label>
                <CheckGrid options={EXPECTATIVAS} selected={form.expectativas}
                  onToggle={toggleArr('expectativas')} disabled={disabled} />
              </Field>
              <Field>
                <Label>KPIs que te interesa medir (opcional)</Label>
                <Textarea value={form.kpis} onChange={set('kpis')} disabled={disabled} rows={3}
                  placeholder="Ej: impresiones, CTR, registros nuevos atribuidos, menciones en redes…" />
              </Field>
              <Field>
                <Label>Comentarios adicionales (opcional)</Label>
                <Textarea value={form.comentarios} onChange={set('comentarios')} disabled={disabled} rows={4}
                  placeholder="¿Algo más que debamos saber? Fechas específicas, restricciones, ideas concretas…" />
              </Field>
            </>
          )}

          {/* ── PASO 5: Contacto ────────────────────────────────────────────── */}
          {paso === 5 && (
            <>
              <SectionTitle num="5" title="Datos de contacto" sub="¿Con quién nos comunicamos?" />
              <Grid2>
                <Field>
                  <Label req>Nombre completo</Label>
                  <Input value={form.contacto_nombre} onChange={set('contacto_nombre')}
                    placeholder="María García" disabled={disabled} />
                </Field>
                <Field>
                  <Label req>Cargo</Label>
                  <Input value={form.contacto_cargo} onChange={set('contacto_cargo')}
                    placeholder="Dir. de Marketing" disabled={disabled} />
                </Field>
                <Field>
                  <Label req>Email de contacto</Label>
                  <Input type="email" value={form.contacto_email} onChange={set('contacto_email')}
                    placeholder="maria@tumarca.com" disabled={disabled} />
                </Field>
                <Field>
                  <Label>Teléfono / WhatsApp</Label>
                  <Input value={form.contacto_telefono} onChange={set('contacto_telefono')}
                    placeholder="+57 300 000 0000" disabled={disabled} />
                </Field>
                <Field>
                  <Label>¿Cómo nos encontraste?</Label>
                  <Select value={form.como_nos_encontro} onChange={set('como_nos_encontro')} disabled={disabled}>
                    <option value="">Selecciona una opción…</option>
                    {COMO_ENCONTRO.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
              </Grid2>

              {/* Resumen previo al envío */}
              <div style={{ background: '#080c14', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '16px 18px', marginTop: 8 }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: GREEN, letterSpacing: '0.12em', marginBottom: 12 }}>
                  RESUMEN DE TU SOLICITUD
                </div>
                {[
                  ['Marca',     form.marca],
                  ['País',      form.pais],
                  ['Torneos',   TIPOS_TORNEO.find(t => t.val === form.tipo_torneo)?.label || '—'],
                  ['Presupuesto', PRESUPUESTOS.find(p => p.val === form.presupuesto)?.label || '—'],
                  ['Duración',  form.duracion],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                    borderBottom: '1px solid #0f1520', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
                    <span style={{ color: '#6b7a8d' }}>{l}</span>
                    <strong style={{ color: '#e2e8f0' }}>{v}</strong>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8, padding: '12px 16px', marginTop: 16,
              fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#fca5a5',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Navegación */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12, flexWrap: 'wrap' }}>
            <div>
              {paso > 1 && (
                <button onClick={anterior} disabled={disabled} style={{ ...BTN_GHOST, padding: '12px 24px', fontSize: 13 }}>
                  ← ANTERIOR
                </button>
              )}
            </div>
            <div>
              {paso < 5
                ? <button onClick={siguiente} disabled={disabled} style={{ ...BTN_PRIMARY, padding: '13px 36px', fontSize: 14 }}>
                    SIGUIENTE →
                  </button>
                : <button onClick={enviar} disabled={disabled} style={{
                    ...BTN_PRIMARY, padding: '14px 40px', fontSize: 15,
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 0 30px rgba(141,198,63,0.25)',
                  }}>
                    {loading ? 'ENVIANDO…' : '🤝 ENVIAR SOLICITUD'}
                  </button>
              }
            </div>
          </div>
        </div>

        {/* Nota de privacidad */}
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#2d3748',
          textAlign: 'center', marginTop: 20, lineHeight: 1.7 }}>
          Al enviar este formulario aceptas que KickLast guarde y use tus datos para
          contactarte sobre oportunidades de patrocinio.{' '}
          <a href="/privacidad" style={{ color: '#4a5568', textDecoration: 'underline' }}>Política de privacidad</a>.
        </p>
      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const PAGE = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg,#0a0d14 0%,#0d1520 55%,#081208 100%)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  padding: '40px 20px', color: '#fff',
};

const BTN_PRIMARY = {
  background: GREEN, color: '#0a0d14',
  fontFamily: 'Oswald, sans-serif', fontWeight: 700,
  borderRadius: 8, border: 'none', cursor: 'pointer', letterSpacing: '0.06em',
};

const BTN_GHOST = {
  background: '#1e2535', color: '#c0cad8',
  fontFamily: 'Oswald, sans-serif', fontWeight: 700,
  borderRadius: 8, border: `1px solid ${BORDER}`, cursor: 'pointer',
};
