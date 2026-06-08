import { useState } from 'react';
import Navbar from '../components/Navbar';

const G = '#8dc63f';

const CANALES = [
  { icon: '📧', title: 'Email general', info: 'soporte@kicklast.com', sub: 'Respuesta en menos de 24 h hábiles', href: 'mailto:soporte@kicklast.com' },
  { icon: '⚖️', title: 'Legal y cumplimiento', info: 'legal@kicklast.com', sub: 'Reclamos, PQRS y cumplimiento normativo', href: 'mailto:legal@kicklast.com' },
  { icon: '🤝', title: 'Patrocinios y alianzas', info: 'sponsors@kicklast.com', sub: 'Oportunidades comerciales y de patrocinio', href: 'mailto:sponsors@kicklast.com' },
  { icon: '💼', title: 'Promotores', info: 'promotores@kicklast.com', sub: 'Solicitudes para ser promotor de la plataforma', href: 'mailto:promotores@kicklast.com' },
];

const HORARIOS = [
  { dia: 'Lunes – Viernes', hora: '8:00 AM – 8:00 PM (GMT-5)' },
  { dia: 'Sábados', hora: '9:00 AM – 5:00 PM (GMT-5)' },
  { dia: 'Domingos / Festivos', hora: 'Solo urgencias técnicas' },
];

const MOTIVOS = ['Tengo un problema técnico', 'Pregunta sobre mi cuenta', 'Consulta sobre pagos o retiros', 'Reportar un error o bug', 'Propuesta comercial', 'Otro'];

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', motivo: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    // Simple mailto fallback — en producción conectar al backend
    const asunto = encodeURIComponent(`[KickLast] ${form.motivo || 'Contacto'}`);
    const cuerpo = encodeURIComponent(`Nombre: ${form.nombre}\nEmail: ${form.email}\nMotivo: ${form.motivo}\n\n${form.mensaje}`);
    window.open(`mailto:soporte@kicklast.com?subject=${asunto}&body=${cuerpo}`);
    setEnviado(true);
  };

  const FI = (placeholder, k, type = 'text') => (
    <input type={type} value={form[k]} onChange={set(k)} placeholder={placeholder} required={k !== 'motivo'}
      style={{ width: '100%', background: '#080c14', border: '1px solid #1e2535', borderRadius: 7, color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 14, padding: '11px 14px', outline: 'none', boxSizing: 'border-box' }} />
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
      <Navbar />
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0a1428 0%,#0d1f10 60%,#0a1428 100%)', padding: '56px 20px 48px', borderBottom: '1px solid rgba(141,198,63,0.1)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: G, letterSpacing: '0.22em', marginBottom: 10 }}>CONTÁCTANOS</p>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, margin: '0 0 14px' }}>
          Estamos para <span style={{ color: G }}>escucharte</span>
        </h1>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#6b7a8d', maxWidth: 440, margin: '0 auto' }}>
          ¿Tienes una pregunta, problema o propuesta? Elige el canal que más te convenga.
        </p>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

          {/* Columna izquierda */}
          <div>
            {/* Canales */}
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: G, letterSpacing: '0.12em', marginBottom: 16 }}>CANALES DE CONTACTO</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
              {CANALES.map((c, i) => (
                <a key={i} href={c.href} style={{ background: '#0d1520', border: '1px solid #1e2535', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', textDecoration: 'none', transition: 'border 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(141,198,63,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2535'}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{c.title}</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: G, marginBottom: 3 }}>{c.info}</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>{c.sub}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Horarios */}
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: G, letterSpacing: '0.12em', marginBottom: 16 }}>HORARIOS DE ATENCIÓN</h2>
            <div style={{ background: '#0d1520', border: '1px solid #1e2535', borderRadius: 12, padding: '18px 20px', marginBottom: 28 }}>
              {HORARIOS.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < HORARIOS.length - 1 ? '1px solid #1e2535' : 'none' }}>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d' }}>{h.dia}</span>
                  <strong style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#e2e8f0' }}>{h.hora}</strong>
                </div>
              ))}
            </div>

            {/* Redes */}
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: G, letterSpacing: '0.12em', marginBottom: 14 }}>REDES SOCIALES</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              {[['IG', 'Instagram', 'https://instagram.com'], ['TT', 'TikTok', 'https://tiktok.com'], ['YT', 'YouTube', 'https://youtube.com'], ['𝕏', 'Twitter/X', 'https://x.com']].map(([s, l, h]) => (
                <a key={s} href={h} target="_blank" rel="noopener noreferrer"
                  style={{ width: 44, height: 44, background: '#0d1520', border: '1px solid #1e2535', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7a8d', textDecoration: 'none', fontFamily: 'Oswald, sans-serif', fontSize: 12, fontWeight: 700, transition: 'all 0.15s' }}
                  title={l}
                  onMouseEnter={e => { e.currentTarget.style.background = G; e.currentTarget.style.color = '#0a0d14'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#0d1520'; e.currentTarget.style.color = '#6b7a8d'; }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <div>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: G, letterSpacing: '0.12em', marginBottom: 20 }}>FORMULARIO DE CONTACTO</h2>
            {enviado ? (
              <div style={{ background: 'rgba(141,198,63,0.08)', border: '1px solid rgba(141,198,63,0.3)', borderRadius: 14, padding: '40px 28px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>¡Mensaje enviado!</div>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#6b7a8d', lineHeight: 1.75 }}>
                  Te responderemos a <strong style={{ color: '#fff' }}>{form.email}</strong> en menos de 24 horas hábiles.
                </p>
                <button onClick={() => { setEnviado(false); setForm({ nombre: '', email: '', motivo: '', mensaje: '' }); }}
                  style={{ background: '#1e2535', color: '#c0cad8', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 12, padding: '10px 20px', borderRadius: 7, border: '1px solid #1e2a3a', cursor: 'pointer', marginTop: 16 }}>
                  NUEVO MENSAJE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: '#0d1520', border: '1px solid #1e2535', borderRadius: 14, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 6 }}>Nombre completo *</label>
                  {FI('Tu nombre', 'nombre')}
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 6 }}>Correo electrónico *</label>
                  {FI('tu@correo.com', 'email', 'email')}
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 6 }}>Motivo de contacto</label>
                  <select value={form.motivo} onChange={set('motivo')} style={{ width: '100%', background: '#080c14', border: '1px solid #1e2535', borderRadius: 7, color: form.motivo ? '#e2e8f0' : '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 14, padding: '11px 14px', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">Selecciona un motivo…</option>
                    {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#6b7a8d', marginBottom: 6 }}>Mensaje *</label>
                  <textarea value={form.mensaje} onChange={set('mensaje')} required rows={5} placeholder="Describe tu pregunta o situación con el mayor detalle posible…"
                    style={{ width: '100%', background: '#080c14', border: '1px solid #1e2535', borderRadius: 7, color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 14, padding: '11px 14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" style={{ background: G, color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 14, padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}>
                  ENVIAR MENSAJE →
                </button>
                <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568', textAlign: 'center', margin: 0 }}>
                  Al enviar aceptas nuestra <a href="/privacidad" style={{ color: '#6b7a8d' }}>Política de privacidad</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
