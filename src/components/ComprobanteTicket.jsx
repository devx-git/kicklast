/**
 * ComprobanteTicket
 * Modal con recibo imprimible estilo papel térmico (Baloto / POS).
 * Soporta dos tipos:
 *   - 'PIN'     → venta de PIN de activación
 *   - 'RECARGA' → recarga de créditos a usuario
 *
 * Props:
 *   datos   {object}   — contenido del recibo (ver estructuras abajo)
 *   onClose {function} — cierra el modal
 *
 * Estructura datos para PIN:
 *   { tipo:'PIN', codigo, creditos, vendido_a, distribuidorNombre, fecha }
 *
 * Estructura datos para RECARGA:
 *   { tipo:'RECARGA', recargaId, usuarioNombre, usuarioEmail, eventoNombre,
 *     creditos, comision, distribuidorNombre, fecha }
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

// ── Genera el HTML del ticket térmico para impresión ─────────────────────────

function buildTicketHTML(datos) {
  const now   = fmtFecha(datos.fecha || new Date());
  const appUrl = 'app.devxsolutions.pro';

  const sep   = `<div class="sep"></div>`;
  const row   = (l, v) => `<div class="row"><span class="l">${l}</span><span class="v">${v}</span></div>`;
  const center = (t, cls='') => `<div class="center ${cls}">${t}</div>`;

  const header = `
    ${center('&bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull;', 'dots')}
    ${center('<strong>&#9917; GURU GURU</strong>', 'logo')}
    ${center(appUrl, 'url')}
    ${center('&bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull;', 'dots')}
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
        <div>3. Ingresa el código de arriba</div>
      </div>
    `;
  } else {
    // RECARGA
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
      ${center('Los créditos ya están disponibles', 'small')}
      ${center('en la cuenta del usuario.', 'small')}
    `;
  }

  const footer = `
    ${sep}
    ${center('GUARDE ESTE COMPROBANTE', 'warn')}
    ${center('GURU GURU PLATAFORMA &copy; 2026', 'small')}
    ${center(appUrl, 'small')}
    ${center('&bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull; &bull;', 'dots')}
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Comprobante Guru</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    background: #fff;
    color: #000;
    width: 300px;
    margin: 0 auto;
    padding: 12px 8px;
  }
  .center { text-align: center; }
  .dots { color: #888; font-size: 10px; letter-spacing: 2px; margin: 4px 0; }
  .logo { font-size: 18px; font-weight: bold; margin: 6px 0 2px; }
  .url  { font-size: 10px; color: #555; margin-bottom: 4px; }
  .title { font-size: 13px; font-weight: bold; margin: 8px 0; letter-spacing: 0.05em; }
  .section { font-size: 10px; font-weight: bold; letter-spacing: 0.1em; color: #555; margin: 4px 0; }
  .status { font-size: 13px; font-weight: bold; margin: 6px 0 2px; }
  .small  { font-size: 10px; color: #555; margin: 1px 0; }
  .warn   { font-size: 11px; font-weight: bold; letter-spacing: 0.08em; margin: 4px 0; }
  .sep { border-top: 1px dashed #aaa; margin: 8px 0; }
  .row { display: flex; justify-content: space-between; margin: 3px 0; }
  .row .l { color: #555; flex-shrink: 0; margin-right: 8px; }
  .row .v { font-weight: bold; text-align: right; word-break: break-word; }
  .code-box {
    border: 2px solid #000;
    padding: 8px 4px;
    text-align: center;
    font-size: 15px;
    font-weight: bold;
    letter-spacing: 2px;
    margin: 8px 0;
    background: #f5f5f5;
  }
  .steps { font-size: 11px; line-height: 1.8; padding: 4px 0; }
  @media print {
    body { width: 80mm; }
    @page { margin: 0; size: 80mm auto; }
  }
</style>
</head>
<body>
  ${header}
  ${body}
  ${footer}
</body>
</html>`;
}

// ── Función de impresión ──────────────────────────────────────────────────────

function imprimirTicket(datos) {
  const html = buildTicketHTML(datos);
  const popup = window.open('', '_blank', 'width=420,height=680,left=300,top=80');
  if (!popup) {
    alert('Permite las ventanas emergentes para imprimir el comprobante.');
    return;
  }
  popup.document.write(html);
  popup.document.close();
  // Esperar render completo antes del diálogo de impresión
  popup.addEventListener('load', () => {
    setTimeout(() => {
      popup.focus();
      popup.print();
    }, 300);
  });
}

// ── Componente React ──────────────────────────────────────────────────────────

export default function ComprobanteTicket({ datos, onClose }) {
  if (!datos) return null;

  const esPIN     = datos.tipo === 'PIN';
  const tituloHead = esPIN ? 'COMPROBANTE DE VENTA' : 'COMPROBANTE DE RECARGA';
  const iconHead   = esPIN ? '🔑' : '⚡';
  const now        = fmtFecha(datos.fecha || new Date());
  const ref        = esPIN
    ? 'VNT-' + shortId(datos.codigo || '')
    : 'REC-' + shortId(datos.recargaId || '');

  return (
    /* Overlay oscuro */
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      zIndex: 10000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '16px', overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Botones de acción arriba */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => imprimirTicket(datos)}
            style={{
              background: '#8dc63f', color: '#0a0d14',
              fontFamily: 'Oswald, sans-serif', fontSize: 13, fontWeight: 700,
              padding: '11px 28px', borderRadius: 6, border: 'none',
              cursor: 'pointer', letterSpacing: '0.06em',
            }}>
            🖨 IMPRIMIR COMPROBANTE
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#1e2535', color: '#6b7a8d',
              fontFamily: 'Oswald, sans-serif', fontSize: 12,
              padding: '11px 20px', borderRadius: 6,
              border: '1px solid #1e2a3a', cursor: 'pointer',
            }}>
            ✕ CERRAR
          </button>
        </div>

        {/* Ticket — papel térmico estilo Baloto */}
        <div style={{
          background: '#fff', color: '#000',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 13, borderRadius: 8,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          // Simulación de corte de papel en los extremos
          borderTop: '6px solid #0a0d14',
          borderBottom: '6px solid #0a0d14',
        }}>
          {/* Cabecera verde */}
          <div style={{ background: '#0a0d14', padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 900, color: '#8dc63f', letterSpacing: '0.08em' }}>
              ⚽ GURU GURU
            </div>
            <div style={{ color: '#4a5568', fontSize: 10, marginTop: 2 }}>app.devxsolutions.pro</div>
          </div>

          {/* Cuerpo del ticket */}
          <div style={{ padding: '16px 18px' }}>

            {/* Título operación */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#777', letterSpacing: '0.06em', marginBottom: 3 }}>
                {iconHead}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: 14, letterSpacing: '0.04em' }}>
                {tituloHead}
              </div>
            </div>

            {/* Meta info */}
            <TicketRow l="Fecha:" v={now} />
            <TicketRow l="Referencia:" v={ref} bold />
            <TicketRow l={esPIN ? 'Vendedor:' : 'Distribuidor:'} v={datos.distribuidorNombre || '—'} />

            {/* PIN: código destacado */}
            {esPIN && (
              <>
                <TicketSep />
                <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 'bold', letterSpacing: '0.1em', color: '#555', marginBottom: 6 }}>
                  CÓDIGO DE ACTIVACIÓN
                </div>
                <div style={{
                  border: '2px solid #000', borderRadius: 4,
                  padding: '10px 6px', textAlign: 'center',
                  fontSize: 16, fontWeight: 'bold', letterSpacing: '3px',
                  background: '#f9f9f9', marginBottom: 12,
                }}>
                  {datos.codigo || '—'}
                </div>
                <TicketRow l="Valor:" v={`${Number(datos.creditos).toLocaleString('es-CO')} créditos`} bold />
                <TicketRow l="Vidas:" v={`${creditosAVidas(Number(datos.creditos))} vidas Gurú`} />
                <TicketRow l="Precio:" v={`$${Number(datos.creditos).toLocaleString('es-CO')} USD aprox.`} />
              </>
            )}

            {/* RECARGA: beneficiario + detalle */}
            {!esPIN && (
              <>
                <TicketSep />
                <div style={{ fontSize: 10, fontWeight: 'bold', letterSpacing: '0.1em', color: '#555', marginBottom: 6 }}>
                  BENEFICIARIO
                </div>
                <TicketRow l="Usuario:" v={datos.usuarioNombre || '—'} bold />
                {datos.usuarioEmail && <TicketRow l="Email:" v={datos.usuarioEmail} />}
                <TicketSep />
                <div style={{ fontSize: 10, fontWeight: 'bold', letterSpacing: '0.1em', color: '#555', marginBottom: 6 }}>
                  DETALLE
                </div>
                <TicketRow l="Evento:" v={datos.eventoNombre || '—'} />
                <TicketRow l="Créditos:" v={`+${Number(datos.creditos).toLocaleString('es-CO')} CR`} bold />
                <TicketRow l="Vidas:" v={`+${creditosAVidas(Number(datos.creditos))} vidas`} />
              </>
            )}

            {/* Comprador (PIN) */}
            {esPIN && datos.vendido_a && (
              <>
                <TicketSep />
                <TicketRow l="Comprador:" v={datos.vendido_a} bold />
              </>
            )}

            {/* Estado */}
            <TicketSep />
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 13, color: '#1a7a1a', margin: '8px 0 4px' }}>
              ✓ {esPIN ? 'VENTA REGISTRADA' : 'RECARGA ACREDITADA'}
            </div>
            {!esPIN && (
              <div style={{ textAlign: 'center', fontSize: 10, color: '#666', marginBottom: 6 }}>
                Los créditos ya están en la cuenta del usuario
              </div>
            )}
            {esPIN && (
              <div style={{ fontSize: 10, color: '#555', lineHeight: 1.7, marginBottom: 6 }}>
                <div style={{ fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: 3 }}>CÓMO CANJEAR:</div>
                <div>1. Entra a <strong>app.devxsolutions.pro</strong></div>
                <div>2. Ve a <strong>Cuenta → Canjear PIN</strong></div>
                <div>3. Ingresa el código y confirma</div>
              </div>
            )}

            {/* Footer */}
            <TicketSep />
            <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 'bold', letterSpacing: '0.08em', marginBottom: 4 }}>
              GUARDE ESTE COMPROBANTE
            </div>
            <div style={{ textAlign: 'center', fontSize: 9, color: '#888' }}>
              GURU GURU PLATAFORMA © 2026
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#4a5568' }}>
          💡 Haz clic en <strong style={{ color: '#8dc63f' }}>IMPRIMIR</strong> para obtener el comprobante físico
          {!esPIN && ' · El usuario recibirá confirmación por email'}
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes del ticket ────────────────────────────────────────────────

function TicketRow({ l, v, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
      <span style={{ color: '#666', flexShrink: 0, marginRight: 8, fontSize: 12 }}>{l}</span>
      <span style={{ fontWeight: bold ? 'bold' : 'normal', textAlign: 'right', wordBreak: 'break-word', fontSize: 12 }}>{v}</span>
    </div>
  );
}

function TicketSep() {
  return <div style={{ borderTop: '1px dashed #ccc', margin: '10px 0' }} />;
}
