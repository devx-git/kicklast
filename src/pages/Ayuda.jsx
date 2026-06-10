import { useState } from 'react';
import Navbar from '../components/Navbar';

const FAQS = [
  {
    sec: '👤 Cuenta y Registro',
    items: [
      { q: '¿Cómo me registro en KickLast?', a: 'Haz clic en "Crear cuenta" en la página principal. Solo necesitas un correo electrónico válido, un nombre de usuario y contraseña. Recibirás un correo de bienvenida con 10 créditos gratis.' },
      { q: '¿Cuál es la edad mínima para jugar?', a: 'Debes tener mínimo 18 años para registrarte y participar en KickLast. Al crear tu cuenta certificas que cumples este requisito. Nos reservamos el derecho de solicitar verificación de identidad en cualquier momento.' },
      { q: '¿Olvidé mi contraseña, qué hago?', a: 'En la pantalla de inicio de sesión haz clic en "¿Olvidaste tu contraseña?". Te enviaremos un enlace de recuperación al correo registrado. Revisa también la carpeta de spam.' },
      { q: '¿Puedo tener más de una cuenta?', a: 'No. Cada persona puede tener solo una cuenta activa. La creación de cuentas duplicadas para obtener créditos de bienvenida o manipular resultados está prohibida y puede resultar en la suspensión de todas las cuentas involucradas.' },
      { q: '¿Cómo cambio mis datos personales?', a: 'Desde tu Dashboard ve a Configuración de perfil. Puedes actualizar tu nombre, avatar, teléfono y país. El correo electrónico solo puede cambiarse contactando al soporte.' },
    ],
  },
  {
    sec: '⚽ Predicciones',
    items: [
      { q: '¿Qué es una Predicción?', a: 'Una Predicción es un set de 10 preguntas sobre un evento deportivo. Pagas créditos para activarla y predices los resultados de cada pregunta. Si aciertas 10/10 compartes el pozo acumulado. Si aciertas 7, 8 o 9 recuperas tus créditos.' },
      { q: '¿Hasta cuándo puedo enviar mis predicciones?', a: 'El plazo de cierre se indica en cada evento. Generalmente cierran al inicio del primer partido del torneo. Una vez cerrado el plazo no podrás crear ni modificar predicciones.' },
      { q: '¿Puedo modificar mis predicciones después de enviarlas?', a: 'Sí, puedes editar tus predicciones mientras el evento esté abierto. Una vez cerrado el período de predicciones no se permiten cambios bajo ninguna circunstancia.' },
      { q: '¿Qué pasa si un partido se cancela o pospone?', a: 'Si un partido se cancela definitivamente, esa pregunta se declara nula y no cuenta ni como acierto ni como error. Si se pospone a una fecha cercana, el evento aguarda el resultado. Si la demora es mayor a 7 días se aplica la política de cancelación.' },
      { q: '¿Cómo funciona la distribución del pozo acumulado?', a: 'El pozo se reparte en partes iguales entre todos los jugadores con 10/10 aciertos. Si nadie acierta todas, el 80% pasa al siguiente evento y el 20% se distribuye entre los jugadores con más aciertos.' },
    ],
  },
  {
    sec: '💳 Créditos y Pagos',
    items: [
      { q: '¿Qué son los créditos?', a: 'Los créditos son la moneda interna de KickLast. 1 crédito equivale aproximadamente a 1 USD. Los usas para activar Predicciones y hacer apuestas 1-X-2. Puedes recargar créditos desde la sección "Recargar" con distintos métodos de pago según tu país.' },
      { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos transferencia bancaria, Nequi, Daviplata, PSE, tarjeta de crédito/débito (Visa/MC) y pines de recarga. La disponibilidad varía por país. Todos los pagos se procesan en USD.' },
      { q: '¿Los créditos de bienvenida tienen restricciones?', a: 'Los 10 créditos de bienvenida pueden usarse en cualquier Predicción activa. No son retirables directamente: primero debes cumplir los requisitos de juego (ganar el pozo acumulado, 3 predicciones ganadas o 3 apuestas ganadas).' },
      { q: '¿Hay comisiones por recargar?', a: 'Las recargas directas no tienen comisión de plataforma. Algunos métodos de pago pueden tener cargos propios de la pasarela (generalmente 1-3%). El monto exacto se muestra antes de confirmar el pago.' },
    ],
  },
  {
    sec: '💸 Retiros',
    items: [
      { q: '¿Cuáles son los requisitos para retirar?', a: 'Para solicitar un retiro debes: (1) tener mínimo $100 USD en créditos, y (2) cumplir al menos uno de estos criterios de juego: haber ganado el pozo acumulado, acumular 3 Predicciones ganadas, o acumular 3 apuestas ganadas. Este requisito existe para garantizar la integridad del sistema.' },
      { q: '¿Cuánto tiempo tardan los retiros?', a: 'Las solicitudes se procesan en 1-3 días hábiles. Transferencias bancarias internacionales pueden tomar hasta 5 días. Recibirás una notificación por email cuando tu retiro sea aprobado y enviado.' },
      { q: '¿Se cobran impuestos sobre los premios?', a: 'Sí. Según la legislación de tu país se aplica una retención en la fuente sobre las ganancias. Colombia: 19%, Ecuador: 15%, México: 16%, Argentina: 35%. Además, KickLast aplica una comisión de plataforma del 3%. Todo se muestra en el resumen antes de confirmar el retiro.' },
      { q: '¿Cuál es el monto mínimo de retiro?', a: 'El mínimo es de $100 USD en créditos. No hay un máximo establecido, aunque montos superiores a $5,000 USD pueden requerir verificación adicional de identidad (KYC).' },
    ],
  },
  {
    sec: '🛠️ Soporte Técnico',
    items: [
      { q: '¿La app no carga, qué hago?', a: 'Prueba los siguientes pasos: (1) Recarga la página (Ctrl+F5). (2) Limpia caché y cookies del navegador. (3) Prueba en modo incógnito. (4) Usa un navegador diferente (Chrome, Firefox, Edge). Si el problema persiste, escríbenos a soporte@kicklast.com con una captura de pantalla del error.' },
      { q: '¿KickLast funciona en móvil?', a: 'Sí. KickLast está optimizado para navegadores móviles en iOS y Android. Funciona mejor en Chrome para Android y Safari para iOS. Próximamente lanzaremos una app nativa.' },
      { q: '¿Cómo reporto un error o bug?', a: 'Escríbenos a soporte@kicklast.com con: (1) descripción del problema, (2) pasos para reproducirlo, (3) captura de pantalla si aplica, (4) navegador y dispositivo que usas. Respondemos en menos de 24 horas hábiles.' },
    ],
  },
];

function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          background: open === i ? 'rgba(141,198,63,0.05)' : '#0d1520',
          border: `1px solid ${open === i ? 'rgba(141,198,63,0.3)' : '#1e2535'}`,
          borderRadius: 10, overflow: 'hidden', transition: 'border 0.2s',
        }}>
          <button onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              gap: 12, textAlign: 'left',
            }}>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600, color: open === i ? '#8dc63f' : '#e2e8f0', lineHeight: 1.4 }}>
              {item.q}
            </span>
            <span style={{ color: '#8dc63f', fontSize: 18, flexShrink: 0, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
          </button>
          {open === i && (
            <div style={{ padding: '0 20px 18px', fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#8b9ab0', lineHeight: 1.75 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Ayuda() {
  const [secAbierta, setSecAbierta] = useState(0);
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
      <Navbar />
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0a1428 0%,#0d1f10 60%,#0a1428 100%)', padding: '56px 20px 48px', borderBottom: '1px solid rgba(141,198,63,0.1)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: '#8dc63f', letterSpacing: '0.22em', marginBottom: 10 }}>CENTRO DE AYUDA</p>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, margin: '0 0 14px' }}>
          ¿En qué podemos <span style={{ color: '#8dc63f' }}>ayudarte?</span>
        </h1>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 15, color: '#6b7a8d', maxWidth: 480, margin: '0 auto 28px' }}>
          Encuentra respuestas a las preguntas más frecuentes. Si no encuentras lo que buscas, escríbenos.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['📧 soporte@kicklast.com', '⏱️ Resp. en 24 h hábiles', '💬 WhatsApp disponible'].map(b => (
            <span key={b} style={{ background: 'rgba(141,198,63,0.08)', border: '1px solid rgba(141,198,63,0.2)', color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 11, padding: '5px 14px', borderRadius: 20 }}>{b}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 20px 80px' }}>
        {/* Tabs de secciones */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {FAQS.map((s, i) => (
            <button key={i} onClick={() => setSecAbierta(i)}
              style={{
                background: secAbierta === i ? '#8dc63f' : '#0d1520',
                color: secAbierta === i ? '#0a0d14' : '#6b7a8d',
                border: `1px solid ${secAbierta === i ? '#8dc63f' : '#1e2535'}`,
                borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
                fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600,
                transition: 'all 0.15s',
              }}>
              {s.sec}
            </button>
          ))}
        </div>

        <Accordion items={FAQS[secAbierta].items} key={secAbierta} />

        {/* Contacto directo */}
        <div style={{ marginTop: 48, background: '#0d1520', border: '1px solid rgba(141,198,63,0.2)', borderRadius: 14, padding: '32px 28px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>¿No encontraste tu respuesta?</div>
            <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', margin: 0 }}>Nuestro equipo de soporte responde en menos de 24 horas hábiles.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="mailto:soporte@kicklast.com" style={{ background: '#8dc63f', color: '#0a0d14', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, padding: '12px 24px', borderRadius: 8, textDecoration: 'none', letterSpacing: '0.05em' }}>
              📧 ESCRIBIRNOS
            </a>
            <a href="/contacto" style={{ background: '#1e2535', color: '#c0cad8', fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, padding: '12px 20px', borderRadius: 8, textDecoration: 'none', border: '1px solid #1e2a3a' }}>
              FORMULARIO →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
