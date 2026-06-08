export default function Terminos() {
  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none', marginBottom: 24 }}>
            ← Volver al inicio
          </a>
          <div style={{ color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.15em', marginBottom: 8 }}>DOCUMENTO LEGAL</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 32, color: '#fff', margin: '0 0 8px' }}>Términos y Condiciones</h1>
          <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, margin: 0 }}>
            Última actualización: junio de 2026 · Versión 1.0
          </p>
        </div>

        <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 12, padding: '40px 36px', lineHeight: 1.9, color: '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>

          <Section title="1. Aceptación de los Términos">
            <p>Al registrarse, acceder o utilizar la plataforma <strong style={{ color: '#fff' }}>Guru</strong> (en adelante, "la Plataforma"), usted acepta quedar vinculado por los presentes Términos y Condiciones de Uso. Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice la Plataforma.</p>
            <p>El uso de la Plataforma implica la aceptación plena y sin reservas de todas las disposiciones incluidas en este documento, así como de la Política de Privacidad y Tratamiento de Datos Personales.</p>
          </Section>

          <Section title="2. Descripción del Servicio">
            <p>Guru es una plataforma de entretenimiento y predicciones deportivas que permite a los usuarios participar en torneos de predicción, realizar apuestas informativas y acumular puntos o créditos virtuales. La Plataforma no opera como casa de apuestas deportivas con dinero real bajo regulación de juego de azar, salvo en las jurisdicciones donde cuente con la debida habilitación.</p>
            <p>Los créditos y saldos virtuales de la Plataforma <strong style={{ color: '#fff' }}>no tienen valor monetario real</strong> a menos que se indique expresamente en las condiciones específicas del evento o modalidad correspondiente.</p>
          </Section>

          <Section title="3. Registro y Cuenta de Usuario">
            <p>Para acceder a los servicios de la Plataforma, el usuario debe:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Ser mayor de 18 años o tener la mayoría de edad legal en su país de residencia.</li>
              <li>Proporcionar información veraz, completa y actualizada durante el registro.</li>
              <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
              <li>Notificar de inmediato cualquier uso no autorizado de su cuenta.</li>
              <li>No crear más de una cuenta por persona.</li>
            </ul>
            <p>La Plataforma se reserva el derecho de suspender o cancelar cuentas que incumplan estas condiciones, sin previo aviso y sin que ello genere derecho a compensación.</p>
          </Section>

          <Section title="4. Uso Aceptable">
            <p>El usuario se compromete a usar la Plataforma de manera lícita y a no:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Manipular resultados, predicciones o cualquier elemento del juego mediante medios automatizados, bots o terceros.</li>
              <li>Suplantar la identidad de otros usuarios o de la Plataforma.</li>
              <li>Compartir contenido ilícito, ofensivo, discriminatorio o que infrinja derechos de terceros.</li>
              <li>Intentar vulnerar la seguridad informática de la Plataforma.</li>
              <li>Utilizar la Plataforma con fines de lavado de activos o financiación ilícita.</li>
            </ul>
          </Section>

          <Section title="5. Créditos, Saldos y Transacciones">
            <p>Los créditos adquiridos en la Plataforma son personales e intransferibles. La Plataforma no garantiza el reembolso de créditos comprados, salvo en los casos expresamente previstos por la legislación aplicable o por error imputable a la Plataforma.</p>
            <p>Las transacciones de recarga se consideran definitivas una vez procesadas. El usuario es responsable de verificar los datos antes de confirmar cualquier operación.</p>
          </Section>

          <Section title="6. Programa de Referidos">
            <p>La Plataforma ofrece un programa de referidos mediante el cual los usuarios pueden invitar a nuevos participantes utilizando su código único. Las bonificaciones por referidos están sujetas a las condiciones vigentes al momento del referido, las cuales pueden modificarse con aviso previo de 15 días a través de los canales oficiales de comunicación.</p>
            <p>Está prohibido el abuso del programa de referidos mediante la creación de cuentas falsas o la generación artificial de referidos. El incumplimiento puede resultar en la cancelación inmediata de la cuenta y la pérdida de los beneficios acumulados.</p>
          </Section>

          <Section title="7. Propiedad Intelectual">
            <p>Todos los contenidos de la Plataforma, incluyendo pero no limitado a diseños, logotipos, textos, imágenes, código fuente y estructura, son propiedad exclusiva de los titulares de la Plataforma y están protegidos por las leyes de propiedad intelectual aplicables. Queda prohibida su reproducción total o parcial sin autorización expresa y escrita.</p>
          </Section>

          <Section title="8. Limitación de Responsabilidad">
            <p>La Plataforma no será responsable por:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Interrupciones del servicio derivadas de mantenimiento, fallos técnicos o causas de fuerza mayor.</li>
              <li>Pérdida de datos por causas ajenas al control de la Plataforma.</li>
              <li>Decisiones tomadas por el usuario basadas en la información publicada.</li>
              <li>Daños indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso del servicio.</li>
            </ul>
          </Section>

          <Section title="9. Modificaciones">
            <p>La Plataforma se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados mediante aviso en la Plataforma con al menos 15 días de antelación. El uso continuado del servicio tras la entrada en vigor de los cambios implicará la aceptación de los nuevos términos.</p>
          </Section>

          <Section title="10. Legislación Aplicable y Jurisdicción">
            <p>Estos Términos y Condiciones se rigen por la legislación de la República de Colombia. Para cualquier controversia derivada del uso de la Plataforma, las partes se someten a los tribunales competentes de la ciudad de Bogotá D.C., con renuncia expresa a cualquier otro fuero que pudiera corresponderles.</p>
          </Section>

          <Section title="11. Contacto">
            <p>Para cualquier consulta relacionada con estos Términos y Condiciones, puede contactarnos a través de:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Correo electrónico: <span style={{ color: '#8dc63f' }}>soporte@guru.app</span></li>
              <li>A través del formulario de contacto disponible en la Plataforma.</li>
            </ul>
          </Section>

        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href="/privacidad" style={{ color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none', marginRight: 24 }}>
            Ver Política de Privacidad →
          </a>
          <a href="/register" style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none' }}>
            Volver al registro
          </a>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: '#8dc63f', margin: '0 0 12px', letterSpacing: '0.05em', borderBottom: '1px solid #1e2a3a', paddingBottom: 8 }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: '#c0cad8' }}>
        {children}
      </div>
    </div>
  );
}
