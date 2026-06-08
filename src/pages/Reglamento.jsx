import Navbar from '../components/Navbar';

const G = '#8dc63f';

function SecTitle({ n, title }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, marginTop: 40 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(141,198,63,0.1)', border: '1px solid rgba(141,198,63,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, color: G, flexShrink: 0 }}>{n}</div>
      <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
    </div>
  );
}

function Rule({ num, text }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: G, fontWeight: 700, minWidth: 28, paddingTop: 2 }}>{num}</span>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#8b9ab0', lineHeight: 1.75, margin: 0 }}>{text}</p>
    </div>
  );
}

function Alert({ icon, text }) {
  return (
    <div style={{ background: 'rgba(141,198,63,0.07)', border: '1px solid rgba(141,198,63,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#c0cad8', lineHeight: 1.7, margin: 0 }}>{text}</p>
    </div>
  );
}

export default function Reglamento() {
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg,#0a1428 0%,#0d1f10 60%,#0a1428 100%)', padding: '56px 20px 48px', borderBottom: '1px solid rgba(141,198,63,0.1)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, color: G, letterSpacing: '0.22em', marginBottom: 10 }}>REGLAMENTO OFICIAL</p>
        <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, margin: '0 0 14px' }}>
          Reglas del <span style={{ color: G }}>juego</span>
        </h1>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: '#6b7a8d', maxWidth: 500, margin: '0 auto' }}>
          Versión 2.0 · Vigente desde el 1 de enero de 2026. Al crear tu cuenta y participar aceptas estas reglas en su totalidad.
        </p>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 20px 80px' }}>

        <SecTitle n="01" title="Elegibilidad y participación" />
        <Rule num="1.1" text="KickLast es un servicio exclusivo para personas mayores de 18 años. Al registrarte declaras que cumples este requisito." />
        <Rule num="1.2" text="El servicio está disponible en los países donde su operación sea legal. Es responsabilidad del usuario verificar la legislación vigente en su jurisdicción." />
        <Rule num="1.3" text="Cada persona física puede registrar una sola cuenta. Las cuentas duplicadas serán suspendidas sin previo aviso y los saldos congelados hasta verificación." />
        <Rule num="1.4" text="Empleados, contratistas y familiares directos del equipo de KickLast no pueden participar en eventos con premio real." />

        <SecTitle n="02" title="Sistema de predicciones — Gurú" />
        <Rule num="2.1" text="Un Gurú es un conjunto de 10 preguntas sobre un evento deportivo. El costo de activación se indica antes de confirmar." />
        <Rule num="2.2" text="Las predicciones solo pueden enviarse o modificarse mientras el evento esté en estado ABIERTO. Una vez cerrado el período, ningún cambio es válido." />
        <Rule num="2.3" text="El sistema de resolución automática compara las respuestas con los resultados oficiales registrados en la plataforma." />
        <Rule num="2.4" text="Acertar 10/10 → accedes al pozo acumulado. Acertar 7, 8 o 9 → devolución de créditos. Menos de 7 → se pierden los créditos de ese Gurú." />
        <Rule num="2.5" text="Si el pozo acumulado no tiene ganador, el 80% del monto pasa al siguiente evento acumulándose. El 20% restante se reparte entre los jugadores con mayor número de aciertos en ese evento." />

        <SecTitle n="03" title="Apuestas deportivas 1-X-2" />
        <Rule num="3.1" text="Las apuestas de resultado final (1=local, X=empate, 2=visitante) utilizan las cuotas publicadas al momento del cierre de la apuesta." />
        <Rule num="3.2" text="Las cuotas pueden variar hasta el cierre del partido. La cuota que se aplica es la vigente en el momento en que se confirmó la apuesta." />
        <Rule num="3.3" text="En caso de aplazamiento definitivo del partido (más de 7 días), la apuesta se cancela y los créditos son devueltos íntegramente." />
        <Rule num="3.4" text="Los resultados de tiempo extra y penales cuentan para el resultado final, a menos que la descripción del evento especifique lo contrario." />

        <SecTitle n="04" title="Créditos y economía de la plataforma" />
        <Rule num="4.1" text="Los créditos tienen un valor nominal de 1 USD cada uno. No son moneda de curso legal ni instrumento financiero." />
        <Rule num="4.2" text="Los créditos de bienvenida (regalo inicial) tienen restricciones de retiro. Consulta la sección de Ayuda para detalles." />
        <Rule num="4.3" text="KickLast no paga intereses ni rendimientos sobre saldos inactivos." />
        <Rule num="4.4" text="Los créditos no son transferibles entre usuarios, salvo mediante los mecanismos oficiales habilitados (distribuidores autorizados)." />

        <SecTitle n="05" title="Retiros y premios" />
        <Rule num="5.1" text="Para solicitar un retiro debes: tener mínimo $100 USD en créditos Y cumplir al menos uno de los criterios de juego (pozo ganado, 3 gurús ganados, o 3 apuestas ganadas)." />
        <Rule num="5.2" text="Se aplica retención fiscal según la legislación del país del usuario y una comisión de plataforma del 3%, ambas visibles antes de confirmar el retiro." />
        <Rule num="5.3" text="Los retiros se procesan en 1-3 días hábiles. KickLast se reserva hasta 5 días adicionales para verificaciones de seguridad en montos superiores a $5,000 USD." />
        <Rule num="5.4" text="KickLast puede solicitar verificación de identidad (KYC) en cualquier momento, especialmente para montos elevados. La negativa a verificar puede resultar en suspensión temporal de retiros." />

        <SecTitle n="06" title="Conducta y fair play" />
        <Alert icon="🚫" text="Está estrictamente prohibido el uso de bots, scripts automatizados o cualquier software de terceros para interactuar con la plataforma." />
        <Alert icon="🚫" text="La colusión entre jugadores, la manipulación de resultados o cualquier forma de fraude conlleva la suspensión permanente y posible acción legal." />
        <Alert icon="🚫" text="El abuso de bonificaciones o exploits de la plataforma será sancionado con la reversión de las ganancias obtenidas." />
        <Alert icon="✅" text="KickLast promueve el juego limpio y la sana competencia. Reporta comportamientos sospechosos a soporte@kicklast.com." />

        <SecTitle n="07" title="Modificaciones al reglamento" />
        <Rule num="7.1" text="KickLast se reserva el derecho de modificar este reglamento en cualquier momento. Los cambios se notificarán con al menos 7 días de anticipación mediante correo electrónico y aviso en la plataforma." />
        <Rule num="7.2" text="El uso continuado de la plataforma después de notificados los cambios implica la aceptación del nuevo reglamento." />
        <Rule num="7.3" text="Para preguntas sobre el reglamento escribe a legal@kicklast.com." />

        <div style={{ marginTop: 40, background: '#0d1520', border: '1px solid #1e2535', borderRadius: 10, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>📄</span>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Documentos relacionados</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[['Términos y condiciones', '/terminos'], ['Política de privacidad', '/privacidad'], ['Juego responsable', '/juego-responsable']].map(([l, h]) => (
                <a key={l} href={h} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: G, textDecoration: 'none' }}>
                  {l} →
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
