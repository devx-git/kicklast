/**
 * ComprobanteTicket
 * Modal con recibo imprimible estilo papel térmico (Baloto / POS).
 * - Botones IMPRIMIR y CERRAR siempre visibles en la parte inferior
 * - No se cierra al hacer click fuera (evita perder progreso)
 *
 * Tipos:
 *   'PIN'     → venta de PIN de activación
 *   'RECARGA' → recarga de créditos a usuario
 */
import { creditosAVidas } from '../utils/currency';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtFecha(f) {
  const d = f instanceof Date ? f : new Date(f);
  return d.toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortId(str) {
  if (!str) return '—';
  return str.replace(/-/g, '').slice(0, 8).toUpperCase();
}

// ── HTML para impresión (ventana popup) ──────────────────────────────────────

function buildTicketHTML(datos) {
  const now    = fmtFecha(datos.fecha || new Date());
  const appUrl = 'app.devxsolutions.pro';
  const sep    = `<div class="sep"></div>`;
  const row    = (l, v) => `<div class="row"><span class="l">${l}</span><span class="v">${v}</span></div>`;
  const center = (t, cls = '') => `<div class="center ${cls}">${t}</div>`;

  const header = `
    ${center('• • • • • • • • • • • • •', 'dots')}
    ${center('<strong>&#9917; GURU GURU</strong>', 'logo')}
    ${center(appUrl, 'url')}
    ${center('• • • • • • • • • • • • •', 'dots')}
  `;

  let body = '';
  if (datos.tipo === 'PIN') {
    const ref = shortId(datos.codigo || '');
    body = `
      ${center('<strong>COMPROBANTE DE VENTA DE PIN</strong>', 'title')}
      ${sep}
      ${row('Fecha:', now)}
      ${row('Referencia:', 'VNT-' + ref)}
      ${row('Vendedor:', datos.distribuidorNombre || '—')}
      ${sep}
      ${center('CÓDIGO DE ACTIVACIÓN', 'section')}
      <div class="code-box">${datos.codigo || '—'}</div>
      ${sep}
      ${row('Valor:', `${Number(datos.creditos).toLocaleString('es-CO')} créditos`)}
      ${row('Equivale:', `${creditosAVidas(Number(datos.creditos))} vidas Gurú`)}
      ${row('Precio aprox.:', `$${Number(datos.creditos).toLocaleString('es-CO')} USD`)}
      ${sep}
      ${row('Comprador:', datos.vendido_a || 'No especificado')}
      ${sep}
      ${center('CÓMO ACTIVAR TU PIN', 'section')}
      <div class="steps">
        <div>1. Entra a <strong>${appUrl}</strong></div>
        <div>2. Ve a <strong>Cuenta &rarr; Canjear PIN</strong></div>
        <div>3. Ingresa el código y confirma</div>
      </div>
    `;
  } else {
    const ref = shortId(datos.recargaId || '');
    body = `
      ${center('<strong>COMPROBANTE DE RECARGA</strong>', 'title')}
      ${sep}
      ${row('Fecha:', now)}
      ${row('Nro. Tx:', 'REC-' + ref)}
      ${row('Distribuidor:', datos.distribuidorNombre || '—')}
      ${sep}
      ${center('BENEFICIARIO', 'section')}
      ${row('Usuario:', datos.usuarioNombre || '—')}
      ${datos.usuarioEmail ? row('Email:', datos.usuarioEmail) : ''}
      ${sep}
      ${center('DETALLE', 'section')}
      ${row('Evento:', datos.eventoNombre || '—')}
      ${row('Créditos acreditados:', `+${Number(datos.creditos).toLocaleString('es-CO')} CR`)}
      ${row('Equivale:', `+${creditosAVidas(Number(datos.creditos))} vidas`)}
      ${sep}
      ${center('&#10003; RECARGA ACREDITADA', 'status')}
      ${center('Los créditos ya están disponibles en la cuenta.', 'small')}
    `;
  }

  const footer = `
    ${sep}
    ${center('GUARDE ESTE COMPROBANTE', 'warn')}
    ${center('GURU GURU PLATAFORMA &copy; 2026', 'small')}
    ${center(appUrl, 'small')}
    ${center('• • • • • • • • • • • • •', 'dots')}
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Comprobante Guru</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Courier New',Courier,monospace; font-size:12px; background:#fff; color:#000; width:300px; margin:0 auto; padding:12px 8px; }
  .center { text-align:center; }
  .dots   { color:#888; font-size:10px; letter-spacing:2px; margin:4px 0; }
  .logo   { font-size:18px; font-weight:bold; margin:6px 0 2px; }
  .url    { font-size:10px; color:#555; margin-bottom:4px; }
  .title  { font-size:13px; font-weight:bold; margin:8px 0; letter-spacing:0.05em; }
  .section{ font-size:10px; font-weight:bold; letter-spacing:0.1em; color:#555; margin:4px 0; }
  .status { font-size:13px; font-weight:bold; margin:6px 0 2px; }
  .small  { font-size:10px; color:#555; margin:1px 0; }
  .warn   { font-size:11px; font-weight:bold; letter-spacing:0.08em; margin:4px 0; }
  .sep    { border-top:1px dashed #aaa; margin:8px 0; }
  .row    { display:flex; justify-content:space-between; margin:3px 0; }
  .row .l { color:#555; flex-shrink:0; margin-right:8px; }
  .row .v { font-weight:bold; text-align:right; word-break:break-word; }
  .code-box { border:2px solid #000; padding:8px 4px; text-align:center; font-size:15px; font-weight:bold; letter-spacing:2px; margin:8px 0; background:#f5f5f5; }
  .steps  { font-size:11px; line-height:1.8; padding:4px 0; }
  @media print { body { width:80mm; } @page { margin:0; size:80mm auto; } }
</style>
</head>
<body>${header}${body}${footer}</body>
</html>`;
}

function imprimirTicket(datos) {
  const html  = buildTicketHTML(datos);
  const popup = window.open('', '_blank', 'width=420,height=680,left=300,top=80');
  if (!popup) { alert('Activa las ventanas emergentes en tu navegador para imprimir.'); return; }
  popup.document.write(html);
  popup.document.close();
  popup.addEventListener('load', () => setTimeout(() => { popup.focus(); popup.print(); }, 300));
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function ComprobanteTicket({ datos, onClose }) {
  if (!datos) return null;

  const esPIN      = datos.tipo === 'PIN';
  const now        = fmtFecha(datos.fecha || new Date());
  const ref        = esPIN
    ? 'VNT-' + shortId(datos.codigo     || '')
    : 'REC-' + shortId(datos.recargaId  || '');

  return (
    /* Overlay — NO se cierra al hacer click fuera */
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.88)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* ── Área scrollable con el ticket ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 16px 8px',
      }}>
        {/* Ticket — papel térmico */}
        <div style={{
          background: '#fff', color: '#000',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 13, borderRadius: 6,
          width: '100%', maxWidth: 380,
          boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          alignSelf: 'flex-start',
        }}>
          {/* Cabecera oscura */}
          <div style={{ background: '#0a0d14', padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 900, color: '#8dc63f', letterSpacing: '0.08em' }}>
              ⚽ GURU GURU
            </div>
            <div style={{ color: '#4a5568', fontSize: 10, marginTop: 2 }}>app.devxsolutions.pro</div>
          </div>

          {/* Cuerpo */}
          <div style={{ padding: '16px 18px' }}>

            {/* Título */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#777', marginBottom: 3 }}>
                {esPIN ? '🔑' : '⚡'}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: 14, letterSpacing: '0.04em' }}>
                {esPIN ? 'COMPROBANTE DE VENTA' : 'COMPROBANTE DE RECARGA'}
              </div>
            </div>

            {/* Meta */}
            <TR l="Fecha:"         v={now} />
            <TR l="Referencia:"    v={ref} bold />
            <TR l={esPIN ? 'Vendedor:' : 'Distribuidor:'}
                v={datos.distribuidorNombre || '—'} />

            {/* ── PIN ── */}
            {esPIN && <>
              <DS />
              <SL>CÓDIGO DE ACTIVACIÓN</SL>
              <div style={{
                border: '2px solid #000', borderRadius: 4,
                padding: '10px 6px', textAlign: 'center',
                fontSize: 15, fontWeight: 'bold', letterSpacing: '3px',
                background: '#f9f9f9', marginBottom: 10,
              }}>
                {datos.codigo || '—'}
              </div>
              <TR l="Valor:"   v={`${Number(datos.creditos).toLocaleString('es-CO')} créditos`} bold />
              <TR l="Vidas:"   v={`${creditosAVidas(Number(datos.creditos))} vidas Gurú`} />
              <TR l="Precio:"  v={`$${Number(datos.creditos).toLocaleString('es-CO')} USD aprox.`} />
            </>}

            {/* ── RECARGA ── */}
            {!esPIN && <>
              <DS />
              <SL>BENEFICIARIO</SL>
              <TR l="Usuario:"  v={datos.usuarioNombre || '—'} bold />
              {datos.usuarioEmail && <TR l="Email:" v={datos.usuarioEmail} />}
              <DS />
              <SL>DETALLE</SL>
              <TR l="Evento:"   v={datos.eventoNombre || '—'} />
              <TR l="Créditos:" v={`+${Number(datos.creditos).toLocaleString('es-CO')} CR`} bold />
              <TR l="Vidas:"    v={`+${creditosAVidas(Number(datos.creditos))} vidas`} />
            </>}

            {/* Comprador (PIN) */}
            {esPIN && datos.vendido_a && <>
              <DS />
              <TR l="Comprador:" v={datos.vendido_a} bold />
            </>}

            {/* Estado */}
            <DS />
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 13, color: '#1a7a1a', margin: '6px 0 3px' }}>
              ✓ {esPIN ? 'VENTA REGISTRADA' : 'RECARGA ACREDITADA'}
            </div>

            {/* Instrucciones canje (PIN) */}
            {esPIN && (
              <div style={{ fontSize: 10, color: '#555', lineHeight: 1.7, marginTop: 6, marginBottom: 4 }}>
                <div style={{ fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: 2 }}>CÓMO CANJEAR:</div>
                <div>1. Entra a <strong>app.devxsolutions.pro</strong></div>
                <div>2. Ve a <strong>Cuenta → Canjear PIN</strong></div>
                <div>3. Ingresa el código y confirma</div>
              </div>
            )}
            {!esPIN && (
              <div style={{ textAlign: 'center', fontSize: 10, color: '#666', marginBottom: 4 }}>
                Los créditos ya están disponibles en la cuenta
              </div>
            )}

            {/* Pie */}
            <DS />
            <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 'bold', letterSpacing: '0.08em', marginBottom: 3 }}>
              GUARDE ESTE COMPROBANTE
            </div>
            <div style={{ textAlign: 'center', fontSize: 9, color: '#888' }}>
              GURU GURU PLATAFORMA © 2026
            </div>
          </div>
        </div>
      </div>

      {/* ── Barra de acciones FIJA en la parte inferior — siempre visible ── */}
      <div style={{
        width: '100%',
        background: '#0f1420',
        borderTop: '1px solid #1e2a3a',
        padding: '14px 20px',
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <button
          onClick={() => imprimirTicket(datos)}
          style={{
            background: '#8dc63f', color: '#0a0d14',
            fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700,
            padding: '13px 32px', borderRadius: 6, border: 'none',
            cursor: 'pointer', letterSpacing: '0.06em',
            flex: 1, maxWidth: 260,
          }}
        >
          🖨 IMPRIMIR COMPROBANTE
        </button>
        <button
          onClick={onClose}
          style={{
            background: '#1e2535', color: '#c0cad8',
            fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700,
            padding: '13px 24px', borderRadius: 6,
            border: '1px solid #2a3550', cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          ✕ CERRAR
        </button>
      </div>
    </div>
  );
}

// ── Micro-componentes del ticket ──────────────────────────────────────────────

/** Fila label / valor */
function TR({ l, v, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
      <span style={{ color: '#666', flexShrink: 0, marginRight: 8, fontSize: 12 }}>{l}</span>
      <span style={{ fontWeight: bold ? 'bold' : 'normal', textAlign: 'right', wordBreak: 'break-all', fontSize: 12, maxWidth: '65%' }}>{v}</span>
    </div>
  );
}

/** Separador punteado */
function DS() {
  return <div style={{ borderTop: '1px dashed #ccc', margin: '10px 0' }} />;
}

/** Sublabel sección */
function SL({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 'bold', letterSpacing: '0.1em', color: '#555', marginBottom: 5 }}>
      {children}
    </div>
  );
}
