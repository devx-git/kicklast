const steps = [
  { num: '01', icon: '👤', title: 'Regístrate', desc: 'Crea tu cuenta <strong>gratis</strong> en segundos. Usa un correo verificable para mantener tu acceso seguro y no perder tus premios.', href: '/register', cta: 'Sin costo' },
  { num: '02', icon: '⚡', title: 'Recarga vidas', desc: 'Compra vidas con nuestros pines. Cada vida te permite hacer una predicción. Distribúyelas entre los torneos que más te interesen.', href: '/recargar', cta: 'Comprar vidas' },
  { num: '03', icon: '🎯', title: 'Predice', desc: 'Elige el resultado que crees que va a ocurrir en cada partido. Analiza, sigue tu intuición y demuestra que sabes más que los demás.', href: '/demo-penaltis', cta: 'Jugar ahora' },
  { num: '04', icon: '🏆', title: 'Gana', desc: 'Acierta las predicciones y reclama tu premio. Cada torneo tiene un premio <strong>independiente</strong>. Cuantos más aciertes, más ganas.', href: '/register', cta: 'Quiero ganar' },
];

const faqs = [
  { ico: '♻', color: 'g', q: '¿Qué pasa si pierdo una vida?', a: 'Cada predicción incorrecta consume una vida. Sin vidas debes recargar para seguir compitiendo en los torneos activos.' },
  { ico: '⏱', color: 'y', q: '¿Cuándo cierran las predicciones?', a: 'Al inicio de cada partido. Una vez arranca el juego ya no puedes modificar ni añadir predicciones para ese evento.' },
  { ico: '💰', color: 'b', q: '¿Cómo se reparten los premios?', a: 'Cada torneo tiene un premio acumulado propio. Ganan quienes aciertan todas las predicciones del evento completo.' },
  { ico: '📋', color: 'r', q: '¿Puedo jugar varios torneos?', a: 'Sí. Distribuye tus vidas entre todos los torneos activos. Cada evento funciona de forma completamente independiente.' },
];

export default function HowToPlay() {
  return (
    <section className="lk-how" id="como-jugar">
      <div className="lk-how-inner">
        <div className="lk-how-head">
          <div>
            <p className="lk-how-eyebrow">Instrucciones del juego</p>
            <h2 className="lk-how-title">¿Cómo jugar?</h2>
          </div>
          <p className="lk-how-desc">Kick Last es un juego de predicciones futbolísticas donde la intuición vale más que la suerte. Solo 4 pasos para empezar a ganar.</p>
        </div>

        <div className="lk-steps-grid">
          {steps.map(s => (
            <div key={s.num} className="lk-step">
              <div className="lk-step-bg-num">{s.num}</div>
              <div className="lk-step-top">
                <div className="lk-step-num">{s.num}</div>
                <span className="lk-step-icon">{s.icon}</span>
              </div>
              <div className="lk-step-title">{s.title}</div>
              <p className="lk-step-desc" dangerouslySetInnerHTML={{ __html: s.desc }} />
              <a className="lk-step-tag" href={s.href}>{s.cta} <span className="lk-step-tag-arr">›</span></a>
            </div>
          ))}
        </div>

        <div className="lk-faq-grid">
          {faqs.map(f => (
            <div key={f.q} className="lk-faq-card">
              <div className={`lk-faq-ico ${f.color}`}>{f.ico}</div>
              <div>
                <div className="lk-faq-q">{f.q}</div>
                <p className="lk-faq-a">{f.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lk-how-footer">
          <div className="lk-how-footer-l">
            <div className="lk-how-fdot" />
            <span className="lk-how-ftxt">Mundial 2026 · Cada vida cuenta</span>
          </div>
          <a className="lk-how-cta" href="/register">+ Crear cuenta gratis</a>
        </div>
      </div>
    </section>
  );
}
