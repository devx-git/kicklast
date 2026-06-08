export default function Privacidad() {
  return (
    <div style={{ background: '#0a0d14', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none', marginBottom: 24 }}>
            ← Volver al inicio
          </a>
          <div style={{ color: '#00d4ff', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.15em', marginBottom: 8 }}>DOCUMENTO LEGAL</div>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 32, color: '#fff', margin: '0 0 8px' }}>Política de Privacidad y Tratamiento de Datos</h1>
          <p style={{ color: '#6b7a8d', fontFamily: 'Roboto, sans-serif', fontSize: 13, margin: 0 }}>
            Última actualización: junio de 2026 · Versión 1.0
          </p>
        </div>

        <div style={{ background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 12, padding: '40px 36px', lineHeight: 1.9, color: '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 14 }}>

          <Section title="1. Responsable del Tratamiento">
            <p>
              En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Colombia), y demás normativa aplicable en materia de protección de datos personales, informamos que el responsable del tratamiento de los datos personales recopilados a través de la Plataforma <strong style={{ color: '#fff' }}>Guru</strong> es la empresa titular de la plataforma (en adelante, "la Empresa"), con domicilio en la República de Colombia.
            </p>
            <p>Para ejercer sus derechos o realizar consultas sobre el tratamiento de sus datos puede contactarnos en: <span style={{ color: '#00d4ff' }}>privacidad@guru.app</span></p>
          </Section>

          <Section title="2. Datos Personales que Recopilamos">
            <p>Al registrarse y utilizar la Plataforma, recopilamos los siguientes datos personales:</p>
            <Table rows={[
              ['Identificación', 'Nombre completo, número de documento, tipo de documento'],
              ['Contacto', 'Correo electrónico, número de teléfono, país de residencia'],
              ['Cuenta', 'Contraseña (cifrada), código de jugador, código de referido'],
              ['Financieros', 'Historial de transacciones, saldo de créditos, método de pago'],
              ['Uso', 'Predicciones realizadas, apuestas, historial de sesiones, dirección IP'],
              ['Técnicos', 'Tipo de dispositivo, sistema operativo, navegador'],
            ]} />
            <p>No recopilamos datos sensibles como información racial, política, religiosa, biométrica o de salud, salvo que usted los proporcione voluntariamente y en los casos permitidos por la ley.</p>
          </Section>

          <Section title="3. Finalidades del Tratamiento">
            <p>Sus datos personales serán tratados para las siguientes finalidades:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong style={{ color: '#fff' }}>Prestación del servicio:</strong> crear y gestionar su cuenta, procesar transacciones y participaciones.</li>
              <li><strong style={{ color: '#fff' }}>Comunicaciones:</strong> enviarle notificaciones sobre su cuenta, eventos, resultados y promociones.</li>
              <li><strong style={{ color: '#fff' }}>Seguridad y prevención:</strong> detectar y prevenir fraudes, accesos no autorizados y actividades ilícitas.</li>
              <li><strong style={{ color: '#fff' }}>Cumplimiento legal:</strong> atender requerimientos de autoridades competentes.</li>
              <li><strong style={{ color: '#fff' }}>Mejora del servicio:</strong> análisis estadístico y mejora de la experiencia de usuario.</li>
              <li><strong style={{ color: '#fff' }}>Programa de referidos:</strong> gestionar las comisiones y bonificaciones derivadas de referidos.</li>
            </ul>
          </Section>

          <Section title="4. Base Jurídica del Tratamiento">
            <p>El tratamiento de sus datos personales se basa en:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong style={{ color: '#fff' }}>Su consentimiento</strong>, otorgado al aceptar estos términos durante el registro.</li>
              <li><strong style={{ color: '#fff' }}>Ejecución del contrato</strong> de uso de la Plataforma.</li>
              <li><strong style={{ color: '#fff' }}>Cumplimiento de obligaciones legales</strong> aplicables a la actividad de la Empresa.</li>
              <li><strong style={{ color: '#fff' }}>Interés legítimo</strong> de la Empresa en garantizar la seguridad y calidad del servicio.</li>
            </ul>
          </Section>

          <Section title="5. Compartición de Datos con Terceros">
            <p>La Empresa no vende ni cede sus datos personales a terceros con fines comerciales. Sus datos podrán ser compartidos únicamente con:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong style={{ color: '#fff' }}>Proveedores de servicios:</strong> procesadores de pago, servicios de nube y mensajería, bajo acuerdos de confidencialidad.</li>
              <li><strong style={{ color: '#fff' }}>Autoridades competentes:</strong> cuando sea requerido por ley, orden judicial o proceso legal.</li>
              <li><strong style={{ color: '#fff' }}>Promotores de la Plataforma:</strong> datos mínimos necesarios para la gestión del evento al que usted se inscribe (nombre de usuario y resultados de predicción).</li>
            </ul>
            <p>En todo caso, la transferencia de datos estará sujeta a los mismos estándares de seguridad y confidencialidad descritos en esta Política.</p>
          </Section>

          <Section title="6. Conservación de los Datos">
            <p>Sus datos personales se conservarán mientras su cuenta esté activa. Una vez cancelada la cuenta, los datos se eliminarán en un plazo máximo de <strong style={{ color: '#fff' }}>90 días</strong>, salvo aquellos que deban conservarse por obligaciones legales (e.g., registros contables y financieros, que se conservan por el período exigido por la legislación tributaria aplicable).</p>
          </Section>

          <Section title="7. Derechos del Titular de los Datos">
            <p>De acuerdo con la normativa aplicable, usted tiene derecho a:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong style={{ color: '#fff' }}>Acceso:</strong> conocer qué datos personales suyos tratamos.</li>
              <li><strong style={{ color: '#fff' }}>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
              <li><strong style={{ color: '#fff' }}>Cancelación / Supresión:</strong> solicitar la eliminación de sus datos cuando no sean necesarios para la finalidad para la que se recogieron.</li>
              <li><strong style={{ color: '#fff' }}>Oposición:</strong> oponerse al tratamiento de sus datos para determinadas finalidades.</li>
              <li><strong style={{ color: '#fff' }}>Portabilidad:</strong> recibir sus datos en un formato estructurado y de uso común.</li>
              <li><strong style={{ color: '#fff' }}>Revocación del consentimiento:</strong> retirar el consentimiento en cualquier momento, sin afectar la licitud del tratamiento previo.</li>
            </ul>
            <p>Para ejercer cualquiera de estos derechos, puede enviarnos una solicitud a <span style={{ color: '#00d4ff' }}>privacidad@guru.app</span> adjuntando copia de su documento de identidad. Atenderemos su solicitud en un plazo máximo de 15 días hábiles.</p>
          </Section>

          <Section title="8. Seguridad de los Datos">
            <p>La Empresa adopta medidas técnicas y organizativas adecuadas para proteger sus datos personales frente a accesos no autorizados, pérdida, alteración o divulgación, incluyendo:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Cifrado de contraseñas mediante algoritmos de hash seguros (bcrypt).</li>
              <li>Transmisión de datos mediante protocolos cifrados (HTTPS/TLS).</li>
              <li>Acceso restringido a los datos por parte del personal según principio de mínimo privilegio.</li>
              <li>Auditoría y registro de accesos a datos sensibles.</li>
            </ul>
            <p>No obstante, ningún sistema de seguridad es infalible. En caso de brecha de seguridad que afecte sus datos, le notificaremos en el menor tiempo posible conforme a la normativa aplicable.</p>
          </Section>

          <Section title="9. Cookies y Tecnologías de Seguimiento">
            <p>La Plataforma puede utilizar cookies y tecnologías similares para mejorar la experiencia de usuario, recordar preferencias y analizar el uso del servicio. Usted puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad de algunas secciones de la Plataforma.</p>
          </Section>

          <Section title="10. Menores de Edad">
            <p>La Plataforma está dirigida exclusivamente a personas mayores de 18 años. No recopilamos conscientemente datos personales de menores. Si detectamos que un menor ha proporcionado datos personales, los eliminaremos de inmediato. Si usted es padre, madre o tutor y cree que su hijo ha registrado una cuenta, contáctenos en <span style={{ color: '#00d4ff' }}>privacidad@guru.app</span>.</p>
          </Section>

          <Section title="11. Modificaciones a esta Política">
            <p>Nos reservamos el derecho de actualizar esta Política de Privacidad cuando sea necesario. Le notificaremos cualquier cambio relevante a través de la Plataforma o por correo electrónico con al menos 15 días de antelación. El uso continuado del servicio tras la entrada en vigor de los cambios implicará su aceptación.</p>
          </Section>

          <Section title="12. Autoridad de Control">
            <p>Si considera que el tratamiento de sus datos no se ajusta a la normativa vigente, tiene derecho a presentar una reclamación ante la <strong style={{ color: '#fff' }}>Superintendencia de Industria y Comercio (SIC)</strong> de Colombia, autoridad competente en materia de protección de datos personales.</p>
          </Section>

        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href="/terminos" style={{ color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontSize: 13, textDecoration: 'none', marginRight: 24 }}>
            Ver Términos y Condiciones →
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
      <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: '#00d4ff', margin: '0 0 12px', letterSpacing: '0.05em', borderBottom: '1px solid #1e2a3a', paddingBottom: 8 }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function Table({ rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, marginBottom: 8, fontSize: 13 }}>
      <thead>
        <tr>
          <th style={{ background: '#161e2e', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.08em', padding: '8px 14px', textAlign: 'left', border: '1px solid #1e2a3a', fontWeight: 700 }}>CATEGORÍA</th>
          <th style={{ background: '#161e2e', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: '0.08em', padding: '8px 14px', textAlign: 'left', border: '1px solid #1e2a3a', fontWeight: 700 }}>DATOS</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([cat, datos], i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? '#0a0d14' : '#0f1420' }}>
            <td style={{ padding: '8px 14px', border: '1px solid #1e2a3a', color: '#8dc63f', fontFamily: 'Roboto, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>{cat}</td>
            <td style={{ padding: '8px 14px', border: '1px solid #1e2a3a', color: '#c0cad8' }}>{datos}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
